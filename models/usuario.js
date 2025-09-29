const { Schema, model } = require("mongoose");

const UsuarioSchema = Schema({
  nombre: { type: String, required: [true, "El nombre es obligatorio"] },
  correo: {
    type: String,
    required: [true, "El correo es obligatorio"],
    unique: true,
  },
  password: { type: String, required: [true, "La contraseña es obligatoria"] },
  telefono: { type: String, required: [true, "El teléfono es obligatorio"] },
  direccion: { type: String },
  img: { type: String },
  rol: {
    type: String,
    required: true,
    default: "USER_ROLE",
    enum: ["ADMIN_ROLE", "USER_ROLE"],
  },
  estado: { type: Boolean, default: true },
  resetToken: { type: String }, // <- token de recuperación
  resetTokenExp: { type: Date }, // <- expiración del token
});

UsuarioSchema.methods.toJSON = function () {
  const { __v, password, resetToken, resetTokenExp, _id, ...usuario } =
    this.toObject();
  usuario.uid = _id;
  return usuario;
};

module.exports = model("Usuario", UsuarioSchema);
