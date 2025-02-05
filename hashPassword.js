const bcrypt = require('bcryptjs');

const password = 'FKADFLAS';  // La contraseña original que quieres hashear
const saltRounds = 10;

bcrypt.hash(password, saltRounds, (err, hash) => {
    if (err) {
        console.error('Error al generar el hash:', err);
    } else {
        console.log('Hash generado:', hash);
    }
});