const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { ROLES } = require('../enums/user');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: [3, 'El nombre debe tener al menos 3 caracteres'],
    maxlength: [50, 'El nombre no puede tener más de 50 caracteres']
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    validate: {
      validator: val => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val),
      message: 'Por favor, ingresa un correo electrónico válido'
    }
  },
  credentials: {
    password: {
      type: String,
      required: true,
      minlength: [8, 'La contraseña debe tener al menos 8 caracteres']
    },
    passwordHistory: {
      type: [String]
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date
  },
  role: {
    type: [String],
    enum: Object.values(ROLES),
    default: [ROLES.USER]
  },
  profileInfo: {
    photoUrl: { type: String, default: '' },
    backgroundUrl: { type: String, default: '' },
    firstName: { type: String, default: '' },
    lastName: { type: String, default: '' },
    birthDate: { type: Date, default: null }
  },
  active: { type: Boolean, default: true },
  blocked: { type: Boolean, default: false },
  deleted: { type: Boolean, default: false }
}, { timestamps: true });

userSchema.pre('save', async function (next) {
  if (!this.isModified('credentials.password')) return next();

  const hashedPassword = await bcrypt.hash(this.credentials.password, 10);

  // Guarda en historial
  if (this.credentials.passwordHistory) {
    this.credentials.passwordHistory.push(hashedPassword);
  } else {
    this.credentials.passwordHistory = [hashedPassword];
  }

  this.credentials.password = hashedPassword;
  next();
});

// Marca fecha de cambio de contraseña si no es nuevo
userSchema.pre('save', function (next) {
  if (!this.isModified('credentials.password') || this.isNew) return next();
  this.credentials.passwordChangedAt = Date.now() - 1000;
  next();
});

// Todo esto esta sacado en userBll
userSchema.methods.comparePassword = async function (password) {
  return bcrypt.compare(password, this.credentials.password);
};

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.credentials.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.credentials.passwordChangedAt.getTime() / 1000,
      10
    );
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

// Todo revisar, esto es una idea de conecepto
userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.credentials.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  this.credentials.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutos

  return resetToken;
};

module.exports = mongoose.model('User', userSchema);
