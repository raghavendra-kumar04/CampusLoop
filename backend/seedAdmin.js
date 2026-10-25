/**
 * Run once to create the admin account in the database.
 * Usage: node seedAdmin.js
 */
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const User = require('./models/User');
const connectDB = require('./config/db');

const seedAdmin = async () => {
  await connectDB();

  const existing = await User.findOne({ email: 'admin@campusloop.org' });
  if (existing) {
    console.log('Admin account already exists.');
    process.exit(0);
  }

  const admin = await User.create({
    name: 'CampusLoop Admin',
    email: 'admin@campusloop.org',
    password: 'admin@campusloop',
    role: 'admin',
    isVerified: true,
    bio: 'Platform Administrator',
    major: 'Administration',
    graduationYear: 2099,
  });

  console.log('Admin account created:', admin.email);
  process.exit(0);
};

seedAdmin().catch(err => {
  console.error('Seed error:', err);
  process.exit(1);
});
