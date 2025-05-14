import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import jwt from 'jsonwebtoken';
import { createClient } from 'redis';
import healthRouter from './src/routes/health.js';
import authRouter from './src/routes/auth.js';
import provisioningRouter from './src/routes/provisioning.js';
import configurationRouter from './src/routes/configuration.js';

// Configuration constants
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const REFRESH_SECRET = process.env.REFRESH_SECRET || 'your-refresh-secret';
const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY = '7d';

// Redis client setup
const redisClient = createClient({
  url: `redis://${process.env.REDIS_HOST || 'localhost'}:${process.env.REDIS_PORT || 6379}`
});

redisClient.on('error', (err) => console.error('Redis Client Error', err));

// Authentication middleware
const authenticate = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });

  try {
    const isBlacklisted = await redisClient.get(`blacklist:${token}`);
    if (isBlacklisted) {
      return res.status(403).json({ error: 'Token revoked' });
    }
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Invalid token' });
  }
};

async function startServer() {
  try {
    await redisClient.connect();
    console.log('Connected to Redis');

    const __dirname = path.dirname(fileURLToPath(import.meta.url));
    const app = express();

    // Middleware
    app.use(express.json({ limit: '16kb' }));

    // Routes
    app.use('/api/auth', authRouter);
    app.use('/api/health', authenticate, healthRouter);
    app.use('/api/provisioning', authenticate, provisioningRouter);
    app.use('/api/configuration', authenticate, configurationRouter);
    app.use('/api/*', (req, res) => res.status(404).json({ error: 'API endpoint not found' }));

    // Static files
    app.use(express.static(path.join(__dirname, 'public')));
    app.get('*', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));

    // Start server
    const PORT = process.env.PORT || 3001;
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

// Export configuration for routes
export {
  JWT_SECRET,
  REFRESH_SECRET,
  ACCESS_TOKEN_EXPIRY,
  REFRESH_TOKEN_EXPIRY,
  redisClient
};

// Start the server
startServer();
