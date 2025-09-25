import pkg from '@prisma/client';
const { PrismaClient } = pkg;
import axios from 'axios';
import { Decimal } from 'decimal.js';

const prisma = new PrismaClient();

function parseDate(dateStr) {
  const d = new Date(dateStr);
  d.setHours(0, 0, 0, 0);
  return d;
}

// Enhanced KPIs with multiplier and occupancy analysis
export const getAdvancedHotelKPI = async (req, res) => {
  try {
    const { hotelId } = req.params;
    const { startDate, endDate } = req.query;

    const from = parseDate(startDate);
    const to = new Date(endDate);
    to.setHours(23, 59, 59, 999);

    // Get total room units
    const totalRoomUnits = await prisma.roomUnit.count({
      where: { hotelId },
    });

    // Get reservations with detailed analysis
    const reservations = await prisma.reservation.findMany({
      where: {
        hotelId,
        checkIn: { lte: to },
        checkOut: { gte: from },
      },
      include: {
        room: true
      }
    });

    let totalRevenue = 0;
    let totalBaseRevenue = 0;
    let totalOccupiedRoomNights = 0;
    let dailyOccupancy = {};
    let roomTypeRevenue = {};

    // Calculate daily occupancy and revenue metrics
    const daysInRange = Math.ceil((to - from) / (1000 * 60 * 60 * 24)) + 1;
    
    reservations.forEach((reservation) => {
      const nights = reservation.nights;
      const roomCount = reservation.rooms;
      const revenueContribution = reservation.perDayRate * nights * roomCount;
      
      totalOccupiedRoomNights += nights * roomCount;
      totalRevenue += revenueContribution;
      
      // Track by room type
      const roomType = reservation.room?.name || 'Unknown';
      if (!roomTypeRevenue[roomType]) {
        roomTypeRevenue[roomType] = { revenue: 0, nights: 0 };
      }
      roomTypeRevenue[roomType].revenue += revenueContribution;
      roomTypeRevenue[roomType].nights += nights * roomCount;
      
      // Calculate daily occupancy
      const checkInDate = new Date(reservation.checkIn);
      for (let i = 0; i < nights; i++) {
        const currentDate = new Date(checkInDate);
        currentDate.setDate(currentDate.getDate() + i);
        const dateKey = currentDate.toISOString().split('T')[0];
        
        if (!dailyOccupancy[dateKey]) {
          dailyOccupancy[dateKey] = 0;
        }
        dailyOccupancy[dateKey] += roomCount;
      }
    });

    // Calculate metrics
    const totalAvailableRoomNights = totalRoomUnits * daysInRange;
    const averageOccupancyRate = totalAvailableRoomNights > 0 ? totalOccupiedRoomNights / totalAvailableRoomNights : 0;
    const ADR = totalOccupiedRoomNights > 0 ? totalRevenue / totalOccupiedRoomNights : 0;
    const RevPAR = ADR * averageOccupancyRate;

    // Get dynamic pricing analytics from Python service
    let pricingAnalytics = null;
    try {
      const analyticsResponse = await axios.get('http://localhost:8001/revenue-analytics', {
        params: {
          start_date: startDate,
          end_date: endDate
        }
      });
      pricingAnalytics = analyticsResponse.data.analytics;
    } catch (error) {
      console.warn('Could not fetch pricing analytics:', error.message);
    }

    // Calculate occupancy trends
    const occupancyTrends = Object.entries(dailyOccupancy).map(([date, occupiedRooms]) => ({
      date,
      occupiedRooms,
      totalRooms: totalRoomUnits,
      occupancyPercentage: (occupiedRooms / totalRoomUnits) * 100
    })).sort((a, b) => a.date.localeCompare(b.date));

    // Room type performance analysis
    const roomPerformance = Object.entries(roomTypeRevenue).map(([roomType, data]) => ({
      roomType,
      totalRevenue: data.revenue,
      totalNights: data.nights,
      averageRate: data.nights > 0 ? data.revenue / data.nights : 0,
      revenueShare: totalRevenue > 0 ? (data.revenue / totalRevenue) * 100 : 0
    })).sort((a, b) => b.totalRevenue - a.totalRevenue);

    // Distribution costs and net revenue
    const commissionExpenses = await prisma.expense.findMany({
      where: {
        hotelId,
        date: { gte: from, lte: to },
        category: {
          name: {
            contains: "commission",
            mode: "insensitive",
          },
        },
      },
    });

    const totalDistributionCost = commissionExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    const netRevenue = totalRevenue - totalDistributionCost;
    const RevADR = totalAvailableRoomNights > 0 ? netRevenue / totalAvailableRoomNights : 0;

    return res.json({
      success: true,
      dateRange: {
        from: startDate,
        to: endDate,
        days: daysInRange
      },
      coreMetrics: {
        ADR: parseFloat(ADR.toFixed(2)),
        RevPAR: parseFloat(RevPAR.toFixed(2)),
        RevADR: parseFloat(RevADR.toFixed(2)),
        occupancyRate: parseFloat((averageOccupancyRate * 100).toFixed(2)),
        totalRevenue: parseFloat(totalRevenue.toFixed(2)),
        netRevenue: parseFloat(netRevenue.toFixed(2)),
        totalDistributionCost: parseFloat(totalDistributionCost.toFixed(2)),
      },
      capacity: {
        totalRoomUnits,
        totalAvailableRoomNights,
        totalOccupiedRoomNights,
        utilizationRate: parseFloat(((totalOccupiedRoomNights / totalAvailableRoomNights) * 100).toFixed(2))
      },
      trends: {
        occupancyTrends,
        roomPerformance,
        pricingAnalytics
      },
      insights: {
        bestPerformingRoomType: roomPerformance[0]?.roomType || null,
        averageDailyOccupancy: parseFloat((Object.values(dailyOccupancy).reduce((a, b) => a + b, 0) / totalRoomUnits / daysInRange * 100).toFixed(2)),
        revenueGrowthPotential: pricingAnalytics?.summary?.average_multiplier ? 
          parseFloat(((pricingAnalytics.summary.average_multiplier - 1) * 100).toFixed(2)) : null
      }
    });
  } catch (error) {
    console.error("Advanced KPI Error:", error);
    return res.status(500).json({ error: "Failed to compute advanced hotel KPIs" });
  }
};

