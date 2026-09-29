require('dotenv').config();
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const User = require('./models/User');

async function ensureAdmin() {
  const { ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;
  if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
    console.log('ADMIN_EMAIL / ADMIN_PASSWORD not set - skipping admin account setup');
    return;
  }
  const email = ADMIN_EMAIL.trim().toLowerCase();
  const existing = await User.findOne({ email });
  if (existing) {
    if (existing.role !== 'admin') {
      existing.role = 'admin';
      await existing.save();
      console.log(`Promoted ${email} to admin`);
    }
    return;
  }
  await User.create({ email, name: 'Administrator', role: 'admin', password: await bcrypt.hash(ADMIN_PASSWORD, 12) });
  console.log(`Admin account created: ${email}`);
}

module.exports = ensureAdmin;

if (require.main === module) {
  mongoose
    .connect(process.env.MONGO_URI)
    .then(ensureAdmin)
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
