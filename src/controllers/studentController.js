const Student = require("../models/Student");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { sendPassEmail } = require("../utils/sendPassEmail");

// Signup Student
exports.signupStudent = async (req, res) => {
  const { name, email, mobile, dob, qualification, password } = req.body;

  try {
    let student = await Student.findOne({ email });
    if (student) {
      return res.status(400).json({ message: "Email already registered." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    student = new Student({
      name,
      email,
      mobile,
      dob,
      qualification,
      password: hashedPassword,
    });

    await student.save();

    // Send password via email (original password, not hashed)
    await sendPassEmail(email, name, password);

    res.status(201).json({ message: "Signup successful! Password sent to email.", student });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ message: "Server error!", error: error.message });
  }
};

// Login Student
exports.loginStudent = async (req, res) => {
  const { email, password } = req.body;

  try {
    console.log("Login attempt for email:", email);
    
    const student = await Student.findOne({ email });
    if (!student) {
      console.log("Login failed: Student not found with email:", email);
      return res.status(400).json({ message: "Invalid Email or Password" });
    }
    
    console.log("Student found:", student.email);
    
    console.log("Comparing provided password with stored hash");
    const isMatch = await bcrypt.compare(password, student.password);
    console.log("Password match:", isMatch);
    
    if (!isMatch) return res.status(400).json({ message: "Invalid Email or Password" });

    console.log("Creating JWT token");
    const token = jwt.sign({ id: student._id }, process.env.JWT_SECRET, { expiresIn: "24h" });
    console.log("Login successful for:", student.email);

    res.json({ message: "Login successful!", token, studentId: student._id });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error!", error });
  }
};

// Logout Student (Clear Token)
exports.logoutStudent = async (req, res) => {
  res.json({ message: "Logout successful!" });
};

// Change Password
// In your changePassword endpoint:
exports.changePassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  
  try {
    console.log("Change password request received");
    console.log("req.student:", req.student);
    const studentId = req.student.id;
    console.log("Looking up student with ID:", studentId);
    
    const student = await Student.findById(studentId);
    if (!student) {
      console.log("Student not found");
      return res.status(404).json({ message: "Student not found" });
    } 
    console.log("Found student:", student.email);
    console.log("Comparing old password");
    const isMatch = await bcrypt.compare(oldPassword, student.password);
    console.log("Old password match:", isMatch);
    
    if (!isMatch) return res.status(400).json({ message: "Old password is incorrect" });
    student.password = newPassword;
    const savedStudent = await student.save();
    console.log("Password updated in database for:", savedStudent.email);
    
    res.json({ message: "Password changed successfully!" });
  } catch (error) {
    console.error("Change password error:", error);
    res.status(500).json({ message: "Server error!", error });
  }
};


// Fetch Student by ID
exports.getStudentById = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id).select("-password"); // omit password
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }
    res.json(student);
  } catch (error) {
    console.error("Error fetching student:", error);
    res.status(500).json({ message: "Server error!", error });
  }
};
