// src/models/measurement.model.js
const mongoose = require('mongoose');

const MeasurementSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  // Ejemplo de campos de medidas
  weight: Number,
  height: Number,
  chest: Number,
  waist: Number,
  hips: Number,
  // Puedes agregar más campos si lo deseas
}, { timestamps: true });

module.exports = mongoose.model('Measurement', MeasurementSchema);
