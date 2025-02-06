const db = require('../db');

const getAllPets = async (req, res) => {
  try {
    const [pets] = await db.execute(`
      SELECT pets.id, pets.name, pets.breed, pets.age, pets.description, 
             users.first_name, users.last_name, pets.created_at, pet_images.filepath
      FROM pets
      LEFT JOIN users ON pets.owner_id = users.id
      LEFT JOIN pet_images ON pets.id = pet_images.pet_id
    `);

    // Asegurar que cada mascota tenga una imagen válida o usar un placeholder
    const petsWithImages = pets.map(pet => ({
      ...pet,
      owner_name: `${pet.first_name} ${pet.last_name}`, // Concatenar nombre y apellido
      filepath: pet.filepath ? `/uploads/${pet.filepath}` : '/default-pet.jpg'
    }));

    res.json(petsWithImages);
  } catch (error) {
    console.error('Error al obtener mascotas:', error);
    res.status(500).json({ message: 'Error al obtener las mascotas' });
  }
};

const addPet = async (req, res) => {
  const { name, breed, age, description, owner_id } = req.body;
  
  try {
    const [result] = await db.execute(
      'INSERT INTO pets (name, breed, age, description, owner_id) VALUES (?, ?, ?, ?, ?)',
      [name, breed, age, description, owner_id]
    );
    
    res.status(201).json({ 
      message: 'Mascota agregada exitosamente',
      petId: result.insertId 
    });
  } catch (error) {
    console.error('Error al agregar mascota:', error);
    res.status(500).json({ message: 'Error al agregar la mascota' });
  }
};

const uploadPetImage = async (req, res) => {
  const petId = req.params.petId;

  if (!req.file) {
    return res.status(400).json({ message: 'No se subió ninguna imagen' });
  }

  const filepath = req.file.filename;  // Guardamos solo el nombre del archivo

  try {
    const [result] = await db.execute(
      `INSERT INTO pet_images (pet_id, filepath) VALUES (?, ?)`,
      [petId, filepath]
    );

    res.status(201).json({ message: 'Imagen subida exitosamente', imageId: result.insertId, filepath });
  } catch (error) {
    console.error('Error al subir la imagen:', error);
    res.status(500).json({ message: 'Error al guardar la imagen en la base de datos' });
  }
};

module.exports = { getAllPets, addPet, uploadPetImage };
