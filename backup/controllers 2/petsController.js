const mysql = require('mysql2/promise');

const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '71422400dmpb',
    database: 'petmatch'
});

async function getPets(req, res) {
    try {
        const [rows] = await pool.execute('SELECT * FROM pets');
        res.render('pets', { pets: rows });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener las mascotas' });
    }
}

module.exports = { getPets };