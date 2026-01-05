import React, { useEffect, useState } from 'react';
import {
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import {
  People as PeopleIcon,
  CardMembership as CardMembershipIcon,
  Person as PersonIcon,
  FitnessCenter as FitnessCenterIcon,
  Payment as PaymentIcon,
  Event as EventIcon,
} from '@mui/icons-material';
import axios from 'axios';

interface Stats {
  totalClients: number;
  totalPackages: number;
  totalInstructors: number;
  activeMemberships: number;
  activeGymSessions: number;
  todayGymSessions: number;
  totalPayments: number;
  activeSessions: number;
}

interface RecentActivity {
  recentClients: any[];
  recentMemberships: any[];
  recentPayments: any[];
  activeGymSessions: any[];
}

const StatCard: React.FC<{ title: string; value: number; icon: React.ReactElement; color: string }> = ({
  title,
  value,
  icon,
  color,
}) => (
  <Card>
    <CardContent>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Box>
          <Typography color="textSecondary" gutterBottom variant="body2">
            {title}
          </Typography>
          <Typography variant="h4">{value}</Typography>
        </Box>
        <Box sx={{ color, fontSize: 48 }}>{icon}</Box>
      </Box>
    </CardContent>
  </Card>
);

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [activity, setActivity] = useState<RecentActivity | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, activityRes] = await Promise.all([
          axios.get('/api/dashboard/stats'),
          axios.get('/api/dashboard/recent-activity'),
        ]);
        setStats(statsRes.data);
        setActivity(activityRes.data);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Clients"
            value={stats?.totalClients || 0}
            icon={<PeopleIcon />}
            color="#1976d2"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Active Memberships"
            value={stats?.activeMemberships || 0}
            icon={<CardMembershipIcon />}
            color="#2e7d32"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Active Gym Sessions"
            value={stats?.activeGymSessions || 0}
            icon={<FitnessCenterIcon />}
            color="#ed6c02"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Packages"
            value={stats?.totalPackages || 0}
            icon={<CardMembershipIcon />}
            color="#9c27b0"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Instructors"
            value={stats?.totalInstructors || 0}
            icon={<PersonIcon />}
            color="#d32f2f"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Today's Sessions"
            value={stats?.todayGymSessions || 0}
            icon={<EventIcon />}
            color="#0288d1"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Payments"
            value={stats?.totalPayments || 0}
            icon={<PaymentIcon />}
            color="#388e3c"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Upcoming Sessions"
            value={stats?.activeSessions || 0}
            icon={<EventIcon />}
            color="#7b1fa2"
          />
        </Grid>
      </Grid>

      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Active Gym Sessions
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Client</TableCell>
                    <TableCell>Entrance Time</TableCell>
                    <TableCell>Locker</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {activity?.activeGymSessions.slice(0, 5).map((session) => (
                    <TableRow key={session.id}>
                      <TableCell>
                        {session.client.fname} {session.client.lname}
                      </TableCell>
                      <TableCell>{new Date(session.entranceTime).toLocaleString()}</TableCell>
                      <TableCell>{session.lockerNumber || '-'}</TableCell>
                    </TableRow>
                  ))}
                  {(!activity?.activeGymSessions || activity.activeGymSessions.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={3} align="center">
                        No active sessions
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Recent Memberships
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Client</TableCell>
                    <TableCell>Package</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {activity?.recentMemberships.map((membership) => (
                    <TableRow key={membership.id}>
                      <TableCell>
                        {membership.client.fname} {membership.client.lname}
                      </TableCell>
                      <TableCell>{membership.package.packageName}</TableCell>
                      <TableCell>{membership.status}</TableCell>
                    </TableRow>
                  ))}
                  {(!activity?.recentMemberships || activity.recentMemberships.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={3} align="center">
                        No recent memberships
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;

