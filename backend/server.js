import express from "express";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import { Webhook } from "svix";
import { MongoClient, ServerApiVersion } from 'mongodb';

dotenv.config();

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

// Connect to MongoDB
async function connectToMongo() {
  try {
    await client.connect();
    await client.db("admin").command({ ping: 1 });
    console.log("Connected successfully to MongoDB!");
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
}
connectToMongo();

const app = express();

app.post(
  '/api/webhooks',
  bodyParser.raw({ type: 'application/json' }),
  async (req, res) => {
    const SIGNING_SECRET = process.env.SIGNING_SECRET

    if (!SIGNING_SECRET) {
      throw new Error('Error: Please add SIGNING_SECRET from Clerk Dashboard to .env')
    }

    const wh = new Webhook(SIGNING_SECRET)

    const headers = req.headers
    const payload = req.body

    const svix_id = headers['svix-id']
    const svix_timestamp = headers['svix-timestamp']
    const svix_signature = headers['svix-signature']

    if (!svix_id || !svix_timestamp || !svix_signature) {
      return void res.status(400).json({
        success: false,
        message: 'Error: Missing svix headers',
      })
    }

    let evt

    try {
      evt = wh.verify(payload, {
        'svix-id': String(svix_id),
        'svix-timestamp': String(svix_timestamp),
        'svix-signature': String(svix_signature),
      })
    } catch (err) {
      console.log('Error: Could not verify webhook:', err.message)
      return void res.status(400).json({
        success: false,
        message: err.message,
      })
    }

    const { id } = evt.data
    const eventType = evt.type
    console.log(`Received webhook with ID ${id} and event type of ${eventType}`)
    console.log('Webhook payload:', evt.data)

    // Store webhook event in MongoDB
    try {
      const database = client.db("webhooks");
      const webhookEvents = database.collection("webhookEvents");
      
      const webhookEvent = {
        eventId: id,
        eventType: eventType,
        data: evt.data,
        receivedAt: new Date()
      };
      
      await webhookEvents.insertOne(webhookEvent);
      console.log('Webhook event saved to database');
    } catch (error) {
      console.error('Error saving webhook event:', error);
      return void res.status(500).json({
        success: false,
        message: 'Error saving webhook event',
      });
    }

    return void res.status(200).json({
      success: true,
      message: 'Webhook received and stored',
    })
  },
)

const port = process.env.PORT || 7000;

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});

// Handle graceful shutdown
process.on('SIGINT', async () => {
  await client.close();
  process.exit(0);
});
