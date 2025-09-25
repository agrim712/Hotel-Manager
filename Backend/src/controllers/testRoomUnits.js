import pkg from '@prisma/client';
const { PrismaClient } = pkg;

const prisma = new PrismaClient();

// Test function to verify RoomUnit creation
export const testRoomUnitCreation = async (req, res) => {
  try {
    const { hotelId } = req.params;
    
    if (!hotelId) {
      return res.status(400).json({ error: "hotelId is required" });
    }
    
    console.log(`🔍 Testing RoomUnit creation for hotel: ${hotelId}`);
    
    // 1. Check if hotel exists
    const hotel = await prisma.hotel.findUnique({
      where: { id: hotelId },
      select: { id: true, name: true, totalRooms: true }
    });
    
    if (!hotel) {
      return res.status(404).json({ error: "Hotel not found" });
    }
    
    console.log(`🏨 Hotel found:`, hotel);
    
    // 2. Check rooms for this hotel
    const rooms = await prisma.room.findMany({
      where: { hotelId },
      select: { 
        id: true, 
        name: true, 
        numOfRooms: true, 
        roomNumbers: true,
        _count: {
          select: { RoomUnit: true }
        }
      }
    });
    
    console.log(`🏠 Rooms found: ${rooms.length}`);
    rooms.forEach(room => {
      console.log(`  - Room: ${room.name}`);
      console.log(`    numOfRooms: ${room.numOfRooms}`);
      console.log(`    roomNumbers: ${JSON.stringify(room.roomNumbers)}`);
      console.log(`    roomNumbers type: ${typeof room.roomNumbers}`);
      console.log(`    RoomUnit count: ${room._count.RoomUnit}`);
    });
    
    // 3. Check room units
    const roomUnits = await prisma.roomUnit.findMany({
      where: { hotelId },
      select: { 
        id: true, 
        roomNumber: true, 
        floor: true, 
        roomId: true,
        room: { select: { name: true } }
      }
    });
    
    console.log(`🏢 RoomUnits found: ${roomUnits.length}`);
    roomUnits.forEach(unit => {
      console.log(`  - RoomUnit: ${unit.floor}-${unit.roomNumber} (Room: ${unit.room.name})`);
    });
    
    // 4. Identify missing room units
    const missingUnits = [];
    rooms.forEach(room => {
      const expectedCount = room.numOfRooms;
      const actualCount = room._count.RoomUnit;
      
      if (expectedCount !== actualCount) {
        missingUnits.push({
          roomId: room.id,
          roomName: room.name,
          expected: expectedCount,
          actual: actualCount,
          roomNumbers: room.roomNumbers
        });
      }
    });
    
    console.log(`❌ Rooms with missing units: ${missingUnits.length}`);
    missingUnits.forEach(missing => {
      console.log(`  - ${missing.roomName}: expected ${missing.expected}, got ${missing.actual}`);
      console.log(`    roomNumbers: ${JSON.stringify(missing.roomNumbers)}`);
    });
    
    // 5. Attempt to fix missing room units
    if (missingUnits.length > 0) {
      console.log(`🔧 Attempting to fix missing room units...`);
      
      for (const missing of missingUnits) {
        console.log(`🔧 Fixing room: ${missing.roomName}`);
        
        if (Array.isArray(missing.roomNumbers) && missing.roomNumbers.length > 0) {
          // Setup date range
          const today = new Date();
          const currentYear = today.getMonth() >= 3 ? today.getFullYear() : today.getFullYear() - 1;
          const startDate = new Date(currentYear, 3, 1);
          const endDate = new Date(currentYear + 1, 2, 31);
          const totalDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
          const dailyStatus = Array(totalDays).fill("AVAILABLE");
          
          for (const roomNumber of missing.roomNumbers) {
            try {
              if (typeof roomNumber === 'string' && roomNumber.includes('-')) {
                const [floor, number] = roomNumber.split('-');
                
                console.log(`🔧 Creating RoomUnit: ${floor}-${number}`);
                
                const created = await prisma.roomUnit.create({
                  data: {
                    roomNumber: number,
                    floor: floor,
                    roomId: missing.roomId,
                    hotelId: hotelId,
                    dailyStatus,
                    cleaningStatus: "CLEANED",
                    startDate,
                  }
                });
                
                console.log(`✅ Created RoomUnit: ${created.id}`);
              } else {
                console.log(`⚠️ Invalid room number format: ${roomNumber}`);
              }
            } catch (error) {
              console.error(`❌ Failed to create RoomUnit for ${roomNumber}:`, error.message);
            }
          }
        } else {
          console.log(`⚠️ Room ${missing.roomName} has invalid roomNumbers: ${JSON.stringify(missing.roomNumbers)}`);
        }
      }
    }
    
    // 6. Final verification
    const finalRoomUnits = await prisma.roomUnit.findMany({
      where: { hotelId },
      select: { 
        id: true, 
        roomNumber: true, 
        floor: true, 
        room: { select: { name: true } }
      }
    });
    
    const summary = {
      hotelId,
      hotelName: hotel.name,
      totalRooms: hotel.totalRooms,
      roomsInDb: rooms.length,
      roomUnitsInDb: finalRoomUnits.length,
      roomsWithMissingUnits: missingUnits.length,
      status: finalRoomUnits.length > 0 ? "SUCCESS" : "FAILED"
    };
    
    console.log(`📊 Final summary:`, summary);
    
    res.json({
      success: true,
      summary,
      rooms: rooms.map(room => ({
        id: room.id,
        name: room.name,
        numOfRooms: room.numOfRooms,
        roomNumbers: room.roomNumbers,
        roomUnitsCount: room._count.RoomUnit
      })),
      roomUnits: finalRoomUnits.map(unit => ({
        id: unit.id,
        roomNumber: unit.roomNumber,
        floor: unit.floor,
        roomName: unit.room.name
      }))
    });
    
  } catch (error) {
    console.error("❌ Test failed:", error);
    res.status(500).json({
      error: "Test failed",
      message: error.message,
      stack: error.stack
    });
  }
};

