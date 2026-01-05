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
}

interface Payment {
  id: string;
  clientId: string;
  paymentType: string;
  description: string;
  createdAt: string;
  client: Client;
}

const Payments: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null);
  const [formData, setFormData] = useState({
    clientId: '',
    paymentType: 'cash',
    description: '',
  });
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [paymentsRes, clientsRes] = await Promise.all([
        axios.get('/api/payments'),
        axios.get('/api/clients'),
      ]);
      setPayments(paymentsRes.data);
      setClients(clientsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = (payment?: Payment) => {
    if (payment) {
      setEditingPayment(payment);
      setFormData({
        clientId: payment.clientId,
        paymentType: payment.paymentType,
        description: payment.description || '',
      });
    } else {
      setEditingPayment(null);
      setFormData({
        clientId: clients[0]?.id || '',
        paymentType: 'cash',
        description: '',
      });
    }
    setOpen(true);
    setError('');
  };

  const handleClose = () => {
    setOpen(false);
    setEditingPayment(null);
    setError('');
  };

  const handleSubmit = async () => {
    try {
      setError('');
      if (editingPayment) {
        await axios.put(`/api/payments/${editingPayment.id}`, formData);
      } else {
        await axios.post('/api/payments', formData);
      }
      handleClose();
      fetchData();
    } catch (error: any) {
      setError(error.response?.data?.message || 'Error saving payment');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this payment?')) {
      try {
        await axios.delete(`/api/payments/${id}`);
        fetchData();
      } catch (error) {
        console.error('Error deleting payment:', error);
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
        <Typography variant="h4">Payments</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpen()}>
          Add Payment
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Client</TableCell>
              <TableCell>Payment Type</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {payments.map((payment) => (
              <TableRow key={payment.id}>
                <TableCell>
                  {payment.client.fname} {payment.client.lname}
                </TableCell>
                <TableCell>{payment.paymentType}</TableCell>
                <TableCell>{payment.description || '-'}</TableCell>
                <TableCell>{new Date(payment.createdAt).toLocaleString()}</TableCell>
                <TableCell>
                  <IconButton size="small" onClick={() => handleOpen(payment)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton size="small" onClick={() => handleDelete(payment.id)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>{editingPayment ? 'Edit Payment' : 'Add Payment'}</DialogTitle>
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
            label="Payment Type"
            select
            fullWidth
            required
            value={formData.paymentType}
            onChange={(e) => setFormData({ ...formData, paymentType: e.target.value })}
            sx={{ mb: 2 }}
          >
            <MenuItem value="cash">Cash</MenuItem>
            <MenuItem value="card">Card</MenuItem>
            <MenuItem value="online">Online</MenuItem>
          </TextField>
          <TextField
            margin="dense"
            label="Description"
            fullWidth
            multiline
            rows={3}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingPayment ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Payments;

