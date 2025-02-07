document.getElementById('register-form').addEventListener('submit', async function(event) {
    event.preventDefault();

    // 1. Recoger datos del usuario
    const userData = {
        first_name: document.getElementById('first_name').value,
        last_name: document.getElementById('last_name').value,
        email: document.getElementById('email').value,
        password: document.getElementById('password').value,
        address: document.getElementById('address').value
    };

    try {
        // 2. Registrar al usuario
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

        // 3. Recoger datos de la mascota
        const petData = {
            name: document.getElementById('pet_name').value,
            breed: document.getElementById('breed').value,
            age: document.getElementById('age').value,
            description: document.getElementById('description').value,
            owner_id: userId
        };

        // 4. Registrar la mascota
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

        // 5. Subir la foto de la mascota
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

        document.getElementById('message').innerText = '¡Registro completo! 🐾';
        document.getElementById('register-form').reset();

        // mostrar un mensaje de éxito
        alert('¡Registro completo! 🐾');

        window.location.href = `/find.html?userId=${userId}`;

    } catch (error) {
        console.error('Error:', error);
        document.getElementById('message').innerText = error.message || 'Ocurrió un error al registrarse.';
    }
});
