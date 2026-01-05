import express from 'express';
import { body, validationResult } from 'express-validator';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { prisma } from '../server';

const router = express.Router();

// Get all memberships
router.get('/', authenticateToken, async (req, res) => {
  try {
    const memberships = await prisma.membership.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        client: true,
        package: true,
        instructor: true
      }
    });

    const membershipsWithStringIds = memberships.map(membership => ({
      ...membership,
      id: membership.id.toString(),
      clientId: membership.clientId.toString(),
      packageId: membership.packageId.toString(),
      instructorId: membership.instructorId.toString(),
      client: {
        ...membership.client,
        id: membership.client.id.toString()
      },
      package: {
        ...membership.package,
        id: membership.package.id.toString()
      },
      instructor: {
        ...membership.instructor,
        id: membership.instructor.id.toString(),
        packageId: membership.instructor.packageId.toString()
      }
    }));

    res.json(membershipsWithStringIds);
  } catch (error: any) {
    console.error('Error fetching memberships:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get membership by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const id = BigInt(req.params.id);
    const membership = await prisma.membership.findUnique({
      where: { id },
      include: {
        client: true,
        package: true,
        instructor: true,
        sessions: {
          orderBy: { destinationDate: 'desc' }
        }
      }
    });

    if (!membership) {
      return res.status(404).json({ message: 'Membership not found' });
    }

    res.json({
      ...membership,
      id: membership.id.toString(),
      clientId: membership.clientId.toString(),
      packageId: membership.packageId.toString(),
      instructorId: membership.instructorId.toString(),
      client: {
        ...membership.client,
        id: membership.client.id.toString()
      },
      package: {
        ...membership.package,
        id: membership.package.id.toString()
      },
      instructor: {
        ...membership.instructor,
        id: membership.instructor.id.toString(),
        packageId: membership.instructor.packageId.toString()
      },
      sessions: membership.sessions.map(s => ({
        ...s,
        id: s.id.toString(),
        instructorId: s.instructorId.toString(),
        membershipId: s.membershipId.toString()
      }))
    });
  } catch (error: any) {
    console.error('Error fetching membership:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create membership
router.post('/', authenticateToken, [
  body('clientId').notEmpty().withMessage('Client ID is required'),
  body('packageId').notEmpty().withMessage('Package ID is required'),
  body('instructorId').notEmpty().withMessage('Instructor ID is required'),
  body('status').notEmpty().withMessage('Status is required'),
  body('startDate').isISO8601().withMessage('Valid start date is required'),
  body('endDate').isISO8601().withMessage('Valid end date is required'),
  body('paymentDate').isISO8601().withMessage('Valid payment date is required'),
  body('isPaid').isBoolean().withMessage('Payment status is required')
], async (req: AuthRequest, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const membership = await prisma.membership.create({
      data: {
        clientId: BigInt(req.body.clientId),
        packageId: BigInt(req.body.packageId),
        instructorId: BigInt(req.body.instructorId),
        status: req.body.status,
        startDate: new Date(req.body.startDate),
        endDate: new Date(req.body.endDate),
        paymentDate: new Date(req.body.paymentDate),
        isPaid: req.body.isPaid,
        description: req.body.description,
        remainSessions: req.body.remainSessions ? parseInt(req.body.remainSessions) : 0
      },
      include: {
        client: true,
        package: true,
        instructor: true
      }
    });

    res.status(201).json({
      ...membership,
      id: membership.id.toString(),
      clientId: membership.clientId.toString(),
      packageId: membership.packageId.toString(),
      instructorId: membership.instructorId.toString(),
      client: {
        ...membership.client,
        id: membership.client.id.toString()
      },
      package: {
        ...membership.package,
        id: membership.package.id.toString()
      },
      instructor: {
        ...membership.instructor,
        id: membership.instructor.id.toString(),
        packageId: membership.instructor.packageId.toString()
      }
    });
  } catch (error: any) {
    console.error('Error creating membership:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update membership
router.put('/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const id = BigInt(req.params.id);

    const membership = await prisma.membership.update({
      where: { id },
      data: {
        clientId: req.body.clientId ? BigInt(req.body.clientId) : undefined,
        packageId: req.body.packageId ? BigInt(req.body.packageId) : undefined,
        instructorId: req.body.instructorId ? BigInt(req.body.instructorId) : undefined,
        status: req.body.status,
        startDate: req.body.startDate ? new Date(req.body.startDate) : undefined,
        endDate: req.body.endDate ? new Date(req.body.endDate) : undefined,
        paymentDate: req.body.paymentDate ? new Date(req.body.paymentDate) : undefined,
        isPaid: req.body.isPaid,
        description: req.body.description,
        remainSessions: req.body.remainSessions !== undefined ? parseInt(req.body.remainSessions) : undefined
      },
      include: {
        client: true,
        package: true,
        instructor: true
      }
    });

    res.json({
      ...membership,
      id: membership.id.toString(),
      clientId: membership.clientId.toString(),
      packageId: membership.packageId.toString(),
      instructorId: membership.instructorId.toString(),
      client: {
        ...membership.client,
        id: membership.client.id.toString()
      },
      package: {
        ...membership.package,
        id: membership.package.id.toString()
      },
      instructor: {
        ...membership.instructor,
        id: membership.instructor.id.toString(),
        packageId: membership.instructor.packageId.toString()
      }
    });
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(404).json({ message: 'Membership not found' });
    }
    console.error('Error updating membership:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete membership
router.delete('/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const id = BigInt(req.params.id);

    await prisma.membership.delete({
      where: { id }
    });

    res.json({ message: 'Membership deleted successfully' });
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(404).json({ message: 'Membership not found' });
    }
    console.error('Error deleting membership:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;

