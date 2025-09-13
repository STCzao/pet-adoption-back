const { Router } = require('express');
const { check } = require('express-validator');
const { publicacionesGet, publicacionesUsuarioGet, publicacionGet, publicacionesPost, publicacionesPut, publicacionesDelete, obtenerContactoPublicacion, publicacionesAdminGet } = require('../controllers/publicaciones');
const { validarCampos } = require('../middlewares/validar-campos');
const { validarJWT } = require('../middlewares/validar-jwt');
const { esAdminRole } = require('../middlewares/validar-roles');

const router = Router();

// Públicas - cualquiera puede ver las publicaciones activas
router.get('/', publicacionesGet);

// Privadas - solo usuarios autenticados
router.get('/usuario/:id', [
    validarJWT,
    check('id', 'No es un ID válido').isMongoId(),
    validarCampos
], publicacionesUsuarioGet);

router.get('/:id', [
    check('id', 'No es un ID válido').isMongoId(),
    validarCampos
], publicacionGet);

router.get('/contacto/:id', [
    validarJWT,
    check('id', 'No es un ID válido').isMongoId(),
    validarCampos
], obtenerContactoPublicacion);

// Solo admin puede ver todas las publicaciones (incluyendo inactivas)
router.get('/admin/todas', [
    validarJWT,
    esAdminRole
], publicacionesAdminGet);

router.post('/', [
    validarJWT,
    check('titulo', 'El título es obligatorio').not().isEmpty(),
    check('descripcion', 'La descripción es obligatoria').not().isEmpty(),
    check('tipo', 'El tipo es obligatorio').isIn(['PERDIDO', 'ENCONTRADO', 'ADOPCION']),
    check('raza', 'La raza es obligatoria').not().isEmpty(),
    check('sexo', 'El sexo es obligatorio').isIn(['MACHO', 'HEMBRA']),
    check('tamanio', 'El tamaño es obligatorio').isIn(['PEQUENO', 'MEDIANO', 'GRANDE']),
    check('color', 'El color es obligatorio').not().isEmpty(),
    check('edad', 'La edad es obligatoria').not().isEmpty(),
    validarCampos
], publicacionesPost);

router.put('/:id', [
    validarJWT,
    check('id', 'No es un ID válido').isMongoId(),
    validarCampos
], publicacionesPut);

router.delete('/:id', [
    validarJWT,
    check('id', 'No es un ID válido').isMongoId(),
    validarCampos
], publicacionesDelete);

module.exports = router;