// src/models/schedule.model.js
const mongoose = require('mongoose');

const TimeSlotSchema = new mongoose.Schema({
  dayOfWeek: {
    type: Number, // 0=Domingo..6=Sábado
    required: true
  },
  startTime: {
    type: String,
    default: ''
  },
  endTime: {
    type: String,
    default: ''
  }
}, { _id: false });

const ScheduleSchema = new mongoose.Schema({
  name: {
    type: String,
    default: ''
  },
  /**
   * timeSlots será un array de objetos
   * donde cada objeto indica dayOfWeek + startTime + endTime
   */
  timeSlots: {
    type: [TimeSlotSchema],
    default: []
  }
}, { timestamps: true });

module.exports = mongoose.model('Schedule', ScheduleSchema);
