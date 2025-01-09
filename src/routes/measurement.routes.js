const { Router } = require('express');
const router = Router();
const measurementController = require('../controllers/measurement.controller');
const { verifyToken, isAdmin } = require('../middlewares/auth.middleware');

// Crear medición
router.post('/', verifyToken, isAdmin, measurementController.createMeasurement);

// Historial de un usuario
router.get('/user/:userId', verifyToken, isAdmin, measurementController.getMeasurementsByUser);

// Editar medición
router.put('/:measurementId', verifyToken, isAdmin, measurementController.updateMeasurement);

// Eliminar medición
router.delete('/:measurementId', verifyToken, isAdmin, measurementController.deleteMeasurement);

module.exports = router;
