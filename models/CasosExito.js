const { Schema, model } = require("mongoose");

const CasoExitoSchema = Schema(
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
    descripcion: {
      type: String,
      required: [true, "La descripcion es obligatoria"],
      maxlength: [500, "La descripcion no puede tener mas de 500 caracteres"],
      trim: true,
    },
    img: {
      type: String,
      required: [true, "La imagen es obligatoria"],
      match: [
        /^https:\/\/res\.cloudinary\.com\/.+\/.+\.(jpg|jpeg|png|webp)$/,
        "La URL de imagen no es valida o no pertenece a Cloudinary",
      ],
      trim: true,
    },
    usuario: {
      type: Schema.Types.ObjectId,
      ref: "Usuario",
      required: true,
    },
    estado: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

CasoExitoSchema.methods.toJSON = function () {
  const { __v, ...caso } = this.toObject();
  return caso;
};

module.exports = model("CasoExito", CasoExitoSchema);
