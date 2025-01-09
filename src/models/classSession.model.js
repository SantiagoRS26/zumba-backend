// src/models/classSession.model.js
const mongoose = require('mongoose');

const AttendanceSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    status: {
      type: String,
      enum: ['present', 'absent'],
      default: 'present'
    }
  },
  { _id: false }
);

const ClassSessionSchema = new mongoose.Schema(
  {
    day: {
      type: Number,
      required: true // Ej: 10 (día del mes)
    },
    month: {
      type: Number,
      required: true // 1=Enero, 2=Febrero...
    },
    year: {
      type: Number,
      required: true
    },
    startTime: {
      type: String,
      default: ''
    },
    endTime: {
      type: String,
      default: ''
    },
    // Array de profesores que dictan la clase
    teachers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    ],
    // Asistencias de los alumnos
    attendances: {
      type: [AttendanceSchema],
      default: []
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('ClassSession', ClassSessionSchema);
