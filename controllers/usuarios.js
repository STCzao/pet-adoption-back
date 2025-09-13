const { response } = require("express");
const bcryptjs = require("bcryptjs");
const Usuario = require("../models/usuario");

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

  res.json({
    total,
    usuarios,
  });
};

const usuariosPost = async (req, res = response) => {
  const { nombre, correo, password, rol, telefono, direccion } = req.body;
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

  res.json({
    usuario,
  });
};

const usuariosPut = async (req, res = response) => {
  const { id } = req.params;
  const { _id, password, correo, ...resto } = req.body;

  if (password) {
    const salt = bcryptjs.genSaltSync();
    resto.password = bcryptjs.hashSync(password, salt);
  }

  const usuario = await Usuario.findByIdAndUpdate(id, resto, { new: true });

  res.json(usuario);
};

const usuariosDelete = async (req, res = response) => {
  const { id } = req.params;

  //Solo admin puede eliminar usuarios
  const usuario = await Usuario.findByIdAndUpdate(
    id,
    { estado: false },
    { new: true }
  );

  res.json({
    msg: "Usuario eliminado correctamente",
    usuario,
  });
};

const usuarioGet = async (req, res = response) => {
  const { id } = req.params;
  const usuario = await Usuario.findById(id).select(
    "nombre correo telefono direccion rol estado"
  );

  res.json(usuario);
};

const usuariosDashboard = async (req, res = response) => {
  //Solo el usuario mismo o admin puede ver el dashboard
  const { id } = req.params;

  if (req.usuario.rol !== "ADMIN_ROLE" && req.usuario._id.toString() !== id) {
    return res.status(403).json({
      msg: "No tiene permisos para acceder a este dashboard",
    });
  }

  const usuario = await Usuario.findById(id).select("-password");
  res.json(usuario);
};

module.exports = {
  usuariosGet,
  usuariosPost,
  usuariosPut,
  usuariosDelete,
  usuarioGet,
  usuariosDashboard,
};
