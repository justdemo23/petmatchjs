document.addEventListener("DOMContentLoaded", async () => {
    const userId = localStorage.getItem("userId");
    if (!userId) {
        alert("Debes iniciar sesión.");
        window.location.href = "login.html";
        return;
    }

    try {
        const response = await fetch(`/api/profile/${userId}`);
        const data = await response.json();
        const { user, pets } = data;

        document.getElementById("email").textContent = user.email;
        document.getElementById("first_name").value = user.first_name;
        document.getElementById("last_name").value = user.last_name;
        document.getElementById("address").value = user.address;
        document.getElementById("subscription").textContent = user.subscription_plan ? user.subscription_plan.toUpperCase() : "FREE";

        const petsList = document.getElementById("pets-list");
        petsList.innerHTML = "";
        
        pets.forEach(pet => {
            const petElement = document.createElement("div");
            petElement.classList.add("pet-card");
            petElement.innerHTML = `
                <img src="/uploads/${pet.image || 'default-pet.jpg'}" alt="${pet.name}">
                <h3>${pet.name}</h3>
                <p>Raza: ${pet.breed}</p>
                <p>Edad: ${pet.age} años</p>
                <p>${pet.description || "Sin descripción"}</p>
            `;
            petsList.appendChild(petElement);
        });

    } catch (error) {
        console.error("❌ Error al cargar el perfil:", error);
    }
});

// 🔹 Actualizar perfil
async function updateProfile() {
    const userId = localStorage.getItem("userId");
    const first_name = document.getElementById("first_name").value;
    const last_name = document.getElementById("last_name").value;
    const address = document.getElementById("address").value;

    try {
        const response = await fetch(`/api/profile/${userId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ first_name, last_name, address })
        });

        const data = await response.json();
        alert(data.message);
    } catch (error) {
        console.error("❌ Error al actualizar perfil:", error);
    }
}

// 🔹 Eliminar cuenta
async function deleteAccount() {
    const userId = localStorage.getItem("userId");
    if (!confirm("¿Estás seguro de que quieres eliminar tu cuenta? Esta acción no se puede deshacer.")) {
        return;
    }

    try {
        await fetch(`/api/profile/${userId}`, { method: "DELETE" });

        alert("Tu cuenta ha sido eliminada.");
        localStorage.clear();
        window.location.href = "login.html";
    } catch (error) {
        console.error("❌ Error al eliminar cuenta:", error);
    }
}

// 🔹 Cerrar sesión
function logout() {
    localStorage.clear();
    window.location.href = "login.html";
}

// 🔹 Ir al dashboard
function goToDashboard() {
    window.location.href = "dashboard.html";
}
