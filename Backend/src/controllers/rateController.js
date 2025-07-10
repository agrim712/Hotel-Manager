import { PrismaClient } from '@prisma/client';
import ExcelJS from 'exceljs';
import moment from 'moment';

const prisma = new PrismaClient();

export const generateRateTemplate = async (req, res) => {
  try {
    const { rateType, year } = req.query;
    const hotelId = req.user.hotelId;

    if (!rateType || !year) {
      return res.status(400).json({ error: 'Missing rateType or year parameters' });
    }

    // Get all room units for the hotel
    const roomUnits = await prisma.roomUnit.findMany({
      where: { hotelId },
      select: { roomNumber: true }
    });

    if (!roomUnits.length) {
      return res.status(404).json({ error: 'No rooms found for this hotel' });
    }

    // Create workbook
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Room Rates');

    // Add headers
    const headers = ['Date'];
    roomUnits.forEach(unit => {
      headers.push(
        `${unit.roomNumber} Base Price`,
        `${unit.roomNumber} Min Price`,
        `${unit.roomNumber} Max Price`
      );
    });

    worksheet.addRow(headers);

    // Add data for each day of the year
    const startDate = moment(`${year}-01-01`);
    const endDate = moment(`${year}-12-31`);

    for (let date = startDate; date.isSameOrBefore(endDate); date.add(1, 'day')) {
      const row = [date.format('YYYY-MM-DD')];
      roomUnits.forEach(() => {
        row.push('', '', ''); // Empty cells for base, min, max prices
      });
      worksheet.addRow(row);
    }

    // Set response headers
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=Room_Rates_${rateType}_${year}.xlsx`
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error('Error generating room rate template:', error);
    res.status(500).json({ error: 'Failed to generate template' });
  }
};

export const uploadRates = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { rateType } = req.query;
    const hotelId = req.user.hotelId;

    if (!rateType) {
      return res.status(400).json({ error: 'Missing rateType parameter' });
    }

    // Validate file type
    const validMimetypes = [
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];
    
    if (!validMimetypes.includes(req.file.mimetype)) {
      return res.status(400).json({ error: 'Invalid file type. Please upload an Excel file' });
    }

    // Load workbook
    const workbook = new ExcelJS.Workbook();
    try {
      await workbook.xlsx.load(req.file.buffer);
    } catch (err) {
      return res.status(400).json({ 
        error: 'Invalid Excel file format',
        details: err.message 
      });
    }

    const worksheet = workbook.worksheets[0];
    if (!worksheet || worksheet.rowCount < 2) {
      return res.status(400).json({ error: 'Invalid Excel format - missing data rows' });
    }

    // Get room numbers from headers
    const headerRow = worksheet.getRow(1);
    const roomNumbers = [];
    
    for (let i = 2; i <= headerRow.actualCellCount; i += 3) {
      const header = headerRow.getCell(i).value;
      if (header && typeof header === 'string') {
        const roomNumber = header.split(' ')[0];
        if (roomNumber) roomNumbers.push(roomNumber);
      }
    }

    if (roomNumbers.length === 0) {
      return res.status(400).json({ error: 'No valid room numbers found in headers' });
    }

    // Verify rooms exist in database
    const existingRooms = await prisma.roomUnit.findMany({
      where: { hotelId, roomNumber: { in: roomNumbers } },
      select: { roomNumber: true }
    });

    const existingRoomNumbers = existingRooms.map(r => r.roomNumber);
    const missingRooms = roomNumbers.filter(r => !existingRoomNumbers.includes(r));

    if (missingRooms.length > 0) {
      return res.status(400).json({ 
        error: 'Some rooms in file do not exist in database',
        missingRooms
      });
    }

    // Process data
    const rates = [];
    const errors = [];
    
    worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
      if (rowNumber === 1) return;
      
      try {
        const dateCell = row.getCell(1);
        if (!dateCell.value) {
          errors.push(`Row ${rowNumber}: Missing date`);
          return;
        }

        const date = moment(dateCell.value);
        if (!date.isValid()) {
          errors.push(`Row ${rowNumber}: Invalid date format`);
          return;
        }

        roomNumbers.forEach((roomNumber, index) => {
          const baseCol = 2 + (index * 3);
          const basePrice = parseFloat(row.getCell(baseCol).value || '');
          const minPrice = parseFloat(row.getCell(baseCol + 1).value || '');
          const maxPrice = parseFloat(row.getCell(baseCol + 2).value || '');
          
          if (isNaN(basePrice) && isNaN(minPrice) && isNaN(maxPrice)) return;

          if (isNaN(basePrice)) {
            throw new Error(`Room ${roomNumber}: Invalid base price`);
          }

          rates.push({
            date: date.toDate(),
            roomNumber,
            basePrice,
            minPrice: isNaN(minPrice) ? basePrice : minPrice,
            maxPrice: isNaN(maxPrice) ? basePrice * 2 : maxPrice,
            ratePlanId: ''
          });
        });
      } catch (err) {
        errors.push(`Row ${rowNumber}: ${err.message}`);
      }
    });

    if (errors.length > 0) {
      return res.status(400).json({ 
        error: 'Validation errors in Excel file',
        details: errors 
      });
    }

    if (rates.length === 0) {
      return res.status(400).json({ error: 'No valid rate data found in file' });
    }

    // Database transaction
    const result = await prisma.$transaction(async (tx) => {
      let ratePlan = await tx.ratePlan.findFirst({
        where: { hotelId, rateType }
      });

      if (!ratePlan) {
        ratePlan = await tx.ratePlan.create({
          data: {
            name: `${rateType} Rates - ${moment().format('YYYY-MM-DD')}`,
            hotelId,
            rateType
          }
        });
      } else {
        await tx.roomDailyRate.deleteMany({
          where: { ratePlanId: ratePlan.id }
        });
      }

      const ratesWithPlan = rates.map(rate => ({
        ...rate,
        ratePlanId: ratePlan.id
      }));

      const batchSize = 100;
      for (let i = 0; i < ratesWithPlan.length; i += batchSize) {
        const batch = ratesWithPlan.slice(i, i + batchSize);
        await tx.roomDailyRate.createMany({ data: batch });
      }

      return {
        count: ratesWithPlan.length,
        ratePlanId: ratePlan.id
      };
    });

    res.json({
      success: true,
      message: 'Rates uploaded successfully',
      data: result
    });

  } catch (error) {
    res.status(500).json({
      error: 'Failed to process rates',
      message: error.message
    });
  }
};
export const getRates = async (req, res) => {
  try {
    const { rateType } = req.params;
    const hotelId = req.user.hotelId;
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'Missing startDate or endDate parameters' });
    }

    // Try to find or create the rate plan
    let ratePlan = await prisma.ratePlan.findFirst({
      where: { 
        hotelId, 
        rateType 
      }
    });

    if (!ratePlan) {
      // Create the rate plan if it doesn't exist
      ratePlan = await prisma.ratePlan.create({
        data: {
          name: `${rateType} rates`,
          rateType,
          hotelId
        }
      });
    }

    // Now get the rates
    const rates = await prisma.roomDailyRate.findMany({
      where: {
        ratePlanId: ratePlan.id,
        date: {
          gte: new Date(startDate),
          lte: new Date(endDate)
        }
      },
      orderBy: [{ date: 'asc' }, { roomNumber: 'asc' }]
    });

    res.json(rates);
  } catch (error) {
    console.error('Error getting room rates:', error);
    res.status(500).json({ error: 'Failed to get room rates' });
  }
};