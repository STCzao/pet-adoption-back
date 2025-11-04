const { Router } = require("express");
const { check } = require("express-validator");
const {
  obtenerCasosAyuda,
  crearCasoAyuda,
  eliminarCasoAyuda,
} = require("../controllers/casosAyuda");
const { validarJWT } = require("../middlewares/validar-jwt");
const { validarCampos } = require("../middlewares/validar-campos");

const router = Router();

// Obtener todos los casos
router.get("/", obtenerCasosAyuda);

// Crear un nuevo caso (requiere autenticacion)
router.post(
  "/",
  [
    validarJWT,
    check("titulo", "El titulo es obligatorio").not().isEmpty(),
    check("contenido", "El contenido es obligatorio").not().isEmpty(),
    validarCampos,
  ],
  crearCasoAyuda
);

// Eliminar (solo autor o admin)
router.delete("/:id", [validarJWT], eliminarCasoAyuda);

module.exports = router;
