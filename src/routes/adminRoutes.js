const express = require("express");
const { registerAdmin, loginAdmin, changePassword, getAllStudents, getAllAdmins, deleteAdmin, getAdminById, updateAdmin } = require("../controllers/adminController");

const router = express.Router();
console.log("dsfghj......................???")

router.get("/students", getAllStudents); // GET request to fetch all students
router.post("/register", registerAdmin);  // Create Admin
router.get("/admins", getAllAdmins);  // Create Admin
router.get("/:id", getAdminById);
router.post("/login", loginAdmin);        // Admin Login
router.put("/change-password", changePassword);  // Change Password (Protected)
router.delete("/:id", deleteAdmin); //delete
router.put("/:id", updateAdmin);  



module.exports = router;
