let carrito = [];

document.addEventListener('DOMContentLoaded', async function () {
  actualizarNavbar();
  iniciarListenersAuth();

  const contenedor = document.getElementById('lista-pizzas');

  try {
    const pizzas = await getPizzas();
    contenedor.innerHTML = '';
    pizzas.forEach(function (pizza) {
      contenedor.innerHTML += `
        <div class="col">
          <div class="card h-100 border-0 shadow-sm">
            <img src="${pizza.imageUrl}" class="card-img-top pizza-img" alt="${pizza.name}">
            <div class="card-body d-flex flex-column text-center">
              <h5 class="card-title fw-bold">${pizza.name}</h5>
              <p class="card-text text-muted flex-grow-1 small">${pizza.ingredients}</p>
              <h5 class="text-primary">$${pizza.price.toFixed(2)}</h5>
              <button class="btn btn-primary btn-sm mt-2"
                onclick='agregarAlCarrito(${JSON.stringify(pizza)})'>
                <i class="bi bi-cart-plus me-1"></i>Agregar
              </button>
            </div>
          </div>
        </div>`;
    });
  } catch (err) {
    contenedor.innerHTML = '<p class="text-center text-danger py-4">Error al cargar el menú. Verifica que el servidor esté activo.</p>';
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

function agregarAlCarrito(pizza) {
  const existente = carrito.find(function (item) { return item.pizza._id === pizza._id; });
  if (existente) {
    existente.cantidad++;
  } else {
    carrito.push({ pizza: pizza, cantidad: 1 });
  }
  actualizarContadorCarrito();
  mostrarCarrito();
}

function quitarDelCarrito(id) {
  carrito = carrito.filter(function (item) { return item.pizza._id !== id; });
  actualizarContadorCarrito();
  mostrarCarrito();
}

function actualizarContadorCarrito() {
  const total = carrito.reduce(function (s, i) { return s + i.cantidad; }, 0);
  const badge = document.getElementById('carrito-badge');
  badge.textContent = total;
  badge.style.display = total === 0 ? 'none' : 'inline-block';
}

function mostrarCarrito() {
  const cuerpo = document.getElementById('carrito-cuerpo');
  const pie = document.getElementById('carrito-pie');

  if (carrito.length === 0) {
    cuerpo.innerHTML = '<p class="text-center text-muted py-3">El carrito está vacío.</p>';
    pie.innerHTML = '';
    return;
  }

  let html = '';
  let total = 0;

  carrito.forEach(function (item) {
    const subtotal = item.pizza.price * item.cantidad;
    total += subtotal;
    html += `
      <div class="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom">
        <div class="text-start">
          <strong>${item.pizza.name}</strong><br>
          <small class="text-muted">$${item.pizza.price.toFixed(2)} x ${item.cantidad}</small>
        </div>
        <div class="d-flex align-items-center gap-2">
          <span class="fw-bold">$${subtotal.toFixed(2)}</span>
          <button class="btn btn-outline-danger btn-sm" onclick="quitarDelCarrito('${item.pizza._id}')">
            <i class="bi bi-trash"></i>
          </button>
        </div>
      </div>`;
  });

  cuerpo.innerHTML = html;
  pie.innerHTML = `
    <div class="w-100">
      <div class="d-flex justify-content-between mb-3">
        <span class="fs-5 fw-bold">Total:</span>
        <span class="fs-5 fw-bold text-primary">$${total.toFixed(2)}</span>
      </div>
      <button class="btn btn-primary w-100" onclick="confirmarPedido()">
        <i class="bi bi-bag-check me-2"></i>Confirmar Pedido
      </button>
    </div>`;
}

async function confirmarPedido() {
  const token = localStorage.getItem('token');

  if (!token) {
    alert('Debes iniciar sesión para hacer un pedido.');
    var modalCarrito = bootstrap.Modal.getInstance(document.getElementById('modalCarrito'));
    modalCarrito.hide();
    var modalLogin = new bootstrap.Modal(document.getElementById('modalLogin'));
    modalLogin.show();
    return;
  }

  const orderItems = carrito.map(function (item) {
    return { pizza: item.pizza._id, quantity: item.cantidad };
  });
  const totalPrice = carrito.reduce(function (s, i) { return s + i.pizza.price * i.cantidad; }, 0);

  try {
    await crearPedido(orderItems, totalPrice, token);
    carrito = [];
    actualizarContadorCarrito();
    mostrarCarrito();
    var modalCarrito = bootstrap.Modal.getInstance(document.getElementById('modalCarrito'));
    modalCarrito.hide();
    alert('¡Pedido enviado con éxito! Pronto estaremos preparando tu pizza.');
  } catch (err) {
    alert('Error al enviar el pedido: ' + err.message);
  }
}
