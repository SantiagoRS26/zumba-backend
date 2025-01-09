const Measurement = require('../models/measurement.model');
const User = require('../models/user.model');

/**
 * Crear una nueva medición para un usuario
 * Body esperado:
 * {
 *   "userId": "...",
 *   "weight": 80,
 *   "height": 170,
 *   "chest": 100,
 *   "waist": 80,
 *   "hips": 90
 * }
 */
exports.createMeasurement = async (req, res) => {
  try {
    const { userId, weight, height, chest, waist, hips } = req.body;

    // Verificar que el usuario existe
    const userFound = await User.findById(userId);
    if (!userFound) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Crear nueva medición
    const newMeasurement = new Measurement({
      user: userId,
      weight,
      height,
      chest,
      waist,
      hips
    });

    await newMeasurement.save();
    return res.status(201).json({
      message: 'Medición registrada exitosamente',
      measurement: newMeasurement
    });
  } catch (error) {
    console.error('Error al crear medición:', error);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
};

/**
 * Obtener historial de mediciones de un usuario
 * Ejemplo de ruta: GET /api/measurements/user/:userId
 */
exports.getMeasurementsByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    // Opcional: validar si userId es ObjectId válido
    const measurements = await Measurement.find({ user: userId })
      .sort({ date: -1 }); // orden descendente por fecha

    return res.json(measurements);
  } catch (error) {
    console.error('Error al obtener mediciones:', error);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
};

/**
 * (Opcional) Editar una medición específica
 */
exports.updateMeasurement = async (req, res) => {
  try {
    const { measurementId } = req.params;
    const { weight, height, chest, waist, hips } = req.body;

    const updatedMeas = await Measurement.findByIdAndUpdate(
      measurementId,
      { weight, height, chest, waist, hips },
      { new: true }
    );
    if (!updatedMeas) {
      return res.status(404).json({ message: 'Medición no encontrada' });
    }

    res.json({
      message: 'Medición actualizada',
      measurement: updatedMeas
    });
  } catch (error) {
    console.error('Error al actualizar medición:', error);
    return res.status(500).json({ message: 'Error interno' });
  }
};

/**
 * (Opcional) Eliminar una medición específica
 */
exports.deleteMeasurement = async (req, res) => {
  try {
    const { measurementId } = req.params;

    const deletedMeas = await Measurement.findByIdAndDelete(measurementId);
    if (!deletedMeas) {
      return res.status(404).json({ message: 'Medición no encontrada' });
    }

    res.json({ message: 'Medición eliminada exitosamente' });
  } catch (error) {
    console.error('Error al eliminar medición:', error);
    return res.status(500).json({ message: 'Error interno' });
  }
};