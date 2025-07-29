import express from 'express';
import Media from '../models/Media.js';
import upload from '../utils/fileUpload.js';
import { protect } from '../middleware/authMiddleware.js';
import mongoose from 'mongoose';

const router = express.Router();

// Dynamically add 'shared' field to Media schema if not present
if (!Media.schema.path('shared')) {
  Media.schema.add({ shared: { type: Boolean, default: false } });
}


// Upload route
router.post('/upload', protect, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const { title, description, tags, shared } = req.body;
    if (!title) {
      return res.status(400).json({ message: 'Title is required' });
    }

    const isShared = shared === 'true' || shared === 'on'; // Handle checkbox values
    console.log('Uploading with shared:', isShared); // Debug log

    const media = new Media({
      title,
      description,
      tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
      filePath: req.file.path,
      userId: req.user._id,
      shared: isShared,
    });

    await media.save();
    res.status(201).json({ message: 'File uploaded successfully', media });
  } catch (error) {
    console.error('Upload error:', error);
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

// Get personal gallery
router.get('/personal', protect, async (req, res) => {
  try {
    const mediaList = await Media.find({ userId: req.user._id });
    res.status(200).json({ message: 'Personal gallery retrieved successfully', media: mediaList });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
});

// Get shared gallery
router.get('/shared', protect, async (req, res) => {
  try {
    const mediaList = await Media.find({ shared: true });
    res.status(200).json({ message: 'Shared gallery retrieved successfully', media: mediaList });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
});

// Search and filter by tags and titles
router.get('/search', protect, async (req, res) => {
  try {
    const { tags, title } = req.query;
    let query = { userId: req.user._id }; // Restrict to user's media

    if (tags) {
      const tagArray = tags.split(',').map(tag => tag.trim());
      query.tags = { $all: tagArray }; // Match all specified tags
    }
    if (title) {
      query.title = { $regex: new RegExp(title, 'i') }; // Case-insensitive regex search
    }

    const mediaList = await Media.find(query);
    res.status(200).json({ message: 'Media search results', media: mediaList });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
});

export default router;