import { Router } from "express";
import mongoose from "mongoose";
import Event from "../models/Event.js";
import Registration from "../models/Registration.js";

const router = Router();

router.get("/", async (_req, res, next) => {
  try {
    const events = await Event.find().sort({ schedule: 1 }).lean();
    const counts = await Registration.aggregate([
      { $group: { _id: "$event", count: { $sum: 1 } } }
    ]);
    const countMap = new Map(counts.map((item) => [String(item._id), item.count]));

    res.json(events.map((event) => {
      const registered = countMap.get(String(event._id)) || 0;
      return {
        ...event,
        registered,
        available: Math.max(0, event.capacity - registered),
        isFull: registered >= event.capacity
      };
    }));
  } catch (error) {
    next(error);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid event ID." });
    }
    const event = await Event.findById(req.params.id).lean();
    if (!event) return res.status(404).json({ message: "Event not found." });

    const registered = await Registration.countDocuments({ event: event._id });
    res.json({
      ...event,
      registered,
      available: Math.max(0, event.capacity - registered),
      isFull: registered >= event.capacity
    });
  } catch (error) {
    next(error);
  }
});

router.post("/:id/register", async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid event ID." });
    }

    const { name, email, college, interests } = req.body;
    if (
      typeof name !== "string" || !name.trim() ||
      typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) ||
      typeof college !== "string" || !college.trim() ||
      !Array.isArray(interests) || interests.length === 0 ||
      interests.some((item) => typeof item !== "string")
    ) {
      return res.status(400).json({
        message: "Enter a valid name, email, college/organization, and at least one interest."
      });
    }

    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: "Event not found." });

    const emailNormalized = email.trim().toLowerCase();
    const alreadyRegistered = await Registration.exists({
      event: event._id,
      email: emailNormalized
    });
    if (alreadyRegistered) {
      return res.status(409).json({
        message: "This email is already registered for this event. Use a different event or email."
      });
    }

    // Check capacity immediately before insert. For high-traffic production use,
    // capacity reservation should be made atomic with a transaction/conditional update.
    const currentCount = await Registration.countDocuments({ event: event._id });
    if (currentCount >= event.capacity) {
      return res.status(409).json({ message: "Sorry, this event is full." });
    }

    try {
      const registration = await Registration.create({
        event: event._id,
        name: name.trim(),
        email: emailNormalized,
        college: college.trim(),
        interests: [...new Set(interests.map((x) => x.trim()).filter(Boolean))]
      });
      return res.status(201).json({
        message: "Registration successful!",
        registrationId: registration._id,
        registered: currentCount + 1,
        available: Math.max(0, event.capacity - currentCount - 1)
      });
    } catch (error) {
      // Handles two simultaneous requests that pass the pre-check together.
      if (error?.code === 11000) {
        return res.status(409).json({
          message: "This email is already registered for this event."
        });
      }
      throw error;
    }
  } catch (error) {
    next(error);
  }
});

export default router;
