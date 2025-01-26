import express from 'express';
import dotenv from 'dotenv';
import { Webhook } from 'svix';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import User from './userModel.js';
import multer from 'multer';
import fs from 'fs';
import cors from 'cors';

dotenv.config();

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Connected to DB');
  })
  .catch((err) => console.log(err.message));

const app = express();

app.use(cors({
  origin: ['http://localhost:5000', 'http://localhost:8080'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:8080');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  next();
});

app.post(
  '/api/webhooks',
  bodyParser.raw({ type: 'application/json' }),
  async function (req, res) {
    try {
      const payloadString = req.body.toString();
      const svixHeaders = req.headers;

      const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET_KEY);
      const evt = wh.verify(payloadString, svixHeaders);

      const { id, ...attributes } = evt.data;

      const eventType = evt.type;

      if (eventType === 'user.created') {
        const firstName = attributes.first_name;
        const lastName = attributes.last_name;

        console.log(firstName);

        const user = new User({
          clerkUserId: id,
          firstName: firstName,
          lastName: lastName,
        });

        await user.save();
        console.log('User is created');
        console.log(`User ${id} is ${eventType}`);
        console.log(attributes);
      }

      res.status(200).json({
        success: true,
        message: 'Webhook received',
      });
    } catch (err) {
      res.status(400).json({
        success: false,
        message: err.message,
      });
    }
  }
);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
      const uploadDir = './uploads';
      if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
      }
      cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
      cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

app.post('/api/projects/upload', upload.single('file'), async (req, res) => {
  const { userId, description } = req.body;

  try {
      if (!req.file) {
          return res.status(400).json({ success: false, message: 'No file uploaded' });
      }

      const fileMetadata = {
          name: req.file.originalname,
          url: `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`,
          description: description || '',
      };

      const user = await User.findOneAndUpdate(
          { clerkUserId: userId },
          { $push: { projects: fileMetadata } },
          { new: true }
      );

      if (!user) {
          return res.status(404).json({ success: false, message: 'User not found' });
      }

      res.status(200).json({ success: true, user });
  } catch (error) {
      console.error('Error uploading file:', error);
      res.status(500).json({ success: false, message: 'Failed to upload file' });
  }
});

app.get('/api/user/:id/projects', async (req, res) => {
  try {
      const { id } = req.params;

      const user = await User.findOne({ clerkUserId: id });

      if (!user) {
          return res.status(404).json({ success: false, message: 'User not found' });
      }

      res.status(200).json({
          success: true,
          projects: user.projects || [],
      });
  } catch (err) {
      console.error('Error fetching user projects:', err);
      res.status(500).json({
          success: false,
          message: 'Failed to fetch user projects',
      });
  }
});

const port = process.env.PORT || 7000;

app.listen(port, () => {
  console.log(`listening on port ${port}`);
});