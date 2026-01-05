import express from 'express';
import { authenticateToken } from '../middleware/auth';
import { prisma } from '../server';

const router = express.Router();

// Get dashboard statistics
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const [
      totalClients,
      totalPackages,
      totalInstructors,
      activeMemberships,
      activeGymSessions,
      todayGymSessions,
      totalPayments,
      activeSessions
    ] = await Promise.all([
      prisma.client.count(),
      prisma.package.count(),
      prisma.instructor.count(),
      prisma.membership.count({
        where: {
          isPaid: true,
          endDate: {
            gte: new Date()
          }
        }
      }),
      prisma.gymSession.count({
        where: {
          exitTime: null
        }
      }),
      prisma.gymSession.count({
        where: {
          entranceTime: {
            gte: new Date(new Date().setHours(0, 0, 0, 0))
          }
        }
      }),
      prisma.payment.count(),
      prisma.session.count({
        where: {
          destinationDate: {
            gte: new Date()
          },
          isAttended: false
        }
      })
    ]);

    res.json({
      totalClients,
      totalPackages,
      totalInstructors,
      activeMemberships,
      activeGymSessions,
      todayGymSessions,
      totalPayments,
      activeSessions
    });
  } catch (error: any) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get recent activity
router.get('/recent-activity', authenticateToken, async (req, res) => {
  try {
    const [recentClients, recentMemberships, recentPayments, activeGymSessions] = await Promise.all([
      prisma.client.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          fname: true,
          lname: true,
          phoneNumber: true,
          createdAt: true
        }
      }),
      prisma.membership.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          client: {
            select: {
              id: true,
              fname: true,
              lname: true
            }
          },
          package: {
            select: {
              id: true,
              packageName: true
            }
          }
        }
      }),
      prisma.payment.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          client: {
            select: {
              id: true,
              fname: true,
              lname: true
            }
          }
        }
      }),
      prisma.gymSession.findMany({
        where: {
          exitTime: null
        },
        take: 10,
        orderBy: { entranceTime: 'desc' },
        include: {
          client: {
            select: {
              id: true,
              fname: true,
              lname: true,
              locker: true
            }
          }
        }
      })
    ]);

    res.json({
      recentClients: recentClients.map(c => ({ ...c, id: c.id.toString() })),
      recentMemberships: recentMemberships.map(m => ({
        ...m,
        id: m.id.toString(),
        clientId: m.clientId.toString(),
        packageId: m.packageId.toString(),
        instructorId: m.instructorId.toString(),
        client: { ...m.client, id: m.client.id.toString() },
        package: { ...m.package, id: m.package.id.toString() }
      })),
      recentPayments: recentPayments.map(p => ({
        ...p,
        id: p.id.toString(),
        clientId: p.clientId.toString(),
        client: { ...p.client, id: p.client.id.toString() }
      })),
      activeGymSessions: activeGymSessions.map(gs => ({
        ...gs,
        id: gs.id.toString(),
        clientId: gs.clientId.toString(),
        client: { ...gs.client, id: gs.client.id.toString() }
      }))
    });
  } catch (error: any) {
    console.error('Error fetching recent activity:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;

