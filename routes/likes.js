const express = require('express');
const router = express.Router();
const db = require('../db');

// Dar like a una mascota y verificar si hay match
router.post('/:petId/like', async (req, res) => {
    const { petId } = req.params;  // Mascota que recibe el like
    const { pet_id_from } = req.body;  // Mascota que da el like

    try {
        // Verificar si ya existe el like para evitar duplicados
        const [existingLike] = await db.execute(
            'SELECT * FROM likes WHERE pet_id_from = ? AND pet_id_to = ?',
            [pet_id_from, petId]
        );

        if (existingLike.length > 0) {
            return res.status(400).json({ message: 'Ya diste like a esta mascota' });
        }

        // Insertar el like en la base de datos
        await db.execute(
            'INSERT INTO likes (pet_id_from, pet_id_to) VALUES (?, ?)',
            [pet_id_from, petId]
        );

        // Verificar si la otra mascota ya había dado like de vuelta (Match)
        const [reciprocalLike] = await db.execute(
            'SELECT * FROM likes WHERE pet_id_from = ? AND pet_id_to = ?',
            [petId, pet_id_from]
        );

        if (reciprocalLike.length > 0) {
            // Generar la clave única del match
            const matchKey = [Math.min(pet_id_from, petId), Math.max(pet_id_from, petId)].join('-');

            // Insertar el match si no existe
            await db.execute(
                'INSERT INTO matches (pet_id_1, pet_id_2, match_key) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE matched_at = CURRENT_TIMESTAMP',
                [Math.min(pet_id_from, petId), Math.max(pet_id_from, petId), matchKey]
            );

            return res.status(201).json({ message: '¡Es un match!', match: true });
        }

        res.status(201).json({ message: 'Like registrado exitosamente', match: false });
    } catch (error) {
        console.error('Error al registrar el like:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
});

// Ver matches de una mascota
router.get('/:petId/matches', async (req, res) => {
    const { petId } = req.params;

    try {
        const [matches] = await db.execute(`
            SELECT p.id, p.name, p.breed, p.age 
            FROM matches m
            JOIN pets p ON (m.pet_id_1 = p.id OR m.pet_id_2 = p.id)
            WHERE (m.pet_id_1 = ? OR m.pet_id_2 = ?) AND p.id != ?
        `, [petId, petId, petId]);

        res.status(200).json(matches);
    } catch (error) {
        console.error('Error al obtener matches:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
});

module.exports = router;