import express from 'express';
import { body, validationResult } from 'express-validator';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { prisma } from '../server';

const router = express.Router();

// Get all payments
router.get('/', authenticateToken, async (req, res) => {
  try {
    const payments = await prisma.payment.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        client: true
      }
    });

    const paymentsWithStringIds = payments.map(payment => ({
      ...payment,
      id: payment.id.toString(),
      clientId: payment.clientId.toString(),
      client: {
        ...payment.client,
        id: payment.client.id.toString()
      }
    }));

    res.json(paymentsWithStringIds);
  } catch (error: any) {
    console.error('Error fetching payments:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get payment by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const id = BigInt(req.params.id);
    const payment = await prisma.payment.findUnique({
      where: { id },
      include: {
        client: true
      }
    });

    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    res.json({
      ...payment,
      id: payment.id.toString(),
      clientId: payment.clientId.toString(),
      client: {
        ...payment.client,
        id: payment.client.id.toString()
      }
    });
  } catch (error: any) {
    console.error('Error fetching payment:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create payment
router.post('/', authenticateToken, [
  body('clientId').notEmpty().withMessage('Client ID is required'),
  body('paymentType').notEmpty().withMessage('Payment type is required')
], async (req: AuthRequest, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const payment = await prisma.payment.create({
      data: {
        clientId: BigInt(req.body.clientId),
        paymentType: req.body.paymentType,
        description: req.body.description
      },
      include: {
        client: true
      }
    });

    res.status(201).json({
      ...payment,
      id: payment.id.toString(),
      clientId: payment.clientId.toString(),
      client: {
        ...payment.client,
        id: payment.client.id.toString()
      }
    });
  } catch (error: any) {
    console.error('Error creating payment:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update payment
router.put('/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const id = BigInt(req.params.id);

    const payment = await prisma.payment.update({
      where: { id },
      data: {
        clientId: req.body.clientId ? BigInt(req.body.clientId) : undefined,
        paymentType: req.body.paymentType,
        description: req.body.description
      },
      include: {
        client: true
      }
    });

    res.json({
      ...payment,
      id: payment.id.toString(),
      clientId: payment.clientId.toString(),
      client: {
        ...payment.client,
        id: payment.client.id.toString()
      }
    });
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(404).json({ message: 'Payment not found' });
    }
    console.error('Error updating payment:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete payment
router.delete('/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const id = BigInt(req.params.id);

    await prisma.payment.delete({
      where: { id }
    });

    res.json({ message: 'Payment deleted successfully' });
  } catch (error: any) {
    if (error.code === 'P2025') {
      return res.status(404).json({ message: 'Payment not found' });
    }
    console.error('Error deleting payment:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;

