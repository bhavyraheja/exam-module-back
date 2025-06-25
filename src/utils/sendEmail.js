const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail", 
  auth: {
    user: "vishumark45@gmail.com", 
    pass: "vheypdprivzgqaeh", 
  },
});

const sendEmail = async (studentEmail, studentName, examName, score, result) => {
  try {
    const mailOptions = {
      from: '"Exam Notification" <vishumark45@gmail.com>',
      to:  `${studentEmail}`, // hard coded 
      subject: `Result for ${examName}`,
      text: `Dear ${studentName},\n\nYour result for the exam "${examName}" is now available.\n\nScore: ${score}\nResult: ${result}\n\nBest of luck!\nExam Cell`,    
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`Email sent successfully: ${info.messageId}`);
    return info.messageId;
  } catch (error) {
    console.error(`Error sending email: ${error.message}`);
    throw error;
  }
};






module.exports = { sendEmail };
