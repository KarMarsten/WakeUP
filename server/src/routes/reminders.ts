import express from 'express';
import prisma from '../lib/prisma';

const router = express.Router();

// Get all reminders
router.get('/', async (req, res) => {
  try {
    const { status, eventId, groupId } = req.query;

    const where: any = {};
    if (status) where.status = status;
    if (eventId) where.eventId = eventId;
    if (groupId) where.groupId = groupId;

    const reminders = await prisma.reminder.findMany({
      where,
      include: {
        event: true,
        group: {
          include: {
            members: true
          }
        },
        acknowledgments: true
      },
      orderBy: {
        reminderTime: 'desc'
      }
    });

    res.json(reminders);
  } catch (error) {
    console.error('Error fetching reminders:', error);
    res.status(500).json({ error: 'Failed to fetch reminders' });
  }
});

// Get a single reminder
router.get('/:id', async (req, res) => {
  try {
    const reminder = await prisma.reminder.findUnique({
      where: { id: req.params.id },
      include: {
        event: true,
        group: {
          include: {
            members: true
          }
        },
        acknowledgments: true
      }
    });

    if (!reminder) {
      return res.status(404).json({ error: 'Reminder not found' });
    }

    res.json(reminder);
  } catch (error) {
    console.error('Error fetching reminder:', error);
    res.status(500).json({ error: 'Failed to fetch reminder' });
  }
});

// Create a new reminder
router.post('/', async (req, res) => {
  try {
    const { eventId, groupId, advanceMinutes, message } = req.body;

    // Get the event to calculate reminder time
    const event = await prisma.calendarEvent.findUnique({
      where: { id: eventId }
    });

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Calculate reminder time (event start time minus advance minutes)
    const reminderTime = new Date(event.startTime);
    reminderTime.setMinutes(reminderTime.getMinutes() - advanceMinutes);

    const reminder = await prisma.reminder.create({
      data: {
        eventId,
        groupId,
        advanceMinutes,
        message: message || `Reminder: ${event.title} is happening in ${advanceMinutes} minutes!`,
        reminderTime
      },
      include: {
        event: true,
        group: true
      }
    });

    res.status(201).json(reminder);
  } catch (error) {
    console.error('Error creating reminder:', error);
    res.status(500).json({ error: 'Failed to create reminder' });
  }
});

// Update a reminder
router.put('/:id', async (req, res) => {
  try {
    const { advanceMinutes, message, status } = req.body;

    const reminder = await prisma.reminder.update({
      where: { id: req.params.id },
      data: {
        advanceMinutes,
        message,
        status
      },
      include: {
        event: true,
        group: true,
        acknowledgments: true
      }
    });

    res.json(reminder);
  } catch (error) {
    console.error('Error updating reminder:', error);
    res.status(500).json({ error: 'Failed to update reminder' });
  }
});

// Delete a reminder
router.delete('/:id', async (req, res) => {
  try {
    await prisma.reminder.delete({
      where: { id: req.params.id }
    });

    res.json({ message: 'Reminder deleted successfully' });
  } catch (error) {
    console.error('Error deleting reminder:', error);
    res.status(500).json({ error: 'Failed to delete reminder' });
  }
});

export default router;

