const { Router } = require("express");
const { validarJWT } = require("../middlewares/validar-jwt");
const {
  comunidadGet,
  comunidadGetById,
  comunidadPost,
  comunidadPut,
  comunidadDelete,
} = require("../controllers/comunidadController");

const router = Router();

router.get("/", comunidadGet);
router.get("/:id", comunidadGetById);

router.post("/", [validarJWT], comunidadPost);

router.put("/:id", [validarJWT], comunidadPut);

router.delete("/:id", [validarJWT], comunidadDelete);

module.exports = router;
