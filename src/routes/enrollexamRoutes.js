const express = require("express");
const { enrollExam, getEnrolledExams } = require("../controllers/enrollexamController");


const router = express.Router();

router.post("/:studentId/exam/:examId", enrollExam);
router.get("/:studentId", getEnrolledExams);

module.exports = router;
