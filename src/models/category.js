const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    minlength: [3, "El nombre debe tener al menos 3 caracteres"],
    maxlength: [50, "El nombre no puede tener más de 50 caracteres"],
  },
  description: {
    type: String,
    required: true,
    trim: true,
    minlength: [10, "La descripción debe tener al menos 10 caracteres"],
    maxlength: [200, "La descripción no puede tener más de 200 caracteres"],
  },
  emojiIcon: {
    type: String,
    default: "",
    trim: true,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  group: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Group",
    required: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  active: {
    type: Boolean,
    default: true,
  },
  history: [
    {
      updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      updatedAt: {
        type: Date,
        default: Date.now,
      },
      description: {
        type: String,
      },
      changes: {
        type: Map,
        of: mongoose.Schema.Types.Mixed,
      },
    },
  ],
});

// Middleware para registrar historial de cambios
categorySchema.pre("save", function (next) {
  if (!this.isNew && this.isModified()) {
    const modifiedFields = this.modifiedPaths();
    const changes = {};

    modifiedFields.forEach((field) => {
      changes[field] = this.get(field);
    });

    this.history.push({
      updatedBy: this._updatedBy, // Este campo debe ser pasado manualmente en la actualización
      description: this._historyDescription || "Actualización de categoría",
      changes,
    });

    // Limitar el historial a las últimas 10 modificaciones (opcional)
    if (this.history.length > 10) {
      this.history.shift();
    }
  }
  next();
});

const Category = mongoose.model("Category", categorySchema);

module.exports = Category;
