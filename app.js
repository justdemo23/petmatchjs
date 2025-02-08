const express = require('express');
const cors = require('cors');
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



const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json()); // Para recibir JSON en las peticiones
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static('public/uploads'));
app.use('/uploads', express.static('uploads'));

// cuando entren a la url lo primero que vea sea home.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'home.html'));
});

// ruta registrar usuario
app.use('/api/users', usersRoutes);

// ruta registrar mascota
app.use('/api/pets', petsRoutes);

// Rutas de ver mascotas
app.use('/api/pets', petsRoutes);

// Rutas para las imágenes de mascotas
app.use('/api/pet-images', petImagesRoutes);

// Rutas de login
app.use('/api', loginRoutes);

// Rutas del foro
app.use('/api/forum', forumRoutes);

// Rutas de likes
app.use('/api/likes', likesRoutes);

// Rutas de notificaciones
app.use('/api/notifications', notificationsRoutes);

// ruta login
app.use('/api/login', loginRoutes);

// Rutas de dislikes
app.use('/api/dislikes', dislikesRoutes);

// Rutas del dashboard
app.use('/api/dashboard', dashboardRoutes);

// Rutas de matchcheck
app.use('/api/matchcheck', matchcheckRoutes);

// Iniciar el servidor
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});