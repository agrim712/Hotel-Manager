// src/services/pricingService.js
import axios from 'axios';

export const getDynamicPrice = async (hotelId, roomTypeId, checkinDate, checkoutDate, numRooms) => {
  try {
    const response = await axios.post('/api/pricing/predict', {
      hotelId,
      roomTypeId,
      checkinDate,
      checkoutDate,
      numRooms
    });
    return response.data;
  } catch (error) {
    console.error('Error getting dynamic price:', error);
    throw error;
  }
};