import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { config } from './config/env';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import logger from './utils/logger';

// Import routes
import authRoutes from './routes/authRoutes';
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

const app: Express = express();

// Security middleware
app.use(helmet());

// CORS configuration
app.use(
  cors({
    origin: config.frontendUrl,
    credentials: true,
  })
);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
});

app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get('user-agent'),
  });
  next();
});

// Static file serving for uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api/auth', authRoutes);
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

// 404 handler
app.use(notFoundHandler);

// Error handler (must be last)
app.use(errorHandler);

// Start server
const PORT = config.port;

app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`, {
    environment: config.nodeEnv,
    frontendUrl: config.frontendUrl,
  });
});

export default app;
