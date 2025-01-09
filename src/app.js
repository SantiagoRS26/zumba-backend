require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const seedRoutes = require('./routes/seed.routes');
const paymentRoutes = require('./routes/payment.routes');
const classSessionRoutes = require('./routes/classSession.routes');
const reportRoutes = require('./routes/report.routes');
const measurementRoutes = require('./routes/measurement.routes');

const app = express();

app.use(cors());

app.use(express.json());

connectDB(process.env.MONGODB_URI);

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/seed', seedRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/class-sessions', classSessionRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/measurements', measurementRoutes);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`>>> Servidor en puerto ${PORT}`);
});