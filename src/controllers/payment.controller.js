// src/controllers/payment.controller.js

const Payment = require('../models/payment.model');
const User = require('../models/user.model');
const ClassSession = require('../models/classSession.model');
const mongoose = require('mongoose');

/**
 * Crear un pago (usualmente lo hace un admin o se hace al momento
 * de que un alumno/profesor/empresa realiza un pago).
 * 
 * Ejemplo de body esperado:
 * {
 *   "paymentType": "monthly",
 *   "userId": "abc123",
 *   "monthsPaid": [
 *     { "month": 1, "year": 2025 },
 *     { "month": 2, "year": 2025 }
 *   ],
 *   "classSessionId": "opc123",  // solo si es "single" o "teacher"
 *   "amount": 40000,
 *   "method": "transfer",
 *   "notes": "Pago por dos meses"
 * }
 */
exports.createPayment = async (req, res) => {
  try {
    const {
      paymentType,   // monthly, single, teacher, sponsor
      userId,        // alumno/profesor/sponsor
      monthsPaid,    // [{ month, year }, ...] - solo si paymentType="monthly" o "sponsor"
      classSessionId,// solo si paymentType="single" o "teacher"
      amount,
      method,        // cash, transfer, card, other
      notes
    } = req.body;

    // Validar datos mínimos
    if (!paymentType || !amount) {
      return res.status(400).json({
        message: 'paymentType y amount son obligatorios'
      });
    }

    // (Opcional) Validar que user exista (para monthly, single, teacher, sponsor)
    let userFound = null;
    if (userId) {
      userFound = await User.findById(userId);
      if (!userFound) {
        return res.status(404).json({ message: 'Usuario no encontrado' });
      }
    }

    // (Opcional) Validar classSession si corresponde
    let sessionFound = null;
    if ((paymentType === 'single' || paymentType === 'teacher') && classSessionId) {
      sessionFound = await ClassSession.findById(classSessionId);
      if (!sessionFound) {
        return res.status(404).json({ message: 'Clase (ClassSession) no encontrada' });
      }
    }

    // Construir objeto Payment
    const payment = new Payment({
      paymentType,
      user: userId || null, // puede ser null si no aplica
      monthsPaid: monthsPaid || [], // por si no viene
      classSession: classSessionId || null,
      amount,
      method: method || 'cash', // default 'cash'
      notes: notes || ''
      // status y paymentDate se setean por defecto en el schema
    });

    // Guardar
    await payment.save();

    return res.status(201).json({
      message: 'Pago creado exitosamente',
      payment
    });
  } catch (error) {
    console.error('Error al crear pago:', error);
    return res.status(500).json({
      message: 'Error interno al crear pago'
    });
  }
};

/**
 * Obtener la información de un pago específico
 * /api/payments/:paymentId
 */
exports.getPayment = async (req, res) => {
  try {
    const { paymentId } = req.params;

    // Validar id de Mongo
    if (!mongoose.Types.ObjectId.isValid(paymentId)) {
      return res.status(400).json({ message: 'paymentId inválido' });
    }

    const payment = await Payment.findById(paymentId)
      .populate('user', 'username email')
      .populate('classSession');

    if (!payment) {
      return res.status(404).json({ message: 'Pago no encontrado' });
    }

    return res.json(payment);
  } catch (error) {
    console.error('Error al obtener pago:', error);
    return res.status(500).json({ message: 'Error interno' });
  }
};

/**
 * Listar todos los pagos (opcionalmente filtrado por usuario)
 * GET /api/payments?userId=abc123
 */
exports.getAllPayments = async (req, res) => {
  try {
    const { userId } = req.query;
    const query = {};

    if (userId) {
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({ message: 'userId inválido' });
      }
      query.user = userId;
    }

    const payments = await Payment.find(query)
      .populate('user', 'username email')
      .populate('classSession')
      .sort({ createdAt: -1 });

    return res.json(payments);
  } catch (error) {
    console.error('Error al obtener pagos:', error);
    return res.status(500).json({ message: 'Error interno' });
  }
};

