const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const jwtDir = path.join(__dirname, '../config/jwt');
const privateKeyPath = path.join(jwtDir, 'jwt-private.pem');
const publicKeyPath = path.join(jwtDir, 'jwt-public.pem');

if (!fs.existsSync(jwtDir)) {
  fs.mkdirSync(jwtDir, { recursive: true });
}

if (!fs.existsSync(privateKeyPath) || !fs.existsSync(publicKeyPath)) {
  console.log('🔐 Generando claves RSA...');

  try {
    execSync(`openssl genpkey -algorithm RSA -out ${privateKeyPath}`);
    execSync(`openssl rsa -in ${privateKeyPath} -pubout -out ${publicKeyPath}`);
    console.log('✅ Claves RSA generadas con éxito.');
  } catch (error) {
    console.error('❌ Error al generar las claves RSA:', error);
    process.exit(1);
  }
} else {
  console.log('🔑 Claves RSA ya existen, omitiendo generación.');
}
