const express = require('express');
const router = express.Router();
const db = require('../db'); // ✅ Base de datos
const authenticate = require('../middleware/auth'); // ✅ Middleware de autenticación

// ✅ Eliminar un like y eliminar el match en ambas direcciones si existe
router.delete('/:likeId', authenticate, async (req, res) => {
    const { likeId } = req.params;
    console.log("Recibiendo solicitud para eliminar like con ID:", likeId);

    if (!likeId || isNaN(likeId)) {
        return res.status(400).json({ message: "ID de like inválido" });
    }

    try {
        // ✅ Verificar si el like existe
        const [like] = await db.query("SELECT * FROM likes WHERE id = ?", [likeId]);

        if (like.length === 0) {
            return res.status(404).json({ message: "Like no encontrado" });
        }

        // ✅ Obtener las mascotas involucradas en el like
        const petIdFrom = like[0].pet_id_from;
        const petIdTo = like[0].pet_id_to;

        // ✅ Eliminar el like del usuario actual
        await db.query("DELETE FROM likes WHERE id = ?", [likeId]);
        console.log(`Like con ID ${likeId} eliminado.`);

        // ✅ También eliminar el like de la otra persona si existe
        const [reverseLike] = await db.query(
            "SELECT * FROM likes WHERE pet_id_from = ? AND pet_id_to = ?",
            [petIdTo, petIdFrom]
        );

        if (reverseLike.length > 0) {
            const reverseLikeId = reverseLike[0].id;
            await db.query("DELETE FROM likes WHERE id = ?", [reverseLikeId]);
            console.log(`Like inverso con ID ${reverseLikeId} eliminado.`);
        }

        // ✅ Verificar si existe un match entre estas dos mascotas
        const [match] = await db.query(
            `SELECT * FROM matches 
             WHERE (pet_id_1 = ? AND pet_id_2 = ?) 
                OR (pet_id_1 = ? AND pet_id_2 = ?)`,
            [petIdFrom, petIdTo, petIdTo, petIdFrom]
        );

        if (match.length > 0) {
            const matchId = match[0].id;

            // ✅ Eliminar el match si existe
            await db.query("DELETE FROM matches WHERE id = ?", [matchId]);
            console.log(`Match entre ${petIdFrom} y ${petIdTo} eliminado.`);
        }

        res.status(200).json({ message: "Like eliminado correctamente y match eliminado si existía en ambas direcciones" });

    } catch (error) {
        console.error("❌ Error al eliminar el like y el match:", error);
        res.status(500).json({ message: "Error interno del servidor" });
    }
});

module.exports = router;
