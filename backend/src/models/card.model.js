const mongoose = require('mongoose');

const cardSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 256
  },
  subtitle: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 256
  },
  description: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 1024
  },
  phone: {
    type: String,
    required: true,
    match: /^0[2-9]-\d{7}$/
  },
  email: {
    type: String,
    required: true,
    match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  },
  web: {
    type: String,
    default: ''
  },
  image: {
    url: { 
      type: String, 
      default: 'https://cdn.pixabay.com/photo/2016/04/20/08/21/entrepreneur-1340649_960_720.jpg' 
    },
    alt: { 
      type: String, 
      default: 'Business card image' 
    }
  },
  address: {
    state: { type: String, maxlength: 256 },
    country: { type: String, required: true, maxlength: 256 },
    city: { type: String, required: true, maxlength: 256 },
    street: { type: String, required: true, maxlength: 256 },
    houseNumber: { type: Number, required: true, min: 1 },
    zip: { type: Number, default: 0 }
  },
  bizNumber: {
    type: Number,
    unique: true,
    required: true,
    default: () => Math.floor(1000000 + Math.random() * 9000000)
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for user_id only (bizNumber already has unique index)
cardSchema.index({ user_id: 1 });

module.exports = mongoose.model('Card', cardSchema);
