const { Router } = require("express");
const { check } = require("express-validator");
const {
    publicacionesGet,
    publicacionesUsuarioGet,
    publicacionGet,
    publicacionesPost,
    publicacionesPut,
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
    [
        validarJWT,
        check("id", "No es un ID válido").isMongoId(),
        validarCampos
    ],
    publicacionesUsuarioGet
);

router.get(
    "/contacto/:id",
    [
        validarJWT,
        check("id", "No es un ID válido").isMongoId(),
        validarCampos
    ],
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
        check("descripcion", "La descripción es obligatoria").not().isEmpty(),
        check("tipo", "El tipo es obligatorio").isIn(["PERDIDO", "ENCONTRADO", "ADOPCION"]),
        check("raza", "La raza es obligatoria").not().isEmpty(),
        check("sexo", "El sexo es obligatorio").isIn(["MACHO", "HEMBRA"]),
        check("tamanio", "El tamaño es obligatorio").isIn(["PEQUEÑO", "MEDIANO", "GRANDE"]),
        check("color", "El color es obligatorio").not().isEmpty(),
        check("edad", "La edad es obligatoria").not().isEmpty(),
        validarCampos,
    ],
    publicacionesPost
);

router.put(
    "/:id",
    [
        validarJWT,
        check("id", "No es un ID válido").isMongoId(),
        validarCampos
    ],
    publicacionesPut
);

router.delete(
    "/:id",
    [
        validarJWT,
        check("id", "No es un ID válido").isMongoId(),
        validarCampos
    ],
    publicacionesDelete
);

module.exports = router;
