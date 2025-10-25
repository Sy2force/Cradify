const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    first: { type: String, required: true, minlength: 2, maxlength: 256 },
    middle: { type: String, maxlength: 256, default: '' },
    last: { type: String, required: true, minlength: 2, maxlength: 256 }
  },
  phone: {
    type: String,
    required: true,
    match: /^0[2-9]-\d{7}$/
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  },
  password: {
    type: String,
    required: true,
    minlength: 7,
    maxlength: 128
  },
  image: {
    url: { type: String, default: 'https://cdn.pixabay.com/photo/2016/04/01/10/11/avatar-1299805_960_720.png' },
    alt: { type: String, default: 'User profile picture' }
  },
  address: {
    state: { type: String, maxlength: 256 },
    country: { type: String, required: true, maxlength: 256 },
    city: { type: String, required: true, maxlength: 256 },
    street: { type: String, required: true, maxlength: 256 },
    houseNumber: { type: Number, required: true, min: 1 },
    zip: { type: Number, default: 0 }
  },
  isAdmin: { type: Boolean, default: false },
  isBusiness: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  loginAttempts: { type: Number, default: 0 },
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
