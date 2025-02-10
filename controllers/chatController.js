const db = require("../db");

// 🔹 Guardar mensaje en la base de datos
const saveMessage = async (senderId, receiverId, message) => {
    try {
        const [result] = await db.execute(
            `INSERT INTO messages (sender_id, receiver_id, message) VALUES (?, ?, ?)`,
            [senderId, receiverId, message]
        );

        return {
            id: result.insertId,
            senderId,
            receiverId,
            message,
            created_at: new Date().toISOString(),
        };
    } catch (error) {
        console.error("❌ Error al guardar mensaje:", error);
        throw error;
    }
};

// 🔹 Obtener mensajes privados entre dos usuarios
const getMessages = async (req, res) => {
    const { userId, otherUserId } = req.params;

    try {
        const [messages] = await db.execute(
            `SELECT * FROM messages 
             WHERE (sender_id = ? AND receiver_id = ?) 
             OR (sender_id = ? AND receiver_id = ?)
             ORDER BY created_at ASC`,
            [userId, otherUserId, otherUserId, userId]
        );

        res.json(messages);
    } catch (error) {
        console.error("❌ Error al obtener mensajes:", error);
        res.status(500).json({ message: "Error interno del servidor" });
    }
};

// 🔹 Obtener la lista de conversaciones del usuario
const getConversations = async (req, res) => {
    const { userId } = req.params;

    try {
        const [conversations] = await db.execute(
            `SELECT DISTINCT u.id, u.email 
             FROM users u 
             JOIN messages m ON u.id = m.sender_id OR u.id = m.receiver_id
             WHERE u.id != ?`,
            [userId]
        );

        res.json(conversations);
    } catch (error) {
        console.error("❌ Error al obtener conversaciones:", error);
        res.status(500).json({ message: "Error interno del servidor" });
    }
};

// 🔹 Obtener mensajes recibidos por un usuario
const getReceivedMessages = async (req, res) => {
    const { userId } = req.params;

    try {
        const [messages] = await db.execute(
            `SELECT m.id, m.sender_id, m.message, m.created_at, u.email AS sender_email 
             FROM messages m
             JOIN users u ON m.sender_id = u.id
             WHERE m.receiver_id = ?
             ORDER BY m.created_at DESC`,
            [userId]
        );

        res.json(messages);
    } catch (error) {
        console.error("❌ Error al obtener mensajes recibidos:", error);
        res.status(500).json({ message: "Error interno del servidor" });
    }
};

// 🔹 Enviar mensaje desde API REST
const sendMessage = async (req, res) => {
    const { senderId, receiverId, message } = req.body;

    if (!senderId || !receiverId || !message) {
        return res.status(400).json({ message: "Todos los campos son obligatorios" });
    }

    try {
        const savedMessage = await saveMessage(senderId, receiverId, message);

        // **📌 Verifica que `req.io` existe antes de usarlo**
        if (!req.io) {
            console.error("❌ Error: `req.io` no está disponible en `chatController.js`.");
            return res.status(500).json({ message: "Error interno del servidor: WebSocket no disponible." });
        }

        // **📌 Emitir mensaje solo al destinatario**
        req.io.to(`user-${receiverId}`).emit("newMessage", savedMessage);
        req.io.to(`user-${senderId}`).emit("newMessage", savedMessage);

        res.status(201).json({ message: "Mensaje enviado correctamente", savedMessage });
    } catch (error) {
        console.error("❌ Error al enviar mensaje:", error);
        res.status(500).json({ message: "Error al enviar mensaje", error: error.message });
    }
};

// **📌 Exportar funciones correctamente**
module.exports = { saveMessage, getMessages, getConversations, getReceivedMessages, sendMessage };
