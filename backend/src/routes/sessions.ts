import express from 'express';
import { body, validationResult } from 'express-validator';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { prisma } from '../server';

const router = express.Router();

// Get all sessions
router.get('/', authenticateToken, async (req, res) => {
  try {
    const sessions = await prisma.session.findMany({
      orderBy: { destinationDate: 'desc' },
      include: {
        instructor: true,
        membership: {
          include: {
            client: true,
            package: true
          }
        },
        attendance: {
          include: {
            client: true
          }
        }
      }
    });

    const sessionsWithStringIds = sessions.map(session => ({
      ...session,
      id: session.id.toString(),
      instructorId: session.instructorId.toString(),
      membershipId: session.membershipId.toString(),
      instructor: {
        ...session.instructor,
        id: session.instructor.id.toString(),
        packageId: session.instructor.packageId.toString()
      },
      membership: {
        ...session.membership,
        id: session.membership.id.toString(),
        clientId: session.membership.clientId.toString(),
        packageId: session.membership.packageId.toString(),
        instructorId: session.membership.instructorId.toString()
      }
    }));

    res.json(sessionsWithStringIds);
  } catch (error: any) {
    console.error('Error fetching sessions:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get session by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const id = BigInt(req.params.id);
    const session = await prisma.session.findUnique({
      where: { id },
      include: {
        instructor: true,
        membership: {
          include: {
            client: true,
            package: true
          }
        },
        attendance: {
          include: {
            client: true
          }
        }
      }
    });

    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    res.json({
      ...session,
      id: session.id.toString(),
      instructorId: session.instructorId.toString(),
      membershipId: session.membershipId.toString(),
      instructor: {
        ...session.instructor,
        id: session.instructor.id.toString(),
        packageId: session.instructor.packageId.toString()
      },
      membership: {
        ...session.membership,
        id: session.membership.id.toString(),
        clientId: session.membership.clientId.toString(),
        packageId: session.membership.packageId.toString(),
        instructorId: session.membership.instructorId.toString()
      },
      attendance: session.attendance.map(a => ({
        ...a,
        id: a.id.toString(),
        clientId: a.clientId.toString(),
        sessionId: a.sessionId.toString()
      }))
    });
  } catch (error: any) {
    console.error('Error fetching session:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create session
router.post('/', authenticateToken, [
  body('instructorId').notEmpty().withMessage('Instructor ID is required'),
  body('membershipId').notEmpty().withMessage('Membership ID is required'),
  body('destinationDate').isISO8601().withMessage('Valid destination date is required'),
  body('isAttended').isBoolean().withMessage('Attendance status is required')
], async (req: AuthRequest, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const session = await prisma.session.create({
      data: {
        instructorId: BigInt(req.body.instructorId),
        membershipId: BigInt(req.body.membershipId),
        destinationDate: new Date(req.body.destinationDate),
        isAttended: req.body.isAttended,
        description: req.body.description
      },
      include: {
        instructor: true,
        membership: {
          include: {
            client: true,
            package: true
          }
        }
      }
    });

    res.status(201).json({
      ...session,
      id: session.id.toString(),
      instructorId: session.instructorId.toString(),
      membershipId: session.membershipId.toString(),
      instructor: {
        ...session.instructor,
        id: session.instructor.id.toString(),
        packageId: session.instructor.packageId.toString()
      },
      membership: {
        ...session.membership,
        id: session.membership.id.toString(),
        clientId: session.membership.clientId.toString(),
        packageId: session.membership.packageId.toString(),
        instructorId: session.membership.instructorId.toString()
      }
    });
  } catch (error: any) {
    console.error('Error creating session:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update session
router.put('/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const id = BigInt(req.params.id);

    const session = await prisma.session.update({
      where: { id },
      data: {
        instructorId: req.body.instructorId ? BigInt(req.body.instructorId) : undefined,
        membershipId: req.body.membershipId ? BigInt(req.body.membershipId) : undefined,
        destinationDate: req.body.destinationDate ? new Date(req.body.destinationDate) : undefined,
        isAttended: req.body.isAttended,
        description: req.body.description
      },
      include: {
        instructor: true,
        membership: {
          include: {
            client: true,
            package: true
          }
        }
      }
    });

    res.json({
      ...session,
      id: session.id.toString(),
      instructorId: session.instructorId.toString(),
      membershipId: session.membershipId.toString(),
      instructor: {
        ...session.instructor,
        id: session.instructor.id.toString(),
        packageId: session.instructor.packageId.toString()
      },
      membership: {
        ...session.membership,
        id: session.membership.id.toString(),
        clientId: session.membership.clientId.toString(),
        packageId: session.membership.packageId.toString(),
        instructorId: session.membership.instructorId.toString()
      }
    });
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(404).json({ message: 'Session not found' });
    }
    console.error('Error updating session:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete session
router.delete('/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const id = BigInt(req.params.id);

    await prisma.session.delete({
      where: { id }
    });

    res.json({ message: 'Session deleted successfully' });
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(404).json({ message: 'Session not found' });
    }
    console.error('Error deleting session:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;

