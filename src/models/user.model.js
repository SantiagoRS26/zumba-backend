// src/models/user.model.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  email: String,
  password: {
    type: String,
    required: true,
  },
  role: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Role',
    default: null,
  },
  // Opcional: para indicar claramente el tipo de usuario:
  // "student", "teacher", "sponsor", "admin", etc.
  userType: {
    type: String,
    enum: ['student', 'teacher', 'sponsor', 'admin'],
    default: 'student',
  },
  profilePhoto: {
    type: String,
    default: '',
  },
  weight: Number,
  height: Number,
  measurements: {
    chest: Number,
    waist: Number,
    hips: Number,
    // ... otros campos
  }
}, { timestamps: true });

// Hook para encriptar la contraseña
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    return next(error);
  }
});

// Método para comparar contraseñas
UserSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
