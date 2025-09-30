const { Schema, model } = require("mongoose");

const UsuarioSchema = Schema({
  nombre: {
    type: String,
    required: [true, "El nombre es obligatorio"],
  },
  correo: {
    type: String,
    required: [true, "El correo es obligatorio"],
    unique: true,
  },
  password: {
    type: String,
    required: [true, "La contraseña es obligatoria"],
  },
  telefono: {
    type: String,
    required: [true, "El teléfono es obligatorio"],
  },
  direccion: {
    type: String,
  },
  img: {
    type: String,
  },
  rol: {
    type: String,
    required: true,
    default: "USER_ROLE",
    enum: ["ADMIN_ROLE", "USER_ROLE"],
  },
  estado: {
    type: Boolean,
    default: true,
  },
  resetToken: {
    // token para recuperación de contraseña
    type: String,
  },
  resetTokenExp: {
    // expiración del token
    type: Date,
  },
});

UsuarioSchema.methods.toJSON = function () {
  const { __v, password, resetToken, resetTokenExp, _id, ...usuario } =
    this.toObject();
  usuario.uid = _id;
  return usuario;
};

module.exports = model("Usuario", UsuarioSchema);