// Multiplier dependency management
export const updateMultiplierDependencies = async (req, res) => {
  try {
    const { hotelId } = req.params;
    const { multipliers, startDate, endDate, roomId, propagateToAll } = req.body;

    if (!multipliers || !Array.isArray(multipliers)) {
      return res.status(400).json({ error: "Multipliers array is required" });
    }

    // Get room data
    const roomQuery = roomId ? { hotelId, id: roomId } : { hotelId };
    const rooms = await prisma.room.findMany({
      where: roomQuery,
      select: { id: true, name: true, rateType: true }
    });

    if (rooms.length === 0) {
      return res.status(404).json({ error: "No rooms found" });
    }

    let updatedRooms = 0;
    const results = [];

    for (const room of rooms) {
      try {
        // Get current rates for the room
        const currentYear = new Date().getFullYear();
        const yearStart = new Date(`${currentYear}-04-01T00:00:00.000Z`);

        const roomRate = await prisma.roomDailyRate.findFirst({
          where: {
            hotelId,
            roomId: room.id,
            yearStart
          }
        });

        if (!roomRate) {
          console.warn(`No rates found for room ${room.name}`);
          continue;
        }

        // Send multipliers to Python service for dependency calculation
        const dependencyResponse = await axios.post('http://localhost:8001/predict-daily-rates', {
          base_rates: roomRate.prices.map(p => p.toNumber()),
          room_type: room.name,
          rate_type: room.rateType,
          year_start: roomRate.yearStart.toISOString(),
          custom_multipliers: multipliers,
          use_historical_fallback: true
        });

        if (dependencyResponse.data.success) {
          const predictions = dependencyResponse.data.predictions;
          
          // Update occupancy data based on predictions
          for (const prediction of predictions) {
            if (prediction.occupancy_data && prediction.occupancy_data.source !== 'default') {
              try {
                await axios.post('http://localhost:8001/occupancy-data', {
                  date: prediction.date,
                  actual_occupancy: prediction.occupancy_data.occupancy_percentage,
                  total_rooms: prediction.occupancy_data.total_rooms,
                  occupied_rooms: prediction.occupancy_data.occupied_rooms
                });
              } catch (occError) {
                console.warn(`Failed to update occupancy for ${prediction.date}:`, occError.message);
              }
            }
          }

          results.push({
            roomId: room.id,
            roomName: room.name,
            rateType: room.rateType,
            multipliers_applied: predictions.length,
            dependencies_updated: dependencyResponse.data.summary?.dependencies_applied || false,
            average_multiplier: dependencyResponse.data.summary?.average_multiplier || 1.0,
            revenue_impact: dependencyResponse.data.summary?.revenue_increase_percent || 0
          });

          updatedRooms++;
        }

      } catch (error) {
        console.error(`Error updating room ${room.name}:`, error);
        results.push({
          roomId: room.id,
          roomName: room.name,
          error: error.message
        });
      }
    }

    return res.json({
      success: true,
      message: `Multiplier dependencies updated for ${updatedRooms} rooms`,
      results,
      summary: {
        rooms_processed: rooms.length,
        rooms_updated: updatedRooms,
        multipliers_count: multipliers.length
      }
    });

  } catch (error) {
    console.error("Multiplier dependency error:", error);
    return res.status(500).json({ error: "Failed to update multiplier dependencies" });
  }
};

