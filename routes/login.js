const express = require('express');
const router = express.Router();
const { login } = require('../controllers/loginController');

// Ruta de login
router.post('/login', login);

module.exports = router;
