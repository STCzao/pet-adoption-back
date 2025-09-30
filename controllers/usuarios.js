const { response } = require("express");
const bcryptjs = require("bcryptjs");
const Usuario = require("../models/usuario");

// ----------------- OBTENER USUARIOS ---------------------
const usuariosGet = async (req, res = response) => {
  const { limite = 5, desde = 0 } = req.query;
  const query = { estado: true };

  const [total, usuarios] = await Promise.all([
    Usuario.countDocuments(query),
    Usuario.find(query)
      .select("-password")
      .skip(Number(desde))
      .limit(Number(limite)),
  ]);

  res.json({ total, usuarios });
};

// ----------------- CREAR USUARIO ------------------------
const usuariosPost = async (req, res = response) => {
  const { nombre, correo, password, rol, telefono, direccion } = req.body;

  if (password.length < 6 || password.length > 15) {
    return res.status(400).json({
      msg: "La contraseña debe tener entre 6 y 15 caracteres",
    });
  }

  try {
    const usuario = new Usuario({
      nombre,
      correo,
      password,
      rol: rol || "USER_ROLE",
      telefono,
      direccion,
    });

    const salt = bcryptjs.genSaltSync();
    usuario.password = bcryptjs.hashSync(password, salt);

    await usuario.save();

    res.json({ usuario });
  } catch (error) {
    if (error.code === 11000) {
      return res
        .status(400)
        .json({ msg: `El correo ${correo} ya está registrado` });
    }

    console.error(error);
    res.status(500).json({ msg: "Error al registrar usuario" });
  }
};

// ----------------- ACTUALIZAR USUARIO -------------------
const usuariosPut = async (req, res = response) => {
  const { id } = req.params;
  const { _id, password, google, correo, ...resto } = req.body;

  if (req.usuario.rol !== "ADMIN_ROLE" && req.usuario._id.toString() !== id) {
    return res
      .status(403)
      .json({ msg: "No tiene permisos para modificar este usuario" });
  }

  if (password) {
    if (password.length < 6 || password.length > 15) {
      return res.status(400).json({
        msg: "La contraseña debe tener entre 6 y 15 caracteres",
      });
    }
    const salt = bcryptjs.genSaltSync();
    resto.password = bcryptjs.hashSync(password, salt);
  }

  const usuario = await Usuario.findByIdAndUpdate(id, resto, { new: true });
  res.json(usuario);
};

// ----------------- ELIMINAR USUARIO --------------------
const usuariosDelete = async (req, res = response) => {
  const { id } = req.params;

  if (req.usuario.rol !== "ADMIN_ROLE") {
    return res
      .status(403)
      .json({ msg: "No tiene permisos para eliminar usuarios" });
  }

  const usuario = await Usuario.findByIdAndUpdate(
    id,
    { estado: false },
    { new: true }
  );
  res.json({ msg: "Usuario eliminado correctamente", usuario });
};

// ----------------- OBTENER USUARIO POR ID ----------------
const usuarioGet = async (req, res = response) => {
  const { id } = req.params;

  if (req.usuario.rol !== "ADMIN_ROLE" && req.usuario._id.toString() !== id) {
    return res
      .status(403)
      .json({ msg: "No tiene permisos para ver este usuario" });
  }

  const usuario = await Usuario.findById(id).select(
    "nombre correo telefono direccion rol estado"
  );
  res.json(usuario);
};

// ----------------- DASHBOARD USUARIO -------------------
const usuariosDashboard = async (req, res = response) => {
  const { id } = req.params;

  if (req.usuario.rol !== "ADMIN_ROLE" && req.usuario._id.toString() !== id) {
    return res
      .status(403)
      .json({ msg: "No tiene permisos para acceder a este dashboard" });
  }

  const usuario = await Usuario.findById(id).select("-password");
  res.json(usuario);
};

// ----------------- PERFIL PROPIO ----------------------
const miPerfilGet = async (req, res = response) => {
  const usuario = await Usuario.findById(req.usuario._id).select("-password");
  res.json(usuario);
};

const miPerfilPut = async (req, res = response) => {
  const { password, google, correo, rol, ...resto } = req.body;

  if (rol && req.usuario.rol !== "ADMIN_ROLE") {
    return res.status(403).json({ msg: "No puede cambiar su rol" });
  }

  if (password) {
    if (password.length < 6 || password.length > 15) {
      return res.status(400).json({
        msg: "La contraseña debe tener entre 6 y 15 caracteres",
      });
    }
    const salt = bcryptjs.genSaltSync();
    resto.password = bcryptjs.hashSync(password, salt);
  }

  const usuario = await Usuario.findByIdAndUpdate(req.usuario._id, resto, {
    new: true,
  }).select("-password");
  res.json(usuario);
};

module.exports = {
  usuariosGet,
  usuariosPost,
  usuariosPut,
  usuariosDelete,
  usuarioGet,
  usuariosDashboard,
  miPerfilGet,
  miPerfilPut,
};
