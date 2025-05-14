import express from 'express';
import jwt from 'jsonwebtoken';
import { JWT_SECRET, REFRESH_SECRET, ACCESS_TOKEN_EXPIRY, REFRESH_TOKEN_EXPIRY, redisClient } from '../../server.js';

const router = express.Router();

// Token refresh endpoint
router.post('/refresh', (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(401).json({ error: 'Refresh token required' });

  try {
    const decoded = jwt.verify(refreshToken, REFRESH_SECRET);
    const accessToken = jwt.sign(
      { userId: decoded.userId }, 
      JWT_SECRET, 
      { expiresIn: ACCESS_TOKEN_EXPIRY }
    );
    
    res.json({ accessToken });
  } catch (err) {
    return res.status(403).json({ error: 'Invalid refresh token' });
  }
});

// Login endpoint (placeholder)
router.post('/login', (req, res) => {
  // TODO: Implement proper authentication
  const { username, password } = req.body;
  
  const accessToken = jwt.sign(
    { userId: 1 }, 
    JWT_SECRET, 
    { expiresIn: ACCESS_TOKEN_EXPIRY }
  );
  
  const refreshToken = jwt.sign(
    { userId: 1 },
    REFRESH_SECRET,
    { expiresIn: REFRESH_TOKEN_EXPIRY }
  );

  res.json({ accessToken, refreshToken });
});

// Logout endpoint
router.post('/logout', (req, res) => {
  const { accessToken, refreshToken } = req.body;
  
  if (!accessToken || !refreshToken) {
    return res.status(400).json({ error: 'Tokens required' });
  }

  // Blacklist tokens
  redisClient.set(`blacklist:${accessToken}`, 'true', 'EX', 60 * 15); // Match access token expiry
  redisClient.set(`blacklist:${refreshToken}`, 'true', 'EX', 60 * 60 * 24 * 7); // Match refresh token expiry

  res.json({ message: 'Logged out successfully' });
});

export default router;
