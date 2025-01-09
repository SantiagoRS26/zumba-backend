// src/controllers/schedule.controller.js
const Schedule = require('../models/schedule.model');
const ClassSession = require('../models/classSession.model');

/**
 * Generar clases en base a un schedule, para un mes y año dados.
 * Ejemplo de body:
 * {
 *   "scheduleId": "...",
 *   "month": 1,
 *   "year": 2025
 * }
 */
exports.generateClassesFromSchedule = async (req, res) => {
  try {
    const { scheduleId, month, year } = req.body;

    // Buscar el schedule
    const schedule = await Schedule.findById(scheduleId);
    if (!schedule) {
      return res.status(404).json({ message: 'Schedule no encontrado' });
    }

    // Convertir a num
    const m = Number(month);
    const y = Number(year);

    // Generamos las fechas
    // Ej: si daysOfWeek=[1,3,5], creamos clases para todos los lunes, miércoles, viernes
    const classesToCreate = [];
    const daysOfWeek = schedule.daysOfWeek; // array de [1,3,5] = lun, mie, vie

    // Recorremos todos los días del mes (1..31, con cuidado de no pasarnos)
    const dateObj = new Date(y, m - 1, 1); // primer día (mes inicia en 0 en JS)
    while (dateObj.getMonth() + 1 === m) {
      // dayOfWeek en JS => 0=Dom,1=Lun,...6=Sab
      const dayOfWeek = dateObj.getDay();
      if (daysOfWeek.includes(dayOfWeek)) {
        // Creamos un record
        classesToCreate.push({
          day: dateObj.getDate(),
          month: m,
          year: y,
          startTime: schedule.startTime || '',
          endTime: schedule.endTime || ''
        });
      }
      // Pasamos al siguiente día
      dateObj.setDate(dateObj.getDate() + 1);
    }

    // Insertamos en la BD
    const classSessions = await ClassSession.insertMany(classesToCreate);

    return res.json({
      message: `Clases generadas para mes ${m}/${y}`,
      classSessions
    });
  } catch (error) {
    console.error('Error al generar clases:', error);
    res.status(500).json({ message: 'Error interno' });
  }
};
