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

// 🔹 Eliminar cuenta del usuario
const deleteAccount = async (req, res) => {
    const { userId } = req.params;

    try {
        await db.execute(`DELETE FROM users WHERE id = ?`, [userId]);
        res.json({ message: "Cuenta eliminada correctamente" });
    } catch (error) {
        console.error("❌ Error al eliminar cuenta:", error);
        res.status(500).json({ message: "Error interno del servidor" });
    }
};

module.exports = { getProfile, updateProfile, deleteAccount };
