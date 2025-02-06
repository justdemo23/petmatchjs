document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('token');  // Asegúrate de que el token JWT esté almacenado después del login
    const userId = localStorage.getItem('userId');  // El ID del usuario logueado
    const notificationsContainer = document.getElementById('notifications-container');
    const loadingMessage = document.getElementById('loading-message');

    if (!token || !userId) {
        notificationsContainer.innerHTML = '<p>Debes iniciar sesión para ver las notificaciones.</p>';
        return;
    }

    try {
        if (loadingMessage) loadingMessage.textContent = 'Cargando notificaciones...';
        console.log('Intentando cargar notificaciones...');

        const response = await fetch(`/api/notifications/${userId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        console.log('Respuesta del servidor:', response.status, response.statusText);

        if (!response.ok) {
            throw new Error('Error al cargar las notificaciones');
        }

        const likes = await response.json();

        if (loadingMessage) loadingMessage.style.display = 'none';

        if (likes.length === 0) {
            notificationsContainer.innerHTML = '<p>No tienes nuevas notificaciones.</p>';
        } else {
            notificationsContainer.innerHTML = likes.map(like => `
                <div class="card">
                    <div class="card-image">
                        <img src="/uploads/${like.pet_image}" alt="${like.pet_name}" class="pet-thumbnail" onerror="this.src='/public/default-pet.jpg'">
                    </div>
                    <div class="card-info">
                        <h2>${like.pet_name}</h2>
                        <p>Raza: ${like.breed}</p>
                        <button class="like-btn" onclick="likeBack(${like.pet_id})">Dar Like de Vuelta</button>
                        <button class="dislike-btn" onclick="removeLike(${like.id})">❌ Quitar Like</button>
                    </div>
                </div>
            `).join('');
            
        }
    } catch (error) {
        console.error('Error:', error);
        notificationsContainer.innerHTML = '<p>Error al cargar las notificaciones.</p>';
    }
});

function likeBack(petId) {
    const userPetId = localStorage.getItem('userPetId');  // ID de la mascota del usuario logueado

    fetch(`/api/likes/${petId}/like`, {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ pet_id_from: userPetId })
    })
    .then(response => response.json())
    .then(data => {
        if (data.match) {
            alert('¡Tienes un match!');
        } else {
            alert('Like enviado exitosamente.');
        }
    })
    .catch(error => console.error('Error al dar like:', error));
}

function removeLike(likeId) {
    console.log("Intentando borrar like con ID:", likeId); // Verificar si el ID se captura bien

    if (!confirm('¿Seguro que quieres quitar este like?')) return;

    fetch(`/api/dislikes/${likeId}`, { // ✅ Cambiado a "dislikes" en lugar de "likes"
        method: 'DELETE',
        headers: { 
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
    })
    
    .then(response => response.json())
    .then(data => {
        console.log("Respuesta del servidor al borrar like:", data); // Verificar respuesta del backend
        alert(data.message);
        location.reload(); // Recargar la página para actualizar
    })
    .catch(error => console.error('Error al quitar el like:', error));
    console.log("Token enviado en la petición:", localStorage.getItem('token'));
}


