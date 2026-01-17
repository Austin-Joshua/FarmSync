// Load environment variables FIRST, before any other imports
import dotenv from 'dotenv';
dotenv.config();

import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'path';
import passport from 'passport';
import session from 'express-session';
import { config } from './config/env';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import logger from './utils/logger';
import { initializeOAuth } from './services/oauthService';

// Import routes
import authRoutes from './routes/authRoutes';
import oauthRoutes from './routes/oauthRoutes';
import dashboardRoutes from './routes/dashboardRoutes';
import farmRoutes from './routes/farmRoutes';
import cropRoutes from './routes/cropRoutes';
import expenseRoutes from './routes/expenseRoutes';
import yieldRoutes from './routes/yieldRoutes';
import stockRoutes from './routes/stockRoutes';
import historyRoutes from './routes/historyRoutes';
import settingsRoutes from './routes/settingsRoutes';
import soilRoutes from './routes/soilRoutes';
import fertilizerRoutes from './routes/fertilizerRoutes';
import pesticideRoutes from './routes/pesticideRoutes';
import irrigationRoutes from './routes/irrigationRoutes';
import mlRoutes from './routes/mlRoutes';
import weatherRoutes from './routes/weatherRoutes';
import diseaseScanRoutes from './routes/diseaseScanRoutes';
import auditLogRoutes from './routes/auditLogRoutes';
import notificationRoutes from './routes/notificationRoutes';
import adminRoutes from './routes/adminRoutes';
import userRoutes from './routes/userRoutes';
import calendarRoutes from './routes/calendarRoutes';
import weatherAlertRoutes from './routes/weatherAlertRoutes';
import reportsRoutes from './routes/reportsRoutes';
import twoFactorRoutes from './routes/twoFactorRoutes';
import whatsappRoutes from './routes/whatsappRoutes';
import smsRoutes from './routes/smsRoutes';
import marketPriceRoutes from './routes/marketPriceRoutes';
import fieldRoutes from './routes/fieldRoutes';
import healthRoutes from './routes/healthRoutes';
import dbTestRoutes from './routes/dbTestRoutes';

const app: Express = express();

// Security middleware
app.use(helmet());

// CORS configuration - Allow all origins
app.use(
  cors({
    origin: '*', // Allow all origins
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
});

app.use('/api/', limiter);

// Passport middleware
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());

// Initialize OAuth strategies
initializeOAuth();

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, _, next) => {
  logger.info(`${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get('user-agent'),
  });
  next();
});

// Static file serving for uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Root endpoint
app.get('/', (_, res) => res.send('Backend is running'));

// Health check endpoint
app.get('/health', (_, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Database connection test endpoint
app.get('/health/db', async (_, res) => {
  try {
    const { pool } = await import('./config/database');
    const connection = await pool.getConnection();
    await connection.ping();
    connection.release();
    res.json({ 
      status: 'ok', 
      database: 'connected',
      timestamp: new Date().toISOString() 
    });
  } catch (error: any) {
    res.status(500).json({ 
      status: 'error', 
      database: 'disconnected',
      error: error.message,
      timestamp: new Date().toISOString() 
    });
  }
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/auth/oauth', oauthRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/farms', farmRoutes);
app.use('/api/crops', cropRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/yields', yieldRoutes);
app.use('/api/stock', stockRoutes);
app.use('/api/history', historyRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/soil-types', soilRoutes);
app.use('/api/fertilizers', fertilizerRoutes);
app.use('/api/pesticides', pesticideRoutes);
app.use('/api/irrigations', irrigationRoutes);
app.use('/api/ml', mlRoutes);
app.use('/api/weather', weatherRoutes);
app.use('/api/disease', diseaseScanRoutes);
app.use('/api/audit-logs', auditLogRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/user', userRoutes);
app.use('/api/calendar', calendarRoutes);
app.use('/api/weather', weatherAlertRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/auth/2fa', twoFactorRoutes);
app.use('/api/whatsapp', whatsappRoutes);
app.use('/api/sms', smsRoutes);
app.use('/api/market-prices', marketPriceRoutes);
app.use('/api/fields', fieldRoutes);
app.use('/api/health', healthRoutes);
app.use('/api/db-test', dbTestRoutes);

// 404 handler
app.use(notFoundHandler);

// Error handler (must be last)
app.use(errorHandler);

// Handle uncaught exceptions and unhandled promise rejections
process.on('uncaughtException', (error: Error) => {
  logger.error('Uncaught Exception:', error);
  // Don't exit - let the server continue running
});

process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Don't exit - let the server continue running
});

// Start server
const PORT = config.port;
const HOST = '0.0.0.0'; // Listen on all interfaces

app.listen(PORT, HOST, () => {
  logger.info(`Server running on http://${HOST === '0.0.0.0' ? 'localhost' : HOST}:${PORT}`, {
    environment: config.nodeEnv,
    frontendUrl: config.frontendUrl,
  });
  console.log(`✅ Backend server is running on http://localhost:${PORT}`);
  console.log(`✅ Frontend URL: ${config.frontendUrl}`);
});

export default app;
