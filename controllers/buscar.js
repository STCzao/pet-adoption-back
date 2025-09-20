const { response, request } = require("express");
const Publicacion = require("../models/publicacion");

// Definir colecciones permitidas para buscar
const coleccionesPermitidas = ["publicaciones"];

// Buscar publicaciones (búsqueda global en varios campos)
const buscarPublicaciones = async (termino, res = response) => {
  try {
    const regex = new RegExp(termino, "i"); // insensible a mayúsculas

    const publicaciones = await Publicacion.find({
      estado: ["ACTIVO", "ENCONTRADO", "ADOPCION"], // solo publicaciones activas
      $or: [
        { titulo: regex },
        { descripcion: regex },
        { raza: regex },
        { tipo: regex },
        { color: regex },
        { detalles: regex },
        { sexo: regex },
        { edad: regex },
        { lugar: regex },
      ],
    });

    res.json({
      msg: "Publicaciones encontradas",
      results: publicaciones,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      msg: "Error al buscar publicaciones",
    });
  }
};

// Función principal para las búsquedas
const buscar = async (req = request, res = response) => {
  const { coleccion, termino } = req.params;

  // Validar la colección
  if (!coleccionesPermitidas.includes(coleccion)) {
    return res.status(400).json({
      msg: `Las colecciones permitidas son: ${coleccionesPermitidas}`,
    });
  }

  // En función de la colección, buscar los términos
  switch (coleccion) {
    case "publicaciones":
      return buscarPublicaciones(termino, res);

    default:
      return res.status(500).json({
        msg: "Hubo un error al hacer la búsqueda",
      });
  }
};

module.exports = {
  buscar,
};
