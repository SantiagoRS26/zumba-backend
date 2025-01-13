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

exports.createSchedule = async (req, res) => {
  try {
    const { name, daysOfWeek, startTime, endTime } = req.body;

    // Validaciones
    if (!name || !daysOfWeek || !Array.isArray(daysOfWeek) || daysOfWeek.length === 0) {
      return res.status(400).json({ message: 'Debes proveer un nombre y al menos un día de la semana.' });
    }
    if (!startTime || !endTime) {
      return res.status(400).json({ message: 'Debes proveer una hora de inicio y fin.' });
    }

    // Convertir daysOfWeek en timeSlots
    const timeSlots = daysOfWeek.map(day => ({
      dayOfWeek: day,
      startTime,
      endTime,
    }));

    // Crear el objeto schedule
    const schedule = new Schedule({
      name,
      timeSlots,
    });

    // Guardar en la base de datos
    await schedule.save();
    return res.status(201).json({
      message: 'Schedule creado exitosamente',
      schedule,
    });
  } catch (error) {
    console.error('Error al crear schedule:', error);
    return res.status(500).json({ message: 'Error interno' });
  }
};


exports.generateClassesFromSchedule = async (req, res) => {
  try {
    const { scheduleId, month, year } = req.body;
    const schedule = await Schedule.findById(scheduleId);
    if (!schedule) {
      return res.status(404).json({ message: 'Schedule no encontrado' });
    }

    const m = Number(month);
    const y = Number(year);

    const timeSlots = schedule.timeSlots; 
    // Ejemplo de timeSlots:
    // [
    //   { dayOfWeek: 1, startTime: "14:00", endTime: "16:00" },
    //   { dayOfWeek: 2, startTime: "16:00", endTime: "18:00" },
    //   { dayOfWeek: 2, startTime: "18:00", endTime: "19:00" } // se puede tener más de uno en un mismo día
    // ]

    const classesToCreate = [];
    const dateObj = new Date(y, m - 1, 1); // primer día del mes

    while (dateObj.getMonth() + 1 === m) {
      const currentDay = dateObj.getDate();       // p.ej. 1..31
      const dayOfWeekJs = dateObj.getDay();       // 0=Dom..6=Sab

      // Filtrar todos los slots que coincidan con dayOfWeekJs
      const slotsForThisDay = timeSlots.filter(
        (slot) => slot.dayOfWeek === dayOfWeekJs
      );

      // Por cada slot, creamos un record
      for (const slot of slotsForThisDay) {
        classesToCreate.push({
          day: currentDay,
          month: m,
          year: y,
          startTime: slot.startTime || '',
          endTime: slot.endTime || '',
        });
      }

      dateObj.setDate(dateObj.getDate() + 1);
    }

    const ClassSession = require('../models/classSession.model');
    const classSessions = await ClassSession.insertMany(classesToCreate);

    return res.json({
      message: `Clases generadas para el mes ${m}/${y}`,
      classSessions,
    });
  } catch (error) {
    console.error('Error al generar clases:', error);
    return res.status(500).json({ message: 'Error interno' });
  }
};


exports.getAllSchedules = async (req, res) => {
  try {
    const schedules = await Schedule.find();
    return res.json(schedules);
  } catch (error) {
    console.error('Error al obtener schedules:', error);
    return res.status(500).json({ message: 'Error interno' });
  }
};

exports.deleteSchedule = async (req, res) => {
  try {
    const { scheduleId } = req.params;
    const deleted = await Schedule.findByIdAndDelete(scheduleId);
    if (!deleted) {
      return res.status(404).json({ message: 'Schedule no encontrado' });
    }
    return res.json({ message: 'Schedule eliminado correctamente.' });
  } catch (error) {
    console.error('Error al eliminar schedule:', error);
    return res.status(500).json({ message: 'Error interno' });
  }
};