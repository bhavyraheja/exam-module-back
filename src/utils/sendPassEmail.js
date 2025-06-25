const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail", 
  auth: {
    user: "vishumark45@gmail.com", 
    pass: "vheypdprivzgqaeh", 
  },
});

const sendPassEmail = async (studentEmail, studentName, studentPassword) => {
  try {
    const mailOptions = {
      from: '"Exam Notification" <vishumark45@gmail.com>',
      to:  `${studentEmail}`, // hard coded 
      subject: `${studentName} login Password`,
      text: `Dear ${studentName},\n\nYour password to login exam module ${studentPassword}`,    
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`Email sent successfully: ${info.messageId}`);
    return info.messageId;
  } catch (error) {
    console.error(`Error sending email: ${error.message}`);
    throw error;
  }
};


module.exports = { sendPassEmail };
