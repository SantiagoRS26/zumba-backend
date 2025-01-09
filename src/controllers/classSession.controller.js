const ClassSession = require('../models/classSession.model');
const mongoose = require('mongoose');

/**
 * Crear manualmente una clase (sin schedule).
 * Body:
 * {
 *   "day": 10,
 *   "month": 1,
 *   "year": 2025,
 *   "startTime": "07:00",
 *   "endTime": "08:00"
 * }
 */
exports.createClassSession = async (req, res) => {
    try {
        const { day, month, year, startTime, endTime } = req.body;

        const classSession = new ClassSession({
            day,
            month,
            year,
            startTime: startTime || '',
            endTime: endTime || ''
        });

        await classSession.save();
        res.status(201).json({
            message: 'Clase creada exitosamente',
            classSession
        });
    } catch (error) {
        console.error('Error al crear clase:', error);
        res.status(500).json({ message: 'Error interno al crear clase' });
    }
};

/**
 * Listar clases con filtros opcionales por mes/año
 */
exports.getAllClassSessions = async (req, res) => {
    try {
        const { month, year } = req.query;
        const query = {};
        if (month) query.month = Number(month);
        if (year) query.year = Number(year);

        const classes = await ClassSession.find(query).sort({ year: 1, month: 1, day: 1 });
        res.json(classes);
    } catch (error) {
        console.error('Error al obtener clases:', error);
        res.status(500).json({ message: 'Error interno' });
    }
};

/**
 * Obtener una clase por ID
 */
exports.getClassSession = async (req, res) => {
    try {
        const { classId } = req.params;
        const classSession = await ClassSession.findById(classId).populate('attendances.user', 'username email');
        if (!classSession) {
            return res.status(404).json({ message: 'Clase no encontrada' });
        }
        res.json(classSession);
    } catch (error) {
        console.error('Error al obtener la clase:', error);
        res.status(500).json({ message: 'Error interno' });
    }
};

/**
 * Marcar/actualizar asistencia de uno o varios usuarios
 */
exports.markAttendance = async (req, res) => {
    try {
        const { classId } = req.params;
        const { attendances } = req.body; // array de { userId, status }

        const classSession = await ClassSession.findById(classId);
        if (!classSession) {
            return res.status(404).json({ message: 'Clase no encontrada' });
        }

        attendances.forEach(({ userId, status }) => {
            if (!mongoose.Types.ObjectId.isValid(userId)) return;

            const index = classSession.attendances.findIndex(
                att => att.user.toString() === userId
            );
            if (index >= 0) {
                // Actualiza status
                classSession.attendances[index].status = status;
            } else {
                // Agrega nuevo
                classSession.attendances.push({ user: userId, status });
            }
        });

        await classSession.save();
        res.json({ message: 'Asistencia actualizada', classSession });
    } catch (error) {
        console.error('Error al marcar asistencia:', error);
        res.status(500).json({ message: 'Error interno' });
    }
};

/**
 * Actualizar la fecha u otros datos de la clase
 * Body: { day, month, year, startTime, endTime }
 */
exports.updateClassSession = async (req, res) => {
    try {
        const { classId } = req.params;
        const { day, month, year, startTime, endTime } = req.body;

        const classSession = await ClassSession.findById(classId);
        if (!classSession) {
            return res.status(404).json({ message: 'Clase no encontrada' });
        }

        if (day != null) classSession.day = day;
        if (month != null) classSession.month = month;
        if (year != null) classSession.year = year;
        if (startTime != null) classSession.startTime = startTime;
        if (endTime != null) classSession.endTime = endTime;

        await classSession.save();
        res.json({ message: 'Clase actualizada', classSession });
    } catch (error) {
        console.error('Error al actualizar clase:', error);
        res.status(500).json({ message: 'Error interno' });
    }
};

/**
 * Eliminar la clase
 */
exports.deleteClassSession = async (req, res) => {
    try {
        const { classId } = req.params;
        const deletedClass = await ClassSession.findByIdAndDelete(classId);
        if (!deletedClass) {
            return res.status(404).json({ message: 'Clase no encontrada' });
        }
        res.json({ message: 'Clase eliminada' });
    } catch (error) {
        console.error('Error al eliminar clase:', error);
        res.status(500).json({ message: 'Error interno' });
    }
};

exports.getUserAttendance = async (req, res) => {
    try {
      const { userId } = req.params;
  
      // Buscar clases donde el usuario marcó asistencia
      const classes = await ClassSession.find({ 'attendance.userId': userId })
        .select('date title attendance') // Selecciona los campos necesarios
        .lean();
  
      // Filtrar las asistencias del usuario específico
      const attendanceHistory = classes.map((classSession) => {
        const userAttendance = classSession.attendance.find(
          (a) => a.userId.toString() === userId
        );
  
        return {
          classId: classSession._id,
          title: classSession.title,
          date: classSession.date,
          status: userAttendance ? userAttendance.status : 'absent',
        };
      });
  
      return res.json(attendanceHistory);
    } catch (error) {
      console.error('Error al obtener asistencias del usuario:', error);
      return res.status(500).json({ message: 'Error interno del servidor' });
    }
  };