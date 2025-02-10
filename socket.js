const { Server } = require("socket.io");
const chatController = require("./controllers/chatController");

module.exports = (server) => {
    const io = new Server(server, {
        cors: { origin: "*", methods: ["GET", "POST"] }
    });


        io.on("connection", (socket) => {
            console.log(`🟢 Usuario conectado: ${socket.id}`);
        
            socket.on("joinChat", (userId) => {
                socket.join(`user-${userId}`);
                console.log(`👥 Usuario ${userId} se unió a su sala privada`);
            });
        
            socket.on("sendMessage", async ({ senderId, receiverId, message }) => {
                try {
                    console.log(`📩 Guardando mensaje de ${senderId} a ${receiverId}: ${message}`);
        
                    // Guardar mensaje en la base de datos
                    const savedMessage = await require("./controllers/chatController").saveMessage(senderId, receiverId, message);
        
                    // 🔥 Emitir mensaje en tiempo real a AMBOS usuarios
                    io.to(`user-${receiverId}`).emit("newMessage", savedMessage);
                    io.to(`user-${senderId}`).emit("newMessage", savedMessage);
                    console.log(`📨 Mensaje emitido en tiempo real a ${senderId} y ${receiverId}`);
                    
                } catch (error) {
                    console.error("❌ Error al guardar mensaje:", error);
                }
            });
        
            socket.on("disconnect", () => {
                console.log("🔴 Usuario desconectado:", socket.id);
            });
        });
    

    // 🔹 Función para obtener el nombre de la sala de chat única
    function getChatRoomName(userA, userB) {
        return `chat-${Math.min(userA, userB)}-${Math.max(userA, userB)}`;
    }

    return io;
};
