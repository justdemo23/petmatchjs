let currentPetIndex = 0;
let pets = [];

async function loadPets() {
    try {
        const response = await fetch('/api/pets');
        if (!response.ok) {
            throw new Error('Error al cargar las mascotas');
        }
        pets = await response.json();
        console.log('Mascotas cargadas:', pets);

        if (pets.length > 0) {
            updateProgressBar();
            showCurrentPet();
        } else {
            showNoPets();
        }
    } catch (error) {
        console.error('Error:', error);
        showError('Error al cargar las mascotas');
    }
}

function updateProgressBar() {
    const progressBar = document.getElementById('progress-bar');
    const percentage = ((pets.length - currentPetIndex) / pets.length) * 100;
    progressBar.style.width = `${percentage}%`;
}

function showCurrentPet() {
    if (currentPetIndex >= pets.length) {
        showNoPets();
        return;
    }

    const pet = pets[currentPetIndex];  
    console.log('Mostrando mascota:', pet);
    
    // Asegurarse de que la imagen se muestra correctamente
    let imagePath = pet.filepath ? pet.filepath : '/default-pet.jpg';

    const container = document.getElementById('pet-cards-container');
    container.innerHTML = `
        <div class="card" id="current-card">
            <div class="card-image">
                <img src="${imagePath}" alt="${pet.name}" onerror="this.onerror=null; this.src='/default-pet.jpg'">
            </div>
            <div class="card-info">
                <h2>${pet.name}, ${pet.age} años</h2>
                <p>${pet.description || 'Sin descripción'}</p>
                <p>Raza: ${pet.breed}</p>
                <p>Dueño: ${pet.owner_name || 'Desconocido'}</p>
            </div>
            <div class="card-buttons">
                <button class="action-button dislike-btn" onclick="dislikePet()">
                    <svg class="paw-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M11.168 11.154c-.71 .31 -1.184 1.107 -2 2.593c-.942 1.703 -2.846 1.845 -3.321 3.291c-.097 .265 -.145 .677 -.143 .962c0 1.176 .787 2 1.8 2c1.259 0 3 -1 4.5 -1s3.241 1 4.5 1c.927 0 1.664 -.689 1.783 -1.708"></path>
                        <path d="M20.188 8.082a1.039 1.039 0 0 0 -.406 -.082h-.015c-.735 .012 -1.56 .75 -1.993 1.866c-.519 1.335 -.28 2.7 .538 3.052c.129 .055 .267 .082 .406 .082c.739 0 1.575 -.742 2.011 -1.866c.516 -1.335 .273 -2.7 -.54 -3.052h0z"></path>
                        <path d="M11 6.992a3.608 3.608 0 0 0 -.04 -.725c-.203 -1.297 -1.047 -2.267 -1.932 -2.267a1.237 1.237 0 0 0 -.758 .265"></path>
                        <path d="M16.456 6.733c.214 -1.376 -.375 -2.594 -1.32 -2.722a1.164 1.164 0 0 0 -.162 -.011c-.885 0 -1.728 .97 -1.93 2.267c-.214 1.376 .375 2.594 1.32 2.722c.054 .007 .108 .011 .162 .011c.885 0 1.73 -.974 1.93 -2.267z"></path>
                        <path d="M5.69 12.918c.816 -.352 1.054 -1.719 .536 -3.052c-.436 -1.124 -1.271 -1.866 -2.009 -1.866c-.14 0 -.277 .027 -.407 .082c-.816 .352 -1.054 1.719 -.536 3.052c.436 1.124 1.271 1.866 2.009 1.866c.14 0 .277 -.027 .407 -.082z"></path>
                        <path d="M3 3l18 18"></path>
                    </svg>
                </button>
                <button class="action-button like-btn" onclick="likePet(${pet.id})">
                    <svg class="paw-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M14.7 13.5c-1.1 -2 -1.441 -2.5 -2.7 -2.5c-1.259 0 -1.736 .755 -2.836 2.747c-.942 1.703 -2.846 1.845 -3.321 3.291c-.097 .265 -.145 .677 -.143 .962c0 1.176 .787 2 1.8 2c1.259 0 3 -1 4.5 -1s3.241 1 4.5 1c1.013 0 1.8 -.823 1.8 -2c0 -.285 -.049 -.697 -.146 -.962c-.475 -1.451 -2.512 -1.835 -3.454 -3.538z"></path>
                        <path d="M20.188 8.082a1.039 1.039 0 0 0 -.406 -.082h-.015c-.735 .012 -1.56 .75 -1.993 1.866c-.519 1.335 -.28 2.7 .538 3.052c.129 .055 .267 .082 .406 .082c.739 0 1.575 -.742 2.011 -1.866c.516 -1.335 .273 -2.7 -.54 -3.052z"></path>
                        <path d="M9.474 9c.055 0 .109 0 .163 -.011c.944 -.128 1.533 -1.346 1.32 -2.722c-.203 -1.297 -1.047 -2.267 -1.932 -2.267c-.055 0 -.109 0 -.163 .011c-.944 .128 -1.533 1.346 -1.32 2.722c.204 1.293 1.048 2.267 1.933 2.267z"></path>
                        <path d="M16.456 6.733c.214 -1.376 -.375 -2.594 -1.32 -2.722a1.164 1.164 0 0 0 -.162 -.011c-.885 0 -1.728 .97 -1.93 2.267c-.214 1.376 .375 2.594 1.32 2.722c.054 .007 .108 .011 .162 .011c.885 0 1.73 -.974 1.93 -2.267z"></path>
                        <path d="M5.69 12.918c.816 -.352 1.054 -1.719 .536 -3.052c-.436 -1.124 -1.271 -1.866 -2.009 -1.866c-.14 0 -.277 .027 -.407 .082c-.816 .352 -1.054 1.719 -.536 3.052c.436 1.124 1.271 1.866 2.009 1.866c.14 0 .277 -.027 .407 -.082z"></path>
                    </svg>
                </button>
            </div>
        </div>
    `;

    updateProgressBar();
}

