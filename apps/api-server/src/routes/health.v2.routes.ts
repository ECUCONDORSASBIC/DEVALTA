import { Router } from 'express';

const router = Router();

router.get('/', (_req, res) => {
  res.status(200).json({ ok: true, status: 'healthy' });
});

router.get('/live', (_req, res) => {
  res.status(200).json({ ok: true, status: 'live' });
});

router.get('/ready', (_req, res) => {
  res.status(200).json({ ok: true, status: 'ready' });
});

export default router;
