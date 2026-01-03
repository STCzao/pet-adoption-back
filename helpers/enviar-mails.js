const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

const enviarEmail = async (to, subject, html) => {
  console.log("Enviando correo a:", to);
  console.log("From:", process.env.RESEND_FROM);
  console.log("Subject:", subject);

  try {
    const data = await resend.emails.send({
      from: process.env.RESEND_FROM, 
      to: to,
      subject: subject,
      html: html,
    });

    console.log("Correo enviado correctamente:", data);
  } catch (error) {
    console.error("Error al enviar correo:", error);

    if (error?.response) {
      console.error("Resend error response:", error.response);
    }

    throw error;
  }
};

module.exports = { enviarEmail };
