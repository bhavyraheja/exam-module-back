// controllers/authController.js
const bcrypt = require("bcryptjs");
const Student = require("../models/Student");
const Admin = require("../models/Admin");

exports.changePassword = async (req, res) => {
  const { email, oldPassword, newPassword } = req.body;

  // Validate request body
  if (!email || !oldPassword || !newPassword) {
    return res.status(400).json({ 
      message: "Email, old password, and new password are required" 
    });
  }

  try {
    // First try to find the user in the Admin collection
    let user = await Admin.findOne({ email });
    let userType = user ? (user.role === "superadmin" ? "SuperAdmin" : "Admin") : null;
    let Model = Admin;

    // If not found in Admin, try Student collection
    if (!user) {
      user = await Student.findOne({ email });
      userType = "Student";
      Model = Student;
    }

    // If user not found in either collection
    if (!user) {
      return res.status(404).json({ message: "User not found with this email" });
    }

    // Verify old password
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Old password is incorrect" });
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    res.json({ 
      message: `${userType} password changed successfully!`,
      userType 
    });
  } catch (error) {
    console.error("Change password error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};