const mongoose = require("mongoose");

const mediaSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    courseId: { type: String, required: true },
    chapterId: { type: String, required: true },
    mediaUrl: { type: String, required: true },
    mediaType: { type: String, default: "VIDEO" },
    status: { type: String, default: "pending" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Media", mediaSchema);
