// src/controllers/user.controller.js
const User = require('../models/user.model');
const Role = require('../models/role.model');

/**
 * Obtener el perfil del usuario que ha iniciado sesión (req.userId).
 * Se asume que en el middleware de autenticación se guardó userId en req.userId.
 */
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.userId).populate('role');
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    res.json({
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role?.name || '',
      userType: user.userType,        // Agregado
      profilePhoto: user.profilePhoto,
      weight: user.weight,
      height: user.height,
      measurements: user.measurements,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    });
  } catch (error) {
    console.error('Error al obtener perfil:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

/**
 * Lista de todos los usuarios (por ejemplo, para Admin/Superadmin).
 */
exports.getAllUsers = async (req, res) => {
  try {
    // Podrías aplicar algún filtro o paginación si lo deseas.
    const users = await User.find().populate('role');
    res.json(users.map((user) => ({
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role?.name || '',
      userType: user.userType,
      profilePhoto: user.profilePhoto,
      weight: user.weight,
      height: user.height,
      measurements: user.measurements,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    })));
  } catch (error) {
    console.error('Error al obtener todos los usuarios:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

/**
 * Actualizar datos de un usuario (rol, userType, etc.).
 * - Puede ser invocado por un Admin/Superadmin o por el mismo usuario (dependiendo de tu lógica).
 */
exports.updateUser = async (req, res) => {
  try {
    const { userId } = req.params; // id del usuario a actualizar
    const {
      username,
      email,
      roleName,       // para asignar un rol distinto
      userType,       // "student","teacher","sponsor","admin"
      profilePhoto,
      weight,
      height,
      measurements,
    } = req.body;

    // Si se quiere actualizar el rol, buscar el rol por nombre
    let roleFound = null;
    if (roleName) {
      roleFound = await Role.findOne({ name: roleName });
    }

    // Construir objeto de update (solo con campos que vengan en el body)
    const updateData = {};
    if (username !== undefined) updateData.username = username;
    if (email !== undefined) updateData.email = email;
    if (roleFound) updateData.role = roleFound._id;
    if (userType !== undefined) updateData.userType = userType; // Solo si permites cambiar
    if (profilePhoto !== undefined) updateData.profilePhoto = profilePhoto;
    if (weight !== undefined) updateData.weight = weight;
    if (height !== undefined) updateData.height = height;
    if (measurements !== undefined) updateData.measurements = measurements;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true }
    ).populate('role');

    if (!updatedUser) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    return res.json({
      message: 'Usuario actualizado',
      user: {
        id: updatedUser._id,
        username: updatedUser.username,
        email: updatedUser.email,
        role: updatedUser.role?.name || '',
        userType: updatedUser.userType,
        profilePhoto: updatedUser.profilePhoto,
        weight: updatedUser.weight,
        height: updatedUser.height,
        measurements: updatedUser.measurements,
        updatedAt: updatedUser.updatedAt
      }
    });
  } catch (error) {
    console.error('Error al actualizar usuario:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

/**
 * Obtener un usuario por su ID (para admin, etc.)
 */
exports.getUserById = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId).populate('role');
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    return res.json({
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role?.name || '',
      userType: user.userType,
      profilePhoto: user.profilePhoto,
      weight: user.weight,
      height: user.height,
      measurements: user.measurements,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    });
  } catch (error) {
    console.error('Error al obtener usuario por ID:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};
