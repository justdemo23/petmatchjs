const express = require('express');
const path = require('path');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const router = express.Router();

// Middleware para verificar autenticación antes de servir el Dashboard
const authenticate = (req, res, next) => {
    const token = req.cookies?.token || req.header('Authorization')?.split(" ")[1];

    if (!token) {
        return res.status(401).send("Acceso denegado. Debes iniciar sesión.");
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(403).send("Token inválido.");
    }
};

// Ruta protegida para servir el Dashboard
router.get('/', authenticate, (req, res) => {
    res.sendFile(path.join(__dirname, '../public/dashboard.html'));
});

module.exports = router;
