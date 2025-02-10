document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('token');

    if (!token) {
        alert('Debes iniciar sesión para acceder al foro.');
        window.location.href = '/login.html';
        return;
    }

    // Cargar publicaciones del foro
    async function loadPosts() {
        try {
            const response = await fetch('/api/forum/posts');
            const posts = await response.json();
            const postsList = document.getElementById('posts-list');
            postsList.innerHTML = '';

            posts.forEach(post => {
                const postElement = document.createElement('div');
                postElement.classList.add('post');
                postElement.innerHTML = `
                    <h3>${post.first_name} ${post.last_name}</h3>
                    <p><strong>${post.title}</strong></p>
                    <p>${post.content}</p>
                    ${post.image ? `<img src="${post.image}" alt="Imagen del post" class="post-image">` : ''}
                    
                    <span>${new Date(post.created_at).toLocaleString()}</span>
                    <div class="comments" id="comments-${post.id}"></div>
                    
                    <div class="comment-box">
                        <input type="text" id="comment-input-${post.id}" placeholder="Escribe un comentario...">
                        <button onclick="postComment(${post.id})">Comentar</button>
                    </div>
                `;
                postsList.appendChild(postElement);
                loadComments(post.id);
            });
        } catch (error) {
            console.error('Error al cargar publicaciones:', error);
        }
    }

    // Publicar un post
    async function publishPost() {
        const userId = localStorage.getItem('userId');
        const title = document.getElementById('post-title').value.trim();
        const content = document.getElementById('post-content').value.trim();
        const fileInput = document.getElementById('post-image');

        if (!title || !content) {
            alert('El título y el contenido son obligatorios.');
            return;
        }

        const formData = new FormData();
        formData.append('user_id', userId);
        formData.append('title', title);
        formData.append('content', content);

        if (fileInput.files.length > 0) {
            formData.append('image', fileInput.files[0]);
        }

        try {
            const response = await fetch('/api/forum/posts', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData
            });

            if (!response.ok) {
                throw new Error('Error al publicar.');
            }

            // Limpiar el formulario después de la publicación
            document.getElementById('post-title').value = '';
            document.getElementById('post-content').value = '';
            fileInput.value = '';
            document.getElementById('image-preview').style.display = 'none';

            alert('Publicación creada exitosamente.');
            loadPosts(); // Recargar publicaciones
        } catch (error) {
            console.error('Error al publicar:', error);
        }
    }

    // Hacer la función accesible globalmente
    window.postComment = async function(postId) {
        const commentInput = document.getElementById(`comment-input-${postId}`);
        const comment = commentInput.value.trim();
        const userId = localStorage.getItem('userId');
        const token = localStorage.getItem('token');

        if (!comment) {
            alert('No puedes enviar un comentario vacío.');
            return;
        }

        try {
            const response = await fetch(`/api/forum/posts/${postId}/comments`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ user_id: userId, comment })
            });

            if (!response.ok) {
                throw new Error('Error al enviar el comentario.');
            }

            commentInput.value = ''; // Limpiar campo después de enviar
            loadComments(postId); // Actualizar los comentarios automáticamente
        } catch (error) {
            console.error('Error al enviar comentario:', error);
        }
    };


    // Cargar comentarios de una publicación
    async function loadComments(postId) {
        try {
            const response = await fetch(`/api/forum/posts/${postId}/comments`);
            const comments = await response.json();
            const commentsContainer = document.getElementById(`comments-${postId}`);
            commentsContainer.innerHTML = '';

            comments.forEach(comment => {
                const commentElement = document.createElement('div');
                commentElement.classList.add('comment');
                commentElement.innerHTML = `
                    <p><strong>${comment.first_name} ${comment.last_name}:</strong> ${comment.comment}</p>
                `;
                commentsContainer.appendChild(commentElement);
            });
        } catch (error) {
            console.error('Error al cargar comentarios:', error);
        }
    }

    // Evento para el botón de publicar
    document.getElementById('post-button').addEventListener('click', publishPost);

    // Cargar las publicaciones al iniciar
    loadPosts();
});

// Función para cerrar sesión
function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    window.location.href = '/login.html';
}

// Redirigir a dashboard al hacer clic en el botón
document.getElementById('dashboard-button').addEventListener('click', () => {
    window.location.href = '/dashboard.html';
});

// Evento de logout al hacer clic en el botón
document.getElementById('logout-button').addEventListener('click', logout);
