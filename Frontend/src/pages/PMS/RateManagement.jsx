import React, { useState } from 'react';
import axios from 'axios';
import { saveAs } from 'file-saver';
import {
  Box,
  Button,
  Container,
  Typography,
  Paper,
  TextField,
  Snackbar,
  Alert,
  CircularProgress,
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DownloadIcon from '@mui/icons-material/Download';
import { useAuth } from '../../context/AuthContext';

const RateManagement = () => {
  const { isLoggedIn, userRole, loading: authLoading, token, hotel } = useAuth();

  const [year, setYear] = useState(new Date().getFullYear());
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // ✅ Download Rate Template
  const downloadTemplate = async () => {
    if (!year) {
      setSnackbar({
        open: true,
        message: 'Please select a year',
        severity: 'warning'
      });
      return;
    }

    setLoading(true);
    try {
      const response = await axios.get(
        `http://localhost:5000/api/hotel/rates/template?year=${year}`,
        { 
          headers: { Authorization: `Bearer ${token}` },
          responseType: 'blob' 
        }
      );

      saveAs(new Blob([response.data]), `Room_Rates_${year}.xlsx`);
      setSnackbar({
        open: true,
        message: 'Template downloaded successfully',
        severity: 'success'
      });
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

  // ✅ Handle File Selection
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  // ✅ Upload Rates
  const uploadRates = async () => {
    if (!file) {
      setSnackbar({
        open: true,
        message: 'Please select a file',
        severity: 'warning'
      });
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      await axios.post(
        `http://localhost:5000/api/hotel/rates/upload?year=${year}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      setSnackbar({
        open: true,
        message: 'Successfully uploaded rates',
        severity: 'success'
      });
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
        Rate Management
      </Typography>

      {/* ✅ Download Template */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Download Rate Template
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 2 }}>
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
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : 'Download Template'}
        </Button>
      </Paper>

      {/* ✅ Upload Rates */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Upload Rates
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
          disabled={loading || !file}
          size="small"
        >
          {loading ? <CircularProgress size={24} /> : 'Upload Rates'}
        </Button>
      </Paper>

      {/* ✅ Snackbar */}
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
