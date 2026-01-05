import express from 'express';
import { body, validationResult } from 'express-validator';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { prisma } from '../server';
import { serializeBigInts } from '../utils/bigint-serializer';

const router = express.Router();

// Get all clients
router.get('/', authenticateToken, async (req, res) => {
  try {
    const clients = await prisma.client.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        memberships: {
          include: {
            package: true,
            instructor: true
          }
        }
      }
    });

    // Convert BigInt to string for JSON serialization
    res.json(serializeBigInts(clients));
  } catch (error: any) {
    console.error('Error fetching clients:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get client by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const id = BigInt(req.params.id);
    const client = await prisma.client.findUnique({
      where: { id },
      include: {
        memberships: {
          include: {
            package: true,
            instructor: true
          },
          orderBy: { createdAt: 'desc' }
        },
        payments: {
          orderBy: { createdAt: 'desc' }
        },
        gymSessions: {
          orderBy: { entranceTime: 'desc' },
          take: 10
        }
      }
    });

    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }

    res.json(serializeBigInts(client));
  } catch (error: any) {
    console.error('Error fetching client:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create client
router.post('/', authenticateToken, [
  body('fname').notEmpty().withMessage('First name is required'),
  body('dob').isISO8601().withMessage('Valid date of birth is required'),
  body('isMale').isBoolean().withMessage('Gender is required'),
  body('phoneNumber').notEmpty().withMessage('Phone number is required'),
  body('socialNumber').notEmpty().withMessage('Social number is required')
], async (req: AuthRequest, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const client = await prisma.client.create({
      data: {
        fname: req.body.fname,
        lname: req.body.lname,
        dob: new Date(req.body.dob),
        isMale: req.body.isMale,
        email: req.body.email,
        phoneNumber: req.body.phoneNumber,
        socialNumber: req.body.socialNumber,
        description: req.body.description,
        locker: req.body.locker ? parseInt(req.body.locker) : null,
        weight: req.body.weight ? parseFloat(req.body.weight) : null,
        height: req.body.height ? parseFloat(req.body.height) : null
      }
    });

    res.status(201).json({
      ...client,
      id: client.id.toString()
    });
  } catch (error: any) {
    console.error('Error creating client:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update client
router.put('/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const id = BigInt(req.params.id);

    const client = await prisma.client.update({
      where: { id },
      data: {
        fname: req.body.fname,
        lname: req.body.lname,
        dob: req.body.dob ? new Date(req.body.dob) : undefined,
        isMale: req.body.isMale,
        email: req.body.email,
        phoneNumber: req.body.phoneNumber,
        socialNumber: req.body.socialNumber,
        description: req.body.description,
        locker: req.body.locker !== undefined ? (req.body.locker ? parseInt(req.body.locker) : null) : undefined,
        weight: req.body.weight !== undefined ? (req.body.weight ? parseFloat(req.body.weight) : null) : undefined,
        height: req.body.height !== undefined ? (req.body.height ? parseFloat(req.body.height) : null) : undefined
      }
    });

    res.json({
      ...client,
      id: client.id.toString()
    });
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(404).json({ message: 'Client not found' });
    }
    console.error('Error updating client:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete client
router.delete('/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const id = BigInt(req.params.id);

    await prisma.client.delete({
      where: { id }
    });

    res.json({ message: 'Client deleted successfully' });
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(404).json({ message: 'Client not found' });
    }
    console.error('Error deleting client:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;

