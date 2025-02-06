document.getElementById('login-form').addEventListener('submit', async (event) => {
    event.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        if (!response.ok) {
            throw new Error('Error al iniciar sesión');
        }

        const data = await response.json();
        localStorage.setItem('token', data.token);
        localStorage.setItem('userId', data.user.id);  // Guardar ID del usuario para futuros usos

        // Redirigir al dashboard después de un login exitoso
        window.location.href = '/dashboard.html';
    } catch (error) {
        console.error('Error:', error);
        alert('Credenciales incorrectas. Inténtalo de nuevo.');
    }
});
