import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import connectDB from './src/config/db.js';

import authRoutes from './src/routes/auth.routes.js';
import userRoutes from './src/routes/user.routes.js';
import seedRoutes from './src/routes/seed.routes.js';
import paymentRoutes from './src/routes/payment.routes.js';
import classSessionRoutes from './src/routes/classSession.routes.js';
import reportRoutes from './src/routes/report.routes.js';
import measurementRoutes from './src/routes/measurement.routes.js';
import scheduleRoutes from './src/routes/schedule.routes.js';

dotenv.config();

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
app.use('/api/schedules', scheduleRoutes);


app.get("/", (req, res) => {
    res.send("Welcome to the API Zumba");
})

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`>>> Servidor en puerto ${PORT}`);
});