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

interface Package {
  id: string;
  packageName: string;
}

interface Instructor {
  id: string;
  fname: string;
  lname: string;
  email: string;
  phoneNumber: string;
  title: string;
  salary: number;
  packageId: string;
  package: Package;
}

const Instructors: React.FC = () => {
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editingInstructor, setEditingInstructor] = useState<Instructor | null>(null);
  const [formData, setFormData] = useState({
    fname: '',
    lname: '',
    email: '',
    phoneNumber: '',
    title: '',
    salary: '',
    packageId: '',
    dob: '',
    isMale: true,
    description: '',
  });
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [instructorsRes, packagesRes] = await Promise.all([
        axios.get('/api/instructors'),
        axios.get('/api/packages'),
      ]);
      setInstructors(instructorsRes.data);
      setPackages(packagesRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = (instructor?: Instructor) => {
    if (instructor) {
      setEditingInstructor(instructor);
      setFormData({
        fname: instructor.fname,
        lname: instructor.lname || '',
        email: instructor.email || '',
        phoneNumber: instructor.phoneNumber,
        title: instructor.title,
        salary: instructor.salary.toString(),
        packageId: instructor.packageId,
        dob: '',
        isMale: true,
        description: '',
      });
    } else {
      setEditingInstructor(null);
      setFormData({
        fname: '',
        lname: '',
        email: '',
        phoneNumber: '',
        title: '',
        salary: '',
        packageId: packages[0]?.id || '',
        dob: '',
        isMale: true,
        description: '',
      });
    }
    setOpen(true);
    setError('');
  };

  const handleClose = () => {
    setOpen(false);
    setEditingInstructor(null);
    setError('');
  };

  const handleSubmit = async () => {
    try {
      setError('');
      if (editingInstructor) {
        await axios.put(`/api/instructors/${editingInstructor.id}`, formData);
      } else {
        await axios.post('/api/instructors', formData);
      }
      handleClose();
      fetchData();
    } catch (error: any) {
      setError(error.response?.data?.message || 'Error saving instructor');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this instructor?')) {
      try {
        await axios.delete(`/api/instructors/${id}`);
        fetchData();
      } catch (error) {
        console.error('Error deleting instructor:', error);
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
        <Typography variant="h4">Instructors</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpen()}>
          Add Instructor
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Title</TableCell>
              <TableCell>Package</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Phone</TableCell>
              <TableCell>Salary</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {instructors.map((instructor) => (
              <TableRow key={instructor.id}>
                <TableCell>
                  {instructor.fname} {instructor.lname}
                </TableCell>
                <TableCell>{instructor.title}</TableCell>
                <TableCell>{instructor.package?.packageName || '-'}</TableCell>
                <TableCell>{instructor.email || '-'}</TableCell>
                <TableCell>{instructor.phoneNumber}</TableCell>
                <TableCell>${instructor.salary}</TableCell>
                <TableCell>
                  <IconButton size="small" onClick={() => handleOpen(instructor)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton size="small" onClick={() => handleDelete(instructor.id)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>{editingInstructor ? 'Edit Instructor' : 'Add Instructor'}</DialogTitle>
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
            label="Title"
            fullWidth
            required
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            sx={{ mb: 2 }}
          />
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
            label="Salary"
            type="number"
            fullWidth
            required
            value={formData.salary}
            onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
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
          >
            <MenuItem value="true">Male</MenuItem>
            <MenuItem value="false">Female</MenuItem>
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingInstructor ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Instructors;

