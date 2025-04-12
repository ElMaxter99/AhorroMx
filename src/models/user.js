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
      validator: function (val) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
      },
      message: 'Por favor, ingresa un correo electrónico válido'
    }
  },
  credentials: {
    password: {
      type: String,
      required: true,
      minlength: [8, 'La contraseña debe tener al menos 8 caracteres'],
      select: false
    },
    passwordHistory: {
      type: [String],
      select: false
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
    photoUrl: {
      type: String,
      default: ''
    },
    backgroundUrl: {
      type: String, default: ''
    },
    firstName: {
      type: String,
      default: ''
    },
    lastName: {
      type: String,
      default: ''
    },
    birthDate: {
      type: Date,
      default: null
    }
  },
  active: {
    type: Boolean
  },
  blocked: {
    type: Boolean
  },
  deleted: {
    type: Boolean
  }
}, { timestamps: true });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.credentials.password = await bcrypt.hash(this.credentials.password, 10);

  if (this.credentials.passwordHistory) {
    this.credentials.passwordHistory.push(this.credentials.password);
  } else {
    this.credentials.passwordHistory = [this.credentials.password];
  }

  next();
});

userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next();

  this.credentials.passwordChangedAt = Date.now() - 1000;
  next();
});

userSchema.pre(/^find/, function (next) {
  this.find({ active: { $ne: false } });
  next();
});

userSchema.methods.comparePassword = async function (password) {
  return bcrypt.compare(password, this.password);
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

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.credentials.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  this.credentials.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  return resetToken;
};

module.exports = mongoose.model('User', userSchema);
