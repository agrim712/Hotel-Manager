import pkg from '@prisma/client';
const { PrismaClient } = pkg;
import ExcelJS from 'exceljs';
import { Decimal } from "decimal.js";
import axios from "axios";

const prisma = new PrismaClient();


export const generateRateTemplate = async (req, res) => {
  try {
    const { year } = req.query;
    const hotelId = req.user.hotelId; // assuming hotelId is in req.user

    // Fetch rooms
    const rooms = await prisma.room.findMany({
      where: { hotelId },
      select: { name: true, rateType: true }
    });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Rates");

    // Generate dates from 1 April (year) → 31 March (year+1)
    const startDate = new Date(`${year}-04-01`);
    const endDate = new Date(`${parseInt(year) + 1}-03-31`);
    let dates = [];
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      dates.push(new Date(d));
    }

    // Header row → First col = Date, then all rooms as columns
    const header = ["Date", ...rooms.map(r => `${r.name} (${r.rateType})`)];
    worksheet.addRow(header);

    // Rows → Each row = one date + blank cells for each room
    dates.forEach(d => {
      const row = [d.toISOString().split("T")[0], ...Array(rooms.length).fill("")];
      worksheet.addRow(row);
    });

    // Send Excel
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader("Content-Disposition", `attachment; filename=rates_${year}.xlsx`);

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error("Error generating template:", error);
    res.status(500).json({ error: "Failed to generate template" });
  }
};


export const uploadRates = async (req, res) => {
  try {
    const { year } = req.query;
    const hotelId = req.user.hotelId;

    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    // Load Excel workbook
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(req.file.buffer);
    const worksheet = workbook.worksheets[0];

    // Header row: ["Date", "Deluxe (CP)", "Executive (AP)", ...]
    const headerRow = worksheet.getRow(1).values.slice(1);
    const roomHeaders = headerRow.slice(1); // skip first "Date" column

    // Map headers to rooms in DB
    const roomMap = {};
    for (let header of roomHeaders) {
      if (!header) continue;
      const match = header.match(/^(.*)\s+\((.*)\)$/);
      if (!match) throw new Error(`Invalid room header: ${header}`);

      const roomName = match[1].trim();
      const rateType = match[2].trim();

      const room = await prisma.room.findFirst({
        where: { hotelId, name: roomName, rateType },
        select: { id: true },
      });

      if (!room) {
        throw new Error(`Room not found: ${roomName} - ${rateType}`);
      }

      roomMap[header] = { roomId: room.id, roomName, rateType };
    }

    // Initialize rates per room
    const ratesByRoom = {};
    Object.keys(roomMap).forEach((header) => {
      ratesByRoom[header] = [];
    });

    // Collect rates from Excel
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return; // skip header

      roomHeaders.forEach((header, idx) => {
        const cellValue = row.getCell(idx + 2).value; // +2 to skip date column
        let price;

        if (cellValue !== null && cellValue !== undefined) {
          let numericValue = cellValue;

          // Handle formula cells
          if (typeof cellValue === "object" && "result" in cellValue) {
            numericValue = cellValue.result;
          }

          if (numericValue !== null && numericValue !== "" && !isNaN(Number(numericValue))) {
            price = new Decimal(Number(numericValue));
          } else {
            price = new Decimal(0); // default 0 for empty/invalid
          }
        } else {
          price = new Decimal(0); // default 0 for empty
        }

        ratesByRoom[header].push(price);
      });
    });

    const yearStart = new Date(`${year}-04-01T00:00:00.000Z`);

    // Upsert each room’s daily rates
    for (let header of Object.keys(roomMap)) {
      const { roomId, roomName, rateType } = roomMap[header];
      const prices = ratesByRoom[header];

      await prisma.roomDailyRate.upsert({
        where: {
          room_rate_year_unique: {
            roomId,
            rateType,
            yearStart,
          },
        },
        update: {
          prices: { set: prices },
          updatedAt: new Date(),
        },
        create: {
          roomId,
          hotelId,
          roomType: roomName,
          rateType,
          yearStart,
          prices: { set: prices },
        },
      });
    }

    res.json({ message: "Rates uploaded/updated successfully" });
  } catch (error) {
    console.error("Error uploading rates:", error);
    res.status(500).json({ error: error.message || "Failed to upload rates" });
  }
};


