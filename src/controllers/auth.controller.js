// src/controllers/auth.controller.js

const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/user.model');
const Role = require('../models/role.model');

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Faltan credenciales' });
    }

    const user = await User.findOne({ username }).populate('role');
    if (!user) {
      return res.status(401).json({ message: 'Usuario no encontrado' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Contraseña incorrecta' });
    }

    // Aquí puedes decidir si incluir userType en el token
    // Por ejemplo, { userId: user._id, role: user.role?.name, userType: user.userType }
    const token = jwt.sign(
      {
        userId: user._id,
        role: user.role?.name, 
        userType: user.userType // <--- OPCIONAL
      },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.json({
      message: 'Login exitoso',
      token,
      user: {
        id: user._id,
        username: user.username,
        role: user.role?.name || 'No role',
        userType: user.userType, // <--- lo devolvemos en la respuesta
      },
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

exports.register = async (req, res) => {
  try {
    const { username, password, email, roleName, userType } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Faltan datos obligatorios' });
    }

    // Buscar el rol si se especificó
    let roleFound = null;
    if (roleName) {
      roleFound = await Role.findOne({ name: roleName });
      if (!roleFound) {
        return res.status(400).json({ message: 'Rol no válido' });
      }
    }

    // Asignar userType si viene en la petición, o un valor por defecto
    const finalUserType = userType || 'student'; // por ejemplo, 'student'

    const newUser = new User({
      username,
      password,
      email,
      role: roleFound ? roleFound._id : null,
      userType: finalUserType,
    });

    await newUser.save();

    res.status(201).json({
      message: 'Usuario creado exitosamente',
      user: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email || '',
        userType: newUser.userType,
      },
    });
  } catch (error) {
    console.error('Error en register:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};