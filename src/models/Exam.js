const mongoose = require("mongoose");

const entranceExamSchema = new mongoose.Schema({
  examName: { type: String, required: true },
  examDateRange: {
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
  },
  qualificationEligibility: [{ type: String }],
  instructions: {
    duration: { type: Number, required: true },
    questionsCount: { type: Number, required: true },
    maxMarks: { type: Number, required: true },
    negativeMarks: { type: Boolean, required: true },
  },
  activeStatus: { type: String, enum: ["Active", "Inactive"], default: "Active" },
  image: { type: String }, // UploadThing image URL
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "Admin", required: true }, // Reference to Admin model
}, { timestamps: true });

module.exports = mongoose.model("EntranceExam", entranceExamSchema);
