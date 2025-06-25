const Student = require("../models/Student");
const EntranceExam = require("../models/Exam");

// @desc    Get statistics for all exams
// @route   GET /api/stats/exams
// @access  Private (Admin)
// @desc    Get statistics for all exams
// @route   GET /api/stats/exams
// @access  Private (Admin)
// Get Exam Statistics
const getExamStats = async (req, res) => {
  try {
    // 1. Get all exams
    const exams = await EntranceExam.find();
    // 2. Get all students
    const students = await Student.find();

    // Get the number of exams and students
    const numberOfStudents = students.length;
    const numberOfExams = exams.length;

    // 3. Extract just exam ID and name
    const examsList = exams.map((exam) => {
      return {
        examId: exam._id,
        examName: exam.examName,
      };
    });

    // 4. Return the simplified response
    res.status(200).json({
      success: true,
      totalStudentsSignup: numberOfStudents,
      totalExamsCreated: numberOfExams,
      exams: examsList,
    });
  } catch (error) {
    console.error("Error fetching exam stats:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// @desc    Get statistics for a specific exam
// @route   GET /api/stats/exams/:examId
// @access  Private (Admin)
const getExamStatsById = async (req, res) => {
  try {
    const { examId } = req.params;

    // 1. Get the specific exam
    const exam = await EntranceExam.findById(examId);

    if (!exam) {
      return res.status(404).json({
        success: false,
        message: "Exam not found",
      });
    }

    // 2. Get all students
    const students = await Student.find();

    // 3. Calculate statistics for this exam
    let registeredCount = 0;
    let passedCount = 0;
    let failedCount = 0;
    let notAttemptedCount = 0;

    // Process each student
    students.forEach((student) => {
      // Find if student has this exam
      const examEntry = student.exams.find(
        (e) => e.examId.toString() === examId
      );

      if (examEntry) {
        // Count registered students
        registeredCount++;

        // Check exam status
        if (examEntry.score !== undefined && examEntry.score !== null) {
          // Exam was attempted
          if (examEntry.result === "Pass") {
            passedCount++;
          } else if (examEntry.result === "Fail") {
            failedCount++;
          }
        } else {
          // Enrolled but not attempted yet
          notAttemptedCount++;
        }
      }
    });

    // Calculate pass rate
    const attemptedCount = passedCount + failedCount;
    const passRate =
      attemptedCount > 0 ? Math.round((passedCount / attemptedCount) * 100) : 0;

    // 4. Get additional exam details for more comprehensive reporting
    const studentDetails = students
      .filter((student) =>
        student.exams.some((e) => e.examId.toString() === examId)
      )
      .map((student) => {
        const examEntry = student.exams.find(
          (e) => e.examId.toString() === examId
        );
        return {
          studentId: student._id,
          studentName: `${student.firstName} ${student.lastName}`,
          email: student.email,
          score: examEntry.score,
          result: examEntry.result,
          attemptDate: examEntry.attemptDate,
          enrollmentDate: examEntry.enrollmentDate,
          status:
            examEntry.score !== undefined && examEntry.score !== null
              ? "Attempted"
              : "Not Attempted",
        };
      });

    // 5. Return the response
    res.status(200).json({
      success: true,
      examDetails: {
        _id: exam._id,
        examName: exam.examName,
        description: exam.description,
        duration: exam.duration,
        totalMarks: exam.totalMarks,
        passingMarks: exam.passingMarks,
        activeStatus: exam.activeStatus,
        createdAt: exam.createdAt,
      },
      examStats: {
        registered: registeredCount,
        passed: passedCount,
        failed: failedCount,
        notAttempted: notAttemptedCount,
        passRate: passRate,
        chartData: [
          { name: "Passed", value: passedCount, color: "#22C55E" },
          { name: "Failed", value: failedCount, color: "#EF4444" },
          { name: "Not Attempted", value: notAttemptedCount, color: "#94A3B8" },
        ],
      },
      studentDetails,
    });
  } catch (error) {
    console.error("Error fetching exam stats by ID:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

module.exports = { getExamStats, getExamStatsById };
