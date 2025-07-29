import express from 'express';
import Media from '../models/Media.js';
import upload from '../utils/fileUpload.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/upload', protect, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const { title, description, tags } = req.body;
    if (!title) {
      return res.status(400).json({ message: 'Title is required' });
    }

    const media = new Media({
      title,
      description,
      tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
      filePath: req.file.path,
      userId: req.user._id,
    });

    await media.save();
    res.status(201).json({ message: 'File uploaded successfully', media });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
});


// New GET route to retrieve media for the authenticated user
router.get('/', protect, async (req, res) => {
  try {
    const mediaList = await Media.find({ userId: req.user._id });
    res.status(200).json({ message: 'Media retrieved successfully', media: mediaList });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
});

export default router;