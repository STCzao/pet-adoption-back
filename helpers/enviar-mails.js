const sgMail = require("@sendgrid/mail");

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const enviarEmail = async (to, subject, html) => {
  const msg = {
    to,
    from: process.env.SENDGRID_FROM,
    subject,
    html,
  };

  try {
    await sgMail.send(msg);
    console.log("Correo enviado a:", to);
  } catch (error) {
    console.error("Error al enviar correo:", error);
    if (error.response) {
      console.error(error.response.body);
    }
    throw new Error("No se pudo enviar el correo");
  }
};

module.exports = { enviarEmail };
