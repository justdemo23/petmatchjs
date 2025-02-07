document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    const notificationsContainer = document.getElementById('notifications-container');
    const loadingMessage = document.getElementById('loading-message');

    if (!token || !userId) {
        notificationsContainer.innerHTML = '<p>Debes iniciar sesión para ver las notificaciones.</p>';
        return;
    }

    try {
        if (loadingMessage) loadingMessage.textContent = 'Cargando notificaciones...';

        const response = await fetch(`/api/notifications/${userId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) {
            throw new Error('Error al cargar las notificaciones');
        }

        const likes = await response.json();

        if (loadingMessage) loadingMessage.style.display = 'none';

        if (likes.length === 0) {
            notificationsContainer.innerHTML = '<p>No tienes nuevas notificaciones.</p>';
        } else {
            notificationsContainer.innerHTML = likes.map(like => {
                console.log('Like:', like); // Verifica si `pet_id_from` está en el objeto `like`

                return `
                    <div class="card">
                        <div class="card-image">
                            <img src="/uploads/${like.pet_image}" alt="${like.pet_name}" class="pet-thumbnail" onerror="this.src='/public/default-pet.jpg'">
                        </div>
                        <div class="card-info">
                            <h2>${like.pet_name}</h2>
                            <p>Raza: ${like.breed}</p>
                            <!-- Usar pet_id_from en lugar de pet_id -->
                            <button class="like-btn mobile-btn" onclick="likeBack(${like.pet_id_from})">Dar Like de Vuelta</button>
                            <button class="dislike-btn mobile-btn" onclick="removeLike(${like.id})">❌ Quitar Like</button>
                        </div>
                    </div>
                `;
            }).join('');
        }
    } catch (error) {
        console.error('Error:', error);
        notificationsContainer.innerHTML = '<p>Error al cargar las notificaciones.</p>';
    }
});

// Función para dar like de vuelta (like back)
async function likeBack(petId) {
    const userId = localStorage.getItem('userId'); // ID del usuario logueado

    console.log('Ejecutando likeBack con petId:', petId); // Depuración para ver si petId está llegando

    // Verificar si petId está definido
    if (!petId) {
        console.error('Error: petId no está definido');
        return;
    }

    try {
        // Hacer la solicitud a la API para registrar el "like back"
        const response = await fetch(`/api/likes/${petId}/like`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({
                pet_id_from: userId,  // Usuario que da el like
                pet_id_to: petId      // Mascota que recibe el like
            })
        });

        if (!response.ok) {
            throw new Error('Error al dar like de vuelta');
        }

        const data = await response.json();
        console.log('Like de vuelta registrado correctamente:', data);

        // Verificar si es un "match"
        if (data.match) {
            alert('¡Es un match!');
        }

        // Actualizar la interfaz después de dar el like
        location.reload();  // Recargar la página para actualizar las notificaciones o el estado
    } catch (error) {
        console.error('Error al dar like de vuelta:', error);
    }
}

// Función para quitar el like
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
}
