const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const { ROLES } = require('../enums/user');
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: [3, 'El nombre debe tener al menos 3 caracteres'],
    maxlength: [50, 'El nombre no puede tener más de 50 caracteres'],
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
      message: "Por favor, ingresa un correo electrónico válido",
    },
  },
  password: {
    type: String,
    required: true,
    minlength: [8, 'La contraseña debe tener al menos 8 caracteres'],
    select: false,
  },
  passwordHistory: {
    type: [String],
    select: false,
  },
  role: {
    type: [String],
    enum: Object.values(ROLES),
    default: [ROLES.USER],
  },
  profileInfo: {
    photoUrl: {
      type: String,
      default: '',
    },
    backgroundUrl: { type: String, default: '' },
  },

  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);

  if (this.passwordHistory) {
    this.passwordHistory.push(this.password);
  } else {
    this.passwordHistory = [this.password];
  }

  next();
});

userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next();

  this.passwordChangedAt = Date.now() - 1000;
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
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );

    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");

  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  return resetToken;
};

module.exports = mongoose.model("User", userSchema);