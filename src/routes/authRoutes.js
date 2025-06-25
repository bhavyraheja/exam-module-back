// src/routes/authRoutes.js
const express = require("express");
const { changePassword } = require("../controllers/changePassword");
const router = express.Router();

// Public route that doesn't require authentication middleware
router.post("/change-password", changePassword);

// Keep the authenticated version if you still need it
// router.post("/change-password-authenticated", authenticateUser, originalChangePassword);

console.log("Password change routes registered successfully");

module.exports = router;