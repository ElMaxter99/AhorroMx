const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');
const config = require('../../config');

const transporter = nodemailer.createTransport({
  host: config.EMAIL.HOST,
  port: config.EMAIL.PORT,
  auth: {
    user: config.EMAIL.USER,
    pass: config.EMAIL.PASS
  }
});

/**
 * Reemplaza dinámicamente los valores en una plantilla HTML.
 * Soporta estructuras como {{user.name}}, {{extraData.info}}, {{token}}
 *
 * @param {string} template - Contenido HTML de la plantilla.
 * @param {object} data - Datos dinámicos para reemplazar en la plantilla.
 * @returns {string} - Plantilla con valores reemplazados.
 */
const replaceTemplateData = (template, data) => {
  const regex = /\{\{([\w.]+)\}\}/g;

  return template.replace(regex, (_, key) => {
    const keys = key.split('.');
    let value = data;

    for (const k of keys) {
      value = value?.[k];
      if (value === undefined) return `{{${key}}}`; // No reemplaza si la variable no existe
    }

    return value;
  });
};

/**
 * Envía un correo basado en una plantilla HTML.
 * @param {string} to - Correo del destinatario.
 * @param {string} subject - Asunto del correo.
 * @param {object} template - { templateType, templateName } para definir la ruta del HTML.
 * @param {object} data - Datos a inyectar en la plantilla.
 */
const sendEmail = async (to, subject, template, data = {}) => {
  try {
    if (!template || !template.templateType || !template.templateName) {
      throw new Error('El objeto template debe contener templateType y templateName');
    }

    const templatePath = path.join(
      __dirname,
      `../templates/email/${template.templateType}/${template.templateName}.html`
    );

    if (!fs.existsSync(templatePath)) {
      throw new Error(`La plantilla ${templatePath} no existe`);
    }

    let emailTemplate = fs.readFileSync(templatePath, 'utf8');

    emailTemplate = replaceTemplateData(emailTemplate, data);

    const mailOptions = {
      from: `'SplitFlow' <${config.EMAIL.USER}>`,
      to,
      subject,
      html: emailTemplate
    };

    await transporter.sendMail(mailOptions);
    console.log(`📩 Correo enviado a ${to}`);
  } catch (error) {
    console.error('❌ Error al enviar correo:', error);
  }
};

module.exports = sendEmail;
