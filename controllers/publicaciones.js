const { response } = require("express");
const Publicacion = require("../models/publicacion");

const publicacionesGet = async (req, res = response) => {
  const { limite = 10, desde = 0, tipo } = req.query;
  const query = { estado: "ACTIVO" };

  if (tipo) {
    query.tipo = tipo;
  }

  const [total, publicaciones] = await Promise.all([
    Publicacion.countDocuments(query),
    Publicacion.find(query)
      .populate("usuario", "nombre")
      .skip(Number(desde))
      .limit(Number(limite))
      .sort({ fechaCreacion: -1 }),
  ]);

  res.json({
    total,
    publicaciones,
  });
};

const publicacionesUsuarioGet = async (req, res = response) => {
  const { id } = req.params;

  // Solo el usuario mismo o admin puede ver sus publicaciones
  if (req.usuario.rol !== "ADMIN_ROLE" && req.usuario._id.toString() !== id) {
    return res.status(403).json({
      msg: "No tiene permisos para ver estas publicaciones",
    });
  }

  const publicaciones = await Publicacion.find({ usuario: id })
    .populate("usuario", "nombre")
    .sort({ fechaCreacion: -1 });

  res.json({
    publicaciones,
  });
};

const publicacionGet = async (req, res = response) => {
  const { id } = req.params;
  const publicacion = await Publicacion.findById(id).populate(
    "usuario",
    "nombre"
  );

  if (!publicacion || publicacion.estado !== "ACTIVO") {
    return res.status(404).json({
      msg: "Publicación no encontrada",
    });
  }

  res.json(publicacion);
};

const publicacionesPost = async (req, res = response) => {
  const { estado, usuario, ...body } = req.body;

  const publicacion = new Publicacion({
    ...body,
    usuario: req.usuario._id,
  });

  try {
    const publicacionDB = await publicacion.save();
    await publicacionDB.populate("usuario", "nombre");

    res.status(201).json(publicacionDB);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      msg: "Hable con el administrador",
    });
  }
};

const publicacionesPut = async (req, res = response) => {
  const { id } = req.params;
  const { _id, usuario, ...resto } = req.body;

  const publicacionExistente = await Publicacion.findById(id);
  if (!publicacionExistente || publicacionExistente.estado !== "ACTIVO") {
    return res.status(404).json({
      msg: "Publicación no encontrada",
    });
  }

  // Solo el dueño o admin puede editar
  if (
    publicacionExistente.usuario.toString() !== req.usuario._id.toString() &&
    req.usuario.rol !== "ADMIN_ROLE"
  ) {
    return res.status(403).json({
      msg: "No tiene privilegios para editar esta publicación",
    });
  }

  const publicacionActualizada = await Publicacion.findByIdAndUpdate(
    id,
    resto,
    { new: true }
  ).populate("usuario", "nombre");

  res.json(publicacionActualizada);
};

const publicacionesDelete = async (req, res = response) => {
  const { id } = req.params;

  const publicacion = await Publicacion.findById(id);
  if (!publicacion) {
    return res.status(404).json({
      msg: "Publicación no encontrada",
    });
  }

  // Solo el dueño o admin puede eliminar
  if (
    publicacion.usuario.toString() !== req.usuario._id.toString() &&
    req.usuario.rol !== "ADMIN_ROLE"
  ) {
    return res.status(403).json({
      msg: "No tiene privilegios para eliminar esta publicación",
    });
  }

  const publicacionEliminada = await Publicacion.findByIdAndUpdate(
    id,
    { estado: "INACTIVO" },
    { new: true }
  );

  res.json({
    msg: "Publicación eliminada correctamente",
    publicacion: publicacionEliminada,
  });
};

const obtenerContactoPublicacion = async (req, res = response) => {
  const { id } = req.params;

  const publicacion = await Publicacion.findById(id).populate(
    "usuario",
    "nombre telefono correo"
  );

  if (!publicacion || publicacion.estado !== "ACTIVO") {
    return res.status(404).json({
      msg: "Publicación no encontrada",
    });
  }

  const contacto = {
    nombre: publicacion.usuario.nombre,
    telefono: publicacion.usuario.telefono,
    correo: publicacion.usuario.correo,
  };

  res.json(contacto);
};

// Nuevo método para que admin gestione todas las publicaciones
const publicacionesAdminGet = async (req, res = response) => {
  const { limite = 10, desde = 0, estado } = req.query;
  const query = {};

  if (estado) {
    query.estado = estado;
  }

  const [total, publicaciones] = await Promise.all([
    Publicacion.countDocuments(query),
    Publicacion.find(query)
      .populate("usuario", "nombre correo")
      .skip(Number(desde))
      .limit(Number(limite))
      .sort({ fechaCreacion: -1 }),
  ]);

  res.json({
    total,
    publicaciones,
  });
};

module.exports = {
  publicacionesGet,
  publicacionesUsuarioGet,
  publicacionGet,
  publicacionesPost,
  publicacionesPut,
  publicacionesDelete,
  obtenerContactoPublicacion,
  publicacionesAdminGet,
};
