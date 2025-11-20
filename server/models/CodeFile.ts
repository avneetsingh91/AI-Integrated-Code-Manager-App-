import mongoose from 'mongoose';

const codeFileSchema = new mongoose.Schema({
  filename: { type: String, required: true },
  language: { type: String, required: true },
  content: { type: String, default: '' },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  lastModified: { type: Date, default: Date.now }
});

export const CodeFile = mongoose.model('CodeFile', codeFileSchema);
