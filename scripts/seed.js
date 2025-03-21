const mongoose = require("mongoose");
const User = require("../src/models/user");
const Category = require("../src/models/category");
const Group = require("../src/models/group");
require("dotenv").config();

const args = process.argv.slice(2);
const noClean = args.includes("--no-clean");
const logOnly = args.includes("--log-only");
const usersOnly = args.includes("--users-only");
const groupsOnly = args.includes("--groups-only");
const categoriesOnly = args.includes("--categories-only");

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("📡 Conectado a MongoDB");

    if (!noClean && !logOnly) {
      await User.deleteMany();
      await Category.deleteMany();
      await Group.deleteMany();
      console.log("🧹 Base de datos limpiada");
    }

    if (logOnly) {
      console.log("📝 Modo log activado. No se modificarán los datos.");
      mongoose.connection.close();
      return;
    }

    let admin, user, userAdmin;

    if (!groupsOnly && !categoriesOnly) {
      // Crear usuarios
      admin = await User.create({
        username: process.env.SEED_SCRIPT_ADMIN_USERNAME,
        email: process.env.SEED_SCRIPT_ADMIN_EMAIL,
        password: process.env.SEED_SCRIPT_ADMIN_PASSWORD,
        role: ["ADMIN"],
      });

      user = await User.create({
        username: process.env.SEED_SCRIPT_USER_USERNAME,
        email: process.env.SEED_SCRIPT_USER_EMAIL,
        password: process.env.SEED_SCRIPT_USER_PASSWORD,
        role: ["USER"],
      });

      userAdmin = await User.create({
        username: process.env.SEED_SCRIPT_USERADMIN_USERNAME,
        email: process.env.SEED_SCRIPT_USERADMIN_EMAIL,
        password: process.env.SEED_SCRIPT_USERADMIN_PASSWORD,
        role: ["ADMIN", "USER"],
      });

      console.log("✅ Usuarios creados");
    }

    if (!usersOnly && !categoriesOnly) {
      // Crear grupo con userAdmin como owner y admin, y user y userAdmin como miembros
      await Group.create({
        name: "Grupo de prueba",
        description: "Este es un grupo de prueba",
        owner: userAdmin._id,
        admins: [userAdmin._id],
        members: [user._id, userAdmin._id],
      });

      console.log("✅ Grupo creado");
    }

    if (!usersOnly && !groupsOnly) {
      // Categorías predefinidas
      const categories = [
        { name: "Alimentación", description: "Gastos en comida y supermercados", emojiIcon: "🍽" },
        { name: "Transporte", description: "Gastos en gasolina, autobús, metro", emojiIcon: "🚌" },
        { name: "Ocio", description: "Cines, bares, entretenimiento", emojiIcon: "🎬" },
        { name: "Salud", description: "Consultas médicas, medicamentos", emojiIcon: "💊" },
        { name: "Educación", description: "Libros, cursos, formación", emojiIcon: "📚" },
        { name: "Hogar", description: "Alquiler, hipoteca, mantenimiento", emojiIcon: "🏠" },
        { name: "Ropa", description: "Ropa, calzado y accesorios", emojiIcon: "👕" },
        { name: "Tecnología", description: "Gadgets, móviles, ordenadores", emojiIcon: "💻" },
        { name: "Viajes", description: "Vacaciones, hoteles, vuelos", emojiIcon: "✈️" },
        { name: "Otros", description: "Gastos varios", emojiIcon: "🔖" },
      ];

      await Category.insertMany(
        categories.map(cat => ({
          ...cat,
          createdBy: admin._id,
        }))
      );

      console.log("✅ Categorías creadas");
    }

    console.log("🎉 Seed completado");
    mongoose.connection.close();
  } catch (error) {
    console.error("❌ Error en el seed:", error);
    mongoose.connection.close();
  }
};

seedDatabase();
