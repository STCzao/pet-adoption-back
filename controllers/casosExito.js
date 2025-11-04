const { response } = require("express");
const CasoExito = require("../models/CasosExito");

// Obtener todos los casos de exito
const obtenerCasosExito = async (req, res = response) => {
  try {
    const casos = await CasoExito.find()
      .populate("usuario", "nombre img rol")
      .sort({ createdAt: -1 });

    res.json({ ok: true, total: casos.length, casos });
  } catch (error) {
    console.error("Error al obtener casos de exito:", error);
    res.status(500).json({ ok: false, msg: "Error interno del servidor" });
  }
};

// Crear un nuevo caso de exito
const crearCasoExito = async (req, res = response) => {
  try {
    const { titulo, descripcion, img } = req.body;

    if (!img || !img.startsWith("https://res.cloudinary.com/")) {
      return res.status(400).json({
        ok: false,
        msg: "Debe proporcionar una URL de imagen valida de Cloudinary",
      });
    }

    const usuario = req.usuario._id;

    const caso = new CasoExito({ titulo, descripcion, img, usuario });
    await caso.save();

    res.status(201).json({
      ok: true,
      msg: "Caso de exito creado correctamente",
      caso,
    });
  } catch (error) {
    console.error("Error al crear caso de exito:", error);
    res.status(500).json({ ok: false, msg: "Error interno del servidor" });
  }
};

// Eliminar un caso de exito (solo creador o admin, borrado fisico)
const eliminarCasoExito = async (req, res = response) => {
  try {
    const { id } = req.params;
    const usuarioAuth = req.usuario;

    const caso = await CasoExito.findById(id);
    if (!caso) {
      return res.status(404).json({ ok: false, msg: "Caso no encontrado" });
    }

    // Verificar permisos
    if (
      caso.usuario.toString() !== usuarioAuth._id.toString() &&
      usuarioAuth.rol !== "ADMIN_ROLE"
    ) {
      return res.status(403).json({
        ok: false,
        msg: "No tiene permisos para eliminar este caso",
      });
    }

    await caso.deleteOne(); // Borrado físico

    res.json({ ok: true, msg: "Caso de exito eliminado permanentemente" });
  } catch (error) {
    console.error("Error al eliminar caso de exito:", error);
    res.status(500).json({ ok: false, msg: "Error interno del servidor" });
  }
};

module.exports = {
  obtenerCasosExito,
  crearCasoExito,
  eliminarCasoExito,
};
