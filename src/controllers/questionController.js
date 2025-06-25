const Question = require("../models/Question");

exports.importQuestions = async (req, res) => {
  try {
    const { questions } = req.body;

    if (!questions || questions.length === 0) {
      return res.status(400).json({ message: "No questions provided!" });
    }

    // Save questions to MongoDB
    await Question.insertMany(questions);

    res.json({ message: "Questions imported successfully!", count: questions.length });
  } catch (error) {
    console.error("Import error:", error);
    res.status(500).json({ message: "Server error!", error });
  }
};

exports.deleteQuestionById = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedQuestion = await Question.findByIdAndDelete(id);

    if (!deletedQuestion) {
      return res.status(404).json({ message: "Question not found" });
    }

    res.status(200).json({ message: "Question deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};


exports.getAllQuestions = async (req, res) => {
    try {
      const questions = await Question.find();
      res.status(200).json(questions);
    } catch (error) {
      res.status(500).json({ error: "Error fetching questions" });
    }
  };
