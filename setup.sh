#!/bin/bash

# PATISA Transit - Local Development Setup Script
# This script automates the initial setup process for local development

echo "🚀 Setting up PATISA Transit for local development..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ from https://nodejs.org/"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18 or higher is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v) detected"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo "✅ Dependencies installed successfully"

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    echo "📄 Creating .env file from template..."
    cp .env.example .env
    echo "✅ .env file created. Please update it with your actual values."
    echo ""
    echo "🔧 Required environment variables to configure:"
    echo "   - DATABASE_URL (PostgreSQL connection string)"
    echo "   - SESSION_SECRET (random secure string)"
    echo "   - STRIPE_SECRET_KEY and VITE_STRIPE_PUBLIC_KEY (from Stripe dashboard)"
    echo "   - TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER (from Twilio)"
    echo ""
else
    echo "✅ .env file already exists"
fi

# Check if PostgreSQL is running (optional)
if command -v psql &> /dev/null; then
    echo "✅ PostgreSQL client detected"
else
    echo "⚠️  PostgreSQL client not found. You may need to install PostgreSQL or use a cloud database."
fi

echo ""
echo "🎉 Setup complete! Next steps:"
echo ""
echo "1. Update your .env file with actual values"
echo "2. Ensure your PostgreSQL database is running"
echo "3. Run 'npm run db:push' to initialize the database schema"
echo "4. Run 'npm run dev' to start the development server"
echo ""
echo "📚 For detailed setup instructions, see README.md"
echo "🚀 Access the application at http://localhost:5000"