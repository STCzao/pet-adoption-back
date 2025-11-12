const { response } = require("express");
const CasoAyuda = require("../models/CasosAyuda");

// Obtener todos los casos de ayuda
const obtenerCasosAyuda = async (req, res = response) => {
  try {
    const casos = await CasoAyuda.find()
      .populate("usuario", "nombre img rol")
      .sort({ createdAt: -1 });

    res.json({ ok: true, total: casos.length, casos });
  } catch (error) {
    console.error("Error al obtener casos de ayuda:", error);
    res.status(500).json({ ok: false, msg: "Error interno del servidor" });
  }
};

// Obtener casos de ayuda por usuario
const obtenerCasosAyudaUsuario = async (req, res = response) => {
  try {
    const { id } = req.params;

    const casos = await CasoAyuda.find({ usuario: id })
      .populate("usuario", "nombre img rol")
      .sort({ createdAt: -1 });

    if (!casos || casos.length === 0) {
      return res.json({
        ok: true,
        total: 0,
        casos: [],
      });
    }

    res.json({
      ok: true,
      total: casos.length,
      casos,
    });
  } catch (error) {
    console.error("Error al obtener casos por usuario:", error);
    res.status(500).json({
      ok: false,
      msg: "Error interno del servidor",
    });
  }
};

// Crear un nuevo caso de ayuda
const crearCasoAyuda = async (req, res = response) => {
  try {
    const { titulo, contenido, categoria } = req.body;
    const usuario = req.usuario._id;

    const caso = new CasoAyuda({ titulo, contenido, categoria, usuario });
    await caso.save();

    res.status(201).json({
      ok: true,
      msg: "Caso de ayuda creado correctamente",
      caso,
    });
  } catch (error) {
    console.error("Error al crear caso de ayuda:", error);
    res.status(500).json({ ok: false, msg: "Error interno del servidor" });
  }
};

// Eliminar un caso de ayuda (solo autor o admin)
const eliminarCasoAyuda = async (req, res = response) => {
  try {
    const { id } = req.params;
    const usuarioAuth = req.usuario;

    const caso = await CasoAyuda.findById(id);
    if (!caso) {
      return res.status(404).json({ ok: false, msg: "Caso no encontrado" });
    }

    if (
      caso.usuario.toString() !== usuarioAuth._id.toString() &&
      usuarioAuth.rol !== "ADMIN_ROLE"
    ) {
      return res.status(403).json({
        ok: false,
        msg: "No tiene permisos para eliminar este caso",
      });
    }

    await caso.deleteOne();

    res.json({ ok: true, msg: "Caso de ayuda eliminado permanentemente" });
  } catch (error) {
    console.error("Error al eliminar caso de ayuda:", error);
    res.status(500).json({ ok: false, msg: "Error interno del servidor" });
  }
};

module.exports = {
  obtenerCasosAyuda,
  obtenerCasosAyudaUsuario,
  crearCasoAyuda,
  eliminarCasoAyuda,
};