// Get occupancy data for date range
export const getOccupancyAnalysis = async (req, res) => {
  try {
    const { hotelId } = req.params;
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ error: "Start date and end date are required" });
    }

    // Get actual occupancy from reservations
    const from = parseDate(startDate);
    const to = new Date(endDate);
    to.setHours(23, 59, 59, 999);

    const totalRoomUnits = await prisma.roomUnit.count({
      where: { hotelId }
    });

    const reservations = await prisma.reservation.findMany({
      where: {
        hotelId,
        checkIn: { lte: to },
        checkOut: { gte: from },
      }
    });

    // Calculate daily occupancy
    const dailyOccupancyMap = {};
    
    reservations.forEach(reservation => {
      const checkInDate = new Date(reservation.checkIn);
      const nights = reservation.nights;
      const roomCount = reservation.rooms;
      
      for (let i = 0; i < nights; i++) {
        const currentDate = new Date(checkInDate);
        currentDate.setDate(currentDate.getDate() + i);
        const dateKey = currentDate.toISOString().split('T')[0];
        
        if (currentDate >= from && currentDate <= to) {
          if (!dailyOccupancyMap[dateKey]) {
            dailyOccupancyMap[dateKey] = 0;
          }
          dailyOccupancyMap[dateKey] += roomCount;
        }
      }
    });

    // Get predicted occupancy from Python service
    const dailyOccupancy = [];
    const currentDate = new Date(from);
    
    while (currentDate <= to) {
      const dateKey = currentDate.toISOString().split('T')[0];
      const actualOccupied = dailyOccupancyMap[dateKey] || 0;
      const actualOccupancyPercentage = (actualOccupied / totalRoomUnits) * 100;
      
      let predictedData = null;
      try {
        const predictionResponse = await axios.get(`http://localhost:8001/occupancy-data/${dateKey}`);
        predictedData = predictionResponse.data.occupancy_data;
      } catch (error) {
        console.warn(`Could not get prediction for ${dateKey}:`, error.message);
      }

      dailyOccupancy.push({
        date: dateKey,
        actualOccupied,
        totalRooms: totalRoomUnits,
        actualOccupancyPercentage: parseFloat(actualOccupancyPercentage.toFixed(2)),
        predictedOccupancyPercentage: predictedData ? predictedData.occupancy_percentage : null,
        predictionSource: predictedData ? predictedData.source : null,
        variance: predictedData ? 
          parseFloat((actualOccupancyPercentage - predictedData.occupancy_percentage).toFixed(2)) : null
      });

      // Update Python service with actual data
      if (actualOccupied > 0) {
        try {
          await axios.post('http://localhost:8001/occupancy-data', {
            date: dateKey,
            actual_occupancy: actualOccupancyPercentage,
            total_rooms: totalRoomUnits,
            occupied_rooms: actualOccupied
          });
        } catch (updateError) {
          console.warn(`Failed to update occupancy data for ${dateKey}:`, updateError.message);
        }
      }

      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Calculate summary statistics
    const actualOccupancies = dailyOccupancy.map(d => d.actualOccupancyPercentage);
    const averageOccupancy = actualOccupancies.reduce((a, b) => a + b, 0) / actualOccupancies.length;
    const maxOccupancy = Math.max(...actualOccupancies);
    const minOccupancy = Math.min(...actualOccupancies);

    // Accuracy metrics for predictions
    const validPredictions = dailyOccupancy.filter(d => d.predictedOccupancyPercentage !== null && d.actualOccupancyPercentage > 0);
    const averageVariance = validPredictions.length > 0 ? 
      validPredictions.reduce((sum, d) => sum + Math.abs(d.variance), 0) / validPredictions.length : null;

    return res.json({
      success: true,
      dateRange: {
        from: startDate,
        to: endDate,
        totalDays: dailyOccupancy.length
      },
      hotelCapacity: {
        totalRoomUnits,
        totalPossibleRoomNights: totalRoomUnits * dailyOccupancy.length
      },
      dailyOccupancy,
      summary: {
        averageOccupancy: parseFloat(averageOccupancy.toFixed(2)),
        maxOccupancy: parseFloat(maxOccupancy.toFixed(2)),
        minOccupancy: parseFloat(minOccupancy.toFixed(2)),
        totalOccupiedRoomNights: actualOccupancies.reduce((sum, _, index) => 
          sum + dailyOccupancy[index].actualOccupied, 0),
        predictionAccuracy: {
          averageVariance: averageVariance ? parseFloat(averageVariance.toFixed(2)) : null,
          predictionsAvailable: validPredictions.length,
          totalPredictionsNeeded: dailyOccupancy.length
        }
      }
    });

  } catch (error) {
    console.error("Occupancy analysis error:", error);
    return res.status(500).json({ error: "Failed to analyze occupancy data" });
  }
};

