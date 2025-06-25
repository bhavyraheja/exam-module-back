const mongoose = require("mongoose");

const CodeInterviewSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: [true, "Please provide a student ID"],
    },
    title: {
      type: String,
      required: [true, "Please provide a question title"],
      trim: true,
    },
    field: {
      type: String,
      enum: ["arrays", "strings", "linked-lists", "trees", "graphs", "math", "dynamic-programming", "recursion", "other"],
      required: [true, "Please specify the question field"],
    },
    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      required: [true, "Please specify difficulty level"],
    },
    question: {
      type: String,
      required: [true, "Please provide the question description"],
    },
    testCases: [
      {
        input: {
          type: String,
          required: true,
        },
        expectedOutput: {
          type: String,
          required: true,
        },
      },
    ],
    boilerplate: {
      type: Map,
      of: String, // e.g., { "python": "def solution():", "javascript": "function solution() {}", ... }
      default: {},
    },
    result: {
      type: Object,
      default: {}, // Can hold verdict, execution time, errors, etc.
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("CodeInterview", CodeInterviewSchema);
