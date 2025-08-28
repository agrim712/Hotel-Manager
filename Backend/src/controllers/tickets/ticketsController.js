import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// ✅ GET all tickets
export const getTickets = async (req, res) => {
  try {
    const tickets = await prisma.ticket.findMany({
      where: { hotelId: req.user.hotelId },
      include: { technician: true, room: true, equipment: true, history: true },
      orderBy: { createdAt: 'desc' }
    });
    res.json(tickets);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ GET ticket by ID
export const getTicketById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ error: 'Ticket ID is required' });

    const ticket = await prisma.ticket.findUnique({
      where: {
        id: Number(id)
      },
      include: { technician: true, room: true, equipment: true, history: true }
    });

    if (!ticket || ticket.hotelId !== req.user.hotelId) {
      return res.status(404).json({ error: 'Ticket not found' });
    }

    res.json(ticket);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ CREATE ticket
export const createTicket = async (req, res) => {
  try {
    const {title, room, issueType, priority, description } = req.body;
    const ticket = await prisma.ticket.create({
      data: {
        title,
        room,
        issueType,
        priority,
        description,
        hotelId: req.user.hotelId,
        status: 'open'
      }
    });
    res.status(201).json(ticket);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ ASSIGN technician
export const assignTechnician = async (req, res) => {
  try {
    const { id } = req.params;
    const { technicianId } = req.body;
    if (!id || !technicianId) return res.status(400).json({ error: 'Ticket ID and Technician ID are required' });

    const updatedTicket = await prisma.ticket.update({
      where: { id: Number(id) },
      data: { technicianId },
      include: { technician: true }
    });

    if (updatedTicket.hotelId !== req.user.hotelId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    res.json(updatedTicket);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ UPDATE ticket status
export const updateTicketStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!id || !status) return res.status(400).json({ error: 'Ticket ID and Status are required' });

    const updatedTicket = await prisma.ticket.update({
      where: { id: Number(id) },
      data: { status }
    });

    if (updatedTicket.hotelId !== req.user.hotelId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    res.json(updatedTicket);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
