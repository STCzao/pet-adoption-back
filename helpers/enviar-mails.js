const nodemailer = require("nodemailer");

const enviarEmail = async (to, subject, text) => {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  await transporter.sendMail({
    from: `"Mi App" <${process.env.SMTP_USER}>`,
    to,
    subject,
    text,
  });
};

module.exports = { enviarEmail };
