const { Router } = require("express");
const { buscar } = require("../controllers/buscar");

const router = Router();

// Nueva ruta para autocomplete y búsqueda
router.get("/:coleccion", buscar);

module.exports = router;
