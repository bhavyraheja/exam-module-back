const Media = require("../models/Proctoring");
const fs = require("fs");
const path = require("path");

// Handle file upload locally
const uploadMedia = async (req, res) => {
  const { id, courseId, chapterId } = req.body;

  if (!req.files || !req.files.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  const file = req.files.file;
  const uploadPath = path.join(__dirname, "../uploads", file.name);

  // Save the file locally
  file.mv(uploadPath, async (err) => {
    if (err) {
      console.error("File upload error:", err);
      return res.status(500).json({ message: "File upload failed" });
    }

    // // Save media information to DB
    // const media = new Media({
    //   userId,
    //   courseId,
    //   chapterId,
    //   mediaUrl: `/uploads/${file.name}`,
    //   mediaType: "VIDEO",
    // });

    // await media.save();
    res.status(201).json({ message: "Media uploaded successfully!"});
  });
};

module.exports = { uploadMedia };
