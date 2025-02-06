const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    const authHeader = req.header('Authorization');
    console.log("🔍 Header Authorization recibido:", authHeader); // 👀 Ver qué token llega

    if (!authHeader) {
        return res.status(401).json({ message: "Acceso denegado. No hay token." });
    }

    const token = authHeader.split(" ")[1]; // Extrae el token sin "Bearer"
    console.log("🔍 Token extraído:", token); // 👀 Verificar que el token sea correcto

    try {
        const decoded = jwt.verify(token, "P3tM@tch$2024!_s3cur3_k3y#JWT"); // ✅ La misma clave usada en el login
        console.log("✅ Token decodificado correctamente:", decoded); // 👀 Ver si se decodifica bien
        req.user = decoded;
        next();
    } catch (error) {
        console.error("❌ Error al verificar el token:", error.message); // 👀 Ver el mensaje exacto del error
        res.status(400).json({ message: "Token inválido." });
    }
};
