const { Router } = require("express");
const { check } = require("express-validator");
const {
  publicacionesGet,
  publicacionesUsuarioGet,
  publicacionGet,
  publicacionesPost,
  publicacionesPut,
  publicacionesEstadoPut,
  publicacionesDelete,
  obtenerContactoPublicacion,
  publicacionesAdminGet,
} = require("../controllers/publicaciones");
const { validarCampos } = require("../middlewares/validar-campos");
const { validarJWT } = require("../middlewares/validar-jwt");
const { esAdminRole } = require("../middlewares/validar-roles");

const router = Router();

// Públicas - Cualquiera puede ver publicaciones activas
router.get("/", publicacionesGet);

// Individual - Pública
router.get(
  "/:id",
  [check("id", "No es un ID válido").isMongoId(), validarCampos],
  publicacionGet
);

// Protegidas - Requieren autenticación
router.get(
  "/usuario/:id",
  [validarJWT, check("id", "No es un ID válido").isMongoId(), validarCampos],
  publicacionesUsuarioGet
);

router.get(
  "/contacto/:id",
  [validarJWT, check("id", "No es un ID válido").isMongoId(), validarCampos],
  obtenerContactoPublicacion
);

// Solo Admin
router.get("/admin/todas", [validarJWT, esAdminRole], publicacionesAdminGet);

// CRUD protegido
router.post(
  "/",
  [
    validarJWT,
    check("titulo", "El título es obligatorio").not().isEmpty(),
    check("titulo", "El título no puede tener más de 60 caracteres").isLength({
      max: 60,
    }),
    check("descripcion", "La descripción es obligatoria").not().isEmpty(),
    check(
      "descripcion",
      "La descripción no puede tener más de 300 caracteres"
    ).isLength({ max: 300 }),
    check("tipo", "El tipo es obligatorio").isIn([
      "PERDIDO",
      "ENCONTRADO",
      "ADOPCION",
    ]),
    check("raza", "La raza es obligatoria").not().isEmpty(),
    check("raza", "La raza no puede tener más de 30 caracteres").isLength({
      max: 30,
    }),
    check("sexo", "El sexo es obligatorio").isIn(["MACHO", "HEMBRA"]),
    check("tamaño", "El tamaño es obligatorio").isIn([
      "MINI",
      "PEQUEÑO",
      "MEDIANO",
      "GRANDE",
    ]),
    check("color", "El color es obligatorio").not().isEmpty(),
    check("color", "El color no puede tener más de 20 caracteres").isLength({
      max: 20,
    }),
    check("edad", "La edad es obligatoria").isIn([
      "CACHORRO",
      "ADULTO",
      "MAYOR",
    ]),
    check("whatsapp", "El WhatsApp es obligatorio").not().isEmpty(),
    check("whatsapp", "El formato de WhatsApp no es válido").matches(
      /^\+?[0-9\s\-()]{10,15}$/
    ),
    validarCampos,
  ],
  publicacionesPost
);

router.put(
  "/:id",
  [validarJWT, check("id", "No es un ID válido").isMongoId(), validarCampos],
  publicacionesPut
);

router.put(
  "/:id/estado",
  [
    validarJWT,
    esAdminRole, // Solo admin puede cambiar estados
    check("id", "No es un ID válido").isMongoId(),
    check("estado", "El estado es obligatorio").not().isEmpty(),
    check("estado").isIn([
      "ACTIVO",
      "INACTIVO",
      "ENCONTRADO",
      "ADOPTADO",
      "VISTO",
    ]),
    validarCampos,
  ],
  publicacionesEstadoPut
);

router.delete(
  "/:id",
  [validarJWT, check("id", "No es un ID válido").isMongoId(), validarCampos],
  publicacionesDelete
);

module.exports = router;
