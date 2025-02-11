const cron = require("node-cron");
const db = require("./db");

// 🔹 Tarea programada para ejecutar cada 15 días a la medianoche
cron.schedule("0 0 */15 * *", async () => {
    try {
        console.log("🗑️ Eliminando mensajes antiguos...");

        await db.execute("DELETE FROM messages WHERE created_at < NOW() - INTERVAL 15 DAY");

        console.log("✅ Mensajes eliminados correctamente.");
    } catch (error) {
        console.error("❌ Error al eliminar mensajes antiguos:", error);
    }
});
