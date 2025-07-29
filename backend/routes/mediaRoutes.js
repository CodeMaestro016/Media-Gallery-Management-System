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


router.get('/media', protect, async (req, res) => {
  try {
    console.log('Request received for /media, userId:', req.user._id); // Debug
    const media = await Media.find({ userId: req.user._id });
    console.log('Media found:', media); // Debug
    if (media.length === 0) {
      return res.status(200).json([]); // Return empty array if no media
    }
    res.status(200).json(media);
  } catch (error) {
    console.error('Error in /media route:', error); // Debug
    res.status(500).json({ message: error.message || 'Server error' });
  }
});

export default router;