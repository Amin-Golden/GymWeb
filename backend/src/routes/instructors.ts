import express from 'express';
import { body, validationResult } from 'express-validator';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { prisma } from '../server';

const router = express.Router();

// Get all instructors
router.get('/', authenticateToken, async (req, res) => {
  try {
    const instructors = await prisma.instructor.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        package: true,
        _count: {
          select: { memberships: true, sessions: true }
        }
      }
    });

    const instructorsWithStringIds = instructors.map(instructor => ({
      ...instructor,
      id: instructor.id.toString(),
      packageId: instructor.packageId.toString(),
      package: {
        ...instructor.package,
        id: instructor.package.id.toString()
      }
    }));

    res.json(instructorsWithStringIds);
  } catch (error: any) {
    console.error('Error fetching instructors:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get instructor by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const id = BigInt(req.params.id);
    const instructor = await prisma.instructor.findUnique({
      where: { id },
      include: {
        package: true,
        memberships: {
          include: {
            client: true
          }
        },
        sessions: {
          include: {
            membership: {
              include: {
                client: true
              }
            }
          }
        }
      }
    });

    if (!instructor) {
      return res.status(404).json({ message: 'Instructor not found' });
    }

    res.json({
      ...instructor,
      id: instructor.id.toString(),
      packageId: instructor.packageId.toString(),
      package: {
        ...instructor.package,
        id: instructor.package.id.toString()
      },
      memberships: instructor.memberships.map(m => ({
        ...m,
        id: m.id.toString(),
        clientId: m.clientId.toString(),
        packageId: m.packageId.toString(),
        instructorId: m.instructorId.toString()
      })),
      sessions: instructor.sessions.map(s => ({
        ...s,
        id: s.id.toString(),
        instructorId: s.instructorId.toString(),
        membershipId: s.membershipId.toString()
      }))
    });
  } catch (error: any) {
    console.error('Error fetching instructor:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create instructor
router.post('/', authenticateToken, [
  body('fname').notEmpty().withMessage('First name is required'),
  body('packageId').notEmpty().withMessage('Package ID is required'),
  body('dob').isISO8601().withMessage('Valid date of birth is required'),
  body('isMale').isBoolean().withMessage('Gender is required'),
  body('salary').isFloat({ min: 0 }).withMessage('Salary must be a positive number'),
  body('title').notEmpty().withMessage('Title is required'),
  body('phoneNumber').notEmpty().withMessage('Phone number is required')
], async (req: AuthRequest, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const instructor = await prisma.instructor.create({
      data: {
        packageId: BigInt(req.body.packageId),
        fname: req.body.fname,
        lname: req.body.lname,
        dob: new Date(req.body.dob),
        isMale: req.body.isMale,
        salary: parseFloat(req.body.salary),
        email: req.body.email,
        title: req.body.title,
        description: req.body.description,
        phoneNumber: req.body.phoneNumber,
        imagePath: req.body.imagePath
      },
      include: {
        package: true
      }
    });

    res.status(201).json({
      ...instructor,
      id: instructor.id.toString(),
      packageId: instructor.packageId.toString(),
      package: {
        ...instructor.package,
        id: instructor.package.id.toString()
      }
    });
  } catch (error: any) {
    console.error('Error creating instructor:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update instructor
router.put('/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const id = BigInt(req.params.id);

    const instructor = await prisma.instructor.update({
      where: { id },
      data: {
        packageId: req.body.packageId ? BigInt(req.body.packageId) : undefined,
        fname: req.body.fname,
        lname: req.body.lname,
        dob: req.body.dob ? new Date(req.body.dob) : undefined,
        isMale: req.body.isMale,
        salary: req.body.salary !== undefined ? parseFloat(req.body.salary) : undefined,
        email: req.body.email,
        title: req.body.title,
        description: req.body.description,
        phoneNumber: req.body.phoneNumber,
        imagePath: req.body.imagePath
      },
      include: {
        package: true
      }
    });

    res.json({
      ...instructor,
      id: instructor.id.toString(),
      packageId: instructor.packageId.toString(),
      package: {
        ...instructor.package,
        id: instructor.package.id.toString()
      }
    });
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(404).json({ message: 'Instructor not found' });
    }
    console.error('Error updating instructor:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete instructor
router.delete('/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const id = BigInt(req.params.id);

    await prisma.instructor.delete({
      where: { id }
    });

    res.json({ message: 'Instructor deleted successfully' });
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(404).json({ message: 'Instructor not found' });
    }
    console.error('Error deleting instructor:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;

