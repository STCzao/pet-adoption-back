const { response } = require("express");
const bcryptjs = require("bcryptjs");
const crypto = require("crypto");
const Usuario = require("../models/usuario");
const { generarJWT } = require("../helpers/generar-jwt");
const { enviarEmail } = require("../helpers/enviar-mails");

// ------------------------- LOGIN -------------------------
const login = async (req, res = response) => {
  const { correo, password } = req.body;

  try {
    const usuario = await Usuario.findOne({ correo });
    if (!usuario || !usuario.estado) {
      return res
        .status(400)
        .json({ msg: "El usuario o la contraseña no coinciden" });
    }

    const validPassword = bcryptjs.compareSync(password, usuario.password);
    if (!validPassword) {
      return res
        .status(400)
        .json({ msg: "El usuario o la contraseña no coinciden" });
    }

    const token = await generarJWT(usuario.id);

    res.json({ usuario, token });
  } catch (error) {
    console.log("Error en login:", error);
    return res.status(500).json({ msg: "Hable con el administrador" });
  }
};

// ----------------- FORGOT PASSWORD ----------------------
const forgotPassword = async (req, res = response) => {
  const { correo } = req.body;
  console.log("Solicitud de recuperación para correo:", correo);

  try {
    const usuario = await Usuario.findOne({ correo });
    if (!usuario) {
      console.log("Usuario no encontrado:", correo);
      return res.status(400).json({ msg: "Usuario no encontrado" });
    }

    const token = crypto.randomBytes(32).toString("hex");
    const exp = Date.now() + 3600000; // 1 hora

    usuario.resetToken = token;
    usuario.resetTokenExp = exp;
    await usuario.save();
    console.log("Token generado para usuario:", usuario.correo);

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${token}`;
    console.log("URL de reset:", resetUrl);

    await enviarEmail(
      usuario.correo,
      "Recuperar contraseña",
      `<p>Hola ${usuario.nombre},</p>
       <p>Haz click en el siguiente enlace para restablecer tu contraseña:</p>
       <a href="${resetUrl}" target="_blank">${resetUrl}</a>
       <p>Este enlace expirará en 1 hora.</p>`
    );

    res.json({
      msg: "Se envió un correo para restablecer la contraseña (verifica la casilla de Spam)",
    });
  } catch (error) {
    console.log("Error en forgotPassword:", error);
    res.status(500).json({ msg: "Error en el servidor" });
  }
};

// ----------------- RESET PASSWORD -----------------------
const resetPassword = async (req, res = response) => {
  const { token } = req.params;
  const { password } = req.body;

  try {
    const usuario = await Usuario.findOne({
      resetToken: token,
      resetTokenExp: { $gt: Date.now() },
    });

    if (!usuario) {
      return res.status(400).json({ msg: "Token inválido o expirado" });
    }

    const salt = bcryptjs.genSaltSync(10);
    usuario.password = bcryptjs.hashSync(password, salt);

    usuario.resetToken = undefined;
    usuario.resetTokenExp = undefined;
    await usuario.save();

    res.json({ msg: "Contraseña actualizada correctamente" });
  } catch (error) {
    console.log("Error en resetPassword:", error);
    res.status(500).json({ msg: "Error en el servidor" });
  }
};

module.exports = {
  login,
  forgotPassword,
  resetPassword,
};
