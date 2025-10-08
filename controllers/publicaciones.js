const { response } = require("express");
const Publicacion = require("../models/publicacion");

// Función para normalizar texto (case-insensitive)
const normalizarTexto = (texto) => {
  if (typeof texto !== "string") return texto;
  return texto.trim().toUpperCase();
};

// Obtener publicaciones públicas (todas excepto INACTIVO)
const publicacionesGet = async (req, res = response) => {
  try {
    const { limite = 10, desde = 0, tipo, estado, search } = req.query;

    // Query base: excluir SOLO INACTIVO - incluir ACTIVO, ENCONTRADO, VISTO, ADOPTADO
    const query = { estado: { $ne: "INACTIVO" } };

    // Filtro por tipo
    if (tipo) {
      query.tipo = normalizarTexto(tipo);
    }

    // Filtro por estado específico (si se proporciona)
    if (estado) {
      const estadoNormalizado = normalizarTexto(estado);
      // Solo aplicar filtro si no es INACTIVO
      if (estadoNormalizado !== "INACTIVO") {
        query.estado = estadoNormalizado;
      }
    }

    // Búsqueda por texto en múltiples campos
    if (search) {
      const regex = new RegExp(search, "i");
      query.$or = [
        { titulo: regex },
        { descripcion: regex },
        { raza: regex },
        { color: regex },
        { detalles: regex },
        { edad: regex },
        { lugar: regex },
        { tamaño: regex },
      ];
    }

    console.log("Query ejecutado:", query);

    const [total, publicaciones] = await Promise.all([
      Publicacion.countDocuments(query),
      Publicacion.find(query)
        .populate("usuario", "nombre")
        .skip(Number(desde))
        .limit(Number(limite))
        .sort({ fechaCreacion: -1 }),
    ]);

    res.json({
      success: true,
      total,
      publicaciones,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      msg: "Error al obtener publicaciones",
    });
  }
};

// Obtener publicaciones de un usuario (para dashboard - incluye INACTIVO)
const publicacionesUsuarioGet = async (req, res = response) => {
  try {
    const { id } = req.params;

    // Solo el usuario dueño o admin puede ver todas sus publicaciones (incluyendo INACTIVO)
    if (req.usuario.rol !== "ADMIN_ROLE" && req.usuario._id.toString() !== id) {
      return res.status(403).json({
        success: false,
        msg: "No tiene permisos para ver estas publicaciones",
      });
    }

    const publicaciones = await Publicacion.find({ usuario: id })
      .populate("usuario", "nombre")
      .sort({ fechaCreacion: -1 });

    res.json({
      success: true,
      publicaciones,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      msg: "Error al obtener publicaciones del usuario",
    });
  }
};

// Obtener publicación individual (pública - excluye INACTIVO)
const publicacionGet = async (req, res = response) => {
  try {
    const { id } = req.params;
    const publicacion = await Publicacion.findOne({
      _id: id,
      estado: { $ne: "INACTIVO" },
    }).populate("usuario", "nombre");

    if (!publicacion) {
      return res.status(404).json({
        success: false,
        msg: "Publicación no encontrada",
      });
    }

    res.json({
      success: true,
      publicacion,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      msg: "Error al obtener la publicación",
    });
  }
};

// Crear publicación
const publicacionesPost = async (req, res = response) => {
  try {
    const { estado, usuario, ...body } = req.body;

    // Normalizar todos los campos de texto (excepto whatsapp)
    const datosNormalizados = {
      titulo: normalizarTexto(body.titulo),
      descripcion: normalizarTexto(body.descripcion),
      tipo: normalizarTexto(body.tipo),
      raza: normalizarTexto(body.raza),
      lugar: body.lugar ? normalizarTexto(body.lugar) : undefined,
      sexo: normalizarTexto(body.sexo),
      tamaño: normalizarTexto(body.tamaño),
      color: normalizarTexto(body.color),
      edad: normalizarTexto(body.edad),
      detalles: body.detalles ? normalizarTexto(body.detalles) : undefined,
      afinidad: body.afinidad ? normalizarTexto(body.afinidad) : undefined,
      energia: body.energia ? normalizarTexto(body.energia) : undefined,
      castrado: body.castrado,
      whatsapp: body.whatsapp, // Mantener formato original
      img: body.img,
      fecha: body.fecha,
      usuario: req.usuario._id,
    };

    const publicacion = new Publicacion(datosNormalizados);
    const publicacionDB = await publicacion.save();
    await publicacionDB.populate("usuario", "nombre");

    res.status(201).json({
      success: true,
      msg: "Publicación creada exitosamente",
      publicacion: publicacionDB,
    });
  } catch (error) {
    console.error(error);

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        msg: "Ya existe una publicación similar",
      });
    }

    if (error.name === "ValidationError") {
      const errors = {};
      Object.keys(error.errors).forEach((key) => {
        errors[key] = error.errors[key].message;
      });
      return res.status(400).json({
        success: false,
        msg: "Error de validación",
        errors,
      });
    }

    res.status(500).json({
      success: false,
      msg: "Error al crear la publicación",
    });
  }
};

