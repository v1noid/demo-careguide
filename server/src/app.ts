import "dotenv/config";
import cors from "cors";
import express from "express";
import mongoose from "mongoose";
import "./types/express.js";
import { authRouter } from "./routes/authRoutes.js";
import { noteRouter } from "./routes/noteRoutes.js";
import { postRouter } from "./routes/postRoutes.js";
import { userRouter } from "./routes/userRoutes.js";
import { errorHandler } from "./middleware/errorHandler.js";

const app = express();
const port = Number(process.env.PORT) || 4000;
const clientOrigin = process.env.CLIENT_ORIGIN ?? "http://localhost:3000";

app.use(cors({ origin: clientOrigin }));
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/auth", authRouter);
app.use("/api/notes", noteRouter);
app.use("/api/users", userRouter);
app.use("/api/posts", postRouter);
app.use(errorHandler);

(async () => {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    throw new Error("MONGODB_URI is required");
  }
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is required");
  }

  await mongoose.connect(mongoUri);
  app.listen(port, () => {
    console.log(`API listening on http://localhost:${port}`);
  });
})().catch((error) => {
  console.error("Failed to start API", error);
  process.exit(1);
});
