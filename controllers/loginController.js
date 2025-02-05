// controllers/loginController.js

const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('../db');

// Clave secreta para JWT (definida directamente en el código)
const JWT_SECRET = 'P3tM@tch$2024!_s3cur3_k3y#JWT';


// Función para autenticar el token JWT
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.sendStatus(401);

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

// Función de login
const login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Correo y contraseña son obligatorios' });
    }

    try {
        const [rows] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);

        if (rows.length === 0) {
            return res.status(401).json({ message: 'Credenciales inválidas' });
        }

        const user = rows[0];
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Credenciales inválidas' });
        }

        const token = jwt.sign(
            { 
                id: user.id, 
                email: user.email,
                first_name: user.first_name,
                last_name: user.last_name
            },
            JWT_SECRET,
            { expiresIn: '2h' }
        );

        res.status(200).json({ 
            token, 
            user: { 
                id: user.id, 
                email: user.email, 
                first_name: user.first_name, 
                last_name: user.last_name 
            } 
        });
    } catch (error) {
        console.error('Error en el login:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};

// Ruta protegida de ejemplo
const profile = (req, res) => {
    res.status(200).json({ message: 'Acceso concedido', user: req.user });
};

module.exports = { login, authenticateToken, profile };
