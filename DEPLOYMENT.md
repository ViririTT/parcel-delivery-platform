# PATISA Transit - Deployment Guide

This guide covers deploying PATISA Transit to various hosting platforms.

## Environment Variables Required

Ensure these environment variables are set in your production environment:

```env
# Database
DATABASE_URL=postgresql://user:password@host:port/database

# Session Security
SESSION_SECRET=your-secure-random-string-min-32-characters

# Stripe (Payment Processing)
STRIPE_SECRET_KEY=sk_live_your_production_stripe_secret_key
VITE_STRIPE_PUBLIC_KEY=pk_live_your_production_stripe_public_key

# Twilio (SMS Notifications)
TWILIO_ACCOUNT_SID=your_production_twilio_account_sid
TWILIO_AUTH_TOKEN=your_production_twilio_auth_token
TWILIO_PHONE_NUMBER=your_verified_twilio_phone_number

# Authentication
REPL_ID=your-production-repl-id
ISSUER_URL=https://replit.com/oidc
REPLIT_DOMAINS=yourdomain.com,www.yourdomain.com
```

## Deployment Options

### 1. Vercel Deployment

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Login to Vercel:
```bash
vercel login
```

3. Deploy:
```bash
vercel --prod
```

4. Set environment variables in Vercel dashboard

### 2. Railway Deployment

1. Install Railway CLI:
```bash
npm i -g @railway/cli
```

2. Login and deploy:
```bash
railway login
railway init
railway up
```

3. Add environment variables via Railway dashboard

### 3. Render Deployment

1. Connect your GitHub repository to Render
2. Create a new Web Service
3. Set build command: `npm run build`
4. Set start command: `npm start`
5. Add environment variables in Render dashboard

### 4. Docker Deployment

Create `Dockerfile`:
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 5000

CMD ["npm", "start"]
```

Build and run:
```bash
docker build -t patisa-transit .
docker run -p 5000:5000 --env-file .env patisa-transit
```

## Database Setup for Production

### PostgreSQL on Neon
1. Visit https://neon.tech
2. Create new project
3. Copy connection string to DATABASE_URL

### PostgreSQL on Supabase
1. Visit https://supabase.com
2. Create new project
3. Go to Settings > Database
4. Copy connection string to DATABASE_URL

### PostgreSQL on Railway
1. Create PostgreSQL service on Railway
2. Copy DATABASE_URL from service variables

## Production Checklist

- [ ] Set all environment variables
- [ ] Use production Stripe keys
- [ ] Configure production database
- [ ] Set secure SESSION_SECRET
- [ ] Update REPLIT_DOMAINS for your domain
- [ ] Test payment flow
- [ ] Test SMS notifications
- [ ] Verify SSL certificate
- [ ] Set up monitoring and logging
- [ ] Configure backup strategy

## Security Considerations

1. **Environment Variables**: Never commit `.env` files
2. **HTTPS**: Ensure SSL/TLS is enabled
3. **Database**: Use connection pooling for production
4. **Sessions**: Use secure session storage
5. **Rate Limiting**: Implement API rate limiting
6. **CORS**: Configure appropriate CORS settings

## Monitoring and Maintenance

1. **Health Checks**: Implement health check endpoints
2. **Logging**: Set up centralized logging
3. **Error Tracking**: Use services like Sentry
4. **Performance**: Monitor response times and database performance
5. **Backups**: Regular database backups
6. **Updates**: Keep dependencies updated