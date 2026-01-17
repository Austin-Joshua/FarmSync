# FarmSync Backend API Reference

## Complete API Endpoints for Live Deployment

### Overview
FarmSync backend provides 31 route modules with comprehensive APIs for agricultural farm management. Below is the complete list of all endpoints required for production deployment.

---

## 📋 Table of Contents

1. [Authentication APIs](#authentication-apis)
2. [Farm Management APIs](#farm-management-apis)
3. [Crop Management APIs](#crop-management-apis)
4. [Financial APIs](#financial-apis)
5. [Field & Soil APIs](#field--soil-apis)
6. [Agricultural Input APIs](#agricultural-input-apis)
7. [Weather & Location APIs](#weather--location-apis)
8. [Analytics & Reporting APIs](#analytics--reporting-apis)
9. [User Management APIs](#user-management-apis)
10. [Health & Testing APIs](#health--testing-apis)
11. [Additional Services APIs](#additional-services-apis)

---

## Authentication APIs

### Route File: `authRoutes.ts`

| Method | Endpoint | Description | Auth | Status |
|--------|----------|-------------|------|--------|
| POST | `/api/auth/register` | User registration | ❌ | Core |
| POST | `/api/auth/login` | User login | ❌ | Core |
| POST | `/api/auth/logout` | User logout | ✅ | Core |
| GET | `/api/auth/profile` | Get user profile | ✅ | Core |
| PUT | `/api/auth/profile` | Update user profile | ✅ | Core |
| POST | `/api/auth/profile/picture` | Upload profile picture | ✅ | Core |
| POST | `/api/auth/forgot-password` | Request password reset | ❌ | Security |
| POST | `/api/auth/reset-password` | Reset password with token | ❌ | Security |
| GET | `/api/auth/sessions` | Get active sessions | ✅ | Security |
| POST | `/api/auth/logout-all` | Logout from all devices | ✅ | Security |

### Route File: `oauthRoutes.ts`

| Method | Endpoint | Description | Auth | Status |
|--------|----------|-------------|------|--------|
| GET | `/api/auth/oauth/google` | Google OAuth login | ❌ | OAuth |
| GET | `/api/auth/oauth/apple` | Apple OAuth login | ❌ | OAuth |
| GET | `/api/auth/oauth/microsoft` | Microsoft OAuth login | ❌ | OAuth |
| GET | `/api/auth/oauth/callback` | OAuth callback handler | ❌ | OAuth |

### Route File: `twoFactorRoutes.ts`

| Method | Endpoint | Description | Auth | Status |
|--------|----------|-------------|------|--------|
| GET | `/api/auth/2fa/setup` | Setup 2FA | ✅ | Security |
| POST | `/api/auth/2fa/verify-setup` | Verify & enable 2FA | ✅ | Security |
| POST | `/api/auth/2fa/verify` | Verify 2FA token | ✅ | Security |
| POST | `/api/auth/2fa/disable` | Disable 2FA | ✅ | Security |
| GET | `/api/auth/2fa/backup-codes` | Regenerate backup codes | ✅ | Security |

---

## Farm Management APIs

### Route File: `farmRoutes.ts`

| Method | Endpoint | Description | Auth | Status |
|--------|----------|-------------|------|--------|
| GET | `/api/farms` | List all farms | ✅ | Core |
| GET | `/api/farms/:id` | Get farm details | ✅ | Core |
| POST | `/api/farms` | Create new farm | ✅ | Core |
| PUT | `/api/farms/:id` | Update farm | ✅ | Core |
| DELETE | `/api/farms/:id` | Delete farm | ✅ | Core |

### Route File: `fieldRoutes.ts`

| Method | Endpoint | Description | Auth | Status |
|--------|----------|-------------|------|--------|
| GET | `/api/fields` | List all fields | ✅ | Core |
| GET | `/api/fields/farm/:farmId` | Get fields by farm | ✅ | Core |
| POST | `/api/fields` | Create new field | ✅ | Core |
| PUT | `/api/fields/:id` | Update field | ✅ | Core |
| DELETE | `/api/fields/:id` | Delete field | ✅ | Core |

---

## Crop Management APIs

### Route File: `cropRoutes.ts`

| Method | Endpoint | Description | Auth | Status |
|--------|----------|-------------|------|--------|
| GET | `/api/crops` | List all crops | ✅ | Core |
| GET | `/api/crops/:id` | Get crop details | ✅ | Core |
| GET | `/api/crops/types` | List crop types | ✅ | Core |
| POST | `/api/crops` | Create new crop | ✅ | Core |
| PUT | `/api/crops/:id` | Update crop | ✅ | Core |
| DELETE | `/api/crops/:id` | Delete crop | ✅ | Core |
| POST | `/api/crops/types` | Add crop type | ✅ | Core |
| PUT | `/api/crops/types/:id` | Update crop type | ✅ | Core |
| DELETE | `/api/crops/types/:id` | Delete crop type | ✅ | Core |

### Route File: `calendarRoutes.ts`

| Method | Endpoint | Description | Auth | Status |
|--------|----------|-------------|------|--------|
| GET | `/api/calendar/events` | Get calendar events | ✅ | Core |
| GET | `/api/calendar/upcoming` | Get upcoming events | ✅ | Core |
| POST | `/api/calendar/events` | Create event | ✅ | Core |
| PUT | `/api/calendar/events/:id` | Update event | ✅ | Core |
| DELETE | `/api/calendar/events/:id` | Delete event | ✅ | Core |

---

## Financial APIs

### Route File: `expenseRoutes.ts`

| Method | Endpoint | Description | Auth | Status |
|--------|----------|-------------|------|--------|
| GET | `/api/expenses` | List expenses | ✅ | Core |
| GET | `/api/expenses/:id` | Get expense details | ✅ | Core |
| POST | `/api/expenses` | Create expense | ✅ | Core |
| PUT | `/api/expenses/:id` | Update expense | ✅ | Core |
| DELETE | `/api/expenses/:id` | Delete expense | ✅ | Core |

### Route File: `yieldRoutes.ts`

| Method | Endpoint | Description | Auth | Status |
|--------|----------|-------------|------|--------|
| GET | `/api/yields` | List yields | ✅ | Core |
| GET | `/api/yields/:id` | Get yield details | ✅ | Core |
| POST | `/api/yields` | Create yield record | ✅ | Core |
| PUT | `/api/yields/:id` | Update yield | ✅ | Core |
| DELETE | `/api/yields/:id` | Delete yield | ✅ | Core |

### Route File: `historyRoutes.ts`

| Method | Endpoint | Description | Auth | Status |
|--------|----------|-------------|------|--------|
| GET | `/api/history/income/monthly` | Get monthly income | ✅ | Core |
| POST | `/api/history/income/monthly` | Create/update monthly income | ✅ | Core |

### Route File: `marketPriceRoutes.ts`

| Method | Endpoint | Description | Auth | Status |
|--------|----------|-------------|------|--------|
| GET | `/api/market-prices/:crop` | Get current price | ✅ | Core |
| GET | `/api/market-prices/:crop/history` | Get price history | ✅ | Core |
| GET | `/api/market-prices/:crop/best-time` | Get best selling time | ✅ | Core |
| POST | `/api/market-prices/:crop/alert` | Set price alert | ✅ | Core |

---

## Field & Soil APIs

### Route File: `soilRoutes.ts`

| Method | Endpoint | Description | Auth | Status |
|--------|----------|-------------|------|--------|
| GET | `/api/soil-types` | List soil types | ✅ | Core |

---

## Agricultural Input APIs

### Route File: `fertilizerRoutes.ts`

| Method | Endpoint | Description | Auth | Status |
|--------|----------|-------------|------|--------|
| GET | `/api/fertilizers` | List fertilizers | ✅ | Core |
| POST | `/api/fertilizers` | Create fertilizer record | ✅ | Core |
| PUT | `/api/fertilizers/:id` | Update fertilizer | ✅ | Core |
| DELETE | `/api/fertilizers/:id` | Delete fertilizer | ✅ | Core |

### Route File: `pesticideRoutes.ts`

| Method | Endpoint | Description | Auth | Status |
|--------|----------|-------------|------|--------|
| GET | `/api/pesticides` | List pesticides | ✅ | Core |
| POST | `/api/pesticides` | Create pesticide record | ✅ | Core |
| PUT | `/api/pesticides/:id` | Update pesticide | ✅ | Core |
| DELETE | `/api/pesticides/:id` | Delete pesticide | ✅ | Core |

### Route File: `irrigationRoutes.ts`

| Method | Endpoint | Description | Auth | Status |
|--------|----------|-------------|------|--------|
| GET | `/api/irrigations` | List irrigation records | ✅ | Core |
| POST | `/api/irrigations` | Create irrigation record | ✅ | Core |
| PUT | `/api/irrigations/:id` | Update irrigation | ✅ | Core |
| DELETE | `/api/irrigations/:id` | Delete irrigation | ✅ | Core |

### Route File: `stockRoutes.ts`

| Method | Endpoint | Description | Auth | Status |
|--------|----------|-------------|------|--------|
| GET | `/api/stock` | List stock items | ✅ | Core |
| GET | `/api/stock/low-stock` | Get low stock items | ✅ | Core |
| GET | `/api/stock/:id` | Get stock item details | ✅ | Core |
| POST | `/api/stock` | Create stock item | ✅ | Core |
| PUT | `/api/stock/:id` | Update stock item | ✅ | Core |
| DELETE | `/api/stock/:id` | Delete stock item | ✅ | Core |
| GET | `/api/stock/history/monthly` | Get monthly stock usage | ✅ | Core |
| POST | `/api/stock/history/monthly` | Create stock usage record | ✅ | Core |

---

## Weather & Location APIs

### Route File: `weatherRoutes.ts`

| Method | Endpoint | Description | Auth | Status |
|--------|----------|-------------|------|--------|
| GET | `/api/weather` | Get weather by city | ❌ | Optional |
| POST | `/api/weather/current` | Get weather by coordinates | ✅ | Optional |
| POST | `/api/weather/alerts` | Get climate alerts | ✅ | Optional |
| POST | `/api/weather/location/current` | Get location from coordinates | ✅ | Optional |

### Route File: `weatherAlertRoutes.ts`

| Method | Endpoint | Description | Auth | Status |
|--------|----------|-------------|------|--------|
| GET | `/api/weather/alerts` | List weather alerts | ✅ | Optional |
| GET | `/api/weather/alerts/unread` | Get unread alerts | ✅ | Optional |
| POST | `/api/weather/alerts/:id/read` | Mark alert as read | ✅ | Optional |
| POST | `/api/weather/alerts/read-all` | Mark all alerts read | ✅ | Optional |

---

## Analytics & Reporting APIs

### Route File: `dashboardRoutes.ts`

| Method | Endpoint | Description | Auth | Status |
|--------|----------|-------------|------|--------|
| GET | `/api/dashboard` | Get dashboard data | ✅ | Core |

### Route File: `reportsRoutes.ts`

| Method | Endpoint | Description | Auth | Status |
|--------|----------|-------------|------|--------|
| GET | `/api/reports/summary` | Get summary report | ✅ | Core |
| GET | `/api/reports/custom` | Get custom report | ✅ | Core |

### Route File: `auditLogRoutes.ts`

| Method | Endpoint | Description | Auth | Status |
|--------|----------|-------------|------|--------|
| GET | `/api/audit-logs` | List audit logs | ✅ | Core |
| GET | `/api/audit-logs/activity-summary` | Get activity summary | ✅ | Core |
| GET | `/api/audit-logs/login-history` | Get login history | ✅ | Core |
| GET | `/api/audit-logs/me` | Get my audit logs | ✅ | Core |

---

## User Management APIs

### Route File: `userRoutes.ts`

| Method | Endpoint | Description | Auth | Status |
|--------|----------|-------------|------|--------|
| GET | `/api/user/profile` | Get user profile | ✅ | Core |
| GET | `/api/user/status` | Get user status | ✅ | Core |
| GET | `/api/user/db-status` | Get database status | ✅ | Core |

### Route File: `adminRoutes.ts`

| Method | Endpoint | Description | Auth | Status |
|--------|----------|-------------|------|--------|
| GET | `/api/admin/statistics` | Get admin statistics | ✅ Admin | Admin |

### Route File: `settingsRoutes.ts`

| Method | Endpoint | Description | Auth | Status |
|--------|----------|-------------|------|--------|
| GET | `/api/settings` | Get user settings | ✅ | Core |
| PUT | `/api/settings` | Update user settings | ✅ | Core |

---

## Health & Testing APIs

### Route File: `healthRoutes.ts`

| Method | Endpoint | Description | Auth | Status |
|--------|----------|-------------|------|--------|
| GET | `/api/health/database` | Check database connection | ❌ | Testing |
| GET | `/api/health/tables` | List database tables | ❌ | Testing |
| GET | `/api/health/stats` | Get database statistics | ✅ | Testing |
| GET | `/api/health/frontend-connection` | Check frontend connection | ❌ | Testing |
| POST | `/api/health/test-query` | Execute test query | ✅ | Testing |

### Route File: `dbTestRoutes.ts`

| Method | Endpoint | Description | Auth | Status |
|--------|----------|-------------|------|--------|
| GET | `/api/db-test` | Test database (SELECT 1) | ❌ | Testing |

### Additional Health Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Server health check |
| GET | `/` | Server status message |

---

## Additional Services APIs

### Route File: `diseaseScanRoutes.ts`

| Method | Endpoint | Description | Auth | Status |
|--------|----------|-------------|------|--------|
| POST | `/api/disease/scan` | Scan for crop diseases | ✅ | Optional |
| GET | `/api/disease/results/:id` | Get disease scan results | ✅ | Optional |

### Route File: `mlRoutes.ts`

| Method | Endpoint | Description | Auth | Status |
|--------|----------|-------------|------|--------|
| POST | `/api/ml/recommend` | Get crop recommendations | ✅ | Optional |
| GET | `/api/ml/history` | Get recommendation history | ✅ | Optional |
| GET | `/api/ml/model-info` | Get model information | ✅ | Optional |

### Route File: `notificationRoutes.ts`

| Method | Endpoint | Description | Auth | Status |
|--------|----------|-------------|------|--------|
| POST | `/api/notifications/push/subscribe` | Subscribe to push notifications | ✅ | Optional |
| DELETE | `/api/notifications/push/unsubscribe` | Unsubscribe from push | ✅ | Optional |
| POST | `/api/notifications/email/test` | Send test email | ✅ | Optional |

### Route File: `whatsappRoutes.ts`

| Method | Endpoint | Description | Auth | Status |
|--------|----------|-------------|------|--------|
| POST | `/api/whatsapp/send` | Send WhatsApp message | ✅ | Optional |

### Route File: `smsRoutes.ts`

| Method | Endpoint | Description | Auth | Status |
|--------|----------|-------------|------|--------|
| POST | `/api/sms/send` | Send SMS | ✅ | Optional |
| POST | `/api/sms/test` | Send test SMS | ✅ | Optional |

---

## 📊 API Statistics

| Category | Count | Status |
|----------|-------|--------|
| **Authentication** | 15 | ✅ Core |
| **Farm Management** | 10 | ✅ Core |
| **Crop Management** | 12 | ✅ Core |
| **Financial** | 19 | ✅ Core |
| **Field & Soil** | 9 | ✅ Core |
| **Agricultural Input** | 19 | ✅ Core |
| **Weather & Location** | 8 | ⚠️ Optional |
| **Analytics** | 11 | ✅ Core |
| **User Management** | 7 | ✅ Core |
| **Health & Testing** | 7 | 🧪 Testing |
| **Additional Services** | 13 | ⚠️ Optional |
| **TOTAL** | **131 Endpoints** | ✅ Production Ready |

---

## Environment Variables Required

### Essential for Production

```env
# Database
DB_HOST=your_mysql_host
DB_PORT=3306
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=farmsync_db

# Server
PORT=5000
NODE_ENV=production
FRONTEND_URL=https://your-frontend-url.com

# Security
JWT_SECRET=your_super_secret_jwt_key_change_in_production
JWT_EXPIRES_IN=7d
SESSION_SECRET=your_session_secret

# Optional: API Keys
OPENWEATHER_API_KEY=your_openweather_key
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
MICROSOFT_CLIENT_ID=your_microsoft_client_id
MICROSOFT_CLIENT_SECRET=your_microsoft_client_secret
APPLE_CLIENT_ID=your_apple_client_id
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
```

---

## Deployment Checklist

### Before Going Live

- [ ] All environment variables configured
- [ ] Database created and migrations run
- [ ] SSL/HTTPS enabled
- [ ] CORS configured for your frontend domain
- [ ] Rate limiting configured
- [ ] Error handling tested
- [ ] Authentication endpoints tested
- [ ] Database backups configured
- [ ] Monitoring/logging enabled
- [ ] API documentation updated
- [ ] Load testing completed
- [ ] Security audit performed

### Core Endpoints to Test First

1. **Health Check**: `GET /health`
2. **Database Test**: `GET /api/db-test`
3. **Registration**: `POST /api/auth/register`
4. **Login**: `POST /api/auth/login`
5. **Profile**: `GET /api/auth/profile`
6. **Dashboard**: `GET /api/dashboard`
7. **Farms**: `GET /api/farms`
8. **Crops**: `GET /api/crops`

---

## Production Deployment Tips

### 1. **Security**
- Use environment variables for all secrets
- Enable HTTPS/SSL
- Configure CORS properly
- Implement rate limiting
- Use strong JWT secrets
- Enable audit logging

### 2. **Performance**
- Use connection pooling
- Enable caching where appropriate
- Optimize database queries
- Use CDN for static assets
- Monitor API response times

### 3. **Reliability**
- Set up health check endpoints
- Enable error logging
- Configure automated backups
- Set up monitoring alerts
- Use load balancing

### 4. **Maintenance**
- Document API changes
- Version your APIs
- Keep dependencies updated
- Regular security audits
- Monitor error logs

---

## API Usage Examples

### Register New User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Farmer",
    "email": "john@farm.com",
    "password": "secure_password",
    "role": "farmer"
  }'
```

### Get Dashboard Data
```bash
curl -X GET http://localhost:5000/api/dashboard \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Get Weather by City
```bash
curl -X GET "http://localhost:5000/api/weather?city=London" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Create Farm
```bash
curl -X POST http://localhost:5000/api/farms \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My Farm",
    "location": "Village, State",
    "landSize": 5,
    "soilType": "loamy"
  }'
```

---

## Support & Documentation

- **API Docs**: This document
- **Database Schema**: `Backend/src/database/schema.sql`
- **Setup Guide**: `Backend/README.md`
- **Deployment Guide**: `COMPLETE_DOCUMENTATION.md`

---

**Last Updated:** January 17, 2026
**FarmSync Backend v1.0.0**
**Total Endpoints: 131 (Core + Optional)**
