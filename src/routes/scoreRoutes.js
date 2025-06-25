const express = require("express");
const { getScores, updateScore, addScore } = require("../controllers/scoreController");


const router = express.Router();

router.get("/:id", getScores);
router.post("/:examId", addScore);

router.put("/:examId", updateScore);

module.exports = router;
