const { Router } = require('express');
const { check } = require('express-validator');
const { usuariosGet, usuariosPost, usuariosPut, usuariosDelete, usuarioGet, usuariosDashboard } = require('../controllers/usuarios');
const { validarCampos } = require('../middlewares/validar-campos');
const { validarJWT } = require('../middlewares/validar-jwt');
const { esAdminRole, tieneRole } = require('../middlewares/validar-roles');

const router = Router();

router.get('/', [
    validarJWT,
    esAdminRole
], usuariosGet);

router.get('/:id', [
    validarJWT,
    check('id', 'No es un ID válido').isMongoId(),
    validarCampos
], usuarioGet);

router.get('/dashboard/:id', [
    validarJWT,
    check('id', 'No es un ID válido').isMongoId(),
    validarCampos
], usuariosDashboard);

router.post('/', [
    check('nombre', 'El nombre es obligatorio').not().isEmpty(),
    check('password', 'El password debe de ser más de 6 letras').isLength({ min: 6 }),
    check('correo', 'El correo no es válido').isEmail(),
    check('telefono', 'El teléfono es obligatorio').not().isEmpty(),
    validarCampos
], usuariosPost);

router.put('/:id', [
    validarJWT,
    check('id', 'No es un ID válido').isMongoId(),
    validarCampos
], usuariosPut);

router.delete('/:id', [
    validarJWT,
    esAdminRole,
    check('id', 'No es un ID válido').isMongoId(),
    validarCampos
], usuariosDelete);

module.exports = router;