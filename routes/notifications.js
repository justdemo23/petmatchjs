const express = require('express');
const router = express.Router();
const db = require('../db');  // Asegúrate de que la conexión a la base de datos está correcta

// Ruta para obtener notificaciones de likes
router.get('/:petId', async (req, res) => {  // Aquí debe ser '/:petId' no '/:petId/notifications'
    const { petId } = req.params;

    try {
        const [likesReceived] = await db.execute(`
            SELECT l.id, l.pet_id_from, p.name AS pet_name, p.breed, p.age, i.filepath AS pet_image
            FROM likes l
            JOIN pets p ON l.pet_id_from = p.id
            LEFT JOIN pet_images i ON p.id = i.pet_id
            WHERE l.pet_id_to = ?
            ORDER BY l.created_at DESC
        `, [petId]);

        res.status(200).json(likesReceived);
    } catch (error) {
        console.error('Error al obtener notificaciones de likes:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
});

module.exports = router;