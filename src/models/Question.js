const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  questionDescription: { type: String, required: true },
  entranceExam: [{ type: String }], // e.g., ["BTech", "BCA"]
  questionCategory: [{ type: String }], // e.g., ["Maths", "English"]
  questionSubCategory: [{ type: String }], // e.g., ["Maths-Addition", "English-Verb"]
  responseOptions: [{ type: String }], // e.g., ["24", "28", "31", "35"]
  correctAnswerIndex: { type: Number, required: true },
  questionMarks: { type: Number, required: true },
  complexity: { type: String, enum: ["Simple", "Moderate", "Hard"], required: true },
  negativeScore: { type: Number, required: true },
  status: { type: String, enum: ["Active", "Deactive"], default: "Active" },
});

module.exports = mongoose.model('Question', questionSchema);