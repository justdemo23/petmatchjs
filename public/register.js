document.addEventListener('DOMContentLoaded', function() {
    const userSection = document.getElementById('user-section');
    const petSection = document.getElementById('pet-section');
    const nextBtn = document.getElementById('next-btn');
    let userData = null;

    // Asegurarnos que la sección de mascota esté oculta inicialmente
    petSection.style.display = 'none';
    userSection.style.display = 'block';

    // Manejador para el botón "Siguiente"
    nextBtn.addEventListener('click', function(event) {
        event.preventDefault();

        // Guardar datos del usuario temporalmente
        userData = {
            first_name: document.getElementById('first_name').value,
            last_name: document.getElementById('last_name').value,
            email: document.getElementById('email').value,
            password: document.getElementById('password').value,
            address: document.getElementById('address').value
        };

        // Validar que todos los campos estén llenos
        if (!userData.first_name || !userData.last_name || !userData.email || !userData.password) {
            alert('Por favor, complete todos los campos obligatorios');
            return;
        }

        // Cambiar visibilidad de las secciones
        userSection.style.display = 'none';
        petSection.style.display = 'block';
    });

    // Manejador para el formulario completo
    document.getElementById('register-form').addEventListener('submit', async function(event) {
        event.preventDefault();

        if (!userData) {
            alert('Error: Debe completar primero los datos del usuario.');
            return;
        }

        try {
            // Registrar al usuario
            const userResponse = await fetch('/api/users/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData)
            });

            const userResult = await userResponse.json();

            if (!userResponse.ok) {
                throw new Error(userResult.message || 'Error al registrar el usuario');
            }

            const userId = userResult.userId;
            console.log('Usuario registrado con ID:', userId);

            // Recoger y registrar datos de la mascota
            const petData = {
                name: document.getElementById('pet_name').value,
                breed: document.getElementById('breed').value,
                age: document.getElementById('age').value,
                description: document.getElementById('description').value,
                owner_id: userId
            };

            // Registrar la mascota
            const petResponse = await fetch('/api/pets', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(petData)
            });

            const petResult = await petResponse.json();

            if (!petResponse.ok) {
                throw new Error(petResult.message || 'Error al registrar la mascota');
            }

            const petId = petResult.petId;
            console.log('Mascota registrada con ID:', petId);

            // Subir la foto de la mascota
            const imageFile = document.getElementById('pet_image').files[0];
            const formData = new FormData();
            formData.append('image', imageFile);

            const imageResponse = await fetch(`/api/pet-images/${petId}`, {
                method: 'POST',
                body: formData
            });

            const imageResult = await imageResponse.json();

            if (!imageResponse.ok) {
                throw new Error(imageResult.message || 'Error al subir la imagen');
            }

            console.log('Imagen subida exitosamente:', imageResult);

            // Mostrar mensaje de éxito y redireccionar
            alert('¡Registro completo! 🐾');
            window.location.href = `/find.html?userId=${userId}`;

        } catch (error) {
            console.error('Error:', error);
            alert(error.message || 'Ocurrió un error durante el registro.');
        }
    });
});
