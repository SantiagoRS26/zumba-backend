// src/models/schedule.model.js
const mongoose = require('mongoose');

const ScheduleSchema = new mongoose.Schema({
  name: {
    type: String,
    default: ''
  },
  // Ejemplo: [1, 3, 5] => lunes, miércoles, viernes
  daysOfWeek: {
    type: [Number], // 0=Domingo..6=Sábado
    default: []
  },
  startTime: {
    type: String,
    default: ''
  },
  endTime: {
    type: String,
    default: ''
  }
  // Podrías poner más campos si gustas
}, { timestamps: true });

module.exports = mongoose.model('Schedule', ScheduleSchema);
