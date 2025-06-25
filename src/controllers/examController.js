const EntranceExam = require("../models/Exam");

// ✅ Create Entrance Exam
exports.createExam = async (req, res) => {
  try {
    const { 
      examName, 
      examDateRange, 
      qualificationEligibility, 
      instructions, 
      activeStatus, 
      image, // Now directly receiving the Cloudinary URL from frontend
      createdBy 
    } = req.body;

    console.log("Request Body:", req.body);
    
    // Create new exam object
    const newExam = new EntranceExam({
      examName,
      examDateRange,
      qualificationEligibility,
      instructions,
      activeStatus,
      image, // Use the Cloudinary URL directly
      createdBy: createdBy || "67f8bf49a4768989f9b54dbe" // Default if not provided
    });

    await newExam.save();
    
    console.log("Exam created successfully:", newExam);
    res.status(201).json({ 
      success: true, 
      message: "Exam created successfully",
      exam: newExam 
    });
  } catch (error) {
    console.error("Error creating exam:", error);
    res.status(500).json({ 
      success: false, 
      message: error.message || "Failed to create exam" 
    });
  }
};
  


// exports.getExams = async (req, res) => {
//   try {
//     const exams = await EntranceExam.find().populate("createdBy", "name email");
//     res.status(200).json(exams);
//   } catch (error) {
//     console.error("Error fetching exams:", error);
//     res.status(500).json({ message: error.message });
//   }
// };


// ✅ Get Exams Based on Student Qualification
exports.getExams = async (req, res) => {
  try {
    const { qualification } = req.query; // Get qualification from query
    console.log(qualification);
    console.log("i am here")
    // Check if qualification is provided
    const filter = qualification
      ? {
          qualificationEligibility: {
            $in: [qualification], // ✅ Match at least one qualification
          },
        }
      : {};
    console.log(filter)
    // Fetch exams with qualification match
    const exams = await EntranceExam.find(filter).populate(
      "createdBy",
      "name email"
    );

    console.log(exams)

    res.status(200).json(exams);
  } catch (error) {
    console.error("Error fetching exams:", error);
    res.status(500).json({ message: error.message });
  }
};





// ✅ Get exam by ID
exports.getExamById = async (req, res) => {
  try {
    const exam = await EntranceExam.findById(req.params.id);
    if (!exam) return res.status(404).json({ message: "Exam not found" });
    res.status(200).json(exam);
  } catch (error) {
    console.error("Error fetching exam:", error);
    res.status(500).json({ message: error.message });
  }
};

// ✅ Update Exam
exports.updateExam = async (req, res) => {
  try {
    const updatedExam = await EntranceExam.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedExam) return res.status(404).json({ message: "Exam not found" });

    res.status(200).json(updatedExam);
  } catch (error) {
    console.error("Error updating exam:", error);
    res.status(500).json({ message: error.message });
  }
};

// ✅ Delete Exam
exports.deleteExam = async (req, res) => {
  try {
    const deletedExam = await EntranceExam.findByIdAndDelete(req.params.id);
    if (!deletedExam) return res.status(404).json({ message: "Exam not found" });

    res.status(200).json({ message: "Exam deleted successfully" });
  } catch (error) {
    console.error("Error deleting exam:", error);
    res.status(500).json({ message: error.message });
  }
};
