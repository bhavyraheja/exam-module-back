
const Admin = require("../models/Admin");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/Student");

console.log("dsfghj...............")
const getAllStudents = async (req, res) => {
  try {
    const students = await User.find({}).select("-password"); // Exclude password for security
    res.status(200).json(students);
  } catch (error) {
    res.status(500).json({ message: "Error fetching students", error });
  }
};



// Generate JWT Token
const generateToken =async  (id) => {
  return await jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });
};
 
const registerAdmin = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const adminExists = await Admin.findOne({ email });
    if (adminExists) return res.status(400).json({ message: "Admin already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newAdmin = await Admin.create({ name, email, password: hashedPassword });

    res.status(201).json({
      _id: newAdmin._id,
      name: newAdmin.name,
      email: newAdmin.email,
      token: generateToken(newAdmin._id),
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Admin Login
const loginAdmin = async (req, res) => {
  const { email, password } = req.body;

  try {
    console.log("Admin login attempt for email:", email);
    
    const admin = await Admin.findOne({ email });
    if (!admin) {
      console.log("Login failed: Admin not found with email:", email);
      return res.status(400).json({ message: "Invalid Email or Password" });
    }
    
    console.log("Admin found:", admin.email);
    
    // Check if admin account is active
    if (admin.accessStatus === "Inactive") {
      console.log("Login failed: Admin account is inactive:", email);
      return res.status(403).json({ 
        message: "Your account has been disabled. Please contact the system administrator.",
        accessStatus: "Inactive"
      });
    }
    
    console.log("Comparing provided password with stored hash");
    const isMatch = await bcrypt.compare(password, admin.password);
    console.log("Password match:", isMatch);
    
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid Email or Password" });
    }

    console.log("Creating JWT token including role");
    const token = jwt.sign(
      { id: admin._id, role: admin.role },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    console.log("Login successful for:", admin.email);

    res.json({ 
      message: "Login successful!", 
      token, 
      adminId: admin._id,
      role: admin.role,
      accessStatus: admin.accessStatus // Include the access status in the response
    });
  } catch (error) {
    console.error("Admin login error:", error);
    res.status(500).json({ message: "Server error!", error });
  }
};

// Change Password
const changePassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const adminId = req.user.id; // From authMiddleware

  try {
    const admin = await Admin.findById(adminId);
    if (!admin) return res.status(404).json({ message: "Admin not found" });

    const isMatch = await bcrypt.compare(oldPassword, admin.password);
    if (!isMatch) return res.status(400).json({ message: "Old password is incorrect" });

    admin.password = await bcrypt.hash(newPassword, 10);
    await admin.save();

    res.json({ message: "Password updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};





// Get All Admins
const getAllAdmins = async (req, res) => {
    console.log("vishu")
    try {
      const admins = await Admin.find().select("-password"); // Exclude password for security
      res.status(200).json(admins);
    } catch (error) {
      res.status(500).json({ message: "Error fetching admins", error });
    }
  };

// delete 
  const deleteAdmin = async (req, res) => {
    try {
      const { id } = req.params;
  
      const deletedAdmin = await Admin.findByIdAndDelete(id);
      if (!deletedAdmin) {
        return res.status(404).json({ message: "Admin not found" });
      }
  
      res.status(200).json({ message: "Admin deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Server error", error });
    }
  };


  const getAdminById = async (req, res) => {
    try {
      const { id } = req.params;
      const admin = await Admin.findById(id);
      
      if (!admin) {
        return res.status(404).json({ message: "Admin not found" });
      }
      
      // Don't send the password in the response
      const adminWithoutPassword = {
        _id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        accessStatus: admin.accessStatus,
        questionsCreated: admin.questionsCreated || 0,
        createdDate: admin.createdDate
      };
      
      res.status(200).json(adminWithoutPassword);
    } catch (error) {
      console.error("Error fetching admin:", error);
      res.status(500).json({ message: "Failed to fetch admin details" });
    }
  };
  
  const 
  updateAdmin = async (req, res) => {
    try {
      const { id } = req.params;
      const { name, email, role, accessStatus } = req.body;
      
      // Validate inputs
      if (!name || !email) {
        return res.status(400).json({ message: "Name and email are required" });
      }
      
      // Find and update the admin
      const updatedAdmin = await Admin.findByIdAndUpdate(
        id,
        { name, email, role, accessStatus },
        { new: true, runValidators: true }
      );
      
      if (!updatedAdmin) {
        return res.status(404).json({ message: "Admin not found" });
      }
      
      // Don't send the password in the response
      const adminWithoutPassword = {
        _id: updatedAdmin._id,
        name: updatedAdmin.name,
        email: updatedAdmin.email,
        role: updatedAdmin.role,
        accessStatus: updatedAdmin.accessStatus,
        questionsCreated: updatedAdmin.questionsCreated || 0,
        createdDate: updatedAdmin.createdDate
      };
      
      res.status(200).json(adminWithoutPassword);
    } catch (error) {
      console.error("Error updating admin:", error);
      res.status(500).json({ message: "Failed to update admin" });
    }
  };





module.exports = { registerAdmin, loginAdmin, changePassword, getAllStudents, getAllAdmins, deleteAdmin, getAdminById, updateAdmin};
