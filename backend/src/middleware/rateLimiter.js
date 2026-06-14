import rateLimit from 'express-rate-limit';

export const aiQuizRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  limit: 10, // Limit each IP to 10 requests per hour
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: {
    error: 'Too many quiz generation requests from this IP. Please try again after an hour.'
  },
  statusCode: 429,
  handler: (req, res, next, options) => {
    return res.status(options.statusCode).json(options.message);
  }
});
