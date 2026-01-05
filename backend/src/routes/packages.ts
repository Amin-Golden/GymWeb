import express from 'express';
import { body, validationResult } from 'express-validator';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { prisma } from '../server';

const router = express.Router();

// Get all packages
router.get('/', authenticateToken, async (req, res) => {
  try {
    const packages = await prisma.package.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { memberships: true, instructors: true }
        }
      }
    });

    const packagesWithStringIds = packages.map(pkg => ({
      ...pkg,
      id: pkg.id.toString()
    }));

    res.json(packagesWithStringIds);
  } catch (error: any) {
    console.error('Error fetching packages:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get package by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const id = BigInt(req.params.id);
    const pkg = await prisma.package.findUnique({
      where: { id },
      include: {
        instructors: true,
        memberships: {
          include: {
            client: true
          }
        }
      }
    });

    if (!pkg) {
      return res.status(404).json({ message: 'Package not found' });
    }

    res.json({
      ...pkg,
      id: pkg.id.toString(),
      instructors: pkg.instructors.map(i => ({ ...i, id: i.id.toString(), packageId: i.packageId.toString() })),
      memberships: pkg.memberships.map(m => ({
        ...m,
        id: m.id.toString(),
        clientId: m.clientId.toString(),
        packageId: m.packageId.toString(),
        instructorId: m.instructorId.toString()
      }))
    });
  } catch (error: any) {
    console.error('Error fetching package:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create package
router.post('/', authenticateToken, [
  body('packageName').notEmpty().withMessage('Package name is required'),
  body('duration').notEmpty().withMessage('Duration is required'),
  body('price').isInt({ min: 0 }).withMessage('Price must be a positive integer'),
  body('days').isInt({ min: 1 }).withMessage('Days must be a positive integer')
], async (req: AuthRequest, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const pkg = await prisma.package.create({
      data: {
        packageName: req.body.packageName,
        imagePath: req.body.imagePath,
        duration: req.body.duration,
        price: parseInt(req.body.price),
        days: parseInt(req.body.days),
        description: req.body.description
      }
    });

    res.status(201).json({
      ...pkg,
      id: pkg.id.toString()
    });
  } catch (error: any) {
    console.error('Error creating package:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update package
router.put('/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const id = BigInt(req.params.id);

    const pkg = await prisma.package.update({
      where: { id },
      data: {
        packageName: req.body.packageName,
        imagePath: req.body.imagePath,
        duration: req.body.duration,
        price: req.body.price !== undefined ? parseInt(req.body.price) : undefined,
        days: req.body.days !== undefined ? parseInt(req.body.days) : undefined,
        description: req.body.description
      }
    });

    res.json({
      ...pkg,
      id: pkg.id.toString()
    });
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(404).json({ message: 'Package not found' });
    }
    console.error('Error updating package:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete package
router.delete('/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const id = BigInt(req.params.id);

    await prisma.package.delete({
      where: { id }
    });

    res.json({ message: 'Package deleted successfully' });
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(404).json({ message: 'Package not found' });
    }
    console.error('Error deleting package:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;

