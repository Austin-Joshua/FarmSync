# FarmSync Deployment & Hosting Guide

## Table of Contents
1. [Traditional Server Hosting](#traditional-server-hosting)
2. [Serverless Deployment](#serverless-deployment)
3. [Mobile App Conversion](#mobile-app-conversion)
4. [PWA (Progressive Web App)](#pwa-progressive-web-app)
5. [Production Checklist](#production-checklist)

---

## Traditional Server Hosting

### Option 1: AWS (Recommended for India)

#### Step 1: Set up EC2 Instance
```bash
# 1. Go to AWS Console → EC2 → Launch Instance
# 2. Select Ubuntu 22.04 LTS
# 3. Instance type: t3.small or t3.medium
# 4. Storage: 20GB SSD
# 5. Security Group: Allow HTTP (80), HTTPS (443), SSH (22)
# 6. Create key pair, save locally

# Connect to instance
ssh -i your-key.pem ubuntu@your-ec2-ip
```

#### Step 2: Install Dependencies
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PostgreSQL (or MySQL)
sudo apt install -y postgresql postgresql-contrib
# OR
sudo apt install -y mysql-server

# Install Nginx
sudo apt install -y nginx

# Install PM2 (process manager)
sudo npm install -g pm2

# Install SSL certificate tool
sudo apt install -y certbot python3-certbot-nginx
```

#### Step 3: Deploy Backend
```bash
# Clone repository
cd /var/www
sudo git clone https://github.com/yourusername/FarmSync.git
cd FarmSync/Backend

# Install dependencies
npm install

# Create .env file
sudo nano .env
# Add all environment variables

# Build TypeScript
npm run build

# Start with PM2
pm2 start dist/server.js --name "farmsync-backend"
pm2 save
pm2 startup

# Create Nginx reverse proxy
sudo nano /etc/nginx/sites-available/default
```

**Nginx Configuration:**
```nginx
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

#### Step 4: Deploy Frontend
```bash
# Navigate to frontend
cd ../Frontend

# Install dependencies
npm install

# Build production
npm run build

# Serve with Nginx
sudo mkdir -p /var/www/farmsync-web
sudo cp -r dist/* /var/www/farmsync-web/

# Configure Nginx for frontend
sudo nano /etc/nginx/sites-available/farmsync-web
```

**Frontend Nginx Configuration:**
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    root /var/www/farmsync-web;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:5000;
        proxy_set_header Host $host;
    }
}
```

#### Step 5: Enable HTTPS
```bash
# Get SSL certificate
sudo certbot certonly --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renew certificate
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer

# Restart Nginx
sudo systemctl restart nginx
```

---

### Option 2: DigitalOcean (Easier, Cheaper)

#### Step 1: Create Droplet
- Go to [DigitalOcean.com](https://digitalocean.com)
- Create Droplet → Ubuntu 22.04 → $5/month plan
- Add SSH key
- Enable backups

#### Step 2: One-Click Setup
```bash
# SSH into droplet
ssh root@your-droplet-ip

# Follow same installation as AWS above
```

#### Step 3: Use App Platform (Optional, Easier)
```
1. Go to App Platform
2. Connect GitHub repository
3. Configure:
   - Backend: Node.js 18, main branch, src/server.ts
   - Frontend: Build command: npm run build, dist folder
4. Add environment variables
5. Deploy!
```

---

### Option 3: Heroku (Free Tier Removed, Paid-only)

Alternative: Railway.app (similar to Heroku, free tier available)

#### Deploy to Railway
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Initialize project
railway init

# Add backend service
railway link

# Deploy
railway up
```

---

## Serverless Deployment

### Vercel (Frontend Only)

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy frontend
cd Frontend
vercel

# Configure environment variables in Vercel dashboard
```

### AWS Lambda (Full Stack)

#### Deploy Backend to Lambda
```bash
# Install Serverless Framework
npm install -g serverless

# Create serverless.yml
serverless deploy

# API Gateway endpoint will be created automatically
```

---

## Mobile App Conversion

### Option 1: React Native (Best Performance)

#### Setup
```bash
# Install Expo CLI
npm install -g expo-cli

# Create React Native project
npx create-expo-app FarmSyncMobile

# Navigate to project
cd FarmSyncMobile
```

#### Convert Web Components to React Native
```typescript
// Example conversion
// Web: <button onClick={handleClick}>Click</button>
// Native: <TouchableOpacity onPress={handleClick}><Text>Click</Text></TouchableOpacity>
```

#### Build APK (Android)
```bash
# Build APK
expo build:android -t apk

# Or use EAS Build (recommended)
npm install -g eas-cli
eas build --platform android --local

# APK will be generated in build folder
```

#### Build IPA (iOS)
```bash
# Only on macOS
eas build --platform ios

# Or use Apple's TestFlight for distribution
```

#### Submit to Stores
- **Google Play Store**: Upload APK, fill store listing
- **Apple App Store**: Use Xcode/Transporter, requires Apple Developer account ($99/year)

---

### Option 2: Flutter (Cross-Platform, Faster)

```bash
# Install Flutter
# Download from flutter.dev

# Create Flutter project
flutter create farmsync_mobile

# Convert React UI to Flutter
# Note: Requires rewriting in Dart

# Build APK
flutter build apk --release

# Build IPA
flutter build ios --release
```

---

### Option 3: Ionic/Capacitor (Use Existing React Code)

**Recommended for fastest conversion**

#### Setup
```bash
# Install Ionic CLI
npm install -g @ionic/cli

# Add Capacitor to existing React project
npm install @capacitor/core @capacitor/cli
npx cap init

# Install mobile plugins
npm install @capacitor/camera @capacitor/geolocation @capacitor/local-notifications

# Build React app
npm run build

# Add platforms
npx cap add android
npx cap add ios
```

#### Build Android APK
```bash
# Copy web build
npx cap copy

# Build APK using Android Studio or CLI
npx cap open android
# Then: Build → Generate Signed Bundle/APK
```

#### Build iOS IPA
```bash
npx cap open ios
# Then use Xcode to build and archive
# Or: Product → Archive → Distribute App
```

---

## PWA (Progressive Web App)

### Convert Web App to PWA

#### Step 1: Create Manifest File
`public/manifest.json`:
```json
{
  "name": "FarmSync - Smart Farming",
  "short_name": "FarmSync",
  "description": "AI-powered farming assistant",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/icon-512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ],
  "start_url": "/",
  "display": "standalone",
  "scope": "/",
  "theme_color": "#4CAF50",
  "background_color": "#ffffff",
  "screenshots": [
    {
      "src": "/screenshot1.png",
      "sizes": "540x720",
      "form_factor": "narrow"
    },
    {
      "src": "/screenshot2.png",
      "sizes": "1280x720",
      "form_factor": "wide"
    }
  ]
}
```

#### Step 2: Link Manifest in HTML
```html
<!-- index.html -->
<link rel="manifest" href="/manifest.json">
<meta name="theme-color" content="#4CAF50">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black">
```

#### Step 3: Create Service Worker
`public/sw.js`:
```javascript
const CACHE_NAME = 'farmsync-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/css/main.css',
  '/js/main.js',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => response || fetch(event.request))
      .catch(() => new Response('Offline'))
  );
});
```

#### Step 4: Register Service Worker
```typescript
// In your main React component or App.tsx
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js');
}
```

#### Step 5: Test PWA
```bash
# Build and serve
npm run build
npm install -g serve
serve -s dist

