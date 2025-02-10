const socket = io("http://localhost:3000");

// 🔹 Obtener ID del usuario desde localStorage
const userId = Number(localStorage.getItem("userId"));
if (!userId) {
    alert("Debes iniciar sesión primero.");
    window.location.href = "login.html";
}

// 🔹 Elementos del DOM
const conversationList = document.getElementById("conversation-list");
const chatMessages = document.getElementById("chat-messages");
const chatUserName = document.getElementById("chat-user-name");
const messageInput = document.getElementById("messageInput");

let receiverId = null;

// 🔹 Unirse al WebSocket
socket.emit("joinChat", userId);

// 🔹 Escuchar mensajes en tiempo real y agregarlos al chat
socket.on("newMessage", (msg) => {
    console.log("📡 Nuevo mensaje recibido:", msg);

    // Manejar nombres diferentes de propiedades (sender_id vs senderId)
    const sender = Number(msg.senderId || msg.sender_id);
    const receiver = Number(msg.receiverId || msg.receiver_id);

    // Solo mostrar si el mensaje pertenece a la conversación activa
    if (receiverId !== null && (sender === receiverId || receiver === receiverId)) {
        appendMessage(msg);
    }
});

// 🔹 Cargar lista de conversaciones
function loadConversations() {
    fetch(`http://localhost:3000/api/chat/conversations/${userId}`)
        .then(response => response.json())
        .then(users => {
            conversationList.innerHTML = "";
            users.forEach(user => {
                const userElement = document.createElement("div");
                userElement.textContent = user.name;
                userElement.classList.add("conversation");
                userElement.onclick = () => {
                    loadChat(user.id, user.name);
                    localStorage.setItem("activeChat", user.id); // Guardar chat abierto
                };
                conversationList.appendChild(userElement);
            });

            // 🔹 Si hay un chat abierto antes de recargar, volver a abrirlo automáticamente
            const activeChat = localStorage.getItem("activeChat");
            if (activeChat) {
                loadChat(Number(activeChat), users.find(u => u.id == activeChat)?.email || "Usuario");
            }
        })
        .catch(error => console.error("❌ Error al cargar conversaciones:", error));
}
loadConversations();

// 🔹 Cargar chat privado con un usuario (y su historial)
function loadChat(selectedUserId, userName) {
    receiverId = Number(selectedUserId);
    chatMessages.innerHTML = "";
    chatUserName.textContent = `Chat con ${userName}`;

    // 🔥 Recuperar mensajes anteriores
    fetch(`http://localhost:3000/api/chat/${userId}/${receiverId}`)
        .then(response => response.json())
        .then(messages => {
            console.log("📩 Mensajes recuperados:", messages);
            messages.forEach(msg => appendMessage(msg)); // Mostrar mensajes antiguos
        })
        .catch(error => console.error("❌ Error al obtener mensajes:", error));
}

// 🔹 Volver a la Lista de Chats
function goBack() {
    chatMessages.innerHTML = "";
    chatUserName.textContent = "Selecciona un chat";
    receiverId = null;
    localStorage.removeItem("activeChat"); // Limpiar chat activo
}

// 🔹 Enviar mensaje mediante WebSockets en tiempo real
function sendMessage() {
    const message = messageInput.value.trim();
    if (!message || !receiverId) return;

    const msgData = { senderId: userId, receiverId, message };

    // 🔹 1️⃣ Enviar mensaje al backend mediante WebSockets
    socket.emit("sendMessage", msgData);

    // 🔹 2️⃣ Agregar el mensaje al chat de inmediato en la UI
    appendMessage(msgData);

    messageInput.value = "";
}

// 🔹 Agregar mensaje al chat en la UI
function appendMessage(msg) {
    console.log("💬 Agregando mensaje al chat:", msg);

    // Manejar nombres diferentes de propiedades (sender_id vs senderId)
    const sender = Number(msg.senderId || msg.sender_id);
    const receiver = Number(msg.receiverId || msg.receiver_id);

    // Evitar mensajes fuera del chat actual
    if (receiverId !== sender && receiverId !== receiver) {
        return;
    }

    const msgElement = document.createElement("p");
    msgElement.textContent = msg.message;

    // Verificar si el mensaje es enviado o recibido
    if (sender === userId) {
        msgElement.classList.add("sent"); // Mensaje enviado (alineado a la derecha)
    } else {
        msgElement.classList.add("received"); // Mensaje recibido (alineado a la izquierda)
    }

    chatMessages.appendChild(msgElement);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// 🔹 Enviar mensaje con "Enter"
messageInput.addEventListener("keypress", function(event) {
    if (event.key === "Enter") {
        sendMessage();
    }
});

// 🔹 Redirigir al dashboard
document.getElementById("dashboard-button").addEventListener("click", function() {
    window.location.href = "dashboard.html";
});
