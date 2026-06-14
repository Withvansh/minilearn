import { Router } from 'express';
import db from '../db/knex.js';
import crypto from 'crypto';

const router = Router();

// POST /api/auth/google - Authenticate user with Google ID token
router.post('/google', async (req, res, next) => {
  try {
    const { idToken } = req.body;
    if (!idToken) {
      return res.status(400).json({ error: 'Google ID Token is required.' });
    }

    // Verify token with Google's API
    const response = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`);
    if (!response.ok) {
      return res.status(400).json({ error: 'Invalid Google ID Token.' });
    }

    const payload = await response.json();

    // Verify audience matches our Client ID if configured
    const clientID = process.env.GOOGLE_CLIENT_ID;
    if (clientID && payload.aud !== clientID) {
      return res.status(400).json({ error: 'Audience mismatch. Token was not generated for this client.' });
    }

    const email = payload.email;
    const name = payload.name || payload.given_name || email.split('@')[0];

    // Find or create user in the database
    let user = await db('users').where({ email }).first();

    if (!user) {
      user = {
        id: crypto.randomUUID(),
        username: name,
        email,
        password_hash: crypto.randomUUID() // random password placeholder for Google OAuth users
      };
      await db('users').insert(user);
    }

    // Return the user details
    return res.status(200).json({
      id: user.id,
      username: user.username,
      email: user.email
    });
  } catch (error) {
    console.error('Google OAuth backend verification failed:', error);
    return res.status(502).json({ error: 'Failed to verify token with Google auth providers.' });
  }
});

export default router;
