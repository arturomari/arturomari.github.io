const BASE_URL = "https://segundo-parcial-r5dv.onrender.com/api";

async function getPizzas() {
  const res = await fetch(BASE_URL + "/pizzas");
  const data = await res.json();
  return data;
}

async function loginUser(email, password) {
  const res = await fetch(BASE_URL + "/users/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message);
  return data;
}

async function registerUser(name, email, password) {
  const res = await fetch(BASE_URL + "/users/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message);
  return data;
}

async function crearPedido(orderItems, totalPrice, token) {
  const res = await fetch(BASE_URL + "/orders", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token,
    },
    body: JSON.stringify({ orderItems, totalPrice }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message);
  return data;
}

async function getMisOrdenes(token) {
  const res = await fetch(BASE_URL + "/orders/myorders", {
    method: "GET",
    headers: {
      Authorization: "Bearer " + token,
    },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message);
  return data;
}

async function actualizarPedido(orderId, status, token) {
  const res = await fetch(BASE_URL + "/orders/" + orderId, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token,
    },
    body: JSON.stringify({ status }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message);
  return data;
}

async function eliminarPedido(orderId, token) {
  const res = await fetch(BASE_URL + "/orders/" + orderId, {
    method: "DELETE",
    headers: {
      Authorization: "Bearer " + token,
    },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message);
  return data;
}
