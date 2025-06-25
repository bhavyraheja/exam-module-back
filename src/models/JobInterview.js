const mongoose = require("mongoose");

const JobInterviewSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student", // Make sure you have a corresponding Student model
      required: [true, "Please provide a student ID"],
    },
    jobRole: {
      type: String,
      required: [true, "Please add a job role"],
      trim: true,
    },
    techStack: {
      type: String,
      required: [true, "Please add a tech stack"],
      trim: true,
    },
    experience: {
      type: String,
      required: [true, "Please add an experience level"],
      trim: true,
    },
    questions: [
      {
        question: {
          type: String,
          required: true,
        },
        answer: {
          type: String,
          default: "", // Answer will be filled later
        },
        feedback: {
          type: String,
          default: "", // Optional feedback per question
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("JobInterview", JobInterviewSchema);
