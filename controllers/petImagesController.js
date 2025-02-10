const db = require('../db');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const uploadPetImage = async (req, res) => {
  const petId = req.params.petId;

  if (!req.file) {
    return res.status(400).json({ message: 'No se subió ninguna imagen' });
  }

  try {
    const originalPath = req.file.path; // Ruta temporal de la imagen original
    const filename = `resized-${Date.now()}.jpg`; // Nombre del nuevo archivo
    const outputPath = path.join(__dirname, "../uploads", filename); // Ruta donde se guardará

    // Redimensionar la imagen a 640x479
    await sharp(originalPath)
      .resize(640, 479, {
        fit: "cover", // Recorta y ajusta sin distorsionar
        position: "center"
      })
      .toFormat("jpeg")
      .toFile(outputPath);

    // Eliminar la imagen original después de procesarla
    fs.unlinkSync(originalPath);

    // Guardar el nombre del archivo redimensionado en la base de datos
    const [result] = await db.execute(
      `INSERT INTO pet_images (pet_id, filepath) VALUES (?, ?)`,
      [petId, filename]
    );

    res.status(201).json({ 
      message: 'Imagen subida y redimensionada exitosamente', 
      imageId: result.insertId, 
      filepath: filename 
    });

  } catch (error) {
    console.error('Error al procesar la imagen:', error);
    res.status(500).json({ message: 'Error al guardar la imagen' });
  }
};

module.exports = { uploadPetImage };
