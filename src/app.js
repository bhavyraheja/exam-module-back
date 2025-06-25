require("dotenv").config();
const express = require("express");
const http = require("http");

const cors = require("cors");
const connectDB = require("./config/db");
const fileUpload = require("express-fileupload");
const studentRoutes = require("./routes/studentRoutes");
const questionRoutes = require("./routes/questionRoutes");
const adminRoutes = require("./routes/adminRoutes");
const examRoutes = require("./routes/examRoutes");
const enrollexamRoutes = require("./routes/enrollexamRoutes");
const proctorRoutes = require("./routes/proctorRoutes");
const initSocket = require("./utils/proctoring");
const scoreRoutes = require("./routes/scoreRoutes");
const examStats = require("./routes/examStatsRoute");
const changePassword = require("./routes/authRoutes");
const jobInterviewRoutes = require("./routes/jobInterview")
const codeInterviewRoutes = require("./routes/codeInterviewRoutes");


const app = express();
const PORT = process.env.PORT || 5005;
const server = http.createServer(app);

connectDB();


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(fileUpload());
app.use("/uploads", express.static("uploads"));

app.use("/api/students", studentRoutes);
app.use("/api/questions", questionRoutes);
app.use("/api/admin", adminRoutes); 
app.use("/api/exams", examRoutes);
app.use("/api/enroll",enrollexamRoutes);
app.use("/api/media", proctorRoutes);
app.use("/api/scores", scoreRoutes);
app.use("/api/stats", examStats);
app.use("/api/auth", changePassword)
app.use("/api/interviews",jobInterviewRoutes)
app.use("/api/code-interview", codeInterviewRoutes);



initSocket(server);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));






