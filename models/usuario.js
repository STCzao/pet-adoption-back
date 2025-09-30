const { Schema, model } = require("mongoose");

const UsuarioSchema = Schema({
  nombre: {
    type: String,
    required: [true, "El nombre es obligatorio"],
    minlength: [3, "El nombre debe tener al menos 3 caracteres"],
    maxlength: [15, "El nombre no puede tener más de 15 caracteres"],
    match: [
      /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/,
      "El nombre solo puede contener letras y espacios",
    ],
  },
  correo: {
    type: String,
    required: [true, "El correo es obligatorio"],
    unique: true,
    match: [/^\S+@\S+\.\S+$/, "Debe ser un correo válido"],
  },
  password: {
    type: String,
    required: [true, "La contraseña es obligatoria"],
    minlength: [6, "La contraseña debe tener al menos 6 caracteres"],
  },
  telefono: {
    type: String,
    required: [true, "El teléfono es obligatorio"],
    match: [
      /^[0-9]{7,15}$/,
      "El teléfono debe contener entre 7 y 15 dígitos numéricos",
    ],
  },
  direccion: {
    type: String,
    maxlength: [30, "La dirección no puede superar los 30 caracteres"],
  },
  img: { type: String },
  rol: {
    type: String,
    required: true,
    default: "USER_ROLE",
    enum: ["ADMIN_ROLE", "USER_ROLE"],
  },
  estado: { type: Boolean, default: true },
  resetToken: { type: String },
  resetTokenExp: { type: Date },
});

// Sobreescribir JSON para no devolver campos sensibles
UsuarioSchema.methods.toJSON = function () {
  const { __v, password, resetToken, resetTokenExp, _id, ...usuario } =
    this.toObject();
  usuario.uid = _id;
  return usuario;
};

module.exports = model("Usuario", UsuarioSchema);
