#!/usr/bin/env node
/**
 * Backfill `planTier` and `scanQuota` for existing users.
 * Usage: MONGODB_URI="..." node ./scripts/backfill-plan-tiers.js
 */
const mongoose = require('mongoose');
const User = require('../models/User');

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('MONGODB_URI environment variable is required');
    process.exit(1);
  }

  await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
  console.log('Connected to MongoDB');

  const users = await User.find({}).lean();
  console.log(`Found ${users.length} users`);

  for (const u of users) {
    const updates = {};
    if (!u.planTier && u.shieldxPlan) updates.planTier = u.shieldxPlan;
    if (!u.planTier) updates.planTier = 'free';

    if (updates.planTier) {
      // set default quotas based on plan
      const quotas = { free: 10, pro: 500, enterprise: 100000, demo: 3 };
      updates.scanQuota = quotas[updates.planTier] ?? 10;
    }

    if (Object.keys(updates).length) {
      await User.updateOne({ _id: u._id }, { $set: updates });
      console.log(`Updated user ${u._id}:`, updates);
    }
  }

  await mongoose.disconnect();
  console.log('Done.');
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
