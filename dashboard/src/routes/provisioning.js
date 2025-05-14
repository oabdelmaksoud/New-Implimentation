import express from 'express';
import { 
  provisionServer,
  deprovisionServer,
  getProvisioningOptions,
  validateServerConfig
} from '../services/serverProvisioning';

const router = express.Router();

router.post('/servers', async (req, res) => {
  try {
    validateServerConfig(req.body);
    const server = await provisionServer(req.body);
    res.status(201).json(server);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.delete('/servers/:name', async (req, res) => {
  try {
    await deprovisionServer(req.params.name);
    res.status(204).send();
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/options', async (req, res) => {
  try {
    const options = await getProvisioningOptions();
    res.json(options);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
