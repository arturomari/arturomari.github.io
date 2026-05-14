document.addEventListener('DOMContentLoaded', async function () {
  actualizarNavbar();
  iniciarListenersAuth();

  const contenedor = document.getElementById('pizzas-destacadas');

  try {
    const pizzas = await getPizzas();
    const primeras3 = pizzas.slice(0, 3);
    contenedor.innerHTML = '';
    primeras3.forEach(function (pizza) {
      contenedor.innerHTML += `
        <div class="col">
          <div class="card h-100 border-0 shadow-sm">
            <img src="${pizza.imageUrl}" class="card-img-top pizza-img" alt="${pizza.name}">
            <div class="card-body d-flex flex-column text-center">
              <h3 class="card-title h4">${pizza.name}</h3>
              <p class="card-text text-muted flex-grow-1">${pizza.ingredients}</p>
              <h4 class="text-primary mt-3">$${pizza.price.toFixed(2)}</h4>
              <a href="menu.html" class="btn btn-primary mt-3">Ver Menú</a>
            </div>
          </div>
        </div>`;
    });
  } catch (err) {
    contenedor.innerHTML = '<p class="text-center text-danger py-4">Error al cargar las pizzas. Verifica que el servidor esté activo.</p>';
  }
});

function actualizarNavbar() {
  const usuario = JSON.parse(localStorage.getItem('usuario'));
  const navAuth = document.getElementById('nav-auth-area');
  if (!navAuth) return;

  if (usuario) {
    navAuth.innerHTML = `
      <li class="nav-item d-flex align-items-center">
        <span class="nav-link text-white"><i class="bi bi-person-circle me-1"></i>${usuario.name}</span>
      </li>
      <li class="nav-item">
        <button class="btn btn-outline-light btn-sm ms-1" onclick="cerrarSesion()">Salir</button>
      </li>`;
  } else {
    navAuth.innerHTML = `
      <li class="nav-item">
        <button class="btn btn-outline-light btn-sm ms-2" data-bs-toggle="modal" data-bs-target="#modalLogin">
          Iniciar sesión
        </button>
      </li>`;
  }
}

function cerrarSesion() {
  localStorage.removeItem('token');
  localStorage.removeItem('usuario');
  location.reload();
}

function iniciarListenersAuth() {
  const btnLogin = document.getElementById('btn-login');
  const btnRegistro = document.getElementById('btn-registro');

  if (btnLogin) {
    btnLogin.addEventListener('click', iniciarSesion);
  }
  if (btnRegistro) {
    btnRegistro.addEventListener('click', registrarse);
  }
}

async function iniciarSesion() {
  const email = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;
  const errorDiv = document.getElementById('login-error');
  errorDiv.classList.add('d-none');

  try {
    const data = await loginUser(email, password);
    localStorage.setItem('token', data.token);
    localStorage.setItem('usuario', JSON.stringify({ name: data.name, email: data.email }));
    bootstrap.Modal.getInstance(document.getElementById('modalLogin')).hide();
    actualizarNavbar();
  } catch (err) {
    errorDiv.textContent = err.message;
    errorDiv.classList.remove('d-none');
  }
}

async function registrarse() {
  const name = document.getElementById('reg-nombre').value.trim();
  const email = document.getElementById('reg-email').value.trim();
  const password = document.getElementById('reg-password').value;
  const errorDiv = document.getElementById('reg-error');
  errorDiv.classList.add('d-none');

  try {
    const data = await registerUser(name, email, password);
    localStorage.setItem('token', data.token);
    localStorage.setItem('usuario', JSON.stringify({ name: data.name, email: data.email }));
    bootstrap.Modal.getInstance(document.getElementById('modalLogin')).hide();
    actualizarNavbar();
  } catch (err) {
    errorDiv.textContent = err.message;
    errorDiv.classList.remove('d-none');
  }
}
