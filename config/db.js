const mongoose = require("mongoose");
const config = require("../config");

const connectDB = async () => {
  try {
    await mongoose.connect(config.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
    });

    console.log("✅ MongoDB conectado");
  } catch (error) {
    console.error("❌ Error al conectar con MongoDB:", error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
