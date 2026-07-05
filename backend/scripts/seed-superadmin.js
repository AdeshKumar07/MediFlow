'use strict';

/**
 * Super Admin Seeder
 * -------------------------------------------------
 * Permanently creates / updates the Super Admin user
 * in MongoDB Atlas. Safe to re-run — will not
 * create duplicates; it upserts by email.
 *
 * Run:  node scripts/seed-superadmin.js
 */

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');
const User     = require('../models/user.model');

// ── Super Admin credentials ─────────────────────────────────────────────────
const SUPER_ADMIN = {
  firstName : 'Adesh',
  lastName  : 'Kumar',
  username  : 'adeshkumar_admin',
  email     : 'adeshkumarchaudhary52@gmail.com',
  password  : 'Adesh@8881',
  phone     : '8881000000',
  role      : 'SUPER_ADMIN',
  isActive  : true
};
// ────────────────────────────────────────────────────────────────────────────

async function seedSuperAdmin() {
  console.log('\n🔧  MediFlow — Super Admin Seeder');
  console.log('──────────────────────────────────────────');

  // 1. Connect to MongoDB Atlas
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('❌  MONGODB_URI not found in .env — aborting.');
    process.exit(1);
  }

  await mongoose.connect(uri);
  console.log('✅  Connected to MongoDB Atlas');

  // 2. Hash the password manually (bypassing model pre-save for upsert)
  const salt         = await bcrypt.genSalt(10);
  const hashedPwd    = await bcrypt.hash(SUPER_ADMIN.password, salt);

  // 3. Upsert: update if email exists, insert if not
  const result = await User.findOneAndUpdate(
    { email: SUPER_ADMIN.email },                         // filter
    {
      $set: {
        firstName : SUPER_ADMIN.firstName,
        lastName  : SUPER_ADMIN.lastName,
        username  : SUPER_ADMIN.username,
        email     : SUPER_ADMIN.email,
        password  : hashedPwd,
        phone     : SUPER_ADMIN.phone,
        role      : SUPER_ADMIN.role,
        isActive  : SUPER_ADMIN.isActive
      }
    },
    { upsert: true, new: true, runValidators: false }     // create if absent
  );

  const action = result.createdAt?.getTime() === result.updatedAt?.getTime()
    ? 'CREATED'
    : 'UPDATED';

  console.log(`\n✅  Super Admin ${action} successfully in MongoDB Atlas`);
  console.log('──────────────────────────────────────────');
  console.log(`   ID       : ${result._id}`);
  console.log(`   Name     : ${result.firstName} ${result.lastName}`);
  console.log(`   Email    : ${result.email}`);
  console.log(`   Username : ${result.username}`);
  console.log(`   Role     : ${result.role}`);
  console.log(`   Active   : ${result.isActive}`);
  console.log('──────────────────────────────────────────');
  console.log('\n🔑  Login credentials:');
  console.log(`   Email    : ${SUPER_ADMIN.email}`);
  console.log(`   Password : ${SUPER_ADMIN.password}`);
  console.log('\n🚀  Account is permanently stored in the database.\n');

  await mongoose.disconnect();
  process.exit(0);
}

seedSuperAdmin().catch((err) => {
  console.error('❌  Seeder failed:', err.message);
  mongoose.disconnect().finally(() => process.exit(1));
});