// funcion para ir a la pagina de dashboard cuando se da click en el boton de dashboard
function goToDashboard() {
    window.location.href = '/dashboard.html';
}

// Asegurar que el botón tenga el evento
document.addEventListener('DOMContentLoaded', () => {
    const dashboardButton = document.getElementById('dashboard-button');
    if (dashboardButton) {
        dashboardButton.addEventListener('click', goToDashboard);
    }
});
// funcion para cerrar sesion
function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('firstName');
    window.location.href = '/login.html';
}

// Asegurar que el botón tenga el evento
document.addEventListener('DOMContentLoaded', () => {
    const logoutButton = document.getElementById('logout-button');
    if (logoutButton) {
        logoutButton.addEventListener('click', logout);
    }
});


function showNoPets() {
    const container = document.getElementById('pet-cards-container');
    container.innerHTML = '<p class="no-pets">No hay mascotas disponibles</p>';
}

function showError(message) {
    const container = document.getElementById('pet-cards-container');
    container.innerHTML = `<p class="error">${message}</p>`;
}

function handleLike() {
    currentPetIndex++;
    showCurrentPet();
}

function handleDislike() {
    currentPetIndex++;
    showCurrentPet();
}


// funcion para dar like a la mascota actual la logica en el backend es http://localhost:3000/api/likes/3/like 3 es el id de la masccota actual y "pet_id_from": 1 que inicia sesion el usuario
async function likePet(petId) {
    const token = localStorage.getItem('token');
    try {
        const response = await fetch(`/api/likes/${petId}/like`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                pet_id_from: localStorage.getItem('userId')
            })
        });

        const data = await response.json();

        if (!response.ok && response.status !== 400) {
            throw new Error('Error al dar like');
        }

        const container = document.getElementById('pet-cards-container');
        
        if (data.message === 'Like registrado exitosamente') {
            container.innerHTML += `<p class="like-message">¡Uuyy le diste like, te gusta!</p>`;
            
            setTimeout(() => {
                const likeMessage = container.querySelector('.like-message');
                if (likeMessage) {
                    likeMessage.remove();
                }
                handleLike();
            }, 3000);
        } 
        else if (data.message === 'Ya diste like a esta mascota') {
            container.innerHTML += `<p class="like-message">¡Ya diste like a esta mascota!</p>`;
            
            setTimeout(() => {
                const likeMessage = container.querySelector('.like-message');
                if (likeMessage) {
                    likeMessage.remove();
                }
                handleDislike();
            }, 3000);
        }

        console.log('Respuesta del servidor:', data);
    } catch (error) {
        console.error('Error al dar like:', error);
        showError('Error al dar like a la mascota');
    }
}


// funcion para no mostrar el index si no estas logueado
document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');

    // Si no hay token, redirigir al login
    if (!token) {
        alert("Debes iniciar sesión para acceder a esta página.");
        window.location.href = "/login.html";
        return;
    }

    // Cargar las mascotas solo si el usuario ha iniciado sesión
    loadPets();
});


// funcion para cuando hagan click en el boton de comunidad
document.getElementById('forum-button').addEventListener('click', function() {
    window.location.href = '/forum.html';
});



async function dislikePet() {
    try {
        const container = document.getElementById('pet-cards-container');
        container.innerHTML += `<p class="dislike-message">No te gustó esta mascota</p>`;
        
        // Eliminar el mensaje después de 2 segundos
        setTimeout(() => {
            const dislikeMessage = container.querySelector('.dislike-message');
            if (dislikeMessage) {
                dislikeMessage.remove();
            }
            handleDislike(); // Pasar a la siguiente mascota
        }, 2000);
        
        console.log('Mascota dislikeada');
    } catch (error) {
        console.error('Error al dar dislike:', error);
        showError('Error al rechazar la mascota');
    }
}



document.addEventListener('DOMContentLoaded', () => {
    loadPets();
});



