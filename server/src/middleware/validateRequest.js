/**
 * Input Validation & Sanitization Middleware
 * Demonstrates: Input sanitization & injection awareness
 * - Allow-listing fields (no extra fields pass through)
 * - Type coercion and range checks
 * - Prevents NoSQL injection via express-mongo-sanitize (already mounted)
 */
const validate = (schema) => (req, res, next) => {
  const errors = [];
  const sanitized = {};

  for (const [field, rules] of Object.entries(schema)) {
    let value = req.body[field];

    if (rules.required && (value === undefined || value === null || value === '')) {
      errors.push(`${field} is required`);
      continue;
    }

    if (value === undefined || value === null) continue;

    // Type casting
    if (rules.type === 'string') {
      value = String(value).trim();
      // Strip HTML tags to prevent XSS
      value = value.replace(/<[^>]*>/g, '');
    } else if (rules.type === 'number') {
      value = Number(value);
      if (isNaN(value)) {
        errors.push(`${field} must be a number`);
        continue;
      }
    } else if (rules.type === 'email') {
      value = String(value).trim().toLowerCase();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        errors.push(`${field} must be a valid email`);
        continue;
      }
    } else if (rules.type === 'array') {
      if (!Array.isArray(value)) {
        errors.push(`${field} must be an array`);
        continue;
      }
    }

    if (rules.minLength && typeof value === 'string' && value.length < rules.minLength) {
      errors.push(`${field} must be at least ${rules.minLength} characters`);
      continue;
    }
    if (rules.maxLength && typeof value === 'string' && value.length > rules.maxLength) {
      errors.push(`${field} must be at most ${rules.maxLength} characters`);
      continue;
    }
    if (rules.min !== undefined && typeof value === 'number' && value < rules.min) {
      errors.push(`${field} must be at least ${rules.min}`);
      continue;
    }
    if (rules.max !== undefined && typeof value === 'number' && value > rules.max) {
      errors.push(`${field} must be at most ${rules.max}`);
      continue;
    }

    sanitized[field] = value;
  }

  if (errors.length > 0) {
    return res.status(400).json({ msg: 'Validation failed', errors });
  }

  req.body = sanitized;
  next();
};

module.exports = { validate };
