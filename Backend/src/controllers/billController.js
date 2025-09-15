// controllers/billController.js
import pkg from '@prisma/client';
const { PrismaClient } = pkg;
import PDFDocument from 'pdfkit';

const prisma = new PrismaClient();

export const generateBillPDF = async (req, res) => {
  try {
    const { reservationId } = req.params;

    const reservation = await prisma.reservation.findUnique({
      where: { id: reservationId },
      include: { 
        hotel: true,
        roomUnit: true
      }
    });

    if (!reservation) {
      return res.status(404).json({ message: 'Reservation not found' });
    }

    // Create a new PDF document optimized for one page
    const doc = new PDFDocument({ 
      margin: 40,
      size: 'A4',
      bufferPages: true
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename=Hotel_Bill_${reservationId}.pdf`);
    doc.pipe(res);

    // ===== HELPER FUNCTIONS =====
    const formatDate = (date) => {
      return new Date(date).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    };

    const formatCurrency = (amount) => {
      return '₹' + amount.toFixed(2);
    };

    const drawDivider = () => {
      doc.moveTo(50, doc.y)
         .lineTo(550, doc.y)
         .strokeColor('#e0e0e0')
         .lineWidth(1)
         .stroke();
      doc.moveDown(0.5);
    };

    // ===== HEADER SECTION =====
    doc.fillColor('#2c3e50')
       .fontSize(24)
       .font('Helvetica-Bold')
       .text(reservation.hotel.name.toUpperCase(), { align: 'center' })
       .moveDown(0.2);

    doc.fillColor('#666')
       .fontSize(10)
       .text(reservation.hotel.address, { align: 'center' })
       .text(`Phone: ${reservation.hotel.phoneCode || ''}-${reservation.hotel.phoneNumber || ''} • Email: ${reservation.hotel.email || ''}`, { align: 'center' })
       .moveDown(0.8);

    doc.fillColor('#3498db')
       .fontSize(20)
       .text('HOTEL BILL', { align: 'center' })
       .moveDown(0.5);

    // ===== TAX NOTICE =====
    doc.fillColor('#666')
       .fontSize(10)
       .font('Helvetica-Oblique')
       .text(`* All amounts are ${reservation.taxInclusive ? 'INCLUSIVE' : 'EXCLUSIVE'} of applicable taxes`, { align: 'center' })
       .moveDown(0.5);

    // ===== GUEST INFORMATION =====
    doc.fillColor('#333')
       .fontSize(12)
       .font('Helvetica-Bold')
       .text('Guest Information:', { underline: true })
       .moveDown(0.3);

    doc.font('Helvetica')
       .text(`Name: ${reservation.guestName}`)
       .text(`Room: ${reservation.roomNo} (${reservation.roomType})`)
       .text(`Stay: ${formatDate(reservation.checkIn)} to ${formatDate(reservation.checkOut)}`)
       .text(`Nights: ${reservation.nights} • Guests: ${reservation.guests}`)
       .moveDown(0.8);

    // ===== BILL DETAILS =====
    const startY = doc.y;
    const perDayRate = reservation.perDayRate;
    const nights = reservation.nights;
    const subtotal = perDayRate * nights;
    const taxAmount = reservation.perDayTax * nights;
    const totalAmount = reservation.taxInclusive ? reservation.totalAmount : subtotal + taxAmount;

    // Table header
    doc.font('Helvetica-Bold')
       .fillColor('#2c3e50')
       .text('Description', 50, startY)
       .text('Amount', 450, startY, { width: 100, align: 'right' })
       .moveDown(0.5);

    drawDivider();

    // Room charges row
    doc.font('Helvetica')
       .fillColor('#333')
       .text(`Room Charges (${nights} nights)`, 50, doc.y);
    
    if (reservation.taxInclusive) {
      doc.text(`(Tax Inclusive)`, 150, doc.y, { fontSize: 8, color: '#666' });
    }
    doc.text(formatCurrency(subtotal), 450, doc.y, { width: 100, align: 'right' })
       .moveDown(0.5);

    // Tax row (only if not tax inclusive)
    if (!reservation.taxInclusive) {
      doc.text(`Tax (${reservation.perDayTax * 100 / reservation.perDayRate}%)`, 50, doc.y)
         .text(formatCurrency(taxAmount), 450, doc.y, { width: 100, align: 'right' })
         .moveDown(0.5);
    }

    drawDivider();

    // Total amount with emphasis
    doc.font('Helvetica-Bold')
       .fillColor('#2c3e50')
       .text('TOTAL', 50, doc.y)
       .text(formatCurrency(totalAmount), 450, doc.y, { width: 100, align: 'right' })
       .moveDown(1);

    // Tax summary note
    doc.fillColor('#666')
       .fontSize(9)
       .text(`Total includes ${reservation.taxInclusive ? 'all applicable taxes' : `taxes of ${formatCurrency(taxAmount)}`}`, { align: 'right' })
       .moveDown(1.5);

    // Payment status
    doc.fillColor('#27ae60')
       .fontSize(12)
       .text(`Payment Method: ${reservation.paymentMode === 'CASH' ? 'Paid in Cash' : 'Paid by Card'}`, { align: 'right' })
       .moveDown(1.5);

    // ===== FOOTER SECTION =====
    doc.fillColor('#666')
       .fontSize(10)
       .text('Thank you for your stay!', { align: 'center' })
       .text('We hope to welcome you again soon.', { align: 'center' })
       .moveDown(0.5);

    // Signature line
    doc.fillColor('#333')
       .text('_________________________', { align: 'right' })
       .fontSize(9)
       .text('Authorized Signature', { align: 'right' })
       .text(`Date: ${new Date().toLocaleDateString('en-IN')}`, { align: 'right' });

    // Ensure we stay on one page
    if (doc.bufferedPageRange().count > 1) {
      doc.addPage();
      doc.fillColor('#ff0000')
         .text('Bill content too long - please contact reception', 50, 50);
    }

    doc.end();
  } catch (error) {
    console.error('Bill generation error:', error);
    res.status(500).json({ error: 'Failed to generate bill PDF' });
  }
};