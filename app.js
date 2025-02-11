const express = require('express');
const cors = require('cors');
const http = require('http'); 
const path = require('path');

const usersRoutes = require('./routes/users');
const petsRoutes = require('./routes/pets');
const petImagesRoutes = require('./routes/petImages');
const loginRoutes = require('./routes/login');
const forumRoutes = require('./routes/forum');
const likesRoutes = require('./routes/likes');
const notificationsRoutes = require('./routes/notifications');
const dislikesRoutes = require('./routes/dislikes');
const dashboardRoutes = require('./routes/dashboard');
const matchcheckRoutes = require('./routes/matchcheck');
const chatRoutes = require('./routes/chatRoutes');
const profileRoutes = require("./routes/profileRoutes");
const cronJobs = require("./cronJobs");

const app = express();
const server = http.createServer(app); // Crear servidor HTTP

const io = require("./socket")(server); // Importar WebSockets desde socket.js

const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static('public/uploads'));
app.use('/uploads', express.static('uploads'));

// Middleware para que `req.io` esté disponible en los controladores
app.use((req, res, next) => {
    req.io = io;
    next();
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'home.html'));
});

app.use('/api/users', usersRoutes);
app.use('/api/pets', petsRoutes);
app.use('/api/pet-images', petImagesRoutes);
app.use('/api', loginRoutes);
app.use('/api/forum', forumRoutes);
app.use('/api/likes', likesRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/login', loginRoutes);
app.use('/api/dislikes', dislikesRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/matchcheck', matchcheckRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/chat/myMessages/:userId', chatRoutes);
app.use('/api/profile', profileRoutes);


// Iniciar el servidor con WebSockets
server.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
