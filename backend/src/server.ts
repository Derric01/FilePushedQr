import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import multer from 'multer';
import dotenv from 'dotenv';
import { logger } from './utils/logger';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { apiLimiter } from './middleware/rateLimiter';
import uploadRoute from './routes/upload.route';
import viewRoute from './routes/view.route';
import deleteRoute from './routes/delete.route';
import { startCleanupJob } from './jobs/cleanup.job';

// Load environment variables
dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 3001;

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE_MB || '500') * 1024 * 1024,
  },
});

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.FRONTEND_URL 
    : (origin, callback) => {
        // Allow localhost and local network IPs
        const allowedOrigins = [
          'http://localhost:3000',
          'http://localhost:3001', 
          'http://localhost:3002',
          /^http:\/\/192\.168\.\d+\.\d+:3000$/,
          /^http:\/\/192\.168\.\d+\.\d+:3001$/,
        ];
        
        if (!origin || allowedOrigins.some(allowed => 
          typeof allowed === 'string' ? allowed === origin : allowed.test(origin)
        )) {
          callback(null, true);
        } else {
          callback(new Error('Not allowed by CORS'));
        }
      },
  credentials: true,
}));

// Body parsing
app.use(compression());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// API rate limiting
app.use('/api', apiLimiter);

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy',
    timestamp: new Date().toISOString(),
  });
});

// API routes
app.use('/api/upload', upload.single('file'), uploadRoute);
app.use('/api/view', viewRoute);
app.use('/api/delete', deleteRoute);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
const portNum = typeof PORT === 'string' ? parseInt(PORT) : PORT;
app.listen(portNum, '0.0.0.0', () => {
  logger.info(`🚀 Backend server running on port ${portNum}`);
  logger.info(`📁 Environment: ${process.env.NODE_ENV || 'development'}`);
  logger.info(`🌐 Network access: http://192.168.1.8:${portNum}`);
  
  // Start cleanup job
  startCleanupJob();
  logger.info('🧹 Cleanup job scheduled');
});

export default app;
