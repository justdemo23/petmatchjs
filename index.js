const express = require('express');
const cors = require('cors');
const usersRoutes = require('./routes/users');
const petsRoutes = require('./routes/pets');
const petImagesRoutes = require('./routes/petImages');
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

// Rutas de usuarios
app.use('/api/users', usersRoutes);

// Rutas de mascotas
app.use('/api/pets', petsRoutes);

// Rutas para las imágenes de mascotas
app.use('/api/pet-images', petImagesRoutes);



// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
