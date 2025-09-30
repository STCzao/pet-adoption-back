const { Router } = require("express");
const { check } = require("express-validator");
const { login, forgotPassword, resetPassword } = require("../controllers/auth");
const { validarCampos } = require("../middlewares/validar-campos");

const router = Router();

router.post(
  "/login",
  [
    check("correo", "Debe ser un correo válido").isEmail(),
    check("password", "La contraseña es obligatoria").not().isEmpty(),
    validarCampos,
  ],
  login
);

router.post(
  "/forgot-password",
  [check("correo", "Debe ser un correo válido").isEmail(), validarCampos],
  forgotPassword
);

router.post(
  "/reset-password/:token",
  [
    check("password", "La contraseña es obligatoria").not().isEmpty(),
    validarCampos,
  ],
  resetPassword
);

module.exports = router;
