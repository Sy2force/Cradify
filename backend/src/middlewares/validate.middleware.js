const Joi = require('joi');
const { 
  registerSchema, 
  loginSchema, 
  updateSchema: updateUserSchema 
} = require('../validators/user.validator');

// Card validation schemas
const cardSchema = Joi.object({
  title: Joi.string().min(2).max(256).required(),
  subtitle: Joi.string().min(2).max(256).required(),
  description: Joi.string().min(2).max(1024).required(),
  phone: Joi.string().pattern(/^0[2-9]-\d{7}$/).required(),
  email: Joi.string().email().required(),
  web: Joi.string().uri().allow(''),
  image: Joi.object({
    url: Joi.string().uri().allow(''),
    alt: Joi.string().max(256).allow('')
  }).optional(),
  address: Joi.object({
    state: Joi.string().max(256).allow(''),
    country: Joi.string().max(256).required(),
    city: Joi.string().max(256).required(),
    street: Joi.string().max(256).required(),
    houseNumber: Joi.number().min(1).required(),
    zip: Joi.number().allow(0)
  }).required()
});

const updateCardSchema = Joi.object({
  title: Joi.string().min(2).max(256),
  subtitle: Joi.string().min(2).max(256),
  description: Joi.string().min(2).max(1024),
  phone: Joi.string().pattern(/^0[2-9]-\d{7}$/),
  email: Joi.string().email(),
  web: Joi.string().uri().allow(''),
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
    zip: Joi.number().allow(0)
  })
});

// Validation middleware
const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({
        message: 'Validation error',
        details: error.details[0].message
      });
    }
    next();
  };
};

// Export validation middlewares
exports.validate = validate;
exports.validateRegister = validate(registerSchema);
exports.validateLogin = validate(loginSchema);
exports.validateUpdate = validate(updateUserSchema);
exports.validateCard = validate(cardSchema);
exports.validateCardUpdate = validate(updateCardSchema);
