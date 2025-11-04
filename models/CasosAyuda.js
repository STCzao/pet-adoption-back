const { Schema, model } = require("mongoose");

const CasoAyudaSchema = Schema(
  {
    titulo: {
      type: String,
      required: [true, "El titulo es obligatorio"],
      maxlength: [80, "El titulo no puede tener mas de 80 caracteres"],
      match: [
        /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s.,!?()-]+$/,
        "El titulo contiene caracteres no validos",
      ],
      trim: true,
    },
    contenido: {
      type: String,
      required: [true, "El contenido es obligatorio"],
      maxlength: [2000, "El contenido no puede tener mas de 2000 caracteres"],
      trim: true,
    },
    categoria: {
      type: String,
      enum: ["CONSEJO", "PREGUNTA", "EXPERIENCIA", "OTRO"],
      default: "OTRO",
    },
    usuario: {
      type: Schema.Types.ObjectId,
      ref: "Usuario",
      required: true,
    },
  },
  { timestamps: true }
);

CasoAyudaSchema.methods.toJSON = function () {
  const { __v, ...caso } = this.toObject();
  return caso;
};

module.exports = model("CasoAyuda", CasoAyudaSchema);
