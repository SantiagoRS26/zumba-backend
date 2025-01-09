const jwt = require('jsonwebtoken');

exports.verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader)
        return res.status(401).json({ message: 'No se recibió el token' });

    const token = authHeader.split(' ')[1];
    if (!token)
        return res.status(401).json({ message: 'Token inválido o ausente' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = decoded.userId;
        req.userRole = decoded.role;
        next();
    } catch (error) {
        return res.status(403).json({ message: 'Token expirado o inválido' });
    }
};

exports.isAdmin = (req, res, next) => {
    if (req.userRole !== 'admin' && req.userRole !== 'superadmin') {
        return res.status(403).json({ message: 'No tienes permiso para esta acción' });
    }
    next();
};

exports.isSuperAdmin = (req, res, next) => {
    if (req.userRole !== 'superadmin') {
        return res.status(403).json({ message: 'Solo superadmin tiene acceso' });
    }
    next();
};