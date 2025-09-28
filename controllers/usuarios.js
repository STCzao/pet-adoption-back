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

  try {
    const usuario = new Usuario({
      nombre,
      correo,
      password,
      rol: rol || "USER_ROLE",
      telefono,
      direccion,
    });

    // Hashear la contraseña
    const salt = bcryptjs.genSaltSync();
    usuario.password = bcryptjs.hashSync(password, salt);

    // Guardar usuario en la base de datos
    await usuario.save();

    res.json({
      usuario,
    });
  } catch (error) {
    // Manejar correo duplicado
    if (error.code === 11000) {
      return res.status(400).json({
        msg: `El correo ${correo} ya está registrado`,
      });
    }

    console.error(error);
    res.status(500).json({
      msg: "Error al registrar usuario",
    });
  }
};

const usuariosPut = async (req, res = response) => {
  const { id } = req.params;
  const { _id, password, google, correo, ...resto } = req.body;

  // Verificar que el usuario solo pueda modificar su propia información (a menos que sea admin)
  if (req.usuario.rol !== "ADMIN_ROLE" && req.usuario._id.toString() !== id) {
    return res.status(403).json({
      msg: "No tiene permisos para modificar este usuario",
    });
  }

  if (password) {
    const salt = bcryptjs.genSaltSync();
    resto.password = bcryptjs.hashSync(password, salt);
  }

  const usuario = await Usuario.findByIdAndUpdate(id, resto, { new: true });

  res.json(usuario);
};

const usuariosDelete = async (req, res = response) => {
  const { id } = req.params;

  // Solo admin puede eliminar usuarios
  if (req.usuario.rol !== "ADMIN_ROLE") {
    return res.status(403).json({
      msg: "No tiene permisos para eliminar usuarios",
    });
  }

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

  // Verificar que el usuario solo pueda ver su propia información (a menos que sea admin)
  if (req.usuario.rol !== "ADMIN_ROLE" && req.usuario._id.toString() !== id) {
    return res.status(403).json({
      msg: "No tiene permisos para ver este usuario",
    });
  }

  const usuario = await Usuario.findById(id).select(
    "nombre correo telefono direccion rol estado"
  );

  res.json(usuario);
};

const usuariosDashboard = async (req, res = response) => {
  const { id } = req.params;

  // Solo el usuario mismo o admin puede ver el dashboard
  if (req.usuario.rol !== "ADMIN_ROLE" && req.usuario._id.toString() !== id) {
    return res.status(403).json({
      msg: "No tiene permisos para acceder a este dashboard",
    });
  }

  const usuario = await Usuario.findById(id).select("-password");
  res.json(usuario);
};

// Nuevo método para que usuario pueda ver/editar solo su perfil
const miPerfilGet = async (req, res = response) => {
  const usuario = await Usuario.findById(req.usuario._id).select("-password");
  res.json(usuario);
};

const miPerfilPut = async (req, res = response) => {
  const { password, google, correo, rol, ...resto } = req.body;

  // Usuario no puede cambiar su propio rol
  if (rol && req.usuario.rol !== "ADMIN_ROLE") {
    return res.status(403).json({
      msg: "No puede cambiar su rol",
    });
  }

  if (password) {
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
