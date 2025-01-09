// src/controllers/report.controller.js
const Payment = require('../models/payment.model');
const ClassSession = require('../models/classSession.model');
const User = require('../models/user.model');
const mongoose = require('mongoose');

/**
 * Reporte de deudores:
 * - Filtra todos los Payment con status = 'pending' o 'partial'.
 * - Opcional: filtrar por mes/año (ej. "?month=1&year=2025")
 */
exports.getDebtors = async (req, res) => {
    try {
        const { month, year } = req.query;
        const query = {
            status: { $in: ['pending', 'partial'] }
        };
        if (month && year) {
            query.month = Number(month);
            query.year = Number(year);
        }

        const debtors = await Payment.find(query)
            .populate('user', 'username email')
            .sort({ createdAt: -1 });

        res.json(debtors);
    } catch (error) {
        console.error('Error al obtener deudores:', error);
        res.status(500).json({ message: 'Error interno' });
    }
};

/**
 * Reporte global de pagos:
 * - Agrupa por 'status'
 * - Suma la cantidad de docs, la suma de abonos, etc.
 * Query opcional ?month=...&year=...
 */
exports.getPaymentsSummary = async (req, res) => {
    try {
        const { month, year } = req.query;

        const matchStage = {};
        if (month && year) {
            matchStage.month = Number(month);
            matchStage.year = Number(year);
        }

        const pipeline = [
            { $match: matchStage },
            {
                $project: {
                    user: 1,
                    status: 1,
                    totalAmount: 1,
                    partialSum: { $sum: '$partialPayments.amount' }
                }
            },
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 },
                    totalRecaudado: { $sum: '$partialSum' },
                    totalTeorico: { $sum: '$totalAmount' }
                }
            }
        ];

        const results = await Payment.aggregate(pipeline);

        // results será un array con subdocumentos por cada status
        // Ej: [ { _id: 'completed', count: 5, totalRecaudado: 100000, totalTeorico: 100000 }, ... ]
        res.json(results);
    } catch (error) {
        console.error('Error al obtener resumen de pagos:', error);
        res.status(500).json({ message: 'Error interno' });
    }
};

/**
* Reporte por rango de fechas: /api/reports/payments-range?start=2025-01-01&end=2025-01-31
*/
exports.getPaymentsByDateRange = async (req, res) => {
    try {
        const { start, end } = req.query;
        const startDate = start ? new Date(start) : new Date('1970-01-01');
        const endDate = end ? new Date(end) : new Date();

        const pipeline = [
            {
                $match: {
                    createdAt: {
                        $gte: startDate,
                        $lte: endDate
                    }
                }
            },
            {
                $project: {
                    user: 1,
                    status: 1,
                    totalAmount: 1,
                    partialSum: { $sum: '$partialPayments.amount' },
                    createdAt: 1
                }
            },
            // Podrías agrupar o simplemente devolver la lista
        ];

        const payments = await Payment.aggregate(pipeline);
        res.json(payments);
    } catch (error) {
        console.error('Error en reporte por rango de fechas:', error);
        res.status(500).json({ message: 'Error interno' });
    }
};


/**
* Reporte de asistencia global en un mes:
* - Cuántas clases se impartieron
* - Cuántos "present" totales hubo
*/
exports.getAttendanceSummaryByMonth = async (req, res) => {
    try {
        const { month, year } = req.query;
        if (!month || !year) {
            return res
                .status(400)
                .json({ message: 'Faltan query params month, year' });
        }

        const m = Number(month);
        const y = Number(year);

        // Buscamos todas las clases de ese mes/año
        const classes = await ClassSession.find({ month: m, year: y });

        const totalClases = classes.length;
        let totalAsistencias = 0;

        classes.forEach((c) => {
            // Contar cuántos "present"
            const presentCount = c.attendances.filter(
                (att) => att.status === 'present'
            ).length;
            totalAsistencias += presentCount;
        });

        res.json({
            totalClases,
            totalAsistencias,
            averageAttendancePerClass:
                totalClases > 0 ? totalAsistencias / totalClases : 0
        });
    } catch (error) {
        console.error('Error en asistencia mensual:', error);
        res.status(500).json({ message: 'Error interno' });
    }
};

/**
* Cuántas asistencias (status=present) tiene un user en un mes
* /api/reports/user-attendance?userId=...&month=...&year=...
*/
exports.getUserAttendanceByMonth = async (req, res) => {
    try {
        const { userId, month, year } = req.query;
        if (!userId || !month || !year) {
            return res.status(400).json({
                message: 'Faltan userId, month, year'
            });
        }

        const m = Number(month);
        const y = Number(year);

        // Buscamos las clases del mes
        const classes = await ClassSession.find({ month: m, year: y });

        let attendedCount = 0;

        classes.forEach((cls) => {
            const found = cls.attendances.find(
                (att) =>
                    att.user.toString() === userId && att.status === 'present'
            );
            if (found) {
                attendedCount++;
            }
        });

        res.json({
            userId,
            month: m,
            year: y,
            attendedCount
        });
    } catch (error) {
        console.error('Error en reporte de asistencia por user:', error);
        res.status(500).json({ message: 'Error interno' });
    }
};
