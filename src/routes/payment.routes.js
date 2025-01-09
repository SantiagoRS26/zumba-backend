// src/routes/payment.routes.js
const { Router } = require('express');
const router = Router();
const paymentController = require('../controllers/payment.controller');
const {
  verifyToken,
  isAdmin,
} = require('../middlewares/auth.middleware');

// Crear un pago (admin)
router.post('/', verifyToken, isAdmin, paymentController.createPayment);

// Obtener un pago por id
router.get('/:paymentId', verifyToken, paymentController.getPayment);

// Listar todos los pagos (o filtrar por userId)
router.get('/', verifyToken, isAdmin, paymentController.getAllPayments);

// Pagos de un mes/año
router.get('/period/all', verifyToken, isAdmin, paymentController.getPaymentsByPeriod);

// Pagos de un usuario
router.get('/user/:userId', verifyToken, paymentController.getUserPayments);

// Actualizar datos (costo, meses pagados, etc.)
router.put('/:paymentId', verifyToken, isAdmin, paymentController.updatePayment);

// Eliminar un pago
router.delete('/:paymentId', verifyToken, isAdmin, paymentController.deletePayment);

module.exports = router;
