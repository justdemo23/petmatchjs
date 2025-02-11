const express = require("express");
const router = express.Router();
const profileController = require("../controllers/profileController");

// 📌 Obtener perfil del usuario
router.get("/:userId", profileController.getProfile);

// 📌 Actualizar perfil del usuario
router.put("/:userId", profileController.updateProfile);

// 📌 Eliminar cuenta del usuario
router.delete("/:userId", profileController.deleteAccount);

module.exports = router;
