const { Router } = require('express');
const router = Router();
const Role = require('../models/role.model');
router.get('/init-roles', async (req, res) => {
    try {
        const count = await Role.countDocuments();
        if (count > 0) {
            return res.status(400).json({ message: 'Roles ya fueron inicializados' });
        }

        await Role.insertMany([
            { name: 'superadmin', permissions: ['all'] },
            { name: 'admin', permissions: ['create_user', 'read_user', 'update_user'] },
            { name: 'user', permissions: [] },
        ]);

        res.status(201).json({ message: 'Roles inicializados correctamente' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al inicializar roles' });
    }
});

module.exports = router;