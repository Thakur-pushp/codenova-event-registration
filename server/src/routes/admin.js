import { Router } from "express";
import Registration from "../models/Registration.js";
import { requireAdmin } from "../middleware/adminAuth.js";

const router = Router();

router.get("/registrations", requireAdmin, async (req, res, next) => {
  try {
    const search = String(req.query.search || "").trim();
    const filter = {};

    if (search) {
      const safe = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const matchingEvents = await (await import("../models/Event.js")).default
        .find({ title: { $regex: safe, $options: "i" } })
        .select("_id")
        .lean();
      const eventIds = matchingEvents.map((event) => event._id);
      filter.$or = [
        { name: { $regex: safe, $options: "i" } },
        { email: { $regex: safe, $options: "i" } },
        { college: { $regex: safe, $options: "i" } },
        { interests: { $regex: safe, $options: "i" } },
        ...(eventIds.length ? [{ event: { $in: eventIds } }] : [])
      ];
    }

    const registrations = await Registration.find(filter)
      .populate("event", "title schedule capacity")
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      total: registrations.length,
      registrations: registrations.map((item) => ({
        id: item._id,
        name: item.name,
        email: item.email,
        college: item.college,
        interests: item.interests,
        createdAt: item.createdAt,
        event: item.event
          ? { id: item.event._id, title: item.event.title, schedule: item.event.schedule, capacity: item.event.capacity }
          : null
      }))
    });
  } catch (error) {
    next(error);
  }
});

export default router;
