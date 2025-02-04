const db = require('../db');

// Obtener todas las mascotas
const getAllPets = async (req, res) => {
    try {
      const [pets] = await db.execute(`
        SELECT 
          pets.id, pets.name, pets.breed, pets.age, pets.description, 
          users.first_name AS owner_name, 
          pet_images.filepath 
        FROM pets
        JOIN users ON pets.owner_id = users.id
        LEFT JOIN pet_images ON pets.id = pet_images.pet_id
      `);
  
      res.json(pets);
    } catch (error) {
      console.error('Error al obtener las mascotas:', error);
      res.status(500).json({ message: 'Error al obtener las mascotas' });
    }
  };
  

// Agregar una nueva mascota
const addPet = async (req, res) => {
  const { name, breed, age, description, owner_id } = req.body;

  if (!name || !breed || !age || !owner_id) {
    return res.status(400).json({ message: 'Faltan campos obligatorios para la mascota' });
  }

  try {
    const [result] = await db.execute(
      `INSERT INTO pets (name, breed, age, description, owner_id)
       VALUES (?, ?, ?, ?, ?)`,
      [name, breed, age, description, owner_id]
    );

    res.status(201).json({ message: 'Mascota agregada exitosamente', petId: result.insertId });
  } catch (error) {
    console.error('Error al agregar la mascota:', error);
    res.status(500).json({ message: 'Error al agregar la mascota' });
  }
};

module.exports = { getAllPets, addPet };
