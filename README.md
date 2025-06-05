# PATISA Transit - Local Development Setup Guide

A comprehensive parcel delivery platform leveraging South Africa's taxi and bus transport network for rapid delivery. This guide will help you set up the project locally in Visual Studio Code.

## Prerequisites

Before starting, ensure you have the following installed on your system:

1. **Node.js** (version 18 or higher)
   - Download from: https://nodejs.org/
   - Verify installation: `node --version` and `npm --version`

2. **Visual Studio Code**
   - Download from: https://code.visualstudio.com/

3. **Git**
   - Download from: https://git-scm.com/

4. **PostgreSQL Database**
   - Option 1: Install locally from https://postgresql.org/
   - Option 2: Use cloud service like Neon, Supabase, or Railway

## Step 1: Clone and Setup Project

### 1.1 Download Project Files
Download all project files from your current environment and create a new folder called `patisa-transit` on your local machine.

### 1.2 Open in Visual Studio Code
```bash
cd patisa-transit
code .
```

### 1.3 Install Dependencies
Open the integrated terminal in VS Code (`Ctrl + `` ` or `View > Terminal`) and run:
```bash
npm install
```

## Step 2: Database Setup

### 2.1 Create PostgreSQL Database
Create a new PostgreSQL database for your project. Note down the connection details.

### 2.2 Environment Variables
Create a `.env` file in your project root:
```bash
touch .env
```

Add the following environment variables to `.env`:
```env
# Database Configuration
DATABASE_URL=postgresql://username:password@localhost:5432/patisa_transit
PGHOST=localhost
PGPORT=5432
PGUSER=your_username
PGPASSWORD=your_password
PGDATABASE=patisa_transit

# Session Configuration
SESSION_SECRET=your-super-secret-session-key-here

# Stripe Configuration (for payments)
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
VITE_STRIPE_PUBLIC_KEY=pk_test_your_stripe_public_key_here

# Twilio Configuration (for SMS notifications)
TWILIO_ACCOUNT_SID=your_twilio_account_sid_here
TWILIO_AUTH_TOKEN=your_twilio_auth_token_here
TWILIO_PHONE_NUMBER=+1234567890

# Replit Auth Configuration (for development)
REPL_ID=your-repl-id
ISSUER_URL=https://replit.com/oidc
REPLIT_DOMAINS=localhost:5000
```

### 2.3 Initialize Database Schema
Run the database migration to create all necessary tables:
```bash
npm run db:push
```

## Step 3: External Service Setup

### 3.1 Stripe Setup (Payment Processing)
1. Create account at https://dashboard.stripe.com/
2. Go to API Keys section
3. Copy your **Publishable key** (starts with `pk_test_`) to `VITE_STRIPE_PUBLIC_KEY`
4. Copy your **Secret key** (starts with `sk_test_`) to `STRIPE_SECRET_KEY`

### 3.2 Twilio Setup (SMS Notifications)
1. Create account at https://twilio.com/
2. Go to Console Dashboard
3. Copy **Account SID** to `TWILIO_ACCOUNT_SID`
4. Copy **Auth Token** to `TWILIO_AUTH_TOKEN`
5. Get a phone number and add to `TWILIO_PHONE_NUMBER`

### 3.3 Replit Auth Setup (Authentication)
For local development, you can modify the authentication or use a different provider. The current setup uses Replit's OpenID Connect.

## Step 4: VS Code Extensions (Recommended)

Install these VS Code extensions for better development experience:

1. **ES7+ React/Redux/React-Native snippets** - `dsznajder.es7-react-js-snippets`
2. **Auto Rename Tag** - `formulahendry.auto-rename-tag`
3. **Bracket Pair Colorizer** - `coenraads.bracket-pair-colorizer`
4. **GitLens** - `eamodio.gitlens`
5. **Prettier** - `esbenp.prettier-vscode`
6. **ESLint** - `dbaeumer.vscode-eslint`
7. **Thunder Client** - `rangav.vscode-thunder-client` (for API testing)
8. **PostgreSQL** - `ms-ossdata.vscode-postgresql`

## Step 5: Running the Application

### 5.1 Start Development Server
In the VS Code terminal, run:
```bash
npm run dev
```

This will start both the frontend (Vite) and backend (Express) servers.

### 5.2 Access the Application
- **Frontend**: http://localhost:5000
- **Backend API**: http://localhost:5000/api

## Step 6: Development Workflow

### 6.1 Project Structure
```
patisa-transit/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/         # Application pages
│   │   ├── hooks/         # Custom React hooks
│   │   └── lib/           # Utility functions
├── server/                # Backend Express server
│   ├── routes.ts          # API routes
│   ├── storage.ts         # Database operations
│   ├── db.ts             # Database connection
│   └── notifications.ts   # SMS notification service
├── shared/               # Shared types and schemas
│   └── schema.ts         # Database schema and types
└── package.json          # Dependencies and scripts
```

### 6.2 Available Scripts
```bash
npm run dev        # Start development server
npm run build      # Build for production
npm run db:push    # Push database schema changes
npm run db:studio  # Open database management interface
```

### 6.3 Making Changes
- **Frontend changes**: Files in `client/src/` will hot reload automatically
- **Backend changes**: Server will restart automatically when you save files
- **Database changes**: Modify `shared/schema.ts` and run `npm run db:push`

## Step 7: Testing Features

### 7.1 User Authentication
1. Click "Get Started" or "Sign In" button
2. You'll be redirected to authentication flow

### 7.2 Parcel Booking
1. Sign in to access the dashboard
2. Fill out the parcel booking form
3. Select pickup and delivery locations
4. Choose transport options
5. Complete payment process

### 7.3 Real-time Tracking
1. Use the tracking page with format: PT-2024-XXXXXX
2. View parcel status and location updates

### 7.4 Admin Features
1. Access admin panel from the dashboard
2. Update parcel statuses
3. Manage transport schedules
4. Send test notifications

## Step 8: Debugging and Troubleshooting

### 8.1 Common Issues

**Database Connection Issues:**
- Verify PostgreSQL is running
- Check DATABASE_URL format
- Ensure database exists

**Port Already in Use:**
```bash
# Kill process on port 5000
npx kill-port 5000
```

**Dependencies Issues:**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

### 8.2 VS Code Debugging
1. Set breakpoints in your code
2. Use VS Code's built-in debugger
3. Check the Debug Console for errors

### 8.3 Database Inspection
Use the included database studio:
```bash
npm run db:studio
```

## Step 9: Production Deployment

### 9.1 Build for Production
```bash
npm run build
```

### 9.2 Environment Variables for Production
Ensure all environment variables are set in your production environment, especially:
- Use production Stripe keys (starts with `pk_live_` and `sk_live_`)
- Set secure SESSION_SECRET
- Use production database URL

## Features Overview

PATISA Transit includes:

- **User Authentication**: Secure sign-in system
- **Parcel Booking**: Complete booking flow with cost estimation
- **Payment Processing**: Stripe integration for secure payments
- **Real-time Tracking**: Live parcel status updates
- **SMS Notifications**: Automated recipient alerts via Twilio
- **Admin Panel**: Management interface for operations
- **Transport Scheduling**: Integration with South Africa's transport network
- **Responsive Design**: Works on desktop and mobile devices

## Support

If you encounter any issues:
1. Check the browser console for errors
2. Review server logs in the terminal
3. Verify all environment variables are set correctly
4. Ensure external services (Stripe, Twilio) are configured properly

The application leverages South Africa's existing taxi and bus transport infrastructure to provide rapid parcel delivery, reducing typical 3-5 day delivery times to just hours.