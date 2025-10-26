const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { DEFAULTS, REGEX_PATTERNS, FIELD_LIMITS } = require('../constants');

const userSchema = new mongoose.Schema({
  name: {
    first: { 
      type: String, 
      required: true, 
      minlength: FIELD_LIMITS.NAME.MIN, 
      maxlength: FIELD_LIMITS.NAME.MAX 
    },
    middle: { 
      type: String, 
      maxlength: FIELD_LIMITS.NAME.MAX, 
      default: '' 
    },
    last: { 
      type: String, 
      required: true, 
      minlength: FIELD_LIMITS.NAME.MIN, 
      maxlength: FIELD_LIMITS.NAME.MAX 
    }
  },
  phone: {
    type: String,
    required: true,
    match: REGEX_PATTERNS.PHONE
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    maxlength: FIELD_LIMITS.EMAIL.MAX,
    match: REGEX_PATTERNS.EMAIL
  },
  password: {
    type: String,
    required: true,
    minlength: FIELD_LIMITS.PASSWORD.MIN,
    maxlength: FIELD_LIMITS.PASSWORD.MAX
  },
  image: {
    url: { 
      type: String, 
      default: DEFAULTS.IMAGE.URL,
      maxlength: FIELD_LIMITS.URL.MAX 
    },
    alt: { 
      type: String, 
      default: DEFAULTS.IMAGE.ALT,
      maxlength: FIELD_LIMITS.ALT_TEXT.MAX 
    }
  },
  address: {
    state: { type: String, maxlength: FIELD_LIMITS.NAME.MAX },
    country: { type: String, required: true, maxlength: FIELD_LIMITS.NAME.MAX },
    city: { type: String, required: true, maxlength: FIELD_LIMITS.NAME.MAX },
    street: { type: String, required: true, maxlength: FIELD_LIMITS.NAME.MAX },
    houseNumber: { type: Number, required: true, min: 1 },
    zip: { type: Number, default: DEFAULTS.ZIP_CODE }
  },
  isAdmin: { type: Boolean, default: DEFAULTS.ADMIN_STATUS },
  isBusiness: { type: Boolean, default: DEFAULTS.BUSINESS_STATUS },
  createdAt: { type: Date, default: Date.now },
  loginAttempts: { type: Number, default: DEFAULTS.LOGIN_ATTEMPTS },
  lockUntil: { type: Date }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Check if account is locked
userSchema.methods.isLocked = function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
};

// Increment login attempts
userSchema.methods.incLoginAttempts = function() {
  // Reset attempts if lock has expired
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $set: { loginAttempts: 1 },
      $unset: { lockUntil: 1 }
    });
  }
  
  const updates = { $inc: { loginAttempts: 1 } };
  
  // Lock after 3 attempts for 24 hours
  if (this.loginAttempts + 1 >= 3 && !this.isLocked()) {
    updates.$set = { lockUntil: Date.now() + 24 * 60 * 60 * 1000 };
  }
  
  return this.updateOne(updates);
};

// Reset login attempts
userSchema.methods.resetLoginAttempts = function() {
  return this.updateOne({
    $set: { loginAttempts: 0 },
    $unset: { lockUntil: 1 }
  });
};

module.exports = mongoose.model('User', userSchema);
