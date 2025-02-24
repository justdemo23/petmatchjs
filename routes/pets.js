const express = require('express');
const router = express.Router();
const { getAllPets, addPet, uploadPetImage } = require('../controllers/petsController');
const upload = require('../upload');

router.post('/', addPet);
router.get('/', getAllPets);


module.exports = router;