const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const User = require('../models/user');
const config = require('../../config');

// 📌 Genera un token JWT
const generateToken = (user) => {
  return jwt.sign(
    { userId: user._id, role: user.role },
    config.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

// 📌 Registro de usuario
exports.register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password } = req.body;
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ message: 'El correo ya está en uso.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({ name, email, password: hashedPassword });
    await newUser.save();

    const token = generateToken(newUser);
    res.status(201).json({ message: 'Usuario registrado.', token });
  } catch (error) {
    res.status(500).json({ message: 'Error en el registro.', error });
  }
};

// 📌 Inicio de sesión
exports.login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'Credenciales incorrectas.' });
    }

    const token = generateToken(user);
    res.json({ message: 'Inicio de sesión exitoso.', token });
  } catch (error) {
    res.status(500).json({ message: 'Error en el inicio de sesión.', error });
  }
};

// 📌 Cierre de sesión (Frontend elimina el token)
exports.logout = (req, res) => {
  res.json({ message: 'Sesión cerrada correctamente.' });
};

// 📌 Renovación de token
exports.refreshToken = (req, res) => {
  try {
    const { token } = req.body;
    const decoded = jwt.verify(token, config.JWT_SECRET);

    const newToken = generateToken({ _id: decoded.userId, role: decoded.role });
    res.json({ token: newToken });
  } catch (error) {
    res.status(401).json({ message: 'Token inválido o expirado.' });
  }
};

// 📌 Recuperación de contraseña (Pendiente de implementación con email)
exports.forgotPassword = async (req, res) => {
  res.json({ message: 'Funcionalidad en desarrollo.' });
};

// 📌 Resetear contraseña
exports.resetPassword = async (req, res) => {
  res.json({ message: 'Funcionalidad en desarrollo.' });
};
