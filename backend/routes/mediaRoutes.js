import express from 'express';
import Media from '../models/Media.js';
import upload from '../utils/fileUpload.js';
import { protect } from '../middleware/authMiddleware.js';
import mongoose from 'mongoose';
import path from 'path';
import archiver from 'archiver';
import fs from 'fs';


const router = express.Router();

// Dynamically add 'filePaths' and 'shared' fields to Media schema if not present
if (!Media.schema.path('filePaths')) {
  Media.schema.add({ filePaths: [{ type: String, required: true }] });
}
// Dynamically add 'shared' field to Media schema if not present
if (!Media.schema.path('shared')) {
  Media.schema.add({ shared: { type: Boolean, default: false } });
}

// Upload route (Create) - Support multiple files
router.post('/upload', protect, upload.array('images', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' });
    }

    const { title, description, tags, shared } = req.body;
    if (!title) {
      return res.status(400).json({ message: 'Title is required' });
    }

    const isShared = shared === 'true' || shared === 'on';
    console.log('Uploading with shared:', isShared);

    const uploadedMedia = [];
    for (const file of req.files) {
      const media = new Media({
        title,
        description,
        tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
        filePath: file.path,
        userId: req.user._id,
        shared: isShared,
      });
      await media.save();
      uploadedMedia.push(media);
    }

    res.status(201).json({ message: 'Files uploaded successfully', media: uploadedMedia });
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


// Update media item (Update)
router.put('/:id', protect, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, tags, shared } = req.body;

    const media = await Media.findById(id);
    if (!media) {
      return res.status(404).json({ message: 'Media item not found' });
    }
    if (media.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this item' });
    }

    media.title = title || media.title;
    media.description = description || media.description;
    media.tags = tags ? tags.split(',').map(tag => tag.trim()) : media.tags;
    media.shared = shared === 'true' || shared === 'on' ? true : media.shared;

    await media.save();
    res.status(200).json({ message: 'Media updated successfully', media });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
});

// Delete media item (Delete)
router.delete('/:id', protect, async (req, res) => {
  try {
    const { id } = req.params;

    const media = await Media.findById(id);
    if (!media) {
      return res.status(404).json({ message: 'Media item not found' });
    }
    if (media.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this item' });
    }

    await Media.deleteOne({ _id: id }); // Replace remove() with deleteOne()
    res.status(200).json({ message: 'Media deleted successfully' });
  } catch (error) {
    console.error('Delete error:', error); // Add detailed error logging
    res.status(500).json({ message: error.message || 'Server error' });
  }
});

// Batch fetch media for ZIP generation (Read)
router.post('/media/batch', protect, async (req, res) => {
  try {
    const { ids } = req.body;
    console.log('Received IDs for batch:', ids);
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: 'Valid array of IDs is required' });
    }

    const mediaList = await Media.find({ _id: { $in: ids }, userId: req.user._id });
    if (mediaList.length !== ids.length) {
      return res.status(404).json({ message: 'Some media items not found or not authorized' });
    }

    const mediaWithUrls = mediaList.map(item => ({
      _id: item._id,
      title: item.title,
      fileUrl: `${req.protocol}://${req.get('host')}/uploads/${path.basename(item.filePath)}`
    }));
    console.log('Generated URLs:', mediaWithUrls.map(m => m.fileUrl));
    res.status(200).json({ message: 'Media batch retrieved successfully', media: mediaWithUrls });
  } catch (error) {
    console.error('Batch fetch error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
});



// Download selected images as ZIP
router.post('/download-zip', protect, async (req, res) => {
  try {
    const { ids } = req.body; // Array of media IDs
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: 'No media IDs provided' });
    }

    const mediaItems = await Media.find({ _id: { $in: ids }, userId: req.user._id });
    if (mediaItems.length === 0) {
      return res.status(404).json({ message: 'No media found for the provided IDs' });
    }

    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', 'attachment; filename="media_images.zip"');

    const archive = archiver('zip', {
      zlib: { level: 9 } // Maximum compression
    });

    archive.pipe(res);

    for (const item of mediaItems) {
      const filePaths = Array.isArray(item.filePaths) ? item.filePaths : [item.filePaths];
      for (const filePath of filePaths) {
        if (fs.existsSync(filePath)) {
          const relativePath = filePath.split('/uploads/').pop(); // Extract file name
          archive.file(filePath, { name: relativePath });
        } else {
          console.warn(`File not found: ${filePath}`);
        }
      }
    }

    archive.finalize();
  } catch (error) {
    console.error('ZIP generation error:', error);
    res.status(500).json({ message: error.message || 'Failed to generate ZIP' });
  }
});


export default router;