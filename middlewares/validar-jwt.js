const { response } = require("express");
const jwt = require("jsonwebtoken");
const Usuario = require("../models/usuario");

const validarJWT = async (req, res = response, next) => {
  const token = req.header("x-token");

  if (!token) {
    return res.status(401).json({
      ok: false,
      msg: "No hay token en la peticion",
    });
  }

  try {
    const { uid } = jwt.verify(token, process.env.SECRETORPRIVATEKEY);

    const usuarioDB = await Usuario.findById(uid);

    if (!usuarioDB) {
      return res.status(401).json({
        msg: "Usuario no existe en DB - Token invalido",
      });
    }

    if (!usuarioDB.estado) {
      return res.status(401).json({
        msg: "Usuario inhabilitado - Token invalido",
      });
    }

    req.usuario = usuarioDB;
    next();
  } catch (error) {
    console.log(error);
    return res.status(401).json({
      ok: false,
      msg: "Token no valido",
    });
  }
};

module.exports = {
  validarJWT,
};
