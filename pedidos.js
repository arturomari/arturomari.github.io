document.addEventListener('DOMContentLoaded', async function () {
  actualizarNavbar();
  iniciarListenersAuth();

  const token = localStorage.getItem('token');
  if (!token) {
    document.getElementById('pedidos-contenedor').innerHTML = `
      <div class="text-center py-5">
        <p class="text-muted mb-3">Debes iniciar sesión para ver tus pedidos.</p>
        <button class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#modalLogin">
          Iniciar sesión
        </button>
      </div>`;
    return;
  }

  cargarPedidos();
});

async function cargarPedidos() {
  const token = localStorage.getItem('token');
  const contenedor = document.getElementById('pedidos-contenedor');

  try {
    const ordenes = await getMisOrdenes(token);

    if (ordenes.length === 0) {
      contenedor.innerHTML = `
        <div class="text-center py-5">
          <i class="bi bi-inbox fs-1 text-muted d-block mb-2"></i>
          <p class="text-muted">Aún no tienes pedidos.</p>
          <a href="menu.html" class="btn btn-primary">Ir al Menú</a>
        </div>`;
      return;
    }

    let html = '';
    ordenes.forEach(function (orden) {
      const fecha = new Date(orden.createdAt).toLocaleDateString('es-ES');
      const items = orden.orderItems.map(function (item) {
        return item.quantity + 'x ' + item.pizza.name;
      }).join(', ');

      html += `
        <div class="card mb-4 border-0 shadow-sm">
          <div class="card-header bg-primary text-white">
            <div class="row align-items-center">
              <div class="col">
                <strong>Pedido #${orden._id.substring(0, 8).toUpperCase()}</strong>
                <small class="d-block opacity-75">${fecha}</small>
              </div>
              <div class="col-auto">
                <span class="badge bg-light text-dark">Estado: ${orden.status}</span>
              </div>
            </div>
          </div>
          <div class="card-body">
            <h6 class="fw-bold mb-2">Items:</h6>
            <p class="text-muted mb-3">${items}</p>

            <div class="d-flex justify-content-between align-items-center mb-3">
              <span class="fs-5 fw-bold">Total: <span class="text-primary">$${orden.totalPrice.toFixed(2)}</span></span>
            </div>

            <div class="mb-3">
              <label class="form-label fw-bold">Cambiar Estado</label>
              <div class="input-group">
                <select class="form-select" id="status-${orden._id}" onchange="cambiarEstado('${orden._id}', this.value)">
                  <option value="Pendiente" ${orden.status === 'Pendiente' ? 'selected' : ''}>Pendiente</option>
                  <option value="Preparando" ${orden.status === 'Preparando' ? 'selected' : ''}>Preparando</option>
                  <option value="Enviado" ${orden.status === 'Enviado' ? 'selected' : ''}>Enviado</option>
                  <option value="Entregado" ${orden.status === 'Entregado' ? 'selected' : ''}>Entregado</option>
                </select>
                <button class="btn btn-outline-danger" onclick="confirmarEliminar('${orden._id}')" title="Eliminar pedido">
                  <i class="bi bi-trash"></i>
                </button>
              </div>
            </div>

            <small class="text-muted d-block">ID del pedido: ${orden._id}</small>
          </div>
        </div>`;
    });

    contenedor.innerHTML = html;
  } catch (err) {
    contenedor.innerHTML = `
      <div class="text-center py-5">
        <p class="text-danger"><i class="bi bi-exclamation-triangle me-2"></i>${err.message}</p>
        <button class="btn btn-outline-primary" onclick="cargarPedidos()">Reintentar</button>
      </div>`;
  }
}

async function cambiarEstado(orderId, nuevoEstado) {
  const token = localStorage.getItem('token');
  const select = document.getElementById('status-' + orderId);
  select.disabled = true;

  try {
    await actualizarPedido(orderId, nuevoEstado, token);
    select.disabled = false;
  } catch (err) {
    alert('Error al actualizar: ' + err.message);
    cargarPedidos();
  }
}

function confirmarEliminar(orderId) {
  if (confirm('¿Estás seguro de que deseas eliminar este pedido? Esta acción no se puede deshacer.')) {
    eliminarPedidoConfirmado(orderId);
  }
}

async function eliminarPedidoConfirmado(orderId) {
  const token = localStorage.getItem('token');

  try {
    await eliminarPedido(orderId, token);
    cargarPedidos();
  } catch (err) {
    alert('Error al eliminar: ' + err.message);
  }
}

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
    cargarPedidos();
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
    cargarPedidos();
  } catch (err) {
    errorDiv.textContent = err.message;
    errorDiv.classList.remove('d-none');
  }
}
