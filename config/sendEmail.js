const nodemailer =
  require("nodemailer");

const sendEmail = async (to, subject, html) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject,
      html,
    });

  } catch (error) {
    console.log("❌ Email Error:", error.message); // sirf message nahi, poora error dekho
    throw error; // temporarily throw karo taaki pata chale
  }
};

module.exports = sendEmail;