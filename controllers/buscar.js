const { response, request } = require("express");
const Publicacion = require("../models/publicacion");

const coleccionesPermitidas = ["publicaciones"];

const buscarPublicaciones = async (termino = "", tipo, res = response) => {
  try {
    const regex = new RegExp(termino, "i");

    const query = {
      estado: { $ne: "INACTIVO" },
      $or: [
        { titulo: regex },
        { descripcion: regex },
        { raza: regex },
        { color: regex },
        { detalles: regex },
        { edad: regex },
        { lugar: regex },
      ],
    };

    if (tipo) {
      query.tipo = tipo.toUpperCase();
    }

    const publicaciones = await Publicacion.find(query)
      .populate("usuario", "nombre")
      .select("titulo tipo img raza color lugar") // datos livianos para autocomplete
      .limit(10)
      .sort({ fechaCreacion: -1 });

    res.json({
      success: true,
      results: publicaciones.length,
      publicaciones,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      msg: "Error al buscar publicaciones",
    });
  }
};

const buscar = async (req = request, res = response) => {
  const { coleccion } = req.params;
  const { termino = "", tipo = "" } = req.query;

  if (!coleccionesPermitidas.includes(coleccion)) {
    return res.status(400).json({
      success: false,
      msg: `Las colecciones permitidas son: ${coleccionesPermitidas.join(
        ", "
      )}`,
    });
  }

  switch (coleccion) {
    case "publicaciones":
      return buscarPublicaciones(termino, tipo, res);
    default:
      return res.status(500).json({
        success: false,
        msg: "Error en la búsqueda",
      });
  }
};

module.exports = { buscar };
