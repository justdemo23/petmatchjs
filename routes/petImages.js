const express = require('express');
const router = express.Router();
const upload = require('../upload'); // Configuración de multer
const { uploadPetImage } = require('../controllers/petImagesController');

router.post('/:petId', upload.single('image'), uploadPetImage);

module.exports = router;