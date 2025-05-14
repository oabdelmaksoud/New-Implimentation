import express from 'express';
import { 
  getServerConfig,
  updateServerConfig,
  getConfigSchema
} from '../services/serverConfiguration';

const router = express.Router();

router.get('/:name', async (req, res) => {
  try {
    const config = getServerConfig(req.params.name);
    res.json(config);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

router.put('/:name', async (req, res) => {
  try {
    const updated = await updateServerConfig(req.params.name, req.body);
    res.json(updated);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/schema/:type', async (req, res) => {
  try {
    const schema = getConfigSchema(req.params.type);
    res.json(schema);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
