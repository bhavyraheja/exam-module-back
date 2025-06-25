const express = require("express");
const router = express.Router();
const { createCodeInterview, getCodeInterviewById } = require("../controllers/codeInterviewController");

router.post("/generate", createCodeInterview);
router.get("/:id", getCodeInterviewById);

module.exports = router;
