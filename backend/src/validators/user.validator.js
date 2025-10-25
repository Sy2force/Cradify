const Joi = require('joi');

// Common validation patterns
const patterns = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone: /^0[2-9]-\d{7}$/,
  password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/
};

// User registration validation
const registerSchema = Joi.object({
  name: Joi.object({
    first: Joi.string().min(2).max(256).required(),
    middle: Joi.string().max(256).allow(''),
    last: Joi.string().min(2).max(256).required()
  }).required(),
  phone: Joi.string().pattern(patterns.phone).required().messages({
    'string.pattern.base': 'Phone must be in format 0X-XXXXXXX'
  }),
  email: Joi.string().email().pattern(patterns.email).required().messages({
    'string.pattern.base': 'Please provide a valid email address'
  }),
  password: Joi.string().min(7).max(128).pattern(patterns.password).required().messages({
    'string.min': 'Password must be at least 7 characters long',
    'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
  }),
  image: Joi.object({
    url: Joi.string().uri().allow(''),
    alt: Joi.string().max(256).allow('')
  }),
  address: Joi.object({
    state: Joi.string().max(256).allow(''),
    country: Joi.string().max(256).required(),
    city: Joi.string().max(256).required(),
    street: Joi.string().max(256).required(),
    houseNumber: Joi.number().min(1).required(),
    zip: Joi.number().min(0).allow(0)
  }).required(),
  isBusiness: Joi.boolean().default(false)
});

// User login validation
const loginSchema = Joi.object({
  email: Joi.string().email().pattern(patterns.email).required(),
  password: Joi.string().min(7).max(128).required()
});

// User update validation
const updateSchema = Joi.object({
  name: Joi.object({
    first: Joi.string().min(2).max(256),
    middle: Joi.string().max(256).allow(''),
    last: Joi.string().min(2).max(256)
  }),
  phone: Joi.string().pattern(patterns.phone).messages({
    'string.pattern.base': 'Phone must be in format 0X-XXXXXXX'
  }),
  image: Joi.object({
    url: Joi.string().uri().allow(''),
    alt: Joi.string().max(256).allow('')
  }),
  address: Joi.object({
    state: Joi.string().max(256).allow(''),
    country: Joi.string().max(256),
    city: Joi.string().max(256),
    street: Joi.string().max(256),
    houseNumber: Joi.number().min(1),
    zip: Joi.number().min(0)
  })
});

// Business status change validation
const businessStatusSchema = Joi.object({
  isBusiness: Joi.boolean().required()
});

// Password change validation
const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().min(7).max(128).required(),
  newPassword: Joi.string().min(7).max(128).pattern(patterns.password).required().messages({
    'string.min': 'Password must be at least 7 characters long',
    'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
  }),
  confirmPassword: Joi.string().valid(Joi.ref('newPassword')).required().messages({
    'any.only': 'Passwords do not match'
  })
});

module.exports = {
  registerSchema,
  loginSchema,
  updateSchema,
  businessStatusSchema,
  changePasswordSchema
};
