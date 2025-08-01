import { Router } from 'express';

const router = Router();

router.get('/test', (req, res) => {
  res.json({
    message: 'Agents API test endpoint reached!',
    timestamp: new Date().toISOString()
  });
});

export default router;
