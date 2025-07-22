// welcome.js
document.addEventListener('DOMContentLoaded', () => {
  const user = localStorage.getItem('loggedUser');
  if (!user) {
    alert("Debes iniciar sesión primero");
    window.location.href = "/";
  } else {
    const display = document.getElementById('usernameDisplay');
    if (display) display.textContent = user;
  }
});

function cerrarSesion(){
  localStorage.removeItem('loggedUser');
  window.location.href = '/';
}