export const getRates = async (req, res) => {
  try {
    const hotelId = req.user.hotelId;
    console.log('🔍 getRates - hotelId:', hotelId);
    
    if (!hotelId) return res.status(400).json({ error: "Hotel not found" });

    const year = req.query.year || new Date().getFullYear();
    const yearStart = new Date(`${year}-04-01T00:00:00.000Z`);
    console.log('📅 getRates - year:', year, 'yearStart:', yearStart);

    // 1. Fetch all base rates for this hotel & year
    const rates = await prisma.roomDailyRate.findMany({
      where: { hotelId, yearStart },
      include: { room: true },
      orderBy: { roomId: "asc" },
    });
    
    console.log('📊 getRates - found rates:', rates?.length || 0);

    if (!rates || rates.length === 0) {
      console.log('❌ No rates found for hotel:', hotelId, 'year:', year);
      return res.status(404).json({ 
        error: "No rates found",
        debug: { hotelId, year, yearStart: yearStart.toISOString() }
      });
    }

  // 2. Send base rates to Python service for dynamic pricing with enhanced multiplier management
    const ratesWithDynamicPricing = [];
    
    console.log('🔄 Starting dynamic pricing calculations for', rates.length, 'room types');
    
    // Process rates with retry logic and reduced data size
    for (let i = 0; i < rates.length; i++) {
      const rate = rates[i];
      
      // Add delay between requests to prevent overloading Python service
      if (i > 0) {
        await new Promise(resolve => setTimeout(resolve, 1000)); // 1 second delay
      }
      try {
        console.log('💰 Processing rate for room:', rate.roomType, 'with', rate.prices?.length || 0, 'prices');
        
        // Limit to first 30 days for initial display to prevent overload
        const limitedPrices = rate.prices.slice(0, 30).map(p => p.toNumber());
        
        const requestData = {
          base_rates: limitedPrices,
          room_type: rate.roomType,
          rate_type: rate.rateType,
          year_start: rate.yearStart.toISOString(),
          use_historical_fallback: true,
          custom_multipliers: null
        };
        
        console.log('🚀 Calling Python service with limited data:', {
          room_type: requestData.room_type,
          rate_type: requestData.rate_type,
          base_rates_count: requestData.base_rates.length,
          limited: true
        });
        
        // Add timeout and retry logic
        const response = await axios.post("http://localhost:8001/predict-daily-rates", requestData, {
          timeout: 30000, // 30 second timeout
          retry: 2
        });
        
        console.log('✅ Python service responded for', rate.roomType, '- predictions:', response.data.predictions?.length || 0);

        ratesWithDynamicPricing.push({
          id: rate.id,
          roomId: rate.roomId,
          roomType: rate.roomType,
          rateType: rate.rateType,
          yearStart: rate.yearStart,
          basePrices: limitedPrices, // Use limited prices
          dynamicPrices: response.data.predictions,
          room: rate.room,
          multiplierSource: response.data.predictions?.[0]?.multiplier_source || 'unknown',
          dependenciesApplied: response.data.summary?.dependencies_applied || false,
          averageMultiplier: response.data.summary?.average_multiplier || 1.0,
          revenueImpact: response.data.summary?.revenue_increase_percent || 0,
          isLimitedData: true, // Flag to indicate this is limited data
          totalDaysAvailable: rate.prices.length
        });
      } catch (err) {
        console.error("❌ Python service error for room", rate.roomType, ':', err.message);
        if (err.response) {
          console.error('Response status:', err.response.status);
          console.error('Response data:', err.response.data);
        }
        
        // Fallback: use base rates as dynamic rates (limited to 30 days)
        const yearStartDate = new Date(rate.yearStart);
        const fallbackPredictions = rate.prices.slice(0, 30).map((price, index) => {
          const currentDate = new Date(yearStartDate);
          currentDate.setDate(currentDate.getDate() + index);
          
          return {
            date: currentDate.toISOString().split('T')[0],
            base_rate: price.toNumber(),
            dynamic_rate: price.toNumber(),
            multiplier: 1.0,
            occupancy_factor: 1.0,
            demand_factor: 1.0,
            occasions: [],
            room_type: rate.roomType,
            rate_type: rate.rateType,
            error: 'Service unavailable, using base rate'
          };
        });

        ratesWithDynamicPricing.push({
          id: rate.id,
          roomId: rate.roomId,
          roomType: rate.roomType,
          rateType: rate.rateType,
          yearStart: rate.yearStart,
          basePrices: rate.prices.slice(0, 30).map(p => p.toNumber()),
          dynamicPrices: fallbackPredictions,
          room: rate.room,
          isLimitedData: true,
          totalDaysAvailable: rate.prices.length,
          error: 'Python service unavailable'
        });
      }
    }

    // 3. Send rates with dynamic pricing
    res.json({
      success: true,
      data: ratesWithDynamicPricing,
      year: year,
      totalRooms: ratesWithDynamicPricing.length
    });
  } catch (error) {
    console.error("Error fetching rates:", error);
    res.status(500).json({ error: "Failed to fetch rates" });
  }
};

