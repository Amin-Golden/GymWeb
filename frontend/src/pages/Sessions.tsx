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
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  CircularProgress,
  Alert,
  Chip,
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import axios from 'axios';

interface Membership {
  id: string;
  client: { fname: string; lname: string };
}

interface Instructor {
  id: string;
  fname: string;
  lname: string;
}

interface Session {
  id: string;
  instructorId: string;
  membershipId: string;
  destinationDate: string;
  isAttended: boolean;
  description: string;
  instructor: Instructor;
  membership: Membership;
}

const Sessions: React.FC = () => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editingSession, setEditingSession] = useState<Session | null>(null);
  const [formData, setFormData] = useState({
    instructorId: '',
    membershipId: '',
    destinationDate: '',
    isAttended: false,
    description: '',
  });
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [sessionsRes, membershipsRes, instructorsRes] = await Promise.all([
        axios.get('/api/sessions'),
        axios.get('/api/memberships'),
        axios.get('/api/instructors'),
      ]);
      setSessions(sessionsRes.data);
      setMemberships(membershipsRes.data);
      setInstructors(instructorsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = (session?: Session) => {
    if (session) {
      setEditingSession(session);
      // Helper function to safely convert date to YYYY-MM-DD format
      const formatDate = (date: any): string => {
        if (!date) return '';
        if (typeof date === 'string') {
          return date.split('T')[0];
        }
        if (date instanceof Date) {
          return date.toISOString().split('T')[0];
        }
        return String(date).split('T')[0];
      };

      setFormData({
        instructorId: session.instructorId,
        membershipId: session.membershipId,
        destinationDate: formatDate(session.destinationDate),
        isAttended: session.isAttended,
        description: session.description || '',
      });
    } else {
      setEditingSession(null);
      setFormData({
        instructorId: instructors[0]?.id || '',
        membershipId: memberships[0]?.id || '',
        destinationDate: '',
        isAttended: false,
        description: '',
      });
    }
    setOpen(true);
    setError('');
  };

  const handleClose = () => {
    setOpen(false);
    setEditingSession(null);
    setError('');
  };

  const handleSubmit = async () => {
    try {
      setError('');
      if (editingSession) {
        await axios.put(`/api/sessions/${editingSession.id}`, formData);
      } else {
        await axios.post('/api/sessions', formData);
      }
      handleClose();
      fetchData();
    } catch (error: any) {
      setError(error.response?.data?.message || 'Error saving session');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this session?')) {
      try {
        await axios.delete(`/api/sessions/${id}`);
        fetchData();
      } catch (error) {
        console.error('Error deleting session:', error);
      }
    }
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
        <Typography variant="h4">Training Sessions</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpen()}>
          Add Session
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Client</TableCell>
              <TableCell>Instructor</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Attended</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sessions.map((session) => (
              <TableRow key={session.id}>
                <TableCell>
                  {session.membership.client.fname} {session.membership.client.lname}
                </TableCell>
                <TableCell>
                  {session.instructor.fname} {session.instructor.lname}
                </TableCell>
                <TableCell>{new Date(session.destinationDate).toLocaleDateString()}</TableCell>
                <TableCell>
                  <Chip
                    label={session.isAttended ? 'Yes' : 'No'}
                    color={session.isAttended ? 'success' : 'default'}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <IconButton size="small" onClick={() => handleOpen(session)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton size="small" onClick={() => handleDelete(session.id)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>{editingSession ? 'Edit Session' : 'Add Session'}</DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <TextField
            margin="dense"
            label="Membership"
            select
            fullWidth
            required
            value={formData.membershipId}
            onChange={(e) => setFormData({ ...formData, membershipId: e.target.value })}
            sx={{ mb: 2 }}
          >
            {memberships.map((membership) => (
              <MenuItem key={membership.id} value={membership.id}>
                {membership.client.fname} {membership.client.lname}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            margin="dense"
            label="Instructor"
            select
            fullWidth
            required
            value={formData.instructorId}
            onChange={(e) => setFormData({ ...formData, instructorId: e.target.value })}
            sx={{ mb: 2 }}
          >
            {instructors.map((instructor) => (
              <MenuItem key={instructor.id} value={instructor.id}>
                {instructor.fname} {instructor.lname}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            margin="dense"
            label="Date"
            type="date"
            fullWidth
            required
            InputLabelProps={{ shrink: true }}
            value={formData.destinationDate}
            onChange={(e) => setFormData({ ...formData, destinationDate: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Attended"
            select
            fullWidth
            required
            value={formData.isAttended}
            onChange={(e) => setFormData({ ...formData, isAttended: e.target.value === 'true' })}
          >
            <MenuItem value="true">Yes</MenuItem>
            <MenuItem value="false">No</MenuItem>
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingSession ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Sessions;

