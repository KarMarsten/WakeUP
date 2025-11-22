import express from 'express';
import prisma from '../lib/prisma';

const router = express.Router();

// Get all groups
router.get('/', async (req, res) => {
  try {
    const groups = await prisma.group.findMany({
      include: {
        members: true,
        _count: {
          select: { reminders: true }
        }
      }
    });
    res.json(groups);
  } catch (error) {
    console.error('Error fetching groups:', error);
    res.status(500).json({ error: 'Failed to fetch groups' });
  }
});

// Get a single group
router.get('/:id', async (req, res) => {
  try {
    const group = await prisma.group.findUnique({
      where: { id: req.params.id },
      include: {
        members: true,
        reminders: {
          include: {
            event: true,
            acknowledgments: true
          }
        }
      }
    });

    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    res.json(group);
  } catch (error) {
    console.error('Error fetching group:', error);
    res.status(500).json({ error: 'Failed to fetch group' });
  }
});

// Create a new group
router.post('/', async (req, res) => {
  try {
    const { name, description, members } = req.body;

    const group = await prisma.group.create({
      data: {
        name,
        description,
        members: members ? {
          create: members.map((member: any) => ({
            name: member.name,
            email: member.email,
            phone: member.phone,
            whatsapp: member.whatsapp
          }))
        } : undefined
      },
      include: {
        members: true
      }
    });

    res.status(201).json(group);
  } catch (error) {
    console.error('Error creating group:', error);
    res.status(500).json({ error: 'Failed to create group' });
  }
});

// Update a group
router.put('/:id', async (req, res) => {
  try {
    const { name, description } = req.body;

    const group = await prisma.group.update({
      where: { id: req.params.id },
      data: {
        name,
        description
      },
      include: {
        members: true
      }
    });

    res.json(group);
  } catch (error) {
    console.error('Error updating group:', error);
    res.status(500).json({ error: 'Failed to update group' });
  }
});

// Delete a group
router.delete('/:id', async (req, res) => {
  try {
    await prisma.group.delete({
      where: { id: req.params.id }
    });

    res.json({ message: 'Group deleted successfully' });
  } catch (error) {
    console.error('Error deleting group:', error);
    res.status(500).json({ error: 'Failed to delete group' });
  }
});

// Add member to group
router.post('/:id/members', async (req, res) => {
  try {
    const { name, email, phone, whatsapp } = req.body;

    const member = await prisma.groupMember.create({
      data: {
        groupId: req.params.id,
        name,
        email,
        phone,
        whatsapp
      }
    });

    res.status(201).json(member);
  } catch (error) {
    console.error('Error adding member:', error);
    res.status(500).json({ error: 'Failed to add member' });
  }
});

// Update a member
router.put('/:groupId/members/:memberId', async (req, res) => {
  try {
    const { name, email, phone, whatsapp } = req.body;

    const member = await prisma.groupMember.update({
      where: { id: req.params.memberId },
      data: {
        name,
        email,
        phone,
        whatsapp
      }
    });

    res.json(member);
  } catch (error) {
    console.error('Error updating member:', error);
    res.status(500).json({ error: 'Failed to update member' });
  }
});

// Delete a member
router.delete('/:groupId/members/:memberId', async (req, res) => {
  try {
    await prisma.groupMember.delete({
      where: { id: req.params.memberId }
    });

    res.json({ message: 'Member deleted successfully' });
  } catch (error) {
    console.error('Error deleting member:', error);
    res.status(500).json({ error: 'Failed to delete member' });
  }
});

export default router;

