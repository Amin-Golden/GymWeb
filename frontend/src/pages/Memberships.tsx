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

interface Client {
  id: string;
  fname: string;
  lname: string;
}

interface Package {
  id: string;
  packageName: string;
}

interface Instructor {
  id: string;
  fname: string;
  lname: string;
}

interface Membership {
  id: string;
  clientId: string;
  packageId: string;
  instructorId: string;
  status: string;
  startDate: string;
  endDate: string;
  isPaid: boolean;
  remainSessions: number;
  client: Client;
  package: Package;
  instructor: Instructor;
}

const Memberships: React.FC = () => {
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [packages, setPackages] = useState<Package[]>([]);
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editingMembership, setEditingMembership] = useState<Membership | null>(null);
  const [formData, setFormData] = useState({
    clientId: '',
    packageId: '',
    instructorId: '',
    status: 'active',
    startDate: '',
    endDate: '',
    paymentDate: '',
    isPaid: false,
    remainSessions: '0',
    description: '',
  });
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [membershipsRes, clientsRes, packagesRes, instructorsRes] = await Promise.all([
        axios.get('/api/memberships'),
        axios.get('/api/clients'),
        axios.get('/api/packages'),
        axios.get('/api/instructors'),
      ]);
      setMemberships(membershipsRes.data);
      setClients(clientsRes.data);
      setPackages(packagesRes.data);
      setInstructors(instructorsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = (membership?: Membership) => {
    if (membership) {
      setEditingMembership(membership);
      setFormData({
        clientId: membership.clientId,
        packageId: membership.packageId,
        instructorId: membership.instructorId,
        status: membership.status,
        startDate: membership.startDate.split('T')[0],
        endDate: membership.endDate.split('T')[0],
        paymentDate: '',
        isPaid: membership.isPaid,
        remainSessions: membership.remainSessions.toString(),
        description: '',
      });
    } else {
      setEditingMembership(null);
      setFormData({
        clientId: clients[0]?.id || '',
        packageId: packages[0]?.id || '',
        instructorId: instructors[0]?.id || '',
        status: 'active',
        startDate: '',
        endDate: '',
        paymentDate: new Date().toISOString().split('T')[0],
        isPaid: false,
        remainSessions: '0',
        description: '',
      });
    }
    setOpen(true);
    setError('');
  };

  const handleClose = () => {
    setOpen(false);
    setEditingMembership(null);
    setError('');
  };

  const handleSubmit = async () => {
    try {
      setError('');
      if (editingMembership) {
        await axios.put(`/api/memberships/${editingMembership.id}`, formData);
      } else {
        await axios.post('/api/memberships', formData);
      }
      handleClose();
      fetchData();
    } catch (error: any) {
      setError(error.response?.data?.message || 'Error saving membership');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this membership?')) {
      try {
        await axios.delete(`/api/memberships/${id}`);
        fetchData();
      } catch (error) {
        console.error('Error deleting membership:', error);
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
        <Typography variant="h4">Memberships</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpen()}>
          Add Membership
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Client</TableCell>
              <TableCell>Package</TableCell>
              <TableCell>Instructor</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Start Date</TableCell>
              <TableCell>End Date</TableCell>
              <TableCell>Paid</TableCell>
              <TableCell>Remaining Sessions</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {memberships.map((membership) => (
              <TableRow key={membership.id}>
                <TableCell>
                  {membership.client.fname} {membership.client.lname}
                </TableCell>
                <TableCell>{membership.package.packageName}</TableCell>
                <TableCell>
                  {membership.instructor.fname} {membership.instructor.lname}
                </TableCell>
                <TableCell>
                  <Chip
                    label={membership.status}
                    color={membership.status === 'active' ? 'success' : 'default'}
                    size="small"
                  />
                </TableCell>
                <TableCell>{new Date(membership.startDate).toLocaleDateString()}</TableCell>
                <TableCell>{new Date(membership.endDate).toLocaleDateString()}</TableCell>
                <TableCell>
                  <Chip
                    label={membership.isPaid ? 'Yes' : 'No'}
                    color={membership.isPaid ? 'success' : 'error'}
                    size="small"
                  />
                </TableCell>
                <TableCell>{membership.remainSessions}</TableCell>
                <TableCell>
                  <IconButton size="small" onClick={() => handleOpen(membership)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton size="small" onClick={() => handleDelete(membership.id)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>{editingMembership ? 'Edit Membership' : 'Add Membership'}</DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <TextField
            margin="dense"
            label="Client"
            select
            fullWidth
            required
            value={formData.clientId}
            onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
            sx={{ mb: 2 }}
          >
            {clients.map((client) => (
              <MenuItem key={client.id} value={client.id}>
                {client.fname} {client.lname}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            margin="dense"
            label="Package"
            select
            fullWidth
            required
            value={formData.packageId}
            onChange={(e) => setFormData({ ...formData, packageId: e.target.value })}
            sx={{ mb: 2 }}
          >
            {packages.map((pkg) => (
              <MenuItem key={pkg.id} value={pkg.id}>
                {pkg.packageName}
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
            label="Status"
            select
            fullWidth
            required
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            sx={{ mb: 2 }}
          >
            <MenuItem value="active">Active</MenuItem>
            <MenuItem value="expired">Expired</MenuItem>
            <MenuItem value="cancelled">Cancelled</MenuItem>
          </TextField>
          <TextField
            margin="dense"
            label="Start Date"
            type="date"
            fullWidth
            required
            InputLabelProps={{ shrink: true }}
            value={formData.startDate}
            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="End Date"
            type="date"
            fullWidth
            required
            InputLabelProps={{ shrink: true }}
            value={formData.endDate}
            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Payment Date"
            type="date"
            fullWidth
            required
            InputLabelProps={{ shrink: true }}
            value={formData.paymentDate}
            onChange={(e) => setFormData({ ...formData, paymentDate: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Payment Status"
            select
            fullWidth
            required
            value={formData.isPaid}
            onChange={(e) => setFormData({ ...formData, isPaid: e.target.value === 'true' })}
            sx={{ mb: 2 }}
          >
            <MenuItem value="true">Paid</MenuItem>
            <MenuItem value="false">Unpaid</MenuItem>
          </TextField>
          <TextField
            margin="dense"
            label="Remaining Sessions"
            type="number"
            fullWidth
            value={formData.remainSessions}
            onChange={(e) => setFormData({ ...formData, remainSessions: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingMembership ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Memberships;

