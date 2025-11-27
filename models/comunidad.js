const { Schema, model } = require("mongoose");

const ComunidadSchema = Schema({
  titulo: {
    type: String,
    required: [true, "El titulo es obligatorio"],
    maxlength: [80, "El titulo no puede tener mas de 80 caracteres"],
  },
  contenido: {
    type: String,
    required: [true, "El contenido es obligatorio"],
    maxlength: [2000, "El contenido no puede tener mas de 3000 caracteres"],
  },
  categoria: {
    type: String,
    required: true,
    enum: ["INFORMACION", "CONSEJO", "HISTORIA", "ALERTA"],
  },
  img: {
    type: String,
    required: [true, "La imagen es obligatoria"],
    match: [
      /^https:\/\/res\.cloudinary\.com\/.+\/.+\.(jpg|jpeg|png|webp)$/,
      "La URL de imagen no es valida",
    ],
  },
  usuario: {
    type: Schema.Types.ObjectId,
    ref: "Usuario",
    required: true,
  },
  fechaCreacion: {
    type: Date,
    default: Date.now,
  },
});

ComunidadSchema.methods.toJSON = function () {
  const { __v, ...comunidad } = this.toObject();
  return comunidad;
};

module.exports = model("Comunidad", ComunidadSchema);
