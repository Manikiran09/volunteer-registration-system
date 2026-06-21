const jwt = require('jsonwebtoken');
const db = require('../db');

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_volunteer_token_key_12345';

// Authenticate any user with a valid JWT
const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, JWT_SECRET);

      // Get user from database (omit password)
      const user = await db.users.findById(decoded.id);
      if (!user) {
        return res.status(401).json({ message: 'Not authorized, user not found' });
      }

      // Format user for request context (safety copy)
      req.user = {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        skills: user.skills,
        availability: user.availability,
        bio: user.bio,
        hoursLogged: user.hoursLogged
      };

      next();
    } catch (error) {
      console.error('Auth error:', error);
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token provided' });
  }
};

// Guard for Admin-only routes
const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return res.status(403).json({ message: 'Access denied, administrator role required' });
  }
};

module.exports = { protect, adminOnly };
