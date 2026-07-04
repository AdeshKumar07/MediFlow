const mongoose = require('mongoose');
const User = require('../models/user.model');
const ROLES = require('../constants/roles');
const logger = require('../utils/logger');
const createIndexes = require('./indexes');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      family: 4 // Use IPv4, skip trying IPv6
    });
    logger.info(`MongoDB Connected: ${conn.connection.host}`);

    // Create/verify all production indexes
    await createIndexes();
  } catch (error) {
    logger.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

const seedUsers = async () => {
  try {
    const count = await User.countDocuments();
    if (count > 0) {
      logger.info('Database already has data. Skipping user seeding.');
      return;
    }

    logger.info('Seeding default users...');

    const defaultUsers = [
      {
        username: 'superadmin',
        email: 'superadmin@mediflow.com',
        password: 'Password@123',
        role: ROLES.SUPER_ADMIN,
        firstName: 'Super',
        lastName: 'Admin',
        isActive: true
      },
      {
        username: 'hospitaladmin',
        email: 'admin@mediflow.com',
        password: 'Password@123',
        role: ROLES.HOSPITAL_ADMIN,
        firstName: 'Hospital',
        lastName: 'Administrator',
        isActive: true
      },
      {
        username: 'doctor',
        email: 'doctor@mediflow.com',
        password: 'Password@123',
        role: ROLES.DOCTOR,
        firstName: 'John',
        lastName: 'Doe',
        isActive: true
      },
      {
        username: 'receptionist',
        email: 'receptionist@mediflow.com',
        password: 'Password@123',
        role: ROLES.RECEPTIONIST,
        firstName: 'Jane',
        lastName: 'Smith',
        isActive: true
      },
      {
        username: 'pharmacist',
        email: 'pharmacist@mediflow.com',
        password: 'Password@123',
        role: ROLES.PHARMACIST,
        firstName: 'Alice',
        lastName: 'Brown',
        isActive: true
      },
      {
        username: 'labtech',
        email: 'labtech@mediflow.com',
        password: 'Password@123',
        role: ROLES.LAB_TECH,
        firstName: 'Bob',
        lastName: 'Wilson',
        isActive: true
      },
      {
        username: 'patient',
        email: 'patient@mediflow.com',
        password: 'Password@123',
        role: ROLES.PATIENT,
        firstName: 'Charlie',
        lastName: 'Miller',
        isActive: true
      }
    ];

    // Note: User model has a pre-save hook that will hash the passwords automatically
    for (const u of defaultUsers) {
      await User.create(u);
    }
    logger.info('Successfully seeded 7 default role-based users!');
  } catch (error) {
    logger.error(`Error seeding data: ${error.message}`);
  }
};

module.exports = connectDB;
