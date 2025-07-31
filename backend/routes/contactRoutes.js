import express from "express";
import ContactMessage from "../models/ContactMessage.js";
import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

// 📬 Create message
router.post("/", protect, async (req, res) => {
  try {
    const newMessage = await ContactMessage.create({
      userId: req.user._id,
      message: req.body.message,
    });
    res.status(201).json(newMessage);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 👤 Get user’s own messages
router.get("/", protect, async (req, res) => {
  try {
    const messages = await ContactMessage.find({ userId: req.user._id });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ✏️ Edit own message
router.put("/:id", protect, async (req, res) => {
  try {
    const msg = await ContactMessage.findById(req.params.id);
    if (!msg) return res.status(404).json({ message: "Message not found" });
    if (msg.userId.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Not authorized" });

    msg.message = req.body.message || msg.message;
    await msg.save();
    res.json(msg);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 🗑 Delete own message
router.delete("/:id", protect, async (req, res) => {
  try {
    const msg = await ContactMessage.findById(req.params.id);
    if (!msg) return res.status(404).json({ message: "Message not found" });
    if (msg.userId.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Not authorized" });

    await msg.deleteOne();
    res.json({ message: "Message deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});



// Admin: View all messages
router.get('/admin', protect, admin, async (req, res) => {
  try {
    const messages = await ContactMessage.find().sort({ createdAt: -1 }); // Sort by creation date, newest first
    res.status(200).json({ message: 'All contact messages retrieved', data: messages });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
});


// Admin: Delete any message
router.delete('/:id', protect, async (req, res) => {
  try {
    const { id } = req.params;
    const contact = await ContactMessage.findById(id);
    if (!contact) {
      return res.status(404).json({ message: 'Message not found' });
    }
    // Allow admin to delete any message, otherwise check ownership
    if (req.user.role !== 'admin' && contact.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this message' });
    }
    await contact.remove();
    res.status(200).json({ message: 'Message deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
});

export default router;
