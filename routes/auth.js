const { Router } = require("express");
const { check } = require("express-validator");
const {
  login,
  forgotPassword,
  resetPassword,
  revalidarToken,
} = require("../controllers/auth");
const { validarCampos } = require("../middlewares/validar-campos");
const { validarJWT } = require("../middlewares/validar-jwt");

const router = Router();

// Login
router.post(
  "/login",
  [
    check("correo", "Debe ser un correo válido").isEmail(),
    check("password", "La contraseña es obligatoria").not().isEmpty(),
    validarCampos,
  ],
  login
);

// Forgot password
router.post(
  "/forgot-password",
  [check("correo", "Debe ser un correo válido").isEmail(), validarCampos],
  forgotPassword
);

// Reset password
router.post(
  "/reset-password/:token",
  [
    check("password", "La contraseña es obligatoria").not().isEmpty(),
    validarCampos,
  ],
  resetPassword
);

//Obtener usuario logueado / revalidar token
router.get("/me", validarJWT, revalidarToken);

module.exports = router;
