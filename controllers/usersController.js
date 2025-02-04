const db = require('../db');

// Crear un nuevo usuario
const createUser = async (req, res) => {
    const { email, password, first_name, last_name, address } = req.body;

    if (!email || !password || !first_name || !last_name) {
        return res.status(400).json({ message: 'Faltan campos obligatorios' });
    }

    try {
        const [existingUser] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
        if (existingUser.length > 0) {
            return res.status(409).json({ message: 'Este correo ya está registrado.' });
        }

        const [result] = await db.execute(
            `INSERT INTO users (email, password, first_name, last_name, address)
            VALUES (?, ?, ?, ?, ?)`,
            [email, password, first_name, last_name, address]
        );

        res.status(201).json({ message: 'Usuario registrado exitosamente', userId: result.insertId });
    } catch (error) {
        console.error('Error al registrar usuario:', error);
        res.status(500).json({ message: 'Error en el servidor al registrar el usuario' });
    }
};

module.exports = { createUser };
