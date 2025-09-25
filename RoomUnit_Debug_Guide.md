# RoomUnit Creation Debug Guide

## Overview
This guide helps diagnose and fix RoomUnit creation issues when room data like `["1-101","1-102","1-103"]` exists in the Room table but corresponding RoomUnit records are not created.

## Step 1: Check Your Data

### 1.1 Verify Room Data in Database
Connect to your database and run:
```sql
SELECT id, name, numOfRooms, roomNumbers FROM Room WHERE hotelId = 'YOUR_HOTEL_ID';
```

Expected output:
- `numOfRooms`: Should be a number (e.g., 3)
- `roomNumbers`: Should be a JSON array like `["1-101","1-102","1-103"]`

### 1.2 Check RoomUnit Table
```sql
SELECT id, roomNumber, floor, roomId FROM RoomUnit WHERE hotelId = 'YOUR_HOTEL_ID';
```

If this returns empty results, RoomUnits are not being created.

## Step 2: Use Debug API Endpoints

### 2.1 Test RoomUnit Creation Status
Make a GET request to:
```
GET http://localhost:5000/api/hotel/test-room-units/YOUR_HOTEL_ID
```

This will:
- Show all rooms and their room numbers
- Show all existing room units
- Identify missing room units
- Attempt to automatically fix missing units

### 2.2 Force Fix Missing RoomUnits
Make a POST request to:
```
POST http://localhost:5000/api/hotel/fix-room-units/YOUR_HOTEL_ID
```

This will:
- Delete all existing room units for the hotel
- Recreate them based on room.roomNumbers data

## Step 3: Check Backend Logs

### 3.1 During Hotel Creation/Update
Look for these log patterns:

**✅ Success Pattern:**
```
🚀 Processing X room types
🏠 Processing room: Room Name
🔢 Room data: { name: "...", numOfRooms: 3, roomNumbers: ["1-101","1-102","1-103"] }
🔄 Processed room numbers: ["1-101","1-102","1-103"]
🚀 Starting RoomUnit creation for room: Room Name
📅 Date setup - Start: ..., End: ..., Total days: 365
🚀 Processing room number: 1-101
🏢 Parsed - Floor: 1, Number: 101
📝 Creating RoomUnit with data: { roomNumber: "101", floor: "1", ... }
✅ RoomUnit created successfully: { id: "...", roomNumber: "101", floor: "1" }
```

**❌ Failure Patterns:**
```
⚠️ Room [name] has no roomNumbers defined (length: 0). Skipping RoomUnit creation.
❌ Invalid room number format: [value] (type: [type])
❌ Failed to create RoomUnit for [room-number]: [error message]
```

## Step 4: Common Issues and Fixes

### Issue 1: roomNumbers is Empty Array
**Symptoms:** Log shows `roomNumbers: []` or `length: 0`
**Cause:** Frontend is not properly formatting the room numbers
**Fix:** Check `formatDataForBackend` function in `HoteladminDashboard.jsx`

### Issue 2: roomNumbers is String Instead of Array
**Symptoms:** Log shows `roomNumbers: "1-101,1-102,1-103"` (string, not array)
**Cause:** JSON parsing issue in backend
**Fix:** Check the `fieldsToParse` logic in hotel controller

### Issue 3: Invalid Room Number Format
**Symptoms:** Log shows `❌ Invalid room number format`
**Cause:** Room numbers not in "floor-number" format
**Fix:** Ensure frontend validation requires format like "1-101", "2-201"

### Issue 4: Transaction Rollback
**Symptoms:** Hotel created but no RoomUnits, no error logs
**Cause:** Silent transaction failure
**Fix:** Check for database constraint violations or timeout issues

## Step 5: Manual Database Fix

If automatic fixes don't work, manually create RoomUnits:

```sql
-- First, check room data
SELECT id, name, numOfRooms, roomNumbers FROM Room WHERE hotelId = 'YOUR_HOTEL_ID';

-- For each room, create RoomUnits manually
-- Example for room with roomNumbers ["1-101","1-102","1-103"]
INSERT INTO RoomUnit (id, roomNumber, floor, roomId, hotelId, dailyStatus, cleaningStatus, startDate, createdAt, updatedAt)
VALUES 
  (gen_random_uuid(), '101', '1', 'ROOM_ID_HERE', 'HOTEL_ID_HERE', ARRAY_FILL('AVAILABLE'::text, ARRAY[365]), 'CLEANED', '2024-04-01', NOW(), NOW()),
  (gen_random_uuid(), '102', '1', 'ROOM_ID_HERE', 'HOTEL_ID_HERE', ARRAY_FILL('AVAILABLE'::text, ARRAY[365]), 'CLEANED', '2024-04-01', NOW(), NOW()),
  (gen_random_uuid(), '103', '1', 'ROOM_ID_HERE', 'HOTEL_ID_HERE', ARRAY_FILL('AVAILABLE'::text, ARRAY[365]), 'CLEANED', '2024-04-01', NOW(), NOW());
```

## Step 6: Verify Fix

After applying fixes:

1. Check RoomUnit count:
```sql
SELECT COUNT(*) FROM RoomUnit WHERE hotelId = 'YOUR_HOTEL_ID';
```

2. Verify floor-number mapping:
```sql
SELECT ru.floor, ru.roomNumber, r.name as roomName 
FROM RoomUnit ru 
JOIN Room r ON ru.roomId = r.id 
WHERE ru.hotelId = 'YOUR_HOTEL_ID' 
ORDER BY r.name, ru.floor, ru.roomNumber;
```

3. Use the test endpoint again:
```
GET http://localhost:5000/api/hotel/test-room-units/YOUR_HOTEL_ID
```

## Step 7: Prevention

To prevent this issue in the future:

1. **Frontend Validation:** Ensure room numbers are always in floor-number format
2. **Backend Validation:** Add validation to ensure roomNumbers array matches numOfRooms
3. **Error Handling:** Implement proper transaction error handling
4. **Testing:** Always verify RoomUnit creation after hotel setup

## Emergency Recovery Script

If you need to quickly fix all hotels with missing RoomUnits:

```javascript
// Run this in your Node.js environment
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function fixAllMissingRoomUnits() {
  const hotels = await prisma.hotel.findMany({
    include: {
      rooms: {
        include: {
          RoomUnit: true
        }
      }
    }
  });

  for (const hotel of hotels) {
    console.log(`Checking hotel: ${hotel.name}`);
    
    for (const room of hotel.rooms) {
      if (room.RoomUnit.length < room.numOfRooms && Array.isArray(room.roomNumbers)) {
        console.log(`Fixing room: ${room.name}`);
        
        // Delete existing
        await prisma.roomUnit.deleteMany({ where: { roomId: room.id } });
        
        // Create new
        const today = new Date();
        const currentYear = today.getMonth() >= 3 ? today.getFullYear() : today.getFullYear() - 1;
        const startDate = new Date(currentYear, 3, 1);
        const dailyStatus = Array(365).fill("AVAILABLE");
        
        for (const roomNumber of room.roomNumbers) {
          if (typeof roomNumber === 'string' && roomNumber.includes('-')) {
            const [floor, number] = roomNumber.split('-');
            
            await prisma.roomUnit.create({
              data: {
                roomNumber: number,
                floor: floor,
                roomId: room.id,
                hotelId: hotel.id,
                dailyStatus,
                cleaningStatus: "CLEANED",
                startDate,
              }
            });
          }
        }
      }
    }
  }
  
  console.log('Fix completed!');
}

// Run the fix
fixAllMissingRoomUnits().catch(console.error);
```

## Contact Support

If issues persist after following this guide:

1. Share backend logs from hotel creation/update
2. Share database query results from Step 1
3. Share API response from debug endpoints
4. Include your room input format examples