const { Router } = require("express");
const { check } = require("express-validator");
const { login, forgotPassword, resetPassword } = require("../controllers/auth");
const { validarCampos } = require("../middlewares/validar-campos");

const router = Router();

router.post(
  "/login",
  [
    check("correo", "El correo es obligatorio").isEmail(),
    check("password", "La contraseña es obligatoria").not().isEmpty(),
    validarCampos,
  ],
  login
);

// Endpoint para solicitar recuperación
router.post(
  "/forgot-password",
  [check("correo", "El correo es obligatorio").isEmail(), validarCampos],
  forgotPassword
);

// Endpoint para resetear contraseña con token
router.post(
  "/reset-password/:token",
  [
    check(
      "password",
      "La contraseña debe tener entre 6 y 15 caracteres"
    ).isLength({ min: 6, max: 15}),
    validarCampos,
  ],
  resetPassword
);

module.exports = router;
