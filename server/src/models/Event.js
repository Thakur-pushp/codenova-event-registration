import mongoose from "mongoose";

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    schedule: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    capacity: { type: Number, required: true, min: 1 },
    domain: { type: String, default: "Technology", trim: true }
  },
  { timestamps: true }
);

export default mongoose.model("Event", eventSchema);
