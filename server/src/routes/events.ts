import express from 'express';
import prisma from '../lib/prisma';

const router = express.Router();

// Get all events
router.get('/', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const where: any = {};
    if (startDate || endDate) {
      where.startTime = {};
      if (startDate) {
        where.startTime.gte = new Date(startDate as string);
      }
      if (endDate) {
        where.startTime.lte = new Date(endDate as string);
      }
    }

    const events = await prisma.calendarEvent.findMany({
      where,
      include: {
        reminders: {
          include: {
            group: true,
            acknowledgments: true
          }
        }
      },
      orderBy: {
        startTime: 'asc'
      }
    });

    res.json(events);
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

// Get a single event
router.get('/:id', async (req, res) => {
  try {
    const event = await prisma.calendarEvent.findUnique({
      where: { id: req.params.id },
      include: {
        reminders: {
          include: {
            group: {
              include: {
                members: true
              }
            },
            acknowledgments: true
          }
        }
      }
    });

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    res.json(event);
  } catch (error) {
    console.error('Error fetching event:', error);
    res.status(500).json({ error: 'Failed to fetch event' });
  }
});

// Create a new event
router.post('/', async (req, res) => {
  try {
    const { title, description, startTime, endTime, location } = req.body;

    const event = await prisma.calendarEvent.create({
      data: {
        title,
        description,
        startTime: new Date(startTime),
        endTime: endTime ? new Date(endTime) : null,
        location
      }
    });

    res.status(201).json(event);
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({ error: 'Failed to create event' });
  }
});

// Update an event
router.put('/:id', async (req, res) => {
  try {
    const { title, description, startTime, endTime, location } = req.body;

    const event = await prisma.calendarEvent.update({
      where: { id: req.params.id },
      data: {
        title,
        description,
        startTime: startTime ? new Date(startTime) : undefined,
        endTime: endTime ? new Date(endTime) : null,
        location
      }
    });

    res.json(event);
  } catch (error) {
    console.error('Error updating event:', error);
    res.status(500).json({ error: 'Failed to update event' });
  }
});

// Delete an event
router.delete('/:id', async (req, res) => {
  try {
    await prisma.calendarEvent.delete({
      where: { id: req.params.id }
    });

    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json({ error: 'Failed to delete event' });
  }
});

export default router;

