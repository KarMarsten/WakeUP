# Setup Guide

## Quick Start

1. **Install Dependencies**
   ```bash
   npm run install:all
   ```

2. **Set Up Database**
   - Create a PostgreSQL database
   - Create a `.env` file in the `server` directory:
     ```
     DATABASE_URL="postgresql://user:password@localhost:5432/wakeup?schema=public"
     PORT=3001
     APP_URL=http://localhost:3000
     ```

3. **Initialize Database**
   ```bash
   cd server
   npm run db:generate
   npm run db:push
   ```

4. **Configure Notification Services** (Optional)

   **Email (Gmail Example):**
   ```
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_SECURE=false
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-app-password
   ```
   - Enable 2FA on your Google account
   - Generate an App Password: https://myaccount.google.com/apppasswords

   **SMS (Twilio):**
   ```
   TWILIO_ACCOUNT_SID=your-account-sid
   TWILIO_AUTH_TOKEN=your-auth-token
   TWILIO_PHONE_NUMBER=+1234567890
   ```
   - Sign up at https://www.twilio.com
   - Get credentials from the dashboard

   **WhatsApp:**
   ```
   ENABLE_WHATSAPP=true
   ```
   - Scan QR code that appears in console on first run

5. **Start Development Servers**
   ```bash
   npm run dev
   ```

   This will start:
   - Backend: http://localhost:3001
   - Frontend: http://localhost:3000

## Project Structure

```
WakeUP/
├── server/              # Backend API
│   ├── src/
│   │   ├── routes/      # API routes
│   │   ├── services/    # Notification & scheduler services
│   │   ├── lib/         # Shared utilities (Prisma client)
│   │   └── server.ts    # Main server file
│   ├── prisma/
│   │   └── schema.prisma # Database schema
│   └── package.json
├── client/              # Frontend React app
│   ├── src/
│   │   ├── pages/       # Page components
│   │   ├── App.tsx      # Main app component
│   │   └── main.tsx     # Entry point
│   └── package.json
└── README.md
```

## Common Commands

- `npm run dev` - Start both servers in development mode
- `npm run build` - Build for production
- `cd server && npm run db:studio` - Open Prisma Studio (database GUI)
- `cd server && npm run db:migrate` - Create database migration

## Troubleshooting

- **Port already in use**: Change `PORT` in `.env` or kill the process using the port
- **Database connection error**: Check your `DATABASE_URL` and ensure PostgreSQL is running
- **Email not sending**: Verify SMTP credentials, especially app passwords for Gmail
- **WhatsApp not working**: Check console for QR code, ensure `ENABLE_WHATSAPP=true`

