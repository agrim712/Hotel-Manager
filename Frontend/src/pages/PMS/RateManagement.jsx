import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { saveAs } from 'file-saver';
import {
  Box,
  Button,
  Container,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Snackbar,
  Alert,
  CircularProgress
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DownloadIcon from '@mui/icons-material/Download';
import { useAuth } from '../../context/AuthContext';

const RateManagement = () => {
  const { isLoggedIn, userRole, hotel, loading: authLoading } = useAuth();
  const [rateTypes, setRateTypes] = useState([
    { value: 'rack', label: 'Rack Rate' },
    { value: 'corporate', label: 'Corporate Rate' },
    { value: 'package', label: 'Package Rate' },
    { value: 'promo', label: 'Promotional Rate' }
  ]);
  const [selectedRateType, setSelectedRateType] = useState('');
  const [year, setYear] = useState(new Date().getFullYear());
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [roomRates, setRoomRates] = useState([]);

  const downloadTemplate = async () => {
    if (!selectedRateType || !year) {
      setSnackbar({
        open: true,
        message: 'Please select rate type and year',
        severity: 'warning'
      });
      return;
    }

    if (!hotel?.id) {
      setSnackbar({
        open: true,
        message: 'Hotel information not available',
        severity: 'error'
      });
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `http://localhost:5000/api/hotel/rates/template?rateType=${selectedRateType}&year=${year}`,
        { 
          headers: {
            Authorization: `Bearer ${token}`
          },
          responseType: 'blob' 
        }
      );

      saveAs(
        new Blob([response.data]),
        `Room_Rates_${selectedRateType}_${year}.xlsx`
      );
    } catch (error) {
      console.error('Error downloading template:', error);
      setSnackbar({
        open: true,
        message: 'Failed to download template',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

const uploadRates = async () => {
  if (!file || !selectedRateType) {
    setSnackbar({
      open: true,
      message: 'Please select a file and rate type',
      severity: 'warning'
    });
    return;
  }

  setLoading(true);
  const token = localStorage.getItem('token');
  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await axios.post(
      `/api/hotel/rates/upload?rateType=${selectedRateType}`,
      formData,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      }
    );

    setSnackbar({
      open: true,
      message: `Successfully uploaded rates`,
      severity: 'success'
    });
    fetchRates();
  } catch (error) {
    const errorMessage = error.response?.data?.error || 'Failed to upload rates';
    setSnackbar({
      open: true,
      message: errorMessage,
      severity: 'error'
    });
  } finally {
    setLoading(false);
  }
};
const fetchRates = async () => {
  if (!selectedRateType || !hotel?.id) return;

  try {
    const token = localStorage.getItem('token');
    const currentDate = new Date();
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    console.log("Selected Rate Type =",selectedRateType);
    const response = await axios.get(
      `/api/hotel/rates/${selectedRateType}`, // Changed from full URL to relative path
      {
        headers: {
          Authorization: `Bearer ${token}`
        },
        params: {
          startDate: firstDayOfMonth.toISOString().split('T')[0],
          endDate: lastDayOfMonth.toISOString().split('T')[0]
        }
      }
    );
    setRoomRates(response.data);
  } catch (error) {
        if (error.response?.status === 404) {
      setSnackbar({
        open: true,
        message: `No rates found for ${selectedRateType}. You can upload rates using the form below.`,
        severity: 'info'
      });
    }
    else{
        console.error('Error fetching room rates:', error);
        setSnackbar({
          open: true,
          message: error.response?.data?.error || 'Failed to fetch room rates',
          severity: 'error'
        });
    }
  }
};

  useEffect(() => {
    if (isLoggedIn && selectedRateType) {
      fetchRates();
    }
  }, [isLoggedIn, selectedRateType, hotel?.id]);

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  if (authLoading) {
    return <div>Loading...</div>;
  }

  if (!isLoggedIn || userRole !== 'HOTELADMIN') {
    return <div>Unauthorized access</div>;
  }

  return (
    
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 4 }}>
        Room Rate Management
      </Typography>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Download Rate Template
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 2 }}>
          <FormControl sx={{ minWidth: 200 }} size="small">
            <InputLabel>Rate Type</InputLabel>
            <Select
              value={selectedRateType}
              onChange={(e) => setSelectedRateType(e.target.value)}
              label="Rate Type"
            >
              {rateTypes.map((type) => (
                <MenuItem key={type.value} value={type.value}>
                  {type.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            label="Year"
            type="number"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            sx={{ width: 120 }}
            size="small"
          />
        </Box>
        <Button
          variant="contained"
          startIcon={<DownloadIcon />}
          onClick={downloadTemplate}
          disabled={loading || !selectedRateType}
        >
          Download Template
        </Button>
      </Paper>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Upload Room Rates
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2 }}>
          <Button
            variant="contained"
            component="label"
            startIcon={<CloudUploadIcon />}
            size="small"
          >
            Select File
            <input
              type="file"
              hidden
              accept=".xlsx,.xls"
              onChange={handleFileChange}
            />
          </Button>
          <Typography variant="body2">
            {file ? file.name : 'No file selected'}
          </Typography>
        </Box>
        <Button
          variant="contained"
          color="primary"
          onClick={uploadRates}
          disabled={loading || !file || !selectedRateType}
          size="small"
        >
          {loading ? <CircularProgress size={24} /> : 'Upload Rates'}
        </Button>
      </Paper>

      {roomRates.length > 0 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Current Rates ({roomRates.length} entries)
          </Typography>
          <TableContainer sx={{ maxHeight: 500 }}>
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Room Number</TableCell>
                  <TableCell align="right">Base Price</TableCell>
                  <TableCell align="right">Min Price</TableCell>
                  <TableCell align="right">Max Price</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {roomRates.map((rate) => (
                  <TableRow key={`${rate.date}-${rate.roomNumber}`}>
                    <TableCell>{new Date(rate.date).toLocaleDateString()}</TableCell>
                    <TableCell>{rate.roomNumber}</TableCell>
                    <TableCell align="right">{rate.basePrice.toFixed(2)}</TableCell>
                    <TableCell align="right">{rate.minPrice.toFixed(2)}</TableCell>
                    <TableCell align="right">{rate.maxPrice.toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default RateManagement;