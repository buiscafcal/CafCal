import path from 'path'; 
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { initializeDatabase } from './db/connection.js';
import authRoutes from './routes/auth.js';
import schoolRoutes from './routes/schools.js';
import foodRoutes from './routes/foods.js';
import trackingRoutes from './routes/tracking.js';
import premiumRoutes from './routes/premium.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP, please try again later.',
});
app.use('/api/', limiter);

app.use('/api/auth', authRoutes);
app.use('/api/schools', schoolRoutes);
app.use('/api/foods', foodRoutes);
app.use('/api/tracking', trackingRoutes);
app.use('/api/premium', premiumRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Serve frontend in production
import { createRequire } from 'module';
import { fileURLToPath as fu } from 'url';
const __dir = path.dirname(fu(import.meta.url));

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dir, '../client/dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dir, '../client/dist/index.html'));
  });
}

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

async function start() {
  try {
    await initializeDatabase();
    app.listen(PORT, () => {
      console.log(`CafCal server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

start();