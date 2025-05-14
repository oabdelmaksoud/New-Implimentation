import express from 'express';
import { getHealthStatus } from '../api/health.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const healthData = await getHealthStatus();
    res.json(healthData);
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to fetch health data',
      details: error.message 
    });
  }
});

export default router;