# Open in Chrome DevTools → Application → Manifest
# Should show green checkmarks
```

---

## Production Checklist

### Security
- [ ] All API keys in environment variables (never commit)
- [ ] HTTPS enabled on all domains
- [ ] CORS properly configured
- [ ] Rate limiting enabled
- [ ] SQL injection protection (using parameterized queries)
- [ ] XSS protection headers set
- [ ] CSRF tokens on forms
- [ ] Regular security audits
- [ ] Database backups automated

### Performance
- [ ] Frontend minified and compressed
- [ ] CDN enabled (CloudFlare or AWS CloudFront)
- [ ] Database indexes created
- [ ] Caching headers set (Cache-Control)
- [ ] API response times < 200ms
- [ ] Image optimization
- [ ] Lazy loading enabled
- [ ] Tree-shaking enabled in build

### Monitoring
- [ ] Error tracking (Sentry)
- [ ] Analytics tracking (GA or Mixpanel)
- [ ] Uptime monitoring (UptimeRobot)
- [ ] Performance monitoring (New Relic)
- [ ] Log aggregation (CloudWatch or ELK)

### Database
- [ ] Production database backup schedule
- [ ] Automated backups (daily)
- [ ] Database password strong
- [ ] Read replicas for scaling
- [ ] Connection pooling configured

### Mobile App
- [ ] Android signed APK
- [ ] iOS IPA built
- [ ] Privacy policy written
- [ ] Terms & conditions written
- [ ] Splash screens added
- [ ] App icons all sizes

---

## Cost Estimation (Monthly)

| Component | Service | Cost |
|-----------|---------|------|
| Backend Server | AWS EC2 t3.small | $9 |
| Frontend Hosting | AWS S3 + CloudFront | $2 |
| Database | AWS RDS t3.micro | $15 |
| Domain | Route53 | $0.50 |
| SSL Certificate | AWS ACM | Free |
| SMS (1000/month) | Twilio | $1 |
| WhatsApp | Meta | $1 |
| **Total** | | **~$28/month** |

---

## Scale-up Plan (When Ready)

### If 10,000+ users
- [ ] Switch to managed database (AWS RDS)
- [ ] Add Redis for caching
- [ ] Use load balancer (AWS ALB)
- [ ] Add monitoring (CloudWatch)
- [ ] Set up CI/CD pipeline

### If 100,000+ users
- [ ] Use microservices
- [ ] Add message queue (SQS/Kafka)
- [ ] Implement caching layers
- [ ] CDN for all static assets
- [ ] Database sharding

---

## Next Steps

1. **Choose hosting**: AWS (recommended), DigitalOcean, or Railway
2. **Set up domain**: Namecheap, GoDaddy, or Route53
3. **Deploy backend**: Follow EC2 or App Platform steps above
4. **Deploy frontend**: Use Vercel or Nginx
5. **Test everything**: Run full test suite
6. **Enable monitoring**: Set up error tracking and analytics
7. **Plan for scale**: Implement monitoring and auto-scaling

For questions or help, check AWS documentation or DigitalOcean community guides!
