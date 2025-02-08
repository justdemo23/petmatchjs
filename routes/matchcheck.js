const express = require('express');
const router = express.Router();
const db = require('../db');



router.get('/check-match/:pet1Id/:pet2Id', async (req, res) => {
    try {
        const { pet1Id, pet2Id } = req.params;
        
        const query = `
            SELECT * FROM matches 
            WHERE (pet_id_1 = ? AND pet_id_2 = ?) 
               OR (pet_id_1 = ? AND pet_id_2 = ?)
        `;

        const [results] = await db.query(query, [pet1Id, pet2Id, pet2Id, pet1Id]);

        res.json({
            matched: results.length > 0,
            matchData: results[0] || null
        });

    } catch (error) {
        res.status(500).json({
            message: 'Error al verificar el match',
            error: error.message
        });
    }
});

module.exports = router;
