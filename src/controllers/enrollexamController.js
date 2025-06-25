const Student = require("../models/Student");
const EntranceExam = require("../models/Exam");


const enrollExam = async (req, res) => {


  try {
    const { examId } = req.params;
    // const studentId = "67b862c8f3acf6c8b2fe14d0"; 
    const {studentId} = req.params;
    
    const exam = await EntranceExam.findById(examId);
    if (!exam) {
      return res.status(404).json({ message: "Exam not found" });
    }

    
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    const alreadyEnrolled = student.exams.some((e) => e.examId.equals(examId));

    if (alreadyEnrolled) {
      return res.status(400).json({ message: "Already enrolled in this exam" });
    }

    
    student.exams.push({ examId, enrollmentDate: new Date() });
    await student.save();

    res.status(200).json({ message: "Enrolled successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};



const getEnrolledExams = async (req, res) => {
    try {
      const {studentId} =  req.params; 

      const student = await Student.findById(studentId).populate("exams.examId");
      if (!student) {
        return res.status(404).json({ message: "Student not found" });
      }
  
      const enrolledExams = student.exams.map((e) => ({
        examId: e.examId._id,
        examName: e.examId.examName,
        enrollmentDate: e.enrollmentDate,
        examDateRange: e.examId.examDateRange,
        status: e.examId.activeStatus,
        image: e.examId.image,
      }));


      
  
      res.status(200).json({ enrolledExams });
    } catch (error) {
      res.status(500).json({ message: "Server error", error: error.message });
    }
  };


module.exports = { enrollExam, getEnrolledExams };
