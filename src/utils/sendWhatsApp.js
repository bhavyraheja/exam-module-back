const twilio = require("twilio");

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;

const client = twilio(accountSid, authToken);

const sendWhatsAppMessage = async (mobileNumber, examName, score, result, user) => {
  try {
    const message = await client.messages.create({
      from: "whatsapp:+14155238886", // Use Twilio sandbox WhatsApp number
      to: `whatsapp: ${mobileNumber}`, // hard coded
      body: `🎉 *Exam Result Notification* 🎯\n\n✅ *Exam:* ${examName}\n📚 *Score:* ${score}\n🏆 *Result:* ${result}\n\nThank you ${user} for taking the exam! 🎓`,
    });

    console.log(`WhatsApp message sent successfully: ${message.sid}`);
    return message.sid;
  } catch (error) {
    console.error("Failed to send WhatsApp message:", error.message);
    throw error;
  }
};

module.exports = { sendWhatsAppMessage };
