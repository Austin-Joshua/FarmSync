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

console.log('[SERVER] Starting app initialization...');
const app: Express = express();

try {
  // Security middleware
  console.log('[SERVER] Setting up middleware...');
  app.use(helmet());

  // CORS configuration
  app.use(
    cors({
      origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        // Allow localhost origins and configured frontend URL
        const allowedOrigins = [
          config.frontendUrl,
          'http://localhost:5173',
          'http://127.0.0.1:5173',
          'http://localhost:5174',
          'http://127.0.0.1:5174',
          'http://localhost:3000',
          'http://127.0.0.1:3000',
        ];
        if (allowedOrigins.indexOf(origin) !== -1 || origin.includes('localhost') || origin.includes('127.0.0.1')) {
          callback(null, true);
        } else {
          callback(new Error('Not allowed by CORS'));
        }
      },
      credentials: true,
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
  console.log('[SERVER] Middleware setup complete');
} catch (initError) {
  console.error('CRITICAL: Error during app initialization:', initError);
  logger.error('App initialization error', { error: String(initError) });
  process.exit(1);
}

console.log('[SERVER] Setting up routes...');

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

// API routes - wrap in try-catch to prevent one bad route from breaking everything
try {
  app.use('/api/auth', authRoutes);
} catch (e) { console.error('Auth routes error:', e); }
try {
  app.use('/api/auth/oauth', oauthRoutes);
} catch (e) { console.error('OAuth routes error:', e); }
try {
  app.use('/api/dashboard', dashboardRoutes);
} catch (e) { console.error('Dashboard routes error:', e); }
try {
  app.use('/api/farms', farmRoutes);
} catch (e) { console.error('Farm routes error:', e); }
try {
  app.use('/api/crops', cropRoutes);
} catch (e) { console.error('Crop routes error:', e); }
try {
  app.use('/api/expenses', expenseRoutes);
} catch (e) { console.error('Expense routes error:', e); }
try {
  app.use('/api/yields', yieldRoutes);
} catch (e) { console.error('Yield routes error:', e); }
try {
  app.use('/api/stock', stockRoutes);
} catch (e) { console.error('Stock routes error:', e); }
try {
  app.use('/api/history', historyRoutes);
} catch (e) { console.error('History routes error:', e); }
try {
  app.use('/api/settings', settingsRoutes);
} catch (e) { console.error('Settings routes error:', e); }
try {
  app.use('/api/soil-types', soilRoutes);
} catch (e) { console.error('Soil routes error:', e); }
try {
  app.use('/api/fertilizers', fertilizerRoutes);
} catch (e) { console.error('Fertilizer routes error:', e); }
try {
  app.use('/api/pesticides', pesticideRoutes);
} catch (e) { console.error('Pesticide routes error:', e); }
try {
  app.use('/api/irrigations', irrigationRoutes);
} catch (e) { console.error('Irrigation routes error:', e); }
try {
  app.use('/api/ml', mlRoutes);
} catch (e) { console.error('ML routes error:', e); }
try {
  app.use('/api/weather', weatherRoutes);
} catch (e) { console.error('Weather routes error:', e); }
try {
  app.use('/api/disease', diseaseScanRoutes);
} catch (e) { console.error('Disease routes error:', e); }
try {
  app.use('/api/audit-logs', auditLogRoutes);
} catch (e) { console.error('Audit routes error:', e); }
try {
  app.use('/api/notifications', notificationRoutes);
} catch (e) { console.error('Notification routes error:', e); }
try {
  app.use('/api/admin', adminRoutes);
} catch (e) { console.error('Admin routes error:', e); }
try {
  app.use('/api/user', userRoutes);
} catch (e) { console.error('User routes error:', e); }
try {
  app.use('/api/calendar', calendarRoutes);
} catch (e) { console.error('Calendar routes error:', e); }
try {
  app.use('/api/weather', weatherAlertRoutes);
} catch (e) { console.error('Weather alert routes error:', e); }
try {
  app.use('/api/reports', reportsRoutes);
} catch (e) { console.error('Reports routes error:', e); }
try {
  app.use('/api/auth/2fa', twoFactorRoutes);
} catch (e) { console.error('2FA routes error:', e); }
try {
  app.use('/api/whatsapp', whatsappRoutes);
} catch (e) { console.error('WhatsApp routes error:', e); }
try {
  app.use('/api/sms', smsRoutes);
} catch (e) { console.error('SMS routes error:', e); }
try {
  app.use('/api/market-prices', marketPriceRoutes);
} catch (e) { console.error('Market price routes error:', e); }
try {
  app.use('/api/fields', fieldRoutes);
} catch (e) { console.error('Fields routes error:', e); }

// 404 handler
console.log('[SERVER] Registering error handlers...');
app.use(notFoundHandler);

// Error handler (must be last)
app.use(errorHandler);

console.log('[SERVER] All routes and handlers registered successfully');

// Handle uncaught exceptions and unhandled promise rejections
process.on('uncaughtException', (error: Error) => {
  logger.error('Uncaught Exception:', { message: error.message, stack: error.stack });
  console.error('UNCAUGHT EXCEPTION:', error);
  // Don't exit - let the server continue running
});

process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
  const message = reason instanceof Error ? reason.message : String(reason);
  const stack = reason instanceof Error ? reason.stack : '';
  logger.error('Unhandled Rejection', { message, stack });
  console.error('UNHANDLED REJECTION:', reason);
  // Don't exit - let the server continue running
});

// Start server
const PORT = config.port;
const HOST = 'localhost'; // Listen on localhost for easier debugging

console.log('[SERVER] About to start listening on port', PORT);
const server = app.listen(PORT, HOST, () => {
  console.log('[SERVER] Listen callback fired!');
  logger.info(`Server running on http://localhost:${PORT}`, {
    environment: config.nodeEnv,
    frontendUrl: config.frontendUrl,
  });
  console.log(`✅ Backend server is running on http://localhost:${PORT}`);
  console.log(`✅ Frontend URL: ${config.frontendUrl}`);
});

server.on('error', (error: any) => {
  console.error('[SERVER] Error event received:', error);
  if (error.code === 'EADDRINUSE') {
    logger.error(`Port ${PORT} is already in use`, { error: error.message });
    console.error(`ERROR: Port ${PORT} is already in use!`);
  } else {
    logger.error('Server error', { error: error.message, stack: error.stack });
    console.error('SERVER ERROR:', error);
  }
  process.exit(1);
});

console.log('[SERVER] Listening started, waiting for connection...');

export default app;
