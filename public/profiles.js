async function loadProfileLikes() {
    const userId = localStorage.getItem('userId');

    try {
        const response = await fetch(`/api/profile/${userId}`);
        const data = await response.json();
        
        const likesContainer = document.getElementById('likes-list');
        likesContainer.innerHTML = '';

        data.likes.forEach(like => {
            const likeElement = document.createElement('div');
            likeElement.classList.add('like-item');
            likeElement.innerHTML = `
                <div class="like-card">
                    <img src="${like.filepath}" alt="${like.pet_name}" class="like-image">
                    <p><strong>${like.pet_name}</strong>, ${like.age} años</p>
                    <p>Raza: ${like.breed}</p>
                </div>
            `;
            likesContainer.appendChild(likeElement);
        });

    } catch (error) {
        console.error('Error al cargar los likes:', error);
    }
}

// Cargar los likes cuando se abra el perfil
document.addEventListener('DOMContentLoaded', loadProfileLikes);
