const express = require("express");
const router = express.Router();
const { getReceivedMessages, sendMessage, getMessages, getConversations } = require("../controllers/chatController");

// 🔹 Obtener mensajes recibidos por un usuario
router.get("/received/:userId", getReceivedMessages);

// 🔹 Obtener la lista de conversaciones
router.get("/conversations/:userId", getConversations);

// 🔹 Obtener los mensajes entre dos usuarios
router.get("/:userId/:otherUserId", getMessages);

// 🔹 Enviar un mensaje
router.post("/sendMessage", sendMessage);

module.exports = router;
