import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import prisma from './lib/prisma';
import groupRoutes from './routes/groups';
import eventRoutes from './routes/events';
import reminderRoutes from './routes/reminders';
import acknowledgmentRoutes from './routes/acknowledgments';
import { startScheduler } from './services/scheduler';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/groups', groupRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/reminders', reminderRoutes);
app.use('/api/acknowledgments', acknowledgmentRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start scheduler
startScheduler(prisma);

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

export default app;

