# WakeUP - Reminder Application

A comprehensive reminder application that sends notifications to groups of people based on calendar events. The app supports multiple notification channels (Email, SMS, WhatsApp) and tracks acknowledgments from recipients.

## Features

- **Group Management**: Create and manage groups of people with their contact information (email, phone, WhatsApp)
- **Calendar Events**: Add and manage calendar events with titles, descriptions, times, and locations
- **Reminders**: Set up reminders that will be sent to groups before events occur
- **Multi-Channel Notifications**: Send reminders via:
  - Email (SMTP)
  - SMS (Twilio)
  - WhatsApp (via WhatsApp Web.js)
- **Acknowledgment Tracking**: Track who has acknowledged reminders and through which channel
- **Real-time Scheduler**: Automatically checks for reminders to send every minute
- **Dashboard**: View statistics and recent activity

## Tech Stack

### Backend
- **Node.js** with **Express** and **TypeScript**
- **PostgreSQL** database with **Prisma ORM**
- **Nodemailer** for email notifications
- **Twilio** for SMS notifications
- **WhatsApp Web.js** for WhatsApp messages
- **node-cron** for scheduled reminder checks

### Frontend
- **React** with **TypeScript**
- **Material-UI** for UI components
- **React Router** for navigation
- **Axios** for API calls
- **date-fns** for date formatting

## Prerequisites

- Node.js (v18 or higher)
- PostgreSQL database
- For email: SMTP server credentials (Gmail, SendGrid, etc.)
- For SMS: Twilio account and credentials
- For WhatsApp: WhatsApp account (will need to scan QR code on first use)

## Installation

1. **Clone the repository** (or navigate to the project directory)

2. **Install dependencies**:
   ```bash
   npm run install:all
   ```

3. **Set up the database**:
   - Create a PostgreSQL database
   - Copy `.env.example` to `.env` in the `server` directory and configure:
     ```env
     DATABASE_URL="postgresql://user:password@localhost:5432/wakeup?schema=public"
     PORT=3001
     APP_URL=http://localhost:3000
     
     # Email Configuration
     SMTP_HOST=smtp.gmail.com
     SMTP_PORT=587
     SMTP_SECURE=false
     SMTP_USER=your-email@gmail.com
     SMTP_PASS=your-app-password
     
     # SMS Configuration (Twilio)
     TWILIO_ACCOUNT_SID=your-account-sid
     TWILIO_AUTH_TOKEN=your-auth-token
     TWILIO_PHONE_NUMBER=+1234567890
     
     # WhatsApp Configuration
     ENABLE_WHATSAPP=false
     ```

4. **Generate Prisma client and push schema**:
   ```bash
   cd server
   npm run db:generate
   npm run db:push
   ```

5. **Start the development servers**:
   ```bash
   # From the root directory
   npm run dev
   ```

   This will start:
   - Backend server on `http://localhost:3001`
   - Frontend app on `http://localhost:3000`

## Usage

### 1. Create Groups

1. Navigate to the "Groups" tab
2. Click "New Group" to create a group
3. Add members to the group with their contact information:
   - Name (required)
   - Email (optional, for email notifications)
   - Phone (optional, for SMS notifications)
   - WhatsApp (optional, for WhatsApp notifications)

### 2. Add Calendar Events

1. Navigate to the "Events" tab
2. Click "New Event" to create an event
3. Fill in:
   - Title (required)
   - Description (optional)
   - Start Time (required)
   - End Time (optional)
   - Location (optional)

### 3. Create Reminders

1. Navigate to the "Reminders" tab
2. Click "New Reminder"
3. Select:
   - An event (required)
   - A group to notify (required)
   - Advance minutes (how many minutes before the event to send the reminder)
   - Custom message (optional, defaults to a template message)

4. The reminder will be automatically sent at the calculated time (event time - advance minutes)

### 4. View Acknowledgments

1. Click the "View" button on any reminder
2. See all acknowledgments with:
   - Method used (Email, SMS, WhatsApp, Web App, Manual)
   - Timestamp
   - Notes

## Acknowledgment Methods

- **EMAIL**: Recipient clicks the acknowledgment link in the email
- **SMS**: Recipient clicks the acknowledgment link in the SMS
- **WHATSAPP**: Recipient clicks the acknowledgment link in the WhatsApp message
- **WEB_APP**: Direct acknowledgment through the web interface
- **MANUAL**: Manually recorded acknowledgment

## Notification Channels Setup

### Email (SMTP)

1. **Gmail Setup**:
   - Enable 2-Factor Authentication
   - Generate an App Password: https://myaccount.google.com/apppasswords
   - Use the app password in `SMTP_PASS`

2. **Other SMTP Servers**:
   - Update `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE` accordingly
   - Provide credentials in `SMTP_USER` and `SMTP_PASS`

### SMS (Twilio)

1. Sign up for Twilio: https://www.twilio.com
2. Get your Account SID and Auth Token from the dashboard
3. Purchase a phone number or use a trial number
4. Add credentials to `.env`

### WhatsApp

1. Set `ENABLE_WHATSAPP=true` in `.env`
2. Restart the server
3. A QR code will appear in the console
4. Scan it with your WhatsApp mobile app (Settings > Linked Devices)
5. Once authenticated, WhatsApp notifications will be available

## API Endpoints

### Groups
- `GET /api/groups` - Get all groups
- `GET /api/groups/:id` - Get a specific group
- `POST /api/groups` - Create a new group
- `PUT /api/groups/:id` - Update a group
- `DELETE /api/groups/:id` - Delete a group
- `POST /api/groups/:id/members` - Add a member to a group
- `PUT /api/groups/:groupId/members/:memberId` - Update a member
- `DELETE /api/groups/:groupId/members/:memberId` - Delete a member

### Events
- `GET /api/events` - Get all events (optional query: `startDate`, `endDate`)
- `GET /api/events/:id` - Get a specific event
- `POST /api/events` - Create a new event
- `PUT /api/events/:id` - Update an event
- `DELETE /api/events/:id` - Delete an event

### Reminders
- `GET /api/reminders` - Get all reminders (optional query: `status`, `eventId`, `groupId`)
- `GET /api/reminders/:id` - Get a specific reminder
- `POST /api/reminders` - Create a new reminder
- `PUT /api/reminders/:id` - Update a reminder
- `DELETE /api/reminders/:id` - Delete a reminder

### Acknowledgments
- `GET /api/acknowledgments` - Get all acknowledgments (optional query: `reminderId`)
- `GET /api/acknowledgments/reminder/:reminderId` - Get acknowledgments for a specific reminder
- `POST /api/acknowledgments` - Create an acknowledgment

## Database Schema

- **groups**: User-defined groups
- **group_members**: Members belonging to groups
- **calendar_events**: Calendar events
- **reminders**: Reminders linked to events and groups
- **acknowledgments**: Records of who acknowledged reminders and how

## Development

### Backend Development
```bash
cd server
npm run dev
```

### Frontend Development
```bash
cd client
npm start
```

### Database Management
```bash
cd server
npm run db:studio  # Opens Prisma Studio
npm run db:migrate # Create a new migration
```

## Production Build

```bash
npm run build
```

This will build both the backend and frontend for production.

## Troubleshooting

1. **Database connection issues**: Verify your `DATABASE_URL` in `.env`
2. **Email not sending**: Check SMTP credentials and ensure app passwords are used for Gmail
3. **WhatsApp QR code not appearing**: Make sure `ENABLE_WHATSAPP=true` and check console logs
4. **Reminders not sending**: Verify the scheduler is running (check server logs for "Reminder scheduler started")

## License

MIT

