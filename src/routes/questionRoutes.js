const express = require("express");
const { importQuestions, getAllQuestions, deleteQuestionById } = require("../controllers/questionController");

const router = express.Router();

// Route to receive JSON questions
router.post("/import", importQuestions);
router.get("/questions", getAllQuestions);
router.delete("/questions/:id", deleteQuestionById
    
);

module.exports = router;
