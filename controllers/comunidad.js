const { response } = require("express");
const Comunidad = require("../models/comunidad");

const normalizar = (t) => (typeof t === "string" ? t.trim().toUpperCase() : t);

const comunidadGet = async (req, res = response) => {
  try {
    const comunidades = await Comunidad.find()
      .populate("usuario", "nombre img rol")
      .sort({ fechaCreacion: -1 });

    res.json({
      success: true,
      comunidades,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      msg: "Error al obtener comunidad",
    });
  }
};

const comunidadGetById = async (req, res = response) => {
  try {
    const post = await Comunidad.findById(req.params.id).populate(
      "usuario",
      "nombre img rol"
    );

    if (!post) {
      return res.status(404).json({
        success: false,
        msg: "Publicacion no encontrada",
      });
    }

    res.json({
      success: true,
      post,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      msg: "Error al obtener la publicacion",
    });
  }
};

const comunidadPost = async (req, res = response) => {
  try {
    if (req.usuario.rol !== "ADMIN_ROLE") {
      return res.status(403).json({
        success: false,
        msg: "Solo el administrador puede crear",
      });
    }

    const { titulo, contenido, categoria, img } = req.body;

    const data = {
      titulo: normalizar(titulo),
      contenido,
      categoria: normalizar(categoria),
      img: img.toLowerCase(),
      usuario: req.usuario._id,
    };

    const comunidad = new Comunidad(data);
    const comunidadDB = await comunidad.save();
    await comunidadDB.populate("usuario", "nombre img rol");

    res.status(201).json({
      success: true,
      comunidad: comunidadDB,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      msg: "Error al crear",
    });
  }
};

const comunidadPut = async (req, res = response) => {
  try {
    if (req.usuario.rol !== "ADMIN_ROLE") {
      return res.status(403).json({
        success: false,
        msg: "Solo el administrador puede editar",
      });
    }

    const { id } = req.params;
    const { titulo, contenido, categoria, img } = req.body;

    const data = {};

    if (titulo) data.titulo = titulo.trim().toUpperCase();
    if (contenido) data.contenido = contenido;
    if (categoria) data.categoria = categoria.trim().toUpperCase();
    if (img) data.img = img.toLowerCase();

    const editado = await Comunidad.findByIdAndUpdate(id, data, {
      new: true,
    }).populate("usuario", "nombre img rol");

    if (!editado) {
      return res.status(404).json({
        success: false,
        msg: "Publicacion no encontrada",
      });
    }

    res.json({
      success: true,
      editado,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      msg: "Error al editar",
    });
  }
};

const comunidadDelete = async (req, res = response) => {
  try {
    if (req.usuario.rol !== "ADMIN_ROLE") {
      return res.status(403).json({
        success: false,
        msg: "Solo el administrador puede eliminar",
      });
    }

    const eliminado = await Comunidad.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      eliminado,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      msg: "Error al eliminar",
    });
  }
};

module.exports = {
  comunidadGet,
  comunidadGetById,
  comunidadPost,
  comunidadPut,
  comunidadDelete,
};