// Revenue forecasting with multiplier optimization
export const getRevenueForecast = async (req, res) => {
  try {
    const { hotelId } = req.params;
    const { forecastDays = 30, optimizationLevel = 'moderate' } = req.query;

    const rooms = await prisma.room.findMany({
      where: { hotelId },
      include: {
        dailyRates: {
          where: {
            yearStart: {
              gte: new Date(new Date().getFullYear(), 3, 1) // April 1st of current year
            }
          }
        }
      }
    });

    if (rooms.length === 0) {
      return res.status(404).json({ error: "No rooms found for forecasting" });
    }

    const forecastResults = [];
    const startDate = new Date();
    
    // Optimization multipliers based on level
    const optimizationMultipliers = {
      conservative: { min: 0.9, max: 1.2, boost: 1.05 },
      moderate: { min: 0.8, max: 1.5, boost: 1.15 },
      aggressive: { min: 0.7, max: 2.0, boost: 1.25 }
    };

    const optimization = optimizationMultipliers[optimizationLevel] || optimizationMultipliers.moderate;

    for (const room of rooms) {
      const roomRate = room.dailyRates[0];
      if (!roomRate || !roomRate.prices || roomRate.prices.length === 0) {
        continue;
      }

      try {
        // Generate base rates for forecast period
        const baseDayOfYear = Math.floor((startDate - new Date(startDate.getFullYear(), 3, 1)) / (1000 * 60 * 60 * 24));
        const forecastBaseRates = [];
        
        for (let i = 0; i < parseInt(forecastDays); i++) {
          const rateIndex = (baseDayOfYear + i) % roomRate.prices.length;
          forecastBaseRates.push(roomRate.prices[rateIndex].toNumber());
        }

        // Get optimized predictions
        const forecastResponse = await axios.post('http://localhost:8001/predict-daily-rates', {
          base_rates: forecastBaseRates,
          room_type: room.name,
          rate_type: room.rateType,
          year_start: roomRate.yearStart.toISOString(),
          use_historical_fallback: true
        });

        if (forecastResponse.data.success) {
          const predictions = forecastResponse.data.predictions;
          
          // Apply optimization boosters
          const optimizedPredictions = predictions.map(p => {
            const originalMultiplier = p.multiplier;
            let optimizedMultiplier = originalMultiplier * optimization.boost;
            
            // Apply bounds
            optimizedMultiplier = Math.max(optimization.min, Math.min(optimization.max, optimizedMultiplier));
            
            return {
              ...p,
              originalMultiplier,
              optimizedMultiplier,
              optimizedRate: p.base_rate * optimizedMultiplier,
              revenueGain: (p.base_rate * optimizedMultiplier) - p.dynamic_rate
            };
          });

          forecastResults.push({
            roomId: room.id,
            roomType: room.name,
            rateType: room.rateType,
            predictions: optimizedPredictions,
            summary: {
              totalBaseForecast: optimizedPredictions.reduce((sum, p) => sum + p.base_rate, 0),
              totalOptimizedForecast: optimizedPredictions.reduce((sum, p) => sum + p.optimizedRate, 0),
              averageOptimizedMultiplier: optimizedPredictions.reduce((sum, p) => sum + p.optimizedMultiplier, 0) / optimizedPredictions.length,
              totalRevenueGain: optimizedPredictions.reduce((sum, p) => sum + p.revenueGain, 0)
            }
          });
        }

      } catch (error) {
        console.error(`Forecast error for room ${room.name}:`, error);
      }
    }

    // Calculate overall forecast summary
    const totalBaseForecast = forecastResults.reduce((sum, r) => sum + r.summary.totalBaseForecast, 0);
    const totalOptimizedForecast = forecastResults.reduce((sum, r) => sum + r.summary.totalOptimizedForecast, 0);
    const totalRevenueGain = totalOptimizedForecast - totalBaseForecast;
    const revenueGainPercentage = totalBaseForecast > 0 ? (totalRevenueGain / totalBaseForecast) * 100 : 0;

    return res.json({
      success: true,
      forecastPeriod: {
        startDate: startDate.toISOString().split('T')[0],
        days: parseInt(forecastDays),
        optimizationLevel
      },
      forecast: forecastResults,
      overallSummary: {
        totalBaseForecast: parseFloat(totalBaseForecast.toFixed(2)),
        totalOptimizedForecast: parseFloat(totalOptimizedForecast.toFixed(2)),
        totalRevenueGain: parseFloat(totalRevenueGain.toFixed(2)),
        revenueGainPercentage: parseFloat(revenueGainPercentage.toFixed(2)),
        roomsForecasted: forecastResults.length
      }
    });

  } catch (error) {
    console.error("Revenue forecast error:", error);
    return res.status(500).json({ error: "Failed to generate revenue forecast" });
  }
};