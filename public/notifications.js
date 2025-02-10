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
                            <p>Edad: ${like.age}</p>
                            <!-- Usar pet_id_from en lugar de pet_id -->
                            <button class="like-btn mobile-btn" onclick="likeBack(${like.pet_id_from})"> ❤️ MATCH ❤️ </button>
                            <button class="dislike-btn mobile-btn" onclick="removeLike(${like.id})">👎 RECHAZAR 👎</button>
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
    const userId = localStorage.getItem('userId');

    if (!petId) {
        console.error('Error: petId no está definido');
        return;
    }

    try {
        // Primero verificamos si ya existe un match
        const matchCheckResponse = await fetch(`/api/matchcheck/check-match/${userId}/${petId}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        const matchData = await matchCheckResponse.json();
        if (matchData.matched === true) {
            // Crear notificación estilizada en lugar de alert
            const existingMatchNotification = document.createElement('div');
            existingMatchNotification.className = 'match-notification';
            existingMatchNotification.style.cssText = `
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: rgba(255, 255, 255, 0.95);
                padding: 2rem;
                border-radius: 15px;
                box-shadow: 0 0 20px rgba(0, 0, 0, 0.2);
                text-align: center;
                z-index: 1000;
            `;
            
            existingMatchNotification.innerHTML = `
                <div class="heart-icon" style="font-size: 4rem;">💌</div>
                <h2 style="color: #ff4b6e; margin: 1rem 0;">¡Ya existe un match!</h2>
                <p style="color: #666;">Ya hiciste match con esta mascota anteriormente.</p>
                <p style="color: #666;">Revisa el chat para comunicarte.</p>
                <button style="
                    background: #ff4b6e;
                    color: white;
                    border: none;
                    padding: 10px 20px;
                    border-radius: 5px;
                    margin-top: 1rem;
                    cursor: pointer;
                ">Aceptar</button>
            `;
            
            document.body.appendChild(existingMatchNotification);
            
            // Agregar evento al botón
            const acceptButton = existingMatchNotification.querySelector('button');
            acceptButton.addEventListener('click', () => {
                existingMatchNotification.style.opacity = '0';
                existingMatchNotification.style.transform = 'translate(-50%, -50%) scale(0.8)';
                existingMatchNotification.style.transition = 'all 0.5s ease-out';
                setTimeout(() => {
                    existingMatchNotification.remove();
                }, 500);
            });

            return;
        }

        // Si no hay match, procedemos con el like
        const response = await fetch(`/api/likes/${petId}/like`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({
                pet_id_from: userId,
                pet_id_to: petId
            })
        });

        if (!response.ok) {
            throw new Error('Error al dar like de vuelta');
        }

        const data = await response.json();
        console.log('Like de vuelta registrado correctamente:', data);

        // Verificar si es un "match"
        if (data.match) {
            console.log('Creando notificación de match...'); // Debug
            
            const matchNotification = document.createElement('div');
            matchNotification.className = 'match-notification';
            
            matchNotification.innerHTML = `
                <div class="match-notification-heart">❤️</div>
                <h2 class="match-notification-title">¡Es un match!</h2>
                <p class="match-notification-text">Has conectado con ${data.pet_name || 'alguien especial'}</p>
                <button id="acceptMatch" class="match-notification-button">Aceptar</button>
            `;
            
            const firstChild = document.body.firstChild;
            document.body.insertBefore(matchNotification, firstChild);
            
            // Agregar evento al botón de aceptar
            document.getElementById('acceptMatch').addEventListener('click', () => {
                matchNotification.style.opacity = '0';
                matchNotification.style.transform = 'translate(-50%, -50%) scale(0.8)';
                matchNotification.style.transition = 'all 0.5s ease-out';
                setTimeout(() => {
                    matchNotification.remove();
                    // location.reload(); // Recargar la página después de cerrar la notificación
                }, 500);
            });
        }

        // Actualizar la interfaz después de dar el like
        // location.reload();  // Recargar la página para actualizar las notificaciones o el estado
    } catch (error) {
        console.error('Error al dar like de vuelta:', error);
        alert('Ocurrió un error al procesar tu like');
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

// Función para manejar el likeBack
async function handleLikeBack(petId) {
    try {
        const userId = localStorage.getItem('userId');
        
        // Verificar primero si ya existe un match
        const matchCheckResponse = await fetch(`/api/matchcheck/check-match/${userId}/${petId}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        const matchData = await matchCheckResponse.json();
        if (matchData.matched === true) {
            alert('¡Ya hiciste match con esta mascota anteriormente!');
            return;
        }

        // Si no hay match previo, continuar con el like
        const response = await fetch(`/api/likes/like-back/${petId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        
        const data = await response.json();
        console.log('Like de vuelta registrado:', data);
        
        // Mostrar la notificación solo cuando se da likeBack y hay match
        if (data.match) {
            const matchNotification = document.createElement('div');
            matchNotification.className = 'match-notification';
            matchNotification.style.cssText = `
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: rgba(255, 255, 255, 0.95);
                padding: 2rem;
                border-radius: 15px;
                box-shadow: 0 0 20px rgba(0, 0, 0, 0.2);
                text-align: center;
                z-index: 1000;
            `;
            
            matchNotification.innerHTML = `
                <div class="heart-icon" style="font-size: 4rem;">❤️</div>
                <h2 style="color: #ff4b6e; margin: 1rem 0;">¡Es un match!</h2>
                <p style="color: #666;">Has conectado con ${data.pet_name || 'alguien especial'}</p>
            `;
            
            document.body.appendChild(matchNotification);
            
            // Eliminar la notificación después de 5 segundos
            setTimeout(() => {
                matchNotification.style.opacity = '0';
                matchNotification.style.transform = 'translate(-50%, -50%) scale(0.8)';
                matchNotification.style.transition = 'all 1s ease-out';
                setTimeout(() => {
                    matchNotification.remove();
                }, 1000);
            }, 5000);
        }
        
        // Actualizar la UI según sea necesario
        const likeBackButton = document.querySelector(`[data-pet-id="${petId}"]`);
        if (likeBackButton) {
            likeBackButton.disabled = true;
            likeBackButton.textContent = '¡Like enviado!';
        }
        
    } catch (error) {
        console.error('Error al dar like de vuelta:', error);
        alert('Ocurrió un error al procesar tu like');
    }
}

// Asegúrate de que los botones de likeBack tengan el evento click correcto
document.addEventListener('DOMContentLoaded', () => {
    const likeBackButtons = document.querySelectorAll('.like-back-button');
    likeBackButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const petId = e.target.dataset.petId;
            handleLikeBack(petId);
        });
    });
});
