const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  mobile: { type: String, required: true },
  dob: { type: Date, required: true },
  qualification: { type: String, required: true },
  password: { type: String, required: true }, // Added password field
  registeredDate: { type: Date, default: Date.now },
  examStatus: { type: String, default: "Not Attempted" },
  systemAccessStatus: { type: String, default: "Active" },
  counselingStatus: { type: String, default: "Pending" },
  photo: { type: String },
  exams: [
    {
      examId: { type: mongoose.Schema.Types.ObjectId, ref: "EntranceExam" },
      enrollmentDate: { type: Date },
      result: { type: String },
      score: { type: Number },
    },
  ],
});

module.exports = mongoose.model("Student", studentSchema);



