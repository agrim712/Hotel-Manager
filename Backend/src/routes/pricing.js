// pricing.js
import express from 'express';
import { PythonShell } from 'python-shell';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

router.post('/pricing/predict', async (req, res) => {
  try {
    const { hotelId, roomTypeId, checkinDate, checkoutDate, numRooms } = req.body;
    
    // Validate input
    if (!checkinDate || !checkoutDate || !roomTypeId || !numRooms) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    const options = {
      mode: 'json',
      pythonPath: 'python3', // Changed from 'python' to 'python3' for better compatibility
      scriptPath: path.join(__dirname, '../../../pricing-model'),
      pythonOptions: ['-u'], // Unbuffered output
      args: [
        JSON.stringify({
          checkin_date: checkinDate,
          checkout_date: checkoutDate,
          room_type: roomTypeId,
          num_rooms: numRooms
        })
      ],
      timeout: 30000 // 30 seconds timeout
    };

    // Improved error handling
    PythonShell.run('predict.py', options, (err, results) => {
      if (err) {
        console.error('Python error:', err);
        return res.status(500).json({ 
          error: 'Price calculation failed',
          details: err.message || 'Unknown Python error'
        });
      }
      
      if (!results || results.length === 0) {
        return res.status(500).json({ 
          error: 'No response from Python script',
          details: 'The Python script did not return any data'
        });
      }
      
      try {
        // Handle both array and single result cases
        const prediction = Array.isArray(results) ? results[0] : results;
        
        // Additional validation of the prediction result
        if (!prediction || typeof prediction !== 'object') {
          throw new Error('Invalid prediction format');
        }
        
        res.json(prediction);
      } catch (parseError) {
        console.error('Result parsing error:', parseError);
        res.status(500).json({ 
          error: 'Failed to parse prediction result',
          details: parseError.message 
        });
      }
    });
  } catch (error) {
    console.error('Pricing endpoint error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
});

export default router;