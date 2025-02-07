document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    const firstName = localStorage.getItem('firstName'); // 🔥 Obtener el nombre del usuario
    const welcomeMessage = document.getElementById('welcome-message');
    const logoutButton = document.getElementById('logout-button');

    // Si no hay token, redirigir al login
    if (!token) {
        alert("Debes iniciar sesión para acceder al Dashboard.");
        window.location.href = "/login.html";
        return;
    }

    // Mostrar el nombre del usuario en el mensaje de bienvenida
    if (welcomeMessage) {
        console.log("Nombre del usuario recuperado:", firstName); // 🔥 Debugging
        welcomeMessage.textContent = firstName 
            ? `¡Bienvenido a PetMatch, ${firstName}! 🔥` 
            : "¡Bienvenido a PetMatch!";
    }

    // Agregar evento al botón de cerrar sesión
    if (logoutButton) {
        logoutButton.addEventListener('click', () => {
            localStorage.removeItem('token');
            localStorage.removeItem('userId');
            localStorage.removeItem('firstName'); 
            alert("Has cerrado sesión correctamente.");
            window.location.href = "/login.html";
        });
    }
});

// para ir a forum si presiono el boton de forum
document.getElementById('forum-button').addEventListener('click', () => {
    window.location.href = '/forum.html';
});
