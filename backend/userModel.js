import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema({
  name: { type: String, required: true },
  url: { type: String, required: true },
  uploadedAt: { type: Date, default: Date.now },
  description: { type: String },
});

const userSchema = new mongoose.Schema({
  clerkUserId: { type: String, required: true, unique: true },
  firstName: { type: String },
  lastName: { type: String },
  projects: [projectSchema],
});

const User = mongoose.model('User', userSchema);

export default User;