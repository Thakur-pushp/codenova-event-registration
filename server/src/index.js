import "dotenv/config";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import eventsRouter from "./routes/events.js";
import adminRouter from "./routes/admin.js";

const app = express();
const port = Number(process.env.PORT || 5000);

app.use(cors({
  origin: process.env.CLIENT_ORIGIN || "http://localhost:5173"
}));
app.use(express.json({ limit: "20kb" }));

app.get("/api/health", (_req, res) => res.json({ status: "ok" }));
app.use("/api/events", eventsRouter);
app.use("/api/admin", adminRouter);

app.use((err, _req, res, _next) => {
  console.error(err);
  if (err?.name === "ValidationError") {
    return res.status(400).json({ message: "Some submitted fields are invalid." });
  }
  res.status(500).json({ message: "Unexpected server error. Please try again." });
});

async function start() {
  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI is missing. Copy .env.example to .env and configure it.");
  }
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("MongoDB connected.");
  app.listen(port, () => console.log(`API running at http://localhost:${port}`));
}

start().catch((error) => {
  console.error("Could not start server:", error.message);
  process.exit(1);
});
