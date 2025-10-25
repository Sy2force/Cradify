const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/user.model');
const Card = require('../models/card.model');
const logger = require('./logger');

async function generateInitialData() {
  try {
    // Check if data already exists
    const userCount = await User.countDocuments();
    const cardCount = await Card.countDocuments();
    
    if (userCount > 0 || cardCount > 0) {
      logger.info('Data already exists, cleaning for fresh seed...');
      await User.deleteMany({});
      await Card.deleteMany({});
    }

    logger.info('🌱 Generating initial data...');

    // Hash password for all users
    const hashedPassword = await bcrypt.hash('Abc123!@#', 10);

    // Create users
    const normalUser = await User.create({
      name: {
        first: 'John',
        middle: '',
        last: 'Doe'
      },
      phone: '05-0123456',
      email: 'user@example.com',
      password: hashedPassword,
      address: {
        state: 'Tel Aviv',
        country: 'Israel',
        city: 'Tel Aviv',
        street: 'Dizengoff',
        houseNumber: 123,
        zip: 12345
      },
      isAdmin: false,
      isBusiness: false
    });

    const businessUser = await User.create({
      name: {
        first: 'Jane',
        middle: 'M',
        last: 'Smith'
      },
      phone: '05-0234567',
      email: 'business@example.com',
      password: hashedPassword,
      address: {
        state: 'Haifa',
        country: 'Israel',
        city: 'Haifa',
        street: 'HaNassi',
        houseNumber: 456,
        zip: 34567
      },
      isAdmin: false,
      isBusiness: true
    });

    const adminUser = await User.create({
      name: {
        first: 'Admin',
        middle: '',
        last: 'User'
      },
      phone: '05-0345678',
      email: 'admin@example.com',
      password: hashedPassword,
      address: {
        state: 'Jerusalem',
        country: 'Israel',
        city: 'Jerusalem',
        street: 'King David',
        houseNumber: 789,
        zip: 67890
      },
      isAdmin: true,
      isBusiness: true
    });

    // Create cards
    const cards = await Card.create([
      {
        title: 'Web Development Services',
        subtitle: 'Professional Web Solutions',
        description: 'Full-stack web development with modern technologies including React, Node.js, and MongoDB',
        phone: '05-0234567',
        email: 'web@business.com',
        web: 'https://webdev.example.com',
        address: {
          state: 'Haifa',
          country: 'Israel',
          city: 'Haifa',
          street: 'HaNassi',
          houseNumber: 456,
          zip: 34567
        },
        user_id: businessUser._id
      },
      {
        title: 'Digital Marketing Agency',
        subtitle: 'Grow Your Business Online',
        description: 'Comprehensive digital marketing services including SEO, PPC, social media management, and content marketing',
        phone: '05-0345678',
        email: 'marketing@admin.com',
        web: 'https://marketing.example.com',
        address: {
          state: 'Jerusalem',
          country: 'Israel',
          city: 'Jerusalem',
          street: 'King David',
          houseNumber: 789,
          zip: 67890
        },
        user_id: adminUser._id
      },
      {
        title: 'IT Consulting & Solutions',
        subtitle: 'Technology Solutions for Business',
        description: 'Expert IT consulting, system integration, cloud solutions, and digital transformation services',
        phone: '05-0234567',
        email: 'it@business.com',
        web: 'https://itconsulting.example.com',
        address: {
          state: 'Haifa',
          country: 'Israel',
          city: 'Haifa',
          street: 'HaNassi',
          houseNumber: 456,
          zip: 34567
        },
        user_id: businessUser._id
      }
    ]);

    // Add some likes to demonstrate the like functionality
    await Card.findByIdAndUpdate(cards[0]._id, {
      $push: { likes: [normalUser._id, adminUser._id] }
    });
    
    await Card.findByIdAndUpdate(cards[1]._id, {
      $push: { likes: [normalUser._id, businessUser._id] }
    });
    
    await Card.findByIdAndUpdate(cards[2]._id, {
      $push: { likes: [normalUser._id] }
    });

    logger.success('✅ Initial data generated successfully!');
    logger.info('👥 Users created:');
    logger.info('  📧 Normal user: user@example.com / Abc123!@#');
    logger.info('  🏢 Business user: business@example.com / Abc123!@#');
    logger.info('  👑 Admin user: admin@example.com / Abc123!@#');
    logger.info('📇 3 business cards created with likes');
    logger.info('🎯 Database ready for demo!');

  } catch (error) {
    logger.error('Failed to generate initial data:', { error: error.message, stack: error.stack });
    throw error;
  }
}

module.exports = generateInitialData;
