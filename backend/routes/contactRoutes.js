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

// 👑 Admin: View all messages
router.get("/admin/all", protect, admin, async (req, res) => {
  try {
    const allMessages = await ContactMessage.find().populate("userId", "name email");
    res.json(allMessages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 👑 Admin: Delete any message
router.delete("/admin/:id", protect, admin, async (req, res) => {
  try {
    const msg = await ContactMessage.findById(req.params.id);
    if (!msg) return res.status(404).json({ message: "Message not found" });

    await msg.deleteOne();
    res.json({ message: "Message deleted by admin" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
