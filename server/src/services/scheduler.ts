import cron from 'node-cron';
import { PrismaClient, ReminderStatus } from '@prisma/client';
import { sendNotificationToMember } from './notifications';

/**
 * Start the reminder scheduler
 * Checks every minute for reminders that need to be sent
 */
export function startScheduler(prisma: PrismaClient) {
  console.log('📅 Reminder scheduler started');

  // Run every minute
  cron.schedule('* * * * *', async () => {
    await checkAndSendReminders(prisma);
  });

  // Also check immediately on start
  checkAndSendReminders(prisma).catch((error) => {
    console.error('Error in initial reminder check:', error);
  });
}

/**
 * Check for reminders that need to be sent and send them
 */
async function checkAndSendReminders(prisma: PrismaClient) {
  try {
    const now = new Date();
    // Check reminders that should be sent in the next minute
    const futureCheck = new Date(now.getTime() + 60000);

    const pendingReminders = await prisma.reminder.findMany({
      where: {
        status: ReminderStatus.PENDING,
        reminderTime: {
          lte: futureCheck,
          gte: now
        }
      },
      include: {
        event: true,
        group: {
          include: {
            members: true
          }
        }
      }
    });

    for (const reminder of pendingReminders) {
      // Check if it's time to send (within 1 minute window)
      const timeDiff = reminder.reminderTime.getTime() - now.getTime();
      
      if (timeDiff <= 60000 && timeDiff >= 0) {
        await sendReminder(prisma, reminder);
      }
    }

    // Also check for past reminders that are still pending (missed window)
    const pastReminders = await prisma.reminder.findMany({
      where: {
        status: ReminderStatus.PENDING,
        reminderTime: {
          lt: now
        }
      },
      include: {
        event: true,
        group: {
          include: {
            members: true
          }
        }
      },
      take: 10 // Limit to prevent overwhelming
    });

    for (const reminder of pastReminders) {
      await sendReminder(prisma, reminder);
    }

  } catch (error) {
    console.error('Error checking reminders:', error);
  }
}

/**
 * Send a reminder to all group members
 */
async function sendReminder(
  prisma: PrismaClient,
  reminder: any
) {
  try {
    console.log(`📤 Sending reminder ${reminder.id} for event: ${reminder.event.title}`);

    const subject = `Reminder: ${reminder.event.title}`;
    const message = `${reminder.message}\n\nEvent Details:\n` +
      `Title: ${reminder.event.title}\n` +
      (reminder.event.description ? `Description: ${reminder.event.description}\n` : '') +
      `Start Time: ${reminder.event.startTime.toLocaleString()}\n` +
      (reminder.event.location ? `Location: ${reminder.event.location}\n` : '') +
      `\nThis event starts in ${reminder.advanceMinutes} minute(s).`;

    let allSuccess = true;
    let anySuccess = false;

    // Send to all members in the group
    for (const member of reminder.group.members) {
      // Determine which channels to use based on member's contact info
      const channels: ('email' | 'sms' | 'whatsapp')[] = [];
      if (member.email) channels.push('email');
      if (member.phone) channels.push('sms');
      if (member.whatsapp) channels.push('whatsapp');

      if (channels.length > 0) {
        const results = await sendNotificationToMember(
          member,
          subject,
          message,
          reminder.id,
          channels
        );

        const memberSuccess = results.some(r => r.success);
        anySuccess = anySuccess || memberSuccess;
        if (!memberSuccess) {
          allSuccess = false;
        }
      }
    }

    // Update reminder status
    await prisma.reminder.update({
      where: { id: reminder.id },
      data: {
        status: anySuccess ? ReminderStatus.SENT : ReminderStatus.FAILED,
        sentAt: new Date()
      }
    });

    console.log(`✅ Reminder ${reminder.id} sent. Success: ${anySuccess ? 'Yes' : 'No'}`);
  } catch (error) {
    console.error(`❌ Error sending reminder ${reminder.id}:`, error);
    
    // Mark as failed
    await prisma.reminder.update({
      where: { id: reminder.id },
      data: {
        status: ReminderStatus.FAILED,
        sentAt: new Date()
      }
    }).catch((updateError) => {
      console.error('Error updating reminder status:', updateError);
    });
  }
}