// Function to manually create missing room units
export const createMissingRoomUnits = async (req, res) => {
  try {
    const { hotelId } = req.params;
    
    if (!hotelId) {
      return res.status(400).json({ error: "hotelId is required" });
    }
    
    console.log(`🔧 Creating missing room units for hotel: ${hotelId}`);
    
    const rooms = await prisma.room.findMany({
      where: { hotelId },
      include: {
        RoomUnit: true
      }
    });
    
    let created = 0;
    let errors = 0;
    
    for (const room of rooms) {
      console.log(`🔧 Processing room: ${room.name}`);
      console.log(`   Expected units: ${room.numOfRooms}`);
      console.log(`   Existing units: ${room.RoomUnit.length}`);
      console.log(`   Room numbers: ${JSON.stringify(room.roomNumbers)}`);
      
      if (room.RoomUnit.length < room.numOfRooms && Array.isArray(room.roomNumbers)) {
        // Delete existing room units for this room
        await prisma.roomUnit.deleteMany({
          where: { roomId: room.id }
        });
        
        // Create fresh room units
        const today = new Date();
        const currentYear = today.getMonth() >= 3 ? today.getFullYear() : today.getFullYear() - 1;
        const startDate = new Date(currentYear, 3, 1);
        const endDate = new Date(currentYear + 1, 2, 31);
        const totalDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
        const dailyStatus = Array(totalDays).fill("AVAILABLE");
        
        for (const roomNumber of room.roomNumbers) {
          try {
            if (typeof roomNumber === 'string' && roomNumber.includes('-')) {
              const [floor, number] = roomNumber.split('-');
              
              const roomUnit = await prisma.roomUnit.create({
                data: {
                  roomNumber: number,
                  floor: floor,
                  roomId: room.id,
                  hotelId: hotelId,
                  dailyStatus,
                  cleaningStatus: "CLEANED",
                  startDate,
                }
              });
              
              console.log(`✅ Created RoomUnit: ${floor}-${number} (ID: ${roomUnit.id})`);
              created++;
            } else {
              console.log(`⚠️ Invalid room number format: ${roomNumber}`);
              errors++;
            }
          } catch (error) {
            console.error(`❌ Failed to create RoomUnit for ${roomNumber}:`, error.message);
            errors++;
          }
        }
      }
    }
    
    res.json({
      success: true,
      message: `Created ${created} room units with ${errors} errors`,
      created,
      errors
    });
    
  } catch (error) {
    console.error("❌ Create missing room units failed:", error);
    res.status(500).json({
      error: "Operation failed",
      message: error.message
    });
  }
};