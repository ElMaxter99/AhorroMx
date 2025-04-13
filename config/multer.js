// config/multer.js
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const config = require('../config');

const {
  PROFILE_IMAGES_DIR
  // DOCUMENTS_DIR
} = config.UPLOADS;

// Helper para asegurarte que el directorio existe
const ensureDirExists = (dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
};

// === Profile image uploader ===
ensureDirExists(PROFILE_IMAGES_DIR);

const profileStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, PROFILE_IMAGES_DIR),
  filename: (req, file, cb) => {
    const userId = req.user?._id || 'temp';
    const ext = path.extname(file.originalname);
    cb(null, `user_${userId}${ext}`);
  }
});

const profileImageUpload = multer({
  storage: profileStorage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50 MB
  fileFilter: (req, file, cb) => {
    const allowed = ['.jpg', '.jpeg', '.png', 'svg', '.gif'];
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, allowed.includes(ext));
  }
});

// === Document uploader === TODO Gestion de documentos
// ensureDirExists(DOCUMENTS_DIR);

// const docStorage = multer.diskStorage({
//   destination: (req, file, cb) => cb(null, DOCUMENTS_DIR),
//   filename: (req, file, cb) => {
//     const userId = req.user?._id || 'temp';
//     const timestamp = Date.now();
//     const ext = path.extname(file.originalname);
//     const base = path.basename(file.originalname, ext).replace(/\s+/g, '_');
//     cb(null, `user_${userId}_${base}_${timestamp}${ext}`);
//   }
// });

// const docUpload = multer({
//   storage: docStorage,
//   limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
//   fileFilter: (req, file, cb) => {
//     const allowed = ['.pdf', '.doc', '.docx', '.txt'];
//     const ext = path.extname(file.originalname).toLowerCase();
//     cb(null, allowed.includes(ext));
//   }
// });

module.exports = {
  profileImageUpload
  // docUpload
};
