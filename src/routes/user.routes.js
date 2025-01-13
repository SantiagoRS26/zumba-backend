const { Router } = require('express');
const router = Router();

const userController = require('../controllers/user.controller');
const { verifyToken, isAdmin, isSuperAdmin } = require('../middlewares/auth.middleware');

router.get('/teachers', verifyToken, isAdmin, userController.getAllTeachers);

router.get('/profile', verifyToken, userController.getProfile);

router.get('/', verifyToken, isAdmin, userController.getAllUsers);

router.put('/:userId', verifyToken, isAdmin, userController.updateUser);

router.get('/:userId', verifyToken, isAdmin, userController.getUserById);


module.exports = router;