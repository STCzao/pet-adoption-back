const { Router } = require("express");
const { check } = require("express-validator");
const {
  usuariosGet,
  usuariosPost,
  usuariosPut,
  usuariosDelete,
  usuarioGet,
  usuariosDashboard,
  miPerfilGet,
  miPerfilPut,
} = require("../controllers/usuarios");
const { validarCampos } = require("../middlewares/validar-campos");
const { validarJWT } = require("../middlewares/validar-jwt");
const { esAdminRole } = require("../middlewares/validar-roles");

const router = Router();

// Rutas públicas - crear usuario
router.post(
  "/",
  [
    check("nombre", "El nombre debe tener entre 3 y 15 caracteres").isLength({
      min: 3,
      max: 15,
    }),
    check(
      "password",
      "La contraseña debe tener entre 6 y 15 caracteres"
    ).isLength({
      min: 6,
      max: 15,
    }),
    check("correo", "El correo debe ser válido").isEmail(),
    check("telefono", "El teléfono es obligatorio").not().isEmpty(),
    validarCampos,
  ],
  usuariosPost
);

// Rutas protegidas - Perfil personal
router.get("/mi-perfil", [validarJWT], miPerfilGet);

router.put(
  "/mi-perfil",
  [
    validarJWT,
    check("nombre", "El nombre debe tener entre 3 y 15 caracteres")
      .optional()
      .isLength({ min: 3, max: 15 }),
    check("telefono", "El teléfono es obligatorio").optional().not().isEmpty(),
    check("password", "La contraseña debe tener entre 6 y 15 caracteres")
      .optional()
      .isLength({ min: 6, max: 15 }),
    validarCampos,
  ],
  miPerfilPut
);

// Rutas protegidas - Solo admin
router.get("/", [validarJWT, esAdminRole], usuariosGet);

router.get(
  "/:id",
  [validarJWT, check("id", "No es un ID válido").isMongoId(), validarCampos],
  usuarioGet
);

router.get(
  "/dashboard/:id",
  [validarJWT, check("id", "No es un ID válido").isMongoId(), validarCampos],
  usuariosDashboard
);

router.put(
  "/:id",
  [
    validarJWT,
    check("id", "No es un ID válido").isMongoId(),
    check("password", "La contraseña debe tener entre 6 y 15 caracteres")
      .optional()
      .isLength({ min: 6, max: 15 }),
    validarCampos,
  ],
  usuariosPut
);

router.delete(
  "/:id",
  [
    validarJWT,
    esAdminRole,
    check("id", "No es un ID válido").isMongoId(),
    validarCampos,
  ],
  usuariosDelete
);

module.exports = router;
