const sgMail = require("@sendgrid/mail");

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const enviarEmail = async (to, subject, html) => {
  console.log("Enviando correo a:", to);
  console.log("From:", process.env.SENDGRID_FROM);
  console.log("Subject:", subject);

  const msg = {
    to,
    from: process.env.SENDGRID_FROM,
    subject,
    html,
  };

  try {
    await sgMail.send(msg);
    console.log("Correo enviado correctamente a:", to);
  } catch (error) {
    console.error("Error al enviar correo:", error);
    if (error.response) {
      console.error("SendGrid response body:", error.response.body);
    }
    throw error; // Lanzar el error para verlo en Render
  }
};

module.exports = { enviarEmail };
