import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import mediaRoutes from './routes/mediaRoutes.js';
import passport from 'passport';
import path from 'path';
import { fileURLToPath } from 'url';
import contactRoutes from './routes/contactRoutes.js';
import adminUserRoutes from './routes/adminUserRoutes.js';


dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(passport.initialize());


// Serve static files for uploaded images
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/api/contact', contactRoutes);
app.use('/api/admin/users', adminUserRoutes);

// Connect to MongoDB
connectDB();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/media', mediaRoutes);

app.get('/', (req, res) => {
  res.send('Media Gallery Backend');
});

const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});