// New endpoint to get rates for specific room and date range
// Debug endpoint to check if rates exist
export const debugRates = async (req, res) => {
  try {
    const hotelId = req.user?.hotelId || req.query.hotelId;
    console.log('🔍 Debug - hotelId:', hotelId);
    
    if (!hotelId) {
      return res.json({ error: 'No hotelId provided', user: req.user });
    }
    
    // Check if hotel exists
    const hotel = await prisma.hotel.findUnique({
      where: { id: hotelId }
    });
    
    console.log('🏨 Hotel found:', hotel?.name || 'Not found');
    
    // Check rooms for this hotel
    const rooms = await prisma.room.findMany({
      where: { hotelId }
    });
    
    console.log('🛏️ Rooms found:', rooms.length);
    
    // Check all daily rates for this hotel
    const allRates = await prisma.roomDailyRate.findMany({
      where: { hotelId },
      include: { room: true }
    });
    
    console.log('📊 All rates found:', allRates.length);
    
    // Check current year rates
    const year = new Date().getFullYear();
    const yearStart = new Date(`${year}-04-01T00:00:00.000Z`);
    
    const currentYearRates = await prisma.roomDailyRate.findMany({
      where: { hotelId, yearStart },
      include: { room: true }
    });
    
    console.log('📅 Current year rates:', currentYearRates.length);
    
    return res.json({
      success: true,
      hotelId,
      hotel: hotel?.name,
      roomsCount: rooms.length,
      allRatesCount: allRates.length,
      currentYearRatesCount: currentYearRates.length,
      year,
      yearStart: yearStart.toISOString(),
      rooms: rooms.map(r => ({ id: r.id, name: r.name, rateType: r.rateType })),
      sampleRates: currentYearRates.slice(0, 2).map(r => ({
        roomType: r.roomType,
        rateType: r.rateType,
        pricesCount: r.prices?.length || 0,
        yearStart: r.yearStart.toISOString()
      }))
    });
  } catch (error) {
    console.error('Debug error:', error);
    return res.status(500).json({ error: error.message });
  }
};

export const getRatesByRoomAndDate = async (req, res) => {
  try {
    const hotelId = req.user.hotelId;
    const { roomId, startDate, endDate } = req.query;

    if (!hotelId || !roomId || !startDate || !endDate) {
      return res.status(400).json({ error: "Missing required parameters" });
    }

    // Find the room daily rate for the current rate year
    const currentYear = new Date().getFullYear();
    const yearStart = new Date(`${currentYear}-04-01T00:00:00.000Z`);

    const rate = await prisma.roomDailyRate.findFirst({
      where: { 
        hotelId, 
        roomId,
        yearStart 
      },
      include: { room: true }
    });

    if (!rate) {
      return res.status(404).json({ error: "No rates found for this room" });
    }

    // Calculate date range indices
    const start = new Date(startDate);
    const end = new Date(endDate);
    const yearStartDate = new Date(yearStart);
    
    const startIndex = Math.floor((start - yearStartDate) / (1000 * 60 * 60 * 24));
    const endIndex = Math.floor((end - yearStartDate) / (1000 * 60 * 60 * 24));

    if (startIndex < 0 || endIndex >= rate.prices.length) {
      return res.status(400).json({ error: "Date range out of bounds" });
    }

    // Extract prices for the date range
    const basePrices = rate.prices.slice(startIndex, endIndex + 1).map(p => p.toNumber());

    // Get dynamic pricing
    let dynamicPredictions = [];
    try {
      const response = await axios.post("http://localhost:8001/predict-daily-rates", {
        base_rates: basePrices,
        room_type: rate.roomType,
        rate_type: rate.rateType,
        year_start: rate.yearStart.toISOString()
      });
      dynamicPredictions = response.data.predictions;
    } catch (err) {
      console.error("Python service error:", err.message);
      // Fallback to base rates
      dynamicPredictions = basePrices.map((price, index) => {
        const currentDate = new Date(start);
        currentDate.setDate(currentDate.getDate() + index);
        
        return {
          date: currentDate.toISOString().split('T')[0],
          base_rate: price,
          dynamic_rate: price,
          multiplier: 1.0,
          occupancy_factor: 1.0,
          demand_factor: 1.0,
          occasions: [],
          room_type: rate.roomType,
          rate_type: rate.rateType,
          error: 'Service unavailable'
        };
      });
    }

    res.json({
      success: true,
      data: {
        room: rate.room,
        roomType: rate.roomType,
        rateType: rate.rateType,
        prices: dynamicPredictions,
        dateRange: {
          start: startDate,
          end: endDate,
          nights: dynamicPredictions.length
        },
        summary: {
          totalBase: dynamicPredictions.reduce((sum, p) => sum + p.base_rate, 0),
          totalDynamic: dynamicPredictions.reduce((sum, p) => sum + p.dynamic_rate, 0),
          averageMultiplier: dynamicPredictions.reduce((sum, p) => sum + p.multiplier, 0) / dynamicPredictions.length
        }
      }
    });
  } catch (error) {
    console.error("Error fetching rates by room and date:", error);
    res.status(500).json({ error: "Failed to fetch rates" });
  }
};