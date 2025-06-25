const express = require("express");
const { signupStudent, loginStudent, logoutStudent, changePassword, submitResult, getStudentById } = require("../controllers/studentController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/signup", signupStudent);
router.post("/login", loginStudent);
router.post("/logout", logoutStudent);
router.put("/change-password", authMiddleware, changePassword);
router.get("/:id", getStudentById);


module.exports = router;
