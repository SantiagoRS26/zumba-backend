// src/routes/schedule.routes.js
const { Router } = require('express');
const router = Router();

const scheduleController = require('../controllers/schedule.controller');
const { verifyToken, isAdmin } = require('../middlewares/auth.middleware');

// GET /schedules
router.get('/', verifyToken, scheduleController.getAllSchedules);

// POST /schedules
router.post('/', verifyToken, isAdmin, scheduleController.createSchedule);

// POST /schedules/generate
router.post('/generate', verifyToken, isAdmin, scheduleController.generateClassesFromSchedule);

// DELETE /schedules/:scheduleId
router.delete('/:scheduleId', verifyToken, isAdmin, scheduleController.deleteSchedule);

module.exports = router;
