const express = require("express");
const { changePassword } = require("../controllers/changePassword");
const router = express.Router();

router.post("/change-password", changePassword);


console.log("Password change routes registered successfully");

module.exports = router;