const mongoose = require('mongoose');
const User = require('../src/models/user');
const Category = require('../src/models/category');
const Group = require('../src/models/group');

const config = require('../config');
const { logger } = require('../src/utils/logger');

const args = process.argv.slice(2);
const noClean = args.includes('--no-clean');
const logOnly = args.includes('--log-only');
const usersOnly = args.includes('--users-only');
const groupsOnly = args.includes('--groups-only');
const categoriesOnly = args.includes('--categories-only');

const seedDatabase = async () => {
  try {
    if (!config.MONGO_URI) {
      throw new Error('❌ MONGO_URI is not defined in the environment variables');
    }
    await mongoose.connect(config.MONGO_URI, {
      serverSelectionTimeoutMS: 5000
    });
    logger.info('📡 Conectado a MongoDB');

    if (!noClean && !logOnly) {
      await User.deleteMany();
      await Category.deleteMany();
      await Group.deleteMany();
      logger.info('🧹 Base de datos limpiada');
    }

    if (logOnly) {
      logger.info('📝 Modo log activado. No se modificarán los datos.');
      mongoose.connection.close();
      return;
    }

    let admin, user, userAdmin;

    if (!groupsOnly && !categoriesOnly) {
      // Crear usuarios
      admin = await User.create({
        username: config.SEED.ADMIN.USERNAME,
        email: config.SEED.ADMIN.EMAIL,
        credentials: {
          password: config.SEED.ADMIN.PASSWORD
        },
        role: ['ADMIN']
      });

      user = await User.create({
        username: config.SEED.USER.EMAIL,
        email: config.SEED.USER.EMAIL,
        credentials: {
          password: config.SEED.USER.PASSWORD
        },
        role: ['USER']
      });

      userAdmin = await User.create({
        username: config.SEED.USERADMIN.USERNAME,
        email: config.SEED.USERADMIN.EMAIL,
        credentials: {
          password: config.SEED.USERADMIN.PASSWORD
        },
        role: ['ADMIN', 'USER']
      });

      logger.info('✅ Usuarios creados');
    }

    if (!usersOnly && !categoriesOnly) {
      // Crear grupo con userAdmin como owner y admin, y user y userAdmin como miembros
      await Group.create({
        name: 'Grupo de prueba',
        description: 'Este es un grupo de prueba',
        owner: userAdmin._id,
        admins: [userAdmin._id],
        members: [user._id, userAdmin._id]
      });

      logger.info('✅ Grupo creado');
    }

    if (!usersOnly && !groupsOnly) {
      // Categorías predefinidas
      const categories = [
        { name: 'Alimentación', description: 'Gastos en comida y supermercados', imgEmojiIcon: '/public/icons/1f37d.svg' },
        { name: 'Transporte', description: 'Gastos en gasolina, autobús, metro', imgEmojiIcon: '/public/icons/1f68c.svg' },
        { name: 'Ocio', description: 'Cines, bares, entretenimiento', imgEmojiIcon: '/public/icons/1f3ac.svg' },
        { name: 'Salud', description: 'Consultas médicas, medicamentos', imgEmojiIcon: '/public/icons/1f48a.svg' },
        { name: 'Educación', description: 'Libros, cursos, formación', imgEmojiIcon: '/public/icons/1f4da.svg' },
        { name: 'Hogar', description: 'Alquiler, hipoteca, mantenimiento', imgEmojiIcon: '/public/icons/1f3e0.svg' },
        { name: 'Ropa', description: 'Ropa, calzado y accesorios', imgEmojiIcon: '/public/icons/1f455.svg' },
        { name: 'Tecnología', description: 'Gadgets, móviles, ordenadores', imgEmojiIcon: '/public/icons/1f4bb.svg' },
        { name: 'Viajes', description: 'Vacaciones, hoteles, vuelos', imgEmojiIcon: '/public/icons/2708.svg' },
        { name: 'Otros', description: 'Gastos varios', imgEmojiIcon: '/public/icons/1f516.svg' },
        { name: 'Sin categorizar' }
      ];

      await Category.insertMany(
        categories.map(cat => ({
          ...cat,
          createdBy: admin._id
        }))
      );

      logger.info('✅ Categorías creadas');
    }

    logger.info('🎉 Seed completado');
    mongoose.connection.close();
  } catch (error) {
    logger.error('❌ Error en el seed:', error);
    mongoose.connection.close();
  }
};

seedDatabase();
