const jwt = require("jsonwebtoken");

// Change your middleware to:
const authMiddleware = (req, res, next) => {
  const token = req.header("Authorization");
  if (!token) return res.status(401).json({ message: "Access Denied! No token provided." });
  
  try {
    const verified = jwt.verify(token.replace("Bearer ", ""), process.env.JWT_SECRET);
    // Make sure you're accessing the id property correctly
    console.log("Decoded token:", verified); // Add this to debug
    req.student = verified; // This contains { id: student._id, iat: timestamp, exp: timestamp }
    next();
  } catch (err) {
    console.error("Token verification error:", err);
    res.status(400).json({ message: "Invalid Token" });
  }
};

module.exports = authMiddleware;
