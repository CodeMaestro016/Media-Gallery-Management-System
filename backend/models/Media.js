import mongoose from 'mongoose';

const mediaSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  tags: [{ type: String }],
  filePath: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('Media', mediaSchema);