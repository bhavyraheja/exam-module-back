const Student = require("../models/Student");
const EntranceExam = require("../models/Exam");
const { sendWhatsAppMessage } = require("../utils/sendWhatsApp");
const { sendEmail }  = require("../utils/sendEmail")

// @desc    Get all exam scores for a student
// @route   GET /api/scores
// @access  Private (Student)
const getScores = async (req, res) => {
  try {
    const {id} = req.params; // Replace with req.user.id after auth setup
    console.log(req.params)

    // ✅ Check if student exists
    const student = await Student.findById(id).populate(
      "exams.examId",
      "examName examDateRange"
    );
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // ✅ Get scores
    const scores = student.exams.map((exam) => ({
      examId: exam.examId._id,
      examName: exam.examId.examName,
      examDateRange: exam.examId.examDateRange,
      score: exam.score,
      result: exam.result,
      enrollmentDate: exam.enrollmentDate,
    }));

    res.status(200).json({ scores });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Add score for a student's exam
// @route   POST /api/scores/:examId
// @access  Private (Admin or System)
const addScore = async (req, res) => {
    console.log(req.body)
  try {
    const { examId } = req.params;
    const { studentId, score } = req.body;

    console.log(examId,  studentId, score)

    // ✅ Check if the student exists
    const student = await Student.findById(studentId).populate(
      "exams.examId",
      "examName"
    );
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // ✅ Check if student is enrolled in the exam
    const examIndex = student.exams.findIndex((exam) =>
      exam.examId.equals(examId)
    );

    if (examIndex === -1) {
      return res
        .status(404)
        .json({ message: "Exam not found for the student" });
    }

    // ✅ Check if score already exists
    if (student.exams[examIndex].score > 0) {
      return res
        .status(400)
        .json({ message: "Score already added for this exam" });
    }

    // ✅ Add score and result
    student.exams[examIndex].score = score;
    student.exams[examIndex].result = score >= 40 ? "Pass" : "Fail";

    await student.save();

    // ✅ Send WhatsApp notification after adding score
    const mobileNumber = `+91${student.mobile}`; // Assuming Indian numbers
    const examName = student.exams[examIndex].examId.examName;
    const result = student.exams[examIndex].result;

    await sendEmail(
      student.email,              // assuming student has an email field
      student.name,               // assuming student has a name field
      examName,
      score,
      result
    );
    
    await sendWhatsAppMessage(mobileNumber, examName, score, result,student.name);

    

    res.status(201).json({
      message: "Score added successfully and WhatsApp notification sent",
      exam: student.exams[examIndex],
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Update student exam score
// @route   PUT /api/scores/:examId
// @access  Private (Admin or System)
const updateScore = async (req, res) => {
  try {
    const { examId } = req.params;
    const { studentId, score } = req.body;

    // ✅ Check if the student exists
    const student = await Student.findById(studentId).populate(
      "exams.examId",
      "examName"
    );
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // ✅ Check if student is enrolled in the exam
    const examIndex = student.exams.findIndex((exam) =>
      exam.examId.equals(examId)
    );

    if (examIndex === -1) {
      return res
        .status(404)
        .json({ message: "Exam not found for the student" });
    }

    // ✅ Update score and result
    student.exams[examIndex].score = score;
    student.exams[examIndex].result = score >= 40 ? "Pass" : "Fail";

    await student.save();

    // ✅ Send WhatsApp notification after updating score
    const mobileNumber = `+91${student.mobile}`; // Assuming Indian numbers
    const examName = student.exams[examIndex].examId.examName;
    const result = student.exams[examIndex].result;

    await sendWhatsAppMessage(mobileNumber, examName, score, result);

    res.status(200).json({
      message: "Score updated successfully and WhatsApp notification sent",
      exam: student.exams[examIndex],
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = { getScores, addScore, updateScore };