/**
 * Listar pagos por "mes y año".
 * Dado que ahora usamos monthsPaid = [{month, year}, ...],
 * debemos buscar dentro del array con un $elemMatch.
 * 
 * Ej: /api/payments/period?month=1&year=2025
 */
exports.getPaymentsByPeriod = async (req, res) => {
  try {
    const { month, year } = req.query;
    if (!month || !year) {
      return res.status(400).json({
        message: 'Faltan parámetros month y year'
      });
    }

    const m = Number(month);
    const y = Number(year);

    // Buscamos dentro de monthsPaid
    const payments = await Payment.find({
      monthsPaid: {
        $elemMatch: {
          month: m,
          year: y
        }
      }
    })
      .populate('user', 'username email')
      .populate('classSession')
      .sort({ createdAt: -1 });

    return res.json(payments);
  } catch (error) {
    console.error('Error al obtener pagos por periodo:', error);
    return res.status(500).json({ message: 'Error interno' });
  }
};

/**
 * Listar todos los pagos de un usuario específico
 * GET /api/payments/user/:userId
 */
exports.getUserPayments = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'userId inválido' });
    }

    const payments = await Payment.find({ user: userId })
      .populate('user', 'username email')
      .populate('classSession')
      .sort({ createdAt: -1 });

    return res.json(payments);
  } catch (error) {
    console.error('Error al obtener pagos de usuario:', error);
    return res.status(500).json({ message: 'Error interno' });
  }
};

/**
 * Actualizar datos de un pago.
 * - Podría servir para cambiar 'status', 'notes', 'amount', etc.
 * - Aquí ya NO manejamos abonos ni #clases, solo update a fields existentes.
 * 
 * Ejemplo de body:
 * {
 *   "paymentType": "single",
 *   "amount": 8000,
 *   "method": "transfer",
 *   "notes": "Pagado de otra forma"
 * }
 */
exports.updatePayment = async (req, res) => {
  try {
    const { paymentId } = req.params;

    // Validar id
    if (!mongoose.Types.ObjectId.isValid(paymentId)) {
      return res.status(400).json({ message: 'paymentId inválido' });
    }

    // Campos que se podrían actualizar
    const {
      paymentType,
      userId,
      monthsPaid,
      classSessionId,
      amount,
      method,
      status,
      notes
    } = req.body;

    const payment = await Payment.findById(paymentId);
    if (!payment) {
      return res.status(404).json({ message: 'Pago no encontrado' });
    }

    // Actualizar cada campo si viene en body
    if (paymentType) payment.paymentType = paymentType;
    if (userId) {
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({ message: 'userId inválido' });
      }
      payment.user = userId;
    }
    if (Array.isArray(monthsPaid)) payment.monthsPaid = monthsPaid;
    if (classSessionId) {
      if (!mongoose.Types.ObjectId.isValid(classSessionId)) {
        return res.status(400).json({ message: 'classSessionId inválido' });
      }
      payment.classSession = classSessionId;
    }
    if (amount !== undefined) payment.amount = amount;
    if (method) payment.method = method;
    if (status) payment.status = status; // 'pending' o 'completed'
    if (notes !== undefined) payment.notes = notes;

    await payment.save();

    return res.json({
      message: 'Pago actualizado correctamente',
      payment
    });
  } catch (error) {
    console.error('Error al actualizar pago:', error);
    return res.status(500).json({ message: 'Error interno' });
  }
};

/**
 * Eliminar un pago
 * DELETE /api/payments/:paymentId
 */
exports.deletePayment = async (req, res) => {
  try {
    const { paymentId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(paymentId)) {
      return res.status(400).json({ message: 'paymentId inválido' });
    }

    const deletedPayment = await Payment.findByIdAndDelete(paymentId);
    if (!deletedPayment) {
      return res
        .status(404)
        .json({ message: 'No se encontró el pago a eliminar' });
    }
    return res.json({ message: 'Pago eliminado con éxito' });
  } catch (error) {
    console.error('Error al eliminar pago:', error);
    return res.status(500).json({ message: 'Error interno' });
  }
};