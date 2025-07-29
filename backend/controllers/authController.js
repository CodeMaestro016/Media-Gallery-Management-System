import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import { OAuth2Client } from 'google-auth-library';
import User from '../models/User.js';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Generate OTP
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();




// Register User
export const registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  console.log('GMAIL_USER:', process.env.GMAIL_USER);
  console.log('GMAIL_PASS:', process.env.GMAIL_PASS ? '*****' : 'MISSING');

  // Create transporter here to ensure env vars are loaded
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASS,
    },
  });

  try {
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: 'User already exists' });

    const otp = generateOTP();

    const mailOptions = {
      from: process.env.GMAIL_USER,
      to: email,
      subject: 'Verify Your Email - Media Gallery',
      text: `Your OTP for email verification is: ${otp}`,
    };

    console.log('Sending mail with options:', mailOptions);

    await transporter.sendMail(mailOptions);

    const hashedPassword = await bcrypt.hash(password, 10);

    user = new User({ name, email, password: hashedPassword });
    await user.save();

    res.status(200).json({ message: 'OTP sent to email', otp }); // Remove otp in production
  } catch (error) {
    console.error('Error in registerUser:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};


// Verify OTP (Placeholder)
export const verifyOTP = async (req, res) => {
  const { email, otp } = req.body;
  res.status(200).json({ message: 'OTP verification placeholder' });
};

// Login User
export const loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user || !user.isActive)
      return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Google OAuth Login
export const googleLogin = async (req, res) => {
  const { token } = req.body;

  console.log('GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID);
  console.log('GOOGLE_CLIENT_SECRET:', process.env.GOOGLE_CLIENT_SECRET ? '*****' : 'MISSING');
  
  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const { name, email } = ticket.getPayload();

    let user = await User.findOne({ email });
    if (!user) {
      user = new User({ name, email, role: 'user', isActive: true });
      await user.save();
    }

    if (!user.isActive)
      return res.status(400).json({ message: 'Account deactivated' });

    const jwtToken = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({
      token: jwtToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Google login failed', error: error.message });
  }
};

// Forgot Password
export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
});


  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'User not found' });

    const otp = generateOTP();
    const mailOptions = {
      from: process.env.GMAIL_USER,
      to: email,
      subject: 'Password Reset - Media Gallery',
      text: `Your OTP for password reset is: ${otp}`,
    };

    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: 'OTP sent to email', otp }); // For demo; store OTP securely in prod
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Reset Password
export const resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'User not found' });

    // In production, verify OTP properly
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({ message: 'Password reset successful' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
