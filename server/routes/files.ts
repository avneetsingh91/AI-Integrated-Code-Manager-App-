import express from 'express';
import { CodeFile } from '../models/CodeFile';
import { verifyToken } from '../middleware/auth';

const router = express.Router();

// Get all files for the logged-in user
router.get('/', verifyToken, async (req, res) => {
  try {
    const files = await CodeFile.find({ userId: (req as any).userId }).sort({ lastModified: -1 });
    res.json(files);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching files', error });
  }
});

// Create a new file
router.post('/', verifyToken, async (req, res) => {
  try {
    const { filename, language, content } = req.body;
    const newFile = new CodeFile({
      filename,
      language,
      content,
      userId: (req as any).userId
    });
    await newFile.save();
    res.status(201).json(newFile);
  } catch (error) {
    res.status(500).json({ message: 'Error creating file', error });
  }
});

// Update a file
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const { content } = req.body;
    const file = await CodeFile.findOneAndUpdate(
      { _id: req.params.id, userId: (req as any).userId },
      { content, lastModified: Date.now() },
      { new: true }
    );
    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }
    res.json(file);
  } catch (error) {
    res.status(500).json({ message: 'Error updating file', error });
  }
});

// Delete a file
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const file = await CodeFile.findOneAndDelete({ _id: req.params.id, userId: (req as any).userId });
    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }
    res.json({ message: 'File deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting file', error });
  }
});

export default router;
