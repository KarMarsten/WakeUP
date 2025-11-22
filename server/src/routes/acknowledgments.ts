import express from 'express';
import prisma from '../lib/prisma';

const router = express.Router();

// Get all acknowledgments
router.get('/', async (req, res) => {
  try {
    const { reminderId } = req.query;

    const where: any = {};
    if (reminderId) where.reminderId = reminderId;

    const acknowledgments = await prisma.acknowledgement.findMany({
      where,
      include: {
        reminder: {
          include: {
            event: true,
            group: true
          }
        }
      },
      orderBy: {
        acknowledgedAt: 'desc'
      }
    });

    res.json(acknowledgments);
  } catch (error) {
    console.error('Error fetching acknowledgments:', error);
    res.status(500).json({ error: 'Failed to fetch acknowledgments' });
  }
});

// Create an acknowledgment
router.post('/', async (req, res) => {
  try {
    const { reminderId, memberId, method, notes } = req.body;

    // Validate method
    const validMethods = ['EMAIL', 'SMS', 'WHATSAPP', 'WEB_APP', 'MANUAL'];
    if (!validMethods.includes(method)) {
      return res.status(400).json({ error: 'Invalid acknowledgment method' });
    }

    const acknowledgment = await prisma.acknowledgement.create({
      data: {
        reminderId,
        memberId,
        method,
        notes
      },
      include: {
        reminder: {
          include: {
            event: true,
            group: true
          }
        }
      }
    });

    res.status(201).json(acknowledgment);
  } catch (error) {
    console.error('Error creating acknowledgment:', error);
    res.status(500).json({ error: 'Failed to create acknowledgment' });
  }
});

// Get acknowledgments for a specific reminder
router.get('/reminder/:reminderId', async (req, res) => {
  try {
    const acknowledgments = await prisma.acknowledgement.findMany({
      where: { reminderId: req.params.reminderId },
      include: {
        reminder: {
          include: {
            event: true,
            group: {
              include: {
                members: true
              }
            }
          }
        }
      },
      orderBy: {
        acknowledgedAt: 'desc'
      }
    });

    res.json(acknowledgments);
  } catch (error) {
    console.error('Error fetching acknowledgments:', error);
    res.status(500).json({ error: 'Failed to fetch acknowledgments' });
  }
});

export default router;

