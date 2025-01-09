// src/models/payment.model.js
const mongoose = require('mongoose');

/**
 * PaymentSchema (SIN abonos parciales).
 * Se paga todo el monto de una sola vez.
 */
const PaymentSchema = new mongoose.Schema(
  {
    /**
     * Identifica el tipo de pago:
     *  - "monthly": pago mensual del alumno (ej. 20.000/mes).
     *  - "single": pago de un alumno por 1 clase suelta (8.000).
     *  - "teacher": pago a un profesor (o profesores) por dictar la(s) clase(s).
     *  - "sponsor": pago de la empresa patrocinadora.
     */
    paymentType: {
      type: String,
      enum: ['monthly', 'single', 'teacher', 'sponsor'],
      required: true
    },

    /**
     * Usuario que paga o al que se le paga, depende del contexto:
     *  - "monthly" o "single": es el alumno.
     *  - "teacher": es el profesor que recibe el pago.
     *  - "sponsor": la empresa patrocinadora (si la manejas como "User").
     */
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },

    /**
     * Sólo aplica cuando paymentType="single" (clase suelta)
     * o "teacher" (pago a profesor por la clase).
     * También se podría usar en "sponsor" si la empresa
     * paga la clase puntual de un día específico.
     */
    classSession: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ClassSession',
      default: null
    },

    /**
     * Para pagos de varios meses de una sola vez.
     * Aplica cuando paymentType="monthly" (pagos del alumno)
     * o "sponsor" (pagos de la empresa a lo largo del mes).
     * 
     * Ej.: 
     *   monthsPaid: [
     *     { month: 1, year: 2025 },
     *     { month: 2, year: 2025 }
     *   ]
     * 
     *   => significa que el alumno pagó enero y febrero de 2025
     *      en un solo registro.
     */
    monthsPaid: [
      {
        month: Number, // 1=enero, 2=feb, ...
        year: Number
      }
    ],

    /**
     * Monto total pagado en UNA sola transacción.
     * - monthly => 20,000 * número de meses
     * - single => 8,000
     * - teacher => 60,000 (por hora, 120,000 si fueron 2 horas/profesores, etc.)
     * - sponsor => lo que cubra la empresa
     */
    amount: {
      type: Number,
      required: true
    },

    /**
     * Método de pago (ya que no hay abonos, solo uno).
     */
    method: {
      type: String,
      enum: ['cash', 'transfer', 'card', 'other'],
      default: 'cash'
    },

    /**
     * Estado del pago (sin abonos, básicamente "pending" o "completed").
     * - "pending": si está registrado pero no se ha confirmado.
     * - "completed": se completó el pago.
     */
    status: {
      type: String,
      enum: ['pending', 'completed'],
      default: 'pending'
    },

    /**
     * Para guardar la fecha efectiva del pago (si es distinta del createdAt).
     */
    paymentDate: {
      type: Date,
      default: Date.now
    },

    notes: {
      type: String,
      default: ''
    }
  },
  { timestamps: true }
);

/**
 * Hook pre-save para determinar automáticamente el "status":
 * - Si amount > 0 y se supone que se paga de una vez,
 *   podrías setear status = 'completed' por defecto.
 */
PaymentSchema.pre('save', function (next) {
  // Si deseas forzar que todo pago se guarde como 'completed'
  // en el momento de creación, puedes hacerlo así:
  if (this.isNew && this.amount > 0) {
    this.status = 'completed';
  }
  next();
});

module.exports = mongoose.model('Payment', PaymentSchema);