import axios from 'axios';


export const generateInvoice = async (reservationId) => {
  try {
    const response = await axios.get(`http://localhost:5000/api/hotel/invoice/${reservationId}`, {
      responseType: 'blob',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    return response.data;
  } catch (error) {
    console.error('Error generating invoice:', error);
    throw error;
  }
};

export const downloadInvoice = async (reservationId) => {
  try {
    const blob = await generateInvoice(reservationId);
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `invoice-${reservationId}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error downloading invoice:', error);
    throw error;
  }
};