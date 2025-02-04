const express = require('express');
const router = express.Router();
const loginController = require('../controllers/loginController');

// Ruta de login
router.post('/login', loginController.login);

// Ruta protegida de ejemplo
router.get('/profile', loginController.authenticateToken, loginController.profile);

module.exports = router;
