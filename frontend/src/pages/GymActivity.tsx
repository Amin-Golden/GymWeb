import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  CircularProgress,
  Chip,
  TextField,
  MenuItem,
} from '@mui/material';
import { ExitToApp as ExitIcon } from '@mui/icons-material';
import axios from 'axios';

interface Client {
  id: string;
  fname: string;
  lname: string;
  locker: number | null;
}

interface GymSession {
  id: string;
  clientId: string;
  entranceTime: string;
  exitTime: string | null;
  lockerNumber: number | null;
  client: Client;
}

const GymActivity: React.FC = () => {
  const [sessions, setSessions] = useState<GymSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'active'>('all');

  useEffect(() => {
    fetchSessions();
    const interval = setInterval(fetchSessions, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, [filter]);

  const fetchSessions = async () => {
    try {
      const url = filter === 'active' ? '/api/gym-sessions?active=true' : '/api/gym-sessions';
      const response = await axios.get(url);
      setSessions(response.data);
    } catch (error) {
      console.error('Error fetching gym sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExit = async (id: string) => {
    if (window.confirm('Mark this client as exited?')) {
      try {
        await axios.put(`/api/gym-sessions/${id}/exit`);
        fetchSessions();
      } catch (error) {
        console.error('Error updating session:', error);
      }
    }
  };

  const calculateDuration = (entranceTime: string, exitTime: string | null) => {
    const entrance = new Date(entranceTime);
    const exit = exitTime ? new Date(exitTime) : new Date();
    const diff = Math.floor((exit.getTime() - entrance.getTime()) / 1000 / 60); // minutes
    if (diff < 60) return `${diff} min`;
    const hours = Math.floor(diff / 60);
    const minutes = diff % 60;
    return `${hours}h ${minutes}m`;
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Gym Activity</Typography>
        <TextField
          select
          value={filter}
          onChange={(e) => setFilter(e.target.value as 'all' | 'active')}
          size="small"
          sx={{ minWidth: 150 }}
        >
          <MenuItem value="all">All Sessions</MenuItem>
          <MenuItem value="active">Active Only</MenuItem>
        </TextField>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Client</TableCell>
              <TableCell>Entrance Time</TableCell>
              <TableCell>Exit Time</TableCell>
              <TableCell>Duration</TableCell>
              <TableCell>Locker</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sessions.map((session) => (
              <TableRow key={session.id}>
                <TableCell>
                  {session.client.fname} {session.client.lname}
                </TableCell>
                <TableCell>{new Date(session.entranceTime).toLocaleString()}</TableCell>
                <TableCell>
                  {session.exitTime ? new Date(session.exitTime).toLocaleString() : '-'}
                </TableCell>
                <TableCell>{calculateDuration(session.entranceTime, session.exitTime)}</TableCell>
                <TableCell>{session.lockerNumber || '-'}</TableCell>
                <TableCell>
                  <Chip
                    label={session.exitTime ? 'Completed' : 'Active'}
                    color={session.exitTime ? 'default' : 'success'}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  {!session.exitTime && (
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<ExitIcon />}
                      onClick={() => handleExit(session.id)}
                    >
                      Exit
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
            {sessions.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  No gym sessions found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default GymActivity;

