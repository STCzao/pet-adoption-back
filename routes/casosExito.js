const { Router } = require("express");
const { check } = require("express-validator");
const {
  obtenerCasosExito,
  crearCasoExito,
  eliminarCasoExito,
} = require("../controllers/casosExito");
const { validarJWT } = require("../middlewares/validar-jwt");
const { validarCampos } = require("../middlewares/validar-campos");

const router = Router();

// Obtener todos
router.get("/", obtenerCasosExito);

// Crear nuevo (requiere JWT)
router.post(
  "/",
  [
    validarJWT,
    check("titulo", "El titulo es obligatorio").not().isEmpty(),
    check("descripcion", "La descripcion es obligatoria").not().isEmpty(),
    check("img", "La URL de imagen es obligatoria").isURL(),
    validarCampos,
  ],
  crearCasoExito
);

// Eliminar (o desactivar)
router.delete("/:id", [validarJWT], eliminarCasoExito);

module.exports = router;
