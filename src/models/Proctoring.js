const mongoose = require("mongoose");

const proctoringSchema = new mongoose.Schema({
  exam: { type: mongoose.Schema.Types.ObjectId, ref: "Exam", required: true },
  student: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
  tabSwitchCount: { type: Number, default: 0 },  // Number of times student switched tabs
  alerts: [{ type: String }], // ["Tab switched", "Suspicious movement"]
  capturedImages: [{ type: String }], // Image URLs stored in AWS S3/Cloudinary
  status: { type: String, enum: ["pending", "approved", "flagged"], default: "pending" },
}, { timestamps: true });

module.exports = mongoose.model("Proctoring", proctoringSchema);
