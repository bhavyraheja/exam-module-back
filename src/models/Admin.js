const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  createdDate: { type: Date, default: Date.now },
  questionsCreated: { type: Number, default: 0 },
  accessStatus: { type: String, enum: ["Active", "Inactive"], default: "Active" },
  role: { type: String, enum: ["admin", "superadmin"], default: "admin" }, // Role added
});

module.exports = mongoose.model('Admin', adminSchema);
