const { Router } = require('express');
const router = Router();
const classController = require('../controllers/classSession.controller');

const { verifyToken, isAdmin } = require('../middlewares/auth.middleware');

// Rutas específicas van primero
router.put('/:classId/assign-teacher', verifyToken, isAdmin, classController.assignTeacher);

// Crear una clase (admin)
router.post('/', verifyToken, isAdmin, classController.createClassSession);

// Listar clases (opcionalmente filtrar por mes/año)
router.get('/', verifyToken, classController.getAllClassSessions);

// Obtener detalle de una clase
router.get('/:classId', verifyToken, classController.getClassSession);

// Marcar asistencia (admin)
router.put('/:classId/attendance', verifyToken, isAdmin, classController.markAttendance);

// Actualizar info de la clase
router.put('/:classId', verifyToken, isAdmin, classController.updateClassSession);

// Eliminar la clase
router.delete('/:classId', verifyToken, isAdmin, classController.deleteClassSession);

// Historial de asistencias de un usuario
router.get('/user/:userId', verifyToken, isAdmin, classController.getUserAttendance);

module.exports = router;
