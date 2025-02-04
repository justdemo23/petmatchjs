const db = require('../db');

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

module.exports = { uploadPetImage };
