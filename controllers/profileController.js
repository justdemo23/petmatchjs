const db = require("../db");

// 🔹 Obtener perfil del usuario con mascotas y suscripción
const getProfile = async (req, res) => {
    const { userId } = req.params;

    try {
        // 🔹 Obtener datos del usuario
        const [user] = await db.execute(
            `SELECT u.id, u.email, u.first_name, u.last_name, u.address, u.is_premium, 
                    s.plan AS subscription_plan, s.start_date, s.end_date
             FROM users u
             LEFT JOIN subscriptions s ON u.id = s.user_id
             WHERE u.id = ?`,
            [userId]
        );

        if (user.length === 0) {
            return res.status(404).json({ message: "Usuario no encontrado" });
        }

        // 🔹 Obtener las mascotas del usuario
        const [pets] = await db.execute(
            `SELECT p.id, p.name, p.breed, p.age, p.description, pi.filepath AS image 
             FROM pets p
             LEFT JOIN pet_images pi ON p.id = pi.pet_id
             WHERE p.owner_id = ?`,
            [userId]
        );

        res.json({ user: user[0], pets });
    } catch (error) {
        console.error("❌ Error al obtener perfil:", error);
        res.status(500).json({ message: "Error interno del servidor" });
    }
};

// 🔹 Actualizar perfil del usuario
const updateProfile = async (req, res) => {
    const { userId } = req.params;
    const { first_name, last_name, address } = req.body;

    try {
        await db.execute(
            `UPDATE users SET first_name = ?, last_name = ?, address = ? WHERE id = ?`,
            [first_name, last_name, address, userId]
        );

        res.json({ message: "Perfil actualizado correctamente" });
    } catch (error) {
        console.error("❌ Error al actualizar perfil:", error);
        res.status(500).json({ message: "Error interno del servidor" });
    }
};

const deleteAccount = async (req, res) => {
    const userId = Number(req.params.userId);
    
    if (isNaN(userId) || userId <= 0) {
        return res.status(400).json({ message: "ID de usuario inválido" });
    }

    try {
        console.log("🔍 Intentando eliminar usuario con ID:", userId);

        // 1️⃣ Verificar si el usuario existe
        const [user] = await db.execute(`SELECT id FROM users WHERE id = ?`, [userId]);
        if (user.length === 0) {
            return res.status(404).json({ message: "Usuario no encontrado" });
        }

        // 🔥 2️⃣ Eliminar dependencias antes de eliminar las mascotas
        await db.execute(`DELETE FROM likes WHERE pet_id_from IN (SELECT id FROM pets WHERE owner_id = ?)`, [userId]);
        await db.execute(`DELETE FROM likes WHERE pet_id_to IN (SELECT id FROM pets WHERE owner_id = ?)`, [userId]); // 🔹 NUEVA LÍNEA
        await db.execute(`DELETE FROM dislikes WHERE pet_id_from IN (SELECT id FROM pets WHERE owner_id = ?)`, [userId]);
        await db.execute(`DELETE FROM dislikes WHERE pet_id_to IN (SELECT id FROM pets WHERE owner_id = ?)`, [userId]); // 🔹 NUEVA LÍNEA
        await db.execute(`DELETE FROM matches WHERE pet_id_1 IN (SELECT id FROM pets WHERE owner_id = ?) OR pet_id_2 IN (SELECT id FROM pets WHERE owner_id = ?)`, [userId, userId]);
        await db.execute(`DELETE FROM pet_images WHERE pet_id IN (SELECT id FROM pets WHERE owner_id = ?)`, [userId]);

        // 3️⃣ Ahora sí, eliminar las mascotas
        await db.execute(`DELETE FROM pets WHERE owner_id = ?`, [userId]);

        // 4️⃣ Eliminar otros registros relacionados al usuario
        await db.execute(`DELETE FROM messages WHERE sender_id = ? OR receiver_id = ?`, [userId, userId]);
        await db.execute(`DELETE FROM forum_comments WHERE user_id = ?`, [userId]);
        await db.execute(`DELETE FROM forum_posts WHERE user_id = ?`, [userId]);
        await db.execute(`DELETE FROM subscriptions WHERE user_id = ?`, [userId]);

        // 5️⃣ Finalmente, eliminar el usuario
        await db.execute(`DELETE FROM users WHERE id = ?`, [userId]);

        console.log(`✅ Usuario con ID ${userId} eliminado correctamente.`);
        res.json({ message: "Cuenta eliminada correctamente" });

    } catch (error) {
        console.error("❌ Error al eliminar cuenta:", error.sqlMessage || error.message);
        res.status(500).json({ message: "Error interno del servidor", error: error.sqlMessage || error.message });
    }
};

module.exports = { getProfile, updateProfile, deleteAccount };
