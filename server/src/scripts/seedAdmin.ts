import "dotenv/config";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { User } from "../models/User.js";

const run = async () => {
  const mongoUri = process.env.MONGODB_URI;
  const name = process.env.SEED_ADMIN_NAME;
  const email = process.env.SEED_ADMIN_EMAIL;
  const password = process.env.SEED_ADMIN_PASSWORD;

  if (!mongoUri || !name || !email || !password) {
    throw new Error(
      "MONGODB_URI, SEED_ADMIN_NAME, SEED_ADMIN_EMAIL, and SEED_ADMIN_PASSWORD are required",
    );
  }

  await mongoose.connect(mongoUri);

  const passwordHash = await bcrypt.hash(password, 12);
  const admin = await User.findOneAndUpdate(
    { email: email.toLowerCase().trim() },
    {
      name,
      email,
      passwordHash,
      role: "admin",
    },
    { returnDocument: "after", upsert: true, runValidators: true },
  );

  console.log(`Admin ready: ${admin.email}`);
  await mongoose.disconnect();
};

run().catch(async (error) => {
  console.error(error);
  await mongoose.disconnect();
  process.exit(1);
});
