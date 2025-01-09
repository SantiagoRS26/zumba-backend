// src/routes/report.routes.js
const { Router } = require('express');
const router = Router();

const reportController = require('../controllers/report.controller');
const { verifyToken, isAdmin } = require('../middlewares/auth.middleware');

// --- Reportes de pagos ---
router.get('/debtors', verifyToken, isAdmin, reportController.getDebtors);
router.get('/payments-summary', verifyToken, isAdmin, reportController.getPaymentsSummary);
router.get('/payments-range', verifyToken, isAdmin, reportController.getPaymentsByDateRange);

// --- Reportes de asistencia ---
router.get('/attendance-summary', verifyToken, isAdmin, reportController.getAttendanceSummaryByMonth);
router.get('/user-attendance', verifyToken, isAdmin, reportController.getUserAttendanceByMonth);

module.exports = router;