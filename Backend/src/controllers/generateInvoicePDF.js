// utils/generateInvoicePDF.js
import { PDFDocument, StandardFonts, rgb, PageSizes } from 'pdf-lib';

// Validate reservation data before generating PDF
function validateReservation(reservation) {
  if (!reservation) {
    throw new Error('Reservation data is required');
  }

  const requiredFields = [
    'id',
    'guestName',
    'checkIn',
    'checkOut',
    'nights',
    'perDayRate',
    'totalAmount',
    'paymentMode'
  ];

  const missingFields = requiredFields.filter(field => !reservation[field]);
  if (missingFields.length > 0) {
    throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
  }

  if (!reservation.hotel) {
    throw new Error('Hotel information is required');
  }

  const requiredHotelFields = ['name', 'currency'];
  const missingHotelFields = requiredHotelFields.filter(field => !reservation.hotel[field]);
  if (missingHotelFields.length > 0) {
    throw new Error(`Missing required hotel fields: ${missingHotelFields.join(', ')}`);
  }
}

export async function generateInvoicePDF(reservation) {
  try {
    // Validate input data
    validateReservation(reservation);

    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage(PageSizes.A4);
    const { width, height } = page.getSize();
    
    // Fonts
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    
    // Colors
    const primaryColor = rgb(0.2, 0.4, 0.6);
    const accentColor = rgb(0.8, 0.1, 0.1);

    // Helper functions
    const drawText = (text, x, y, options = {}) => {
      page.drawText(String(text || 'N/A'), {
        x,
        y,
        font: options.bold ? fontBold : font,
        size: options.size || 11,
        color: options.color || rgb(0, 0, 0),
        ...options,
      });
    };

    const formatDate = (date) => {
      if (!date) return 'N/A';
      try {
        const d = new Date(date);
        return d.toLocaleDateString('en-US', {
          year: 'numeric', 
          month: 'short', 
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      } catch {
        return 'Invalid Date';
      }
    };

    // Header Section
    let y = height - 50;
    
    // Hotel Info
    drawText(reservation.hotel.name, 50, y, {
      size: 18,
      bold: true,
      color: primaryColor
    });
    y -= 25;

    // Contact info
    const contactInfo = [
      reservation.hotel.address,
      reservation.hotel.phoneNumber && `Tel: ${reservation.hotel.phoneNumber}`,
      reservation.hotel.email && `Email: ${reservation.hotel.email}`
    ].filter(Boolean).join(' | ');
    
    drawText(contactInfo, 50, y, { size: 10 });
    y -= 30;

    // Invoice Number - Moved more to the left and made smaller
    // drawText(`INVOICE #: INV-${reservation.id}`, width - 250, y, {
    //   size: 12,
    //   bold: true,
    //   color: accentColor
    // });
    // y -= 20;
    
    // drawText(`Date: ${formatDate(new Date())}`, width - 250, y, { size: 10 });
    // y -= 40;

    // Guest Information
// Draw invoice number on left (with max width to prevent overlap)
const invoiceText = `Invoice #: INV-${reservation.id}`;
const maxInvoiceWidth = width * 0.5; // Don't let it use more than half the page width
drawText(invoiceText, 50, y, {
  size: 12,
  bold: true,
  color: accentColor,
  maxWidth: maxInvoiceWidth // This will prevent it from overlapping
});

// Draw date on right (aligned to right margin)
const dateText = `Date: ${formatDate(new Date())}`;
drawText(dateText, width - 50 - font.widthOfTextAtSize(dateText, 10), y, { 
  size: 10 
});

y -= 40;
    
    const guestInfo = [
      reservation.guestName,
      reservation.address,
      [reservation.city, reservation.state, reservation.country].filter(Boolean).join(', '),
      reservation.phone && `Phone: ${reservation.phone}`,
      reservation.email && `Email: ${reservation.email}`,
      reservation.idDetail && `ID: ${reservation.idDetail}${reservation.identity ? ` (${reservation.identity})` : ''}`
    ].filter(Boolean);
    
    guestInfo.forEach(info => {
      drawText(info, 50, y, { size: 10 });
      y -= 15;
    });
    y -= 20;

    // Reservation Details
    const reservationDetails = [
      ['Room Number', reservation.roomNo],
      ['Room Type', reservation.roomType],
      ['Check-in', formatDate(reservation.checkIn)],
      ['Check-out', formatDate(reservation.checkOut)],
      ['Nights', reservation.nights],
      ['Guests', reservation.guests],
      ['Rate Type', reservation.rateType],
      ['Booked By', reservation.bookedBy]
    ];

    drawText('RESERVATION DETAILS', 50, y, { bold: true });
    y -= 20;
    
    reservationDetails.forEach(([label, value]) => {
      drawText(`${label}:`, 50, y);
      drawText(value, 150, y);
      y -= 15;
    });

    // Connected Rooms
    if (reservation.connectedRooms?.length) {
      y -= 10;
      drawText('Connected Rooms:', 50, y);
      y -= 15;
      
      reservation.connectedRooms.forEach(room => {
        drawText(`• ${room.name} (${room.roomNumbers?.join(', ') || 'N/A'})`, 60, y);
        y -= 15;
      });
    }
    y -= 20;

    // Billing Section
    drawText('BILLING DETAILS', 50, y, { bold: true });
    y -= 20;

    // Table Header
    drawText('Description', 50, y);
    drawText('Amount', width - 100, y, { bold: true });
    y -= 20;

    // Room Charges - Show rate per night first
    drawText(`Room Rate (per night)`, 50, y);
    drawText(`${reservation.hotel.currency} ${reservation.perDayRate.toFixed(2)}`, width - 100, y);
    y -= 15;

    // Then show total room charges
    drawText(`Room Charges (${reservation.nights} night${reservation.nights > 1 ? 's' : ''})`, 50, y);
    drawText(`${reservation.hotel.currency} ${(reservation.perDayRate * reservation.nights).toFixed(2)}`, width - 100, y);
    y -= 20;

    // Taxes - Only show if not inclusive
    if (reservation.perDayTax > 0 && !reservation.taxInclusive) {
      drawText(`Tax (${reservation.nights} night${reservation.nights > 1 ? 's' : ''})`, 50, y);
      drawText(`${reservation.hotel.currency} ${(reservation.perDayTax * reservation.nights).toFixed(2)}`, width - 100, y);
      y -= 20;
    }

    // Total
    y -= 10;
    page.drawLine({
      start: { x: 50, y },
      end: { x: width - 50, y },
      thickness: 1,
      color: rgb(0.7, 0.7, 0.7),
    });
    y -= 20;

    drawText('TOTAL AMOUNT', 50, y, { bold: true, size: 12 });
    drawText(`${reservation.hotel.currency} ${reservation.totalAmount.toFixed(2)}`, 
      width - 100, y, { bold: true, size: 12 });
    y -= 15;

    // Show tax inclusive note if applicable
    if (reservation.taxInclusive && reservation.perDayTax > 0) {
      drawText('(Tax included in rate)', width - 150, y, { size: 9, color: rgb(0.5, 0.5, 0.5) });
      y -= 15;
    }
    y -= 15;

    // Payment Information
    drawText('PAYMENT DETAILS', 50, y, { bold: true });
    y -= 20;
    
    drawText(`Mode: ${reservation.paymentMode}`, 50, y);
    drawText(`Status: ${reservation.paymentStatus || 'Paid'}`, width - 100, y);
    y -= 30;

    // Footer
    drawText('Thank you for choosing us!', width/2 - 80, y, { 
      size: 12, 
      color: primaryColor 
    });
    y -= 20;
    
    drawText('For any queries, please contact our front desk.', width/2 - 140, y, { size: 10 });
    y -= 15;
    
    drawText(`Invoice generated on: ${new Date().toLocaleString()}`, 
      width/2 - 100, y, { size: 8, color: rgb(0.5, 0.5, 0.5) });

    return await pdfDoc.save();
  } catch (error) {
    console.error('Error generating invoice:', error);
    throw new Error(`Failed to generate invoice: ${error.message}`);
  }
}