// Actualizar publicación (solo dueño o admin)
const publicacionesPut = async (req, res = response) => {
  try {
    const { id } = req.params;
    const { _id, usuario, ...resto } = req.body;

    // Buscar publicación (incluyendo INACTIVO para que dueño/admin pueda reactivar)
    const publicacionExistente = await Publicacion.findById(id);

    if (!publicacionExistente) {
      return res.status(404).json({
        success: false,
        msg: "Publicación no encontrada",
      });
    }

    // Verificar permisos: solo dueño o admin
    if (
      publicacionExistente.usuario.toString() !== req.usuario._id.toString() &&
      req.usuario.rol !== "ADMIN_ROLE"
    ) {
      return res.status(403).json({
        success: false,
        msg: "No tiene permisos para editar esta publicación",
      });
    }

    // Normalizar campos de texto (excepto whatsapp)
    const datosNormalizados = {};
    Object.keys(resto).forEach((key) => {
      if (key === "whatsapp") {
        datosNormalizados[key] = resto[key]; // Mantener formato original
      } else if (typeof resto[key] === "string" && resto[key].trim() !== "") {
        datosNormalizados[key] = normalizarTexto(resto[key]);
      } else {
        datosNormalizados[key] = resto[key];
      }
    });

    const publicacionActualizada = await Publicacion.findByIdAndUpdate(
      id,
      datosNormalizados,
      { new: true }
    ).populate("usuario", "nombre");

    res.json({
      success: true,
      msg: "Publicación actualizada exitosamente",
      publicacion: publicacionActualizada,
    });
  } catch (error) {
    console.error(error);

    if (error.name === "ValidationError") {
      const errors = {};
      Object.keys(error.errors).forEach((key) => {
        errors[key] = error.errors[key].message;
      });
      return res.status(400).json({
        success: false,
        msg: "Error de validación",
        errors,
      });
    }

    res.status(500).json({
      success: false,
      msg: "Error al actualizar la publicación",
    });
  }
};

// Eliminar publicación (cambiar estado a INACTIVO)
const publicacionesDelete = async (req, res = response) => {
  try {
    const { id } = req.params;

    const publicacion = await Publicacion.findById(id);

    if (!publicacion) {
      return res.status(404).json({
        success: false,
        msg: "Publicación no encontrada",
      });
    }

    // Verificar permisos: solo dueño o admin
    if (
      publicacion.usuario.toString() !== req.usuario._id.toString() &&
      req.usuario.rol !== "ADMIN_ROLE"
    ) {
      return res.status(403).json({
        success: false,
        msg: "No tiene permisos para eliminar esta publicación",
      });
    }

    const publicacionEliminada = await Publicacion.findByIdAndUpdate(
      id,
      { estado: "INACTIVO" },
      { new: true }
    );

    res.json({
      success: true,
      msg: "Publicación eliminada correctamente",
      publicacion: publicacionEliminada,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      msg: "Error al eliminar la publicación",
    });
  }
};

// Obtener contacto de la publicación (requiere autenticación)
const obtenerContactoPublicacion = async (req, res = response) => {
  try {
    const { id } = req.params;

    // Buscar publicación activa (excluye INACTIVO)
    const publicacion = await Publicacion.findOne({
      _id: id,
      estado: { $ne: "INACTIVO" },
    }).populate("usuario", "nombre telefono correo");

    if (!publicacion) {
      return res.status(404).json({
        success: false,
        msg: "Publicación no encontrada",
      });
    }

    const contacto = {
      nombre: publicacion.usuario.nombre,
      telefono: publicacion.usuario.telefono,
      correo: publicacion.usuario.correo,
      whatsapp: publicacion.whatsapp,
    };

    res.json({
      success: true,
      contacto,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      msg: "Error al obtener información de contacto",
    });
  }
};

// Admin: ver todas las publicaciones (incluyendo INACTIVO)
const publicacionesAdminGet = async (req, res = response) => {
  try {
    const { limite = 10, desde = 0, estado } = req.query;

    const query = {};
    if (estado) {
      query.estado = normalizarTexto(estado);
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
      success: true,
      total,
      publicaciones,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      msg: "Error al obtener publicaciones",
    });
  }
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
