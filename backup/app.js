const express = require('express');
const cors = require('cors');
const usersRoutes = require('./routes/users');
const petsRoutes = require('./routes/pets');
const petImagesRoutes = require('./routes/petImages');
const loginRoutes = require('./routes/login');
const forumRoutes = require('./routes/forum');
const likesRoutes = require('./routes/likes');
const notificationsRoutes = require('./routes/notifications');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json()); // Para recibir JSON en las peticiones

app.use(express.static('public'));
app.use('/uploads', express.static('uploads'));


// Ruta principal para verificar que la API funciona
app.get('/', (req, res) => {
  res.send('¡Bienvenido a PetMatch API!');
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

// Iniciar el servidor
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

// Ruta para servir el archivo login.html
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// Ruta para servir el archivo register.html
app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'register.html'));
});