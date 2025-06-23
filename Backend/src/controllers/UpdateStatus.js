import { PrismaClient } from '@prisma/client';
import pkg from '@prisma/client';
const { RoomStatus } = pkg;




const prisma = new PrismaClient();

/**
 * @desc    Update room unit status
 * @route   PUT /api/hotel/roomunits/:id/status
 * @access  Private/HOTELADMIN
 */
export const updateRoomUnitStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Validate the status
    if (!Object.values(RoomStatus).includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid room status provided',
        validStatuses: Object.values(RoomStatus)
      });
    }

    // Check if room unit exists
    const existingRoomUnit = await prisma.roomUnit.findUnique({
      where: { id },
      include: {
        room: {
          select: {
            id: true,
            name: true  // Use actual fields from your Room model
          }
        }
      }
    });

    if (!existingRoomUnit) {
      return res.status(404).json({
        success: false,
        error: 'Room unit not found'
      });
    }

    // Update the room unit status
    const updatedRoomUnit = await prisma.roomUnit.update({
      where: { id },
      data: { status },
      select: {
        id: true,
        roomNumber: true,
        status: true,
        floor: true,
        room: {
          select: {
            id: true,
            name: true  // Use actual fields from your Room model
          }
        }
      }
    });

    res.status(200).json({
      success: true,
      data: updatedRoomUnit
    });

  } catch (error) {
    console.error('Error updating room status:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Something went wrong!'
    });
  }
};