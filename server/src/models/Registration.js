import mongoose from "mongoose";

const registrationSchema = new mongoose.Schema(
  {
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true,
      index: true
    },
    name: { type: String, required: true, trim: true, maxlength: 100 },
    email: { type: String, required: true, trim: true, lowercase: true },
    college: { type: String, required: true, trim: true, maxlength: 150 },
    interests: {
      type: [String],
      required: true,
      validate: {
        validator: (items) => items.length > 0,
        message: "Select at least one domain interest."
      }
    }
  },
  { timestamps: true }
);

// This database constraint is the reliable duplicate guard, including simultaneous requests.
registrationSchema.index({ event: 1, email: 1 }, { unique: true });

export default mongoose.model("Registration", registrationSchema);
