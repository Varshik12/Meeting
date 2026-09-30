import dotenv from 'dotenv';
import { connectDB } from '../config/db.js';
import { initStorage, seedDefaultRooms } from '../repositories/storage.js';

dotenv.config();

async function runSeed() {
  console.log('🌱 Starting database seeding script...');
  await connectDB();
  await initStorage();
  const seeded = await seedDefaultRooms();
  console.log(`✅ Seeding complete. Pre-seeded ${seeded.length} meeting rooms.`);
  process.exit(0);
}

runSeed().catch((err) => {
  console.error('❌ Seeding failed:', err);
  process.exit(1);
});
