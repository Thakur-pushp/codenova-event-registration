import "dotenv/config";
import mongoose from "mongoose";
import Event from "./models/Event.js";

const sampleEvents = [
  {
    title: "CodeNova Buildathon",
    schedule: "2026-11-15 · 10:00 AM – 5:00 PM",
    description: "Build a useful prototype with a team, get feedback, and present your idea.",
    capacity: 120,
    domain: "Web Development"
  },
  {
    title: "AI & Data Science Meetup",
    schedule: "2026-11-21 · 11:00 AM – 2:00 PM",
    description: "Explore practical machine learning, data workflows, and beginner-friendly demos.",
    capacity: 80,
    domain: "AI / Data Science"
  },
  {
    title: "Open Source Starter Workshop",
    schedule: "2026-11-28 · 9:30 AM – 12:30 PM",
    description: "Learn Git basics, make your first contribution, and collaborate on real projects.",
    capacity: 60,
    domain: "Open Source"
  }
];

try {
  if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI is missing. Create server/.env first.");
  await mongoose.connect(process.env.MONGODB_URI);
  const count = await Event.countDocuments();
  if (count === 0) {
    await Event.insertMany(sampleEvents);
    console.log("Sample events added.");
  } else {
    console.log(`Database already contains ${count} event(s); seed skipped.`);
  }
} catch (error) {
  console.error("Seed failed:", error.message);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
