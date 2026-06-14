const jwt = require('jsonwebtoken');
const db = require('../db');

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey_minilearn_2026';

module.exports = async function(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authorization header missing or invalid format.' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    const user = await db('users').where('id', decoded.userId).first();
    if (!user) {
      return res.status(401).json({ error: 'User associated with this token not found.' });
    }

    delete user.password_hash;
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Token is invalid or has expired.' });
  }
};
