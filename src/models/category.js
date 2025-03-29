const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    minlength: [3, 'El nombre debe tener al menos 3 caracteres'],
    maxlength: [50, 'El nombre no puede tener más de 50 caracteres']
  },
  description: {
    type: String,
    default: '',
    trim: true,
    maxlength: [200, 'La descripción no puede tener más de 200 caracteres']
  },
  imgEmojiIcon: {
    type: String,
    default: '/public/icons/2754.svg', // Default '❔' icon
    validate: {
      validator: function (v) {
        return /^(\/public\/icons\/[a-zA-Z0-9-_]+\.[a-zA-Z0-9]+)$/.test(v);
      },
      message: props => `${props.value} no es una URL válida para un icono.`
    },
    trim: true
  },
  active: {
    type: Boolean,
    default: true
  },
  history: [
    {
      updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
      },
      updatedAt: {
        type: Date,
        default: Date.now
      },
      description: {
        type: String
      },
      changes: {
        type: Map,
        of: mongoose.Schema.Types.Mixed
      }
    }
  ]
}, { timestamps: true });

// Middleware para registrar historial de cambios
categorySchema.pre('save', function (next) {
  if (!this.isNew && this.isModified()) {
    const modifiedFields = this.modifiedPaths();
    const changes = {};

    modifiedFields.forEach((field) => {
      changes[field] = this.get(field);
    });

    this.history.push({
      updatedBy: this._updatedBy || null, // Este campo debe ser pasado manualmente en la actualización
      description: this._historyDescription || 'Actualización de categoría',
      changes
    });
  }
  next();
});

const Category = mongoose.model('Category', categorySchema);

module.exports = Category;
