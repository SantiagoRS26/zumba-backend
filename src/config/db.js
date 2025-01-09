const mongoose = require('mongoose');

async function connectDB(uri) {
    try {
        await mongoose.connect(uri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log(">>> Conexión a MongoDB exitosa");
    } catch (error) {
        console.error("Error al conectar a MongoDB:", error);
        process.exit(1);
    }
}

module.exports = connectDB;