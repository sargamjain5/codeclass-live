import mongoose from "mongoose";

const MeetingSchema = new mongoose.Schema({
  tutorName: { type: String, required: true },
  sessionId: { type: String, required: true, unique: true },
  password: { type: String }, // Optional password
  startTime: { type: Date, required: true },
  status: { type: String, enum: ["scheduled", "live", "ended"], default: "scheduled" },
  createdAt: { type: Date, default: Date.now },
});

export const Meeting = mongoose.models.Meeting || mongoose.model("Meeting", MeetingSchema);