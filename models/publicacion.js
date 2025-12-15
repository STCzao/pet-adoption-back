const { Schema, model } = require("mongoose");

const PublicacionSchema = Schema({
  
  tipo: {
    type: String,
    required: true,
    enum: ["PERDIDO", "ENCONTRADO", "ADOPCION"],
  },
  estado: {
    type: String,
    default: "ACTIVO",
    enum: ["ACTIVO", "ENCONTRADO", "VISTO", "ADOPTADO", "INACTIVO"],
  },
  raza: {
    type: String,
    required: [true, "La raza es obligatoria"],
    maxlength: [40, "La raza no puede tener más de 40 caracteres"],
    match: [
      /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/,
      "La raza solo puede contener letras y espacios",
    ],
  },
  lugar: {
    type: String,
    required: function () {
      return this.tipo === "PERDIDO" || this.tipo === "ENCONTRADO";
    },
    maxlength: [80, "El lugar no puede tener más de 80 caracteres"],
  },
  fecha: {
    type: String,
    required: function () {
      return this.tipo === "PERDIDO" || this.tipo === "ENCONTRADO";
    },
  },
  sexo: {
    type: String,
    required: [true, "El sexo es obligatorio"],
    enum: ["MACHO", "HEMBRA"],
  },
  tamaño: {
    type: String,
    required: [true, "El tamaño es obligatorio"],
    enum: ["MINI", "PEQUEÑO", "MEDIANO", "GRANDE"],
  },
  color: {
    type: String,
    required: [true, "El color es obligatorio"],
    maxlength: [50, "El color no puede tener más de 50 caracteres"],
    match: [
      /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s/-]+$/,
      "El color contiene caracteres no válidos",
    ],
  },
  detalles: {
    type: String,
    maxlength: [250, "Los detalles no pueden tener más de 250 caracteres"],
  },
  edad: {
    type: String,
    required: [true, "La edad es obligatoria"],
    enum: ["CACHORRO", "ADULTO", "MAYOR"],
  },
  afinidad: {
    type: String,
    required: function () {
      return this.tipo === "ADOPCION";
    },
    enum: ["ALTA", "MEDIA", "BAJA"],
  },
  energia: {
    type: String,
    required: function () {
      return this.tipo === "ADOPCION";
    },
    enum: ["ALTA", "MEDIA", "BAJA"],
  },
  castrado: {
    type: Boolean,
    required: function () {
      return this.tipo === "ADOPCION";
    },
  },
  whatsapp: {
    type: String,
    required: [true, "El WhatsApp es obligatorio para contacto"],
    match: [/^\+?[0-9\s\-()]{10,15}$/, "El formato de WhatsApp no es válido"],
    maxlength: [15, "El WhatsApp no puede tener más de 15 caracteres"],
  },
  usuario: {
    type: Schema.Types.ObjectId,
    ref: "Usuario",
    required: true,
  },
  img: {
    type: String,
    required: [true, "La imagen es obligatoria"],
    match: [
      /^https:\/\/res\.cloudinary\.com\/.+\/.+\.(jpg|jpeg|png|webp)$/,
      "La URL de imagen no es válida",
    ],
  },
  fechaCreacion: {
    type: Date,
    default: Date.now,
  },
});

PublicacionSchema.methods.toJSON = function () {
  const { __v, ...publicacion } = this.toObject();
  return publicacion;
};

module.exports = model("Publicacion", PublicacionSchema);
