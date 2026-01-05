import express from 'express';
import { body, validationResult } from 'express-validator';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { prisma } from '../server';

const router = express.Router();

// Get all gym sessions
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { active } = req.query;
    
    const where: any = {};
    if (active === 'true') {
      where.exitTime = null;
    }

    const gymSessions = await prisma.gymSession.findMany({
      where,
      orderBy: { entranceTime: 'desc' },
      include: {
        client: true
      }
    });

    const gymSessionsWithStringIds = gymSessions.map(session => ({
      ...session,
      id: session.id.toString(),
      clientId: session.clientId.toString(),
      client: {
        ...session.client,
        id: session.client.id.toString()
      }
    }));

    res.json(gymSessionsWithStringIds);
  } catch (error: any) {
    console.error('Error fetching gym sessions:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get gym session by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const id = BigInt(req.params.id);
    const gymSession = await prisma.gymSession.findUnique({
      where: { id },
      include: {
        client: true
      }
    });

    if (!gymSession) {
      return res.status(404).json({ message: 'Gym session not found' });
    }

    res.json({
      ...gymSession,
      id: gymSession.id.toString(),
      clientId: gymSession.clientId.toString(),
      client: {
        ...gymSession.client,
        id: gymSession.client.id.toString()
      }
    });
  } catch (error: any) {
    console.error('Error fetching gym session:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create gym session (entrance)
router.post('/', authenticateToken, [
  body('clientId').notEmpty().withMessage('Client ID is required')
], async (req: AuthRequest, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Check if client has active membership
    const activeMembership = await prisma.membership.findFirst({
      where: {
        clientId: BigInt(req.body.clientId),
        isPaid: true,
        endDate: {
          gte: new Date()
        }
      }
    });

    if (!activeMembership) {
      return res.status(400).json({ message: 'Client does not have an active membership' });
    }

    // Check if client is already in gym
    const activeSession = await prisma.gymSession.findFirst({
      where: {
        clientId: BigInt(req.body.clientId),
        exitTime: null
      }
    });

    if (activeSession) {
      return res.status(400).json({ message: 'Client is already in the gym' });
    }

    const gymSession = await prisma.gymSession.create({
      data: {
        clientId: BigInt(req.body.clientId),
        entranceTime: new Date(),
        lockerNumber: req.body.lockerNumber ? parseInt(req.body.lockerNumber) : null
      },
      include: {
        client: true
      }
    });

    res.status(201).json({
      ...gymSession,
      id: gymSession.id.toString(),
      clientId: gymSession.clientId.toString(),
      client: {
        ...gymSession.client,
        id: gymSession.client.id.toString()
      }
    });
  } catch (error: any) {
    console.error('Error creating gym session:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update gym session (exit)
router.put('/:id/exit', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const id = BigInt(req.params.id);

    const gymSession = await prisma.gymSession.update({
      where: { id },
      data: {
        exitTime: new Date()
      },
      include: {
        client: true
      }
    });

    res.json({
      ...gymSession,
      id: gymSession.id.toString(),
      clientId: gymSession.clientId.toString(),
      client: {
        ...gymSession.client,
        id: gymSession.client.id.toString()
      }
    });
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(404).json({ message: 'Gym session not found' });
    }
    console.error('Error updating gym session:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;

