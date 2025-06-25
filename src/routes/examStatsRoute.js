const express = require("express");
const { getExamStats} = require("../controllers/examStatsController");
const { getExamStatsById} = require("../controllers/examStatsController");

const router = express.Router();
// Routes for exam statistics
router.get("/exams", getExamStats);
router.get('/exams/:examId', getExamStatsById);
module.exports = router;