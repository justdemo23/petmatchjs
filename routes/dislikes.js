const express = require('express');
const router = express.Router();
const db = require('../db'); // ✅ Aquí usas db, no pool
const authenticate = require('../middleware/auth'); // ✅ Correcto (sin "s")



// Eliminar un like (dislike)
router.delete('/:likeId', authenticate, async (req, res) => {
    const { likeId } = req.params;
    console.log("Recibiendo solicitud para eliminar like con ID:", likeId);

    if (!likeId || isNaN(likeId)) {
        return res.status(400).json({ message: "ID de like inválido" });
    }

    try {
        // ❌ ERROR: Antes usabas "pool.query", pero importaste "db"
        // ✅ SOLUCIÓN: Cambia "pool.query" por "db.query"
        const [like] = await db.query("SELECT * FROM likes WHERE id = ?", [likeId]);

        if (like.length === 0) {
            return res.status(404).json({ message: "Like no encontrado" });
        }

        await db.query("DELETE FROM likes WHERE id = ?", [likeId]);

        res.status(200).json({ message: "Like eliminado correctamente" });
    } catch (error) {
        console.error("Error al eliminar el like:", error);
        res.status(500).json({ message: "Error interno del servidor" });
    }
});

module.exports = router;
