const express = require('express');
const router = express.Router();
const { getAllPets, addPet, uploadPetImage } = require('../controllers/petsController');
const upload = require('../upload'); // Asegúrate de que este archivo existe y está configurado correctamente

router.post('/', addPet);
router.get('/', getAllPets);


module.exports = router;