import mongoose from "mongoose";

const SessionSchema = new mongoose.Schema({
  title: String,

  tutorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },

  students: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],

  sessionId: String, // Zego room ID

  scheduledAt: Date,

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.Session ||
  mongoose.model("Session", SessionSchema);