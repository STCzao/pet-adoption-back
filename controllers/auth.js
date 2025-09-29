const { response } = require("express");
const bcryptjs = require("bcryptjs");
const crypto = require("crypto");
const Usuario = require("../models/usuario");
const { generarJWT } = require("../helpers/generar-jwt");
const { enviarEmail } = require("../helpers/enviar-email"); // helper que creamos para mandar mails

const login = async (req, res = response) => {
  const { correo, password } = req.body;

  try {
    const usuario = await Usuario.findOne({ correo });
    if (!usuario || !usuario.estado) {
      return res
        .status(400)
        .json({ msg: "Usuario / Password no son correctos" });
    }

    const validPassword = bcryptjs.compareSync(password, usuario.password);
    if (!validPassword) {
      return res
        .status(400)
        .json({ msg: "Usuario / Password no son correctos" });
    }

    const token = await generarJWT(usuario.id);

    res.json({ usuario, token });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ msg: "Hable con el administrador" });
  }
};

// -------------------------------------------------------
// Solicitar recuperacion de contraseña
const forgotPassword = async (req, res = response) => {
  const { correo } = req.body;

  try {
    const usuario = await Usuario.findOne({ correo });
    if (!usuario) {
      return res.status(400).json({ msg: "Usuario no encontrado" });
    }

    // Generar token
    const token = crypto.randomBytes(32).toString("hex");
    const exp = Date.now() + 3600000; // 1 hora

    usuario.resetToken = token;
    usuario.resetTokenExp = exp;
    await usuario.save();

    // Enviar correo con el token
    await enviarEmail(
      usuario.correo,
      "Recuperar contraseña",
      `Tu token es: ${token}`
    );

    res.json({ msg: "Se envió un correo para restablecer la contraseña" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Error en el servidor" });
  }
};

// -------------------------------------------------------
// Resetear contraseña
const resetPassword = async (req, res = response) => {
  const { token } = req.params;
  const { password } = req.body;

  try {
    const usuario = await Usuario.findOne({
      resetToken: token,
      resetTokenExp: { $gt: Date.now() }, // token valido
    });

    if (!usuario) {
      return res.status(400).json({ msg: "Token inválido o expirado" });
    }

    // Hashear nueva contraseña
    const salt = bcryptjs.genSaltSync(10);
    usuario.password = bcryptjs.hashSync(password, salt);

    usuario.resetToken = undefined;
    usuario.resetTokenExp = undefined;
    await usuario.save();

    res.json({ msg: "Contraseña actualizada correctamente" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Error en el servidor" });
  }
};

module.exports = {
  login,
  forgotPassword,
  resetPassword,
};
