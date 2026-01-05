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
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import axios from 'axios';

interface Client {
  id: string;
  fname: string;
  lname: string;
  email: string;
  phoneNumber: string;
  socialNumber?: string;
  dob: string | Date;
  isMale: boolean;
  locker: number | null;
  weight?: number | null;
  height?: number | null;
  description?: string;
}

const Clients: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [formData, setFormData] = useState({
    fname: '',
    lname: '',
    email: '',
    phoneNumber: '',
    socialNumber: '',
    dob: '',
    isMale: true,
    locker: '',
    weight: '',
    height: '',
    description: '',
  });
  const [error, setError] = useState('');

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const response = await axios.get('/api/clients');
      setClients(response.data);
    } catch (error) {
      console.error('Error fetching clients:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = (client?: Client) => {
    if (client) {
      setEditingClient(client);
      
      // Handle dob - it could be a string or Date object
      let dobString = '';
      if (client.dob) {
        if (typeof client.dob === 'string') {
          dobString = client.dob.split('T')[0];
        } else if (client.dob && typeof client.dob === 'object' && 'toISOString' in client.dob) {
          dobString = (client.dob as Date).toISOString().split('T')[0];
        } else {
          // If it's already in YYYY-MM-DD format
          dobString = String(client.dob).split('T')[0];
        }
      }
      
      setFormData({
        fname: client.fname,
        lname: client.lname || '',
        email: client.email || '',
        phoneNumber: client.phoneNumber,
        socialNumber: client.socialNumber || '',
        dob: dobString,
        isMale: client.isMale,
        locker: client.locker?.toString() || '',
        weight: client.weight?.toString() || '',
        height: client.height?.toString() || '',
        description: client.description || '',
      });
    } else {
      setEditingClient(null);
      setFormData({
        fname: '',
        lname: '',
        email: '',
        phoneNumber: '',
        socialNumber: '',
        dob: '',
        isMale: true,
        locker: '',
        weight: '',
        height: '',
        description: '',
      });
    }
    setOpen(true);
    setError('');
  };

  const handleClose = () => {
    setOpen(false);
    setEditingClient(null);
    setError('');
  };

  const handleSubmit = async () => {
    try {
      setError('');
      if (editingClient) {
        await axios.put(`/api/clients/${editingClient.id}`, formData);
      } else {
        await axios.post('/api/clients', formData);
      }
      handleClose();
      fetchClients();
    } catch (error: any) {
      setError(error.response?.data?.message || 'Error saving client');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this client?')) {
      try {
        await axios.delete(`/api/clients/${id}`);
        fetchClients();
      } catch (error) {
        console.error('Error deleting client:', error);
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
        <Typography variant="h4">Clients</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpen()}>
          Add Client
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Phone</TableCell>
              <TableCell>Gender</TableCell>
              <TableCell>Locker</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {clients.map((client) => (
              <TableRow key={client.id}>
                <TableCell>
                  {client.fname} {client.lname}
                </TableCell>
                <TableCell>{client.email || '-'}</TableCell>
                <TableCell>{client.phoneNumber}</TableCell>
                <TableCell>{client.isMale ? 'Male' : 'Female'}</TableCell>
                <TableCell>{client.locker || '-'}</TableCell>
                <TableCell>
                  <IconButton size="small" onClick={() => handleOpen(client)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton size="small" onClick={() => handleDelete(client.id)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>{editingClient ? 'Edit Client' : 'Add Client'}</DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <TextField
            margin="dense"
            label="First Name"
            fullWidth
            required
            value={formData.fname}
            onChange={(e) => setFormData({ ...formData, fname: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Last Name"
            fullWidth
            value={formData.lname}
            onChange={(e) => setFormData({ ...formData, lname: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Email"
            type="email"
            fullWidth
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Phone Number"
            fullWidth
            required
            value={formData.phoneNumber}
            onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Social Number"
            fullWidth
            required
            value={formData.socialNumber}
            onChange={(e) => setFormData({ ...formData, socialNumber: e.target.value })}
            disabled={!!editingClient}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Date of Birth"
            type="date"
            fullWidth
            required
            InputLabelProps={{ shrink: true }}
            value={formData.dob}
            onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Gender"
            select
            fullWidth
            required
            value={formData.isMale}
            onChange={(e) => setFormData({ ...formData, isMale: e.target.value === 'true' })}
            sx={{ mb: 2 }}
          >
            <MenuItem value="true">Male</MenuItem>
            <MenuItem value="false">Female</MenuItem>
          </TextField>
          <TextField
            margin="dense"
            label="Locker Number"
            type="number"
            fullWidth
            value={formData.locker}
            onChange={(e) => setFormData({ ...formData, locker: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Weight (kg)"
            type="number"
            fullWidth
            value={formData.weight}
            onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Height (cm)"
            type="number"
            fullWidth
            value={formData.height}
            onChange={(e) => setFormData({ ...formData, height: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingClient ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Clients;

