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

// Rutas públicas
router.post(
  "/",
  [
    check("nombre", "El nombre es obligatorio").not().isEmpty(),
    check("password", "El password debe de ser más de 6 letras").isLength({
      min: 6,
    }),
    check("correo", "El correo no es válido").isEmail(),
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
    check("nombre", "El nombre es obligatorio").optional().not().isEmpty(),
    check("telefono", "El teléfono es obligatorio").optional().not().isEmpty(),
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
  [validarJWT, check("id", "No es un ID válido").isMongoId(), validarCampos],
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
