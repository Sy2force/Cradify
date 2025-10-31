const Joi = require('joi');

// Common validation patterns
const patterns = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone: /^0[2-9]-\d{7}$/,
  url: /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)$/
};

// Card creation validation
const createCardSchema = Joi.object({
  title: Joi.string().min(2).max(256).required(),
  subtitle: Joi.string().min(2).max(256).required(),
  description: Joi.string().min(2).max(1024).required(),
  phone: Joi.string().pattern(patterns.phone).required().messages({
    'string.pattern.base': 'Phone must be in valid format'
  }),
  email: Joi.string().email().pattern(patterns.email).required().messages({
    'string.pattern.base': 'Please provide a valid email address'
  }),
  web: Joi.string().pattern(patterns.url).allow('').messages({
    'string.pattern.base': 'Please provide a valid URL starting with http:// or https://'
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
  }).required()
});

// Card update validation
const updateCardSchema = Joi.object({
  title: Joi.string().min(2).max(256),
  subtitle: Joi.string().min(2).max(256),
  description: Joi.string().min(2).max(1024),
  phone: Joi.string().pattern(/^[+]?[0-9\-\s()]{8,15}$/).messages({
    'string.pattern.base': 'Phone must be in valid format'
  }),
  email: Joi.string().email().pattern(patterns.email).messages({
    'string.pattern.base': 'Please provide a valid email address'
  }),
  web: Joi.string().pattern(patterns.url).allow('').messages({
    'string.pattern.base': 'Please provide a valid URL starting with http:// or https://'
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

// MongoDB ObjectId validation
const objectIdSchema = Joi.object({
  id: Joi.string().hex().length(24).required().messages({
    'string.hex': 'Invalid ID format',
    'string.length': 'ID must be 24 characters long'
  })
});

// Pagination validation
const paginationSchema = Joi.object({
  page: Joi.number().min(1).default(1),
  limit: Joi.number().min(1).max(100).default(10),
  sort: Joi.string().valid('createdAt', '-createdAt', 'title', '-title', 'likes', '-likes').default('-createdAt')
});

module.exports = {
  createCardSchema,
  updateCardSchema,
  objectIdSchema,
  paginationSchema
};
