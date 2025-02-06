const express = require('express');
const router = express.Router();
const { getAllPets, addPet } = require('../controllers/petsController');

router.post('/', addPet);
router.get('/', getAllPets);

module.exports = router;
