import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import { prisma } from '../server';

const router = express.Router();

// Login
router.post('/login', [
  body('adminID').notEmpty().withMessage('Admin ID is required'),
  body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { adminID, password } = req.body;

    const admin = await prisma.admin.findUnique({
      where: { adminID }
    });

    if (!admin) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isValidPassword = await bcrypt.compare(password, admin.password);

    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const jwtSecret = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production';
    const token = jwt.sign(
      { adminId: admin.adminID, id: admin.id.toString() },
      jwtSecret,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      admin: {
        id: admin.id.toString(),
        adminID: admin.adminID,
        fname: admin.fname,
        lname: admin.lname,
        email: admin.email
      }
    });
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get current admin info
router.get('/me', async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const jwtSecret = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production';
    const decoded: any = jwt.verify(token, jwtSecret);

    const admin = await prisma.admin.findUnique({
      where: { adminID: decoded.adminId },
      select: {
        id: true,
        adminID: true,
        fname: true,
        lname: true,
        phoneNumber: true,
        createdAt: true
      }
    });

    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    res.json({
      ...admin,
      id: admin.id.toString()
    });
  } catch (error: any) {
    res.status(401).json({ message: 'Invalid token' });
  }
});

export default router;

