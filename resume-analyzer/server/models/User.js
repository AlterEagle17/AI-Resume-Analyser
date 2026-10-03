import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  lastActiveAt: {
    type: Date,
    default: Date.now,
  },
}, {
  collection: 'users',
  strict: 'throw',
  versionKey: false,
});

export default mongoose.models.User || mongoose.model('User', userSchema);
