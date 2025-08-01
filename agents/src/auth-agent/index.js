import express from 'express';
import { createAuthToken, verifyAuthToken } from '@altamedica/shared';
import logger from '@altamedica/shared/logger';

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware to log requests
app.use((req, res, next) => {
  logger.info(`Received request: ${req.method} ${req.url}`);
  next();
});

// Endpoint to create a token
app.post('/create-token', (req, res) => {
  const { uid, email, userType } = req.body;
  try {
    const token = createAuthToken({ uid, email, userType });
    res.json({ token });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create token' });
  }
});

// Endpoint to verify a token
app.post('/verify-token', (req, res) => {
  const { token } = req.body;
  try {
    const payload = verifyAuthToken(token);
    res.json({ payload });
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

// Start the AuthAgent server
app.listen(PORT, () => {
  logger.info(`AuthAgent listening on port ${PORT}`);
});
