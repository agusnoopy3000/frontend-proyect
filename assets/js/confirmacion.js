// confirmacion.js
// Muestra el resumen del pedido usando los datos del carrito en localStorage

async function cargarProductos(){
  const resp = await fetch('data/productos.json');
  return await resp.json();
}

function formatoPrecio(n){ return new Intl.NumberFormat('es-CL',{style:'currency',currency:'CLP',maximumFractionDigits:0}).format(n) }

async function mostrarResumenPedido() {
  const resumen = document.getElementById('resumenPedido');
  const cart = JSON.parse(localStorage.getItem('pedidoConfirmado')||'{}');
  const productos = await cargarProductos();
  let total = 0;
  let html = `<table class="table table-bordered mt-3"><thead><tr><th>Producto</th><th>Cantidad</th><th>Precio</th><th>Subtotal</th></tr></thead><tbody>`;
  Object.entries(cart).forEach(([codigo, cantidad]) => {
    const prod = productos.find(p => p.codigo === codigo);
    if (!prod) return;
    const subtotal = prod.precio * cantidad;
    total += subtotal;
    html += `<tr><td>${prod.nombre}</td><td>${cantidad}</td><td>${formatoPrecio(prod.precio)}</td><td>${formatoPrecio(subtotal)}</td></tr>`;
  });
  html += `</tbody><tfoot><tr><th colspan="3">Total</th><th>${formatoPrecio(total)}</th></tr></tfoot></table>`;
  resumen.innerHTML = html;
  // Limpiar pedido confirmado para que no se repita si recarga
  localStorage.removeItem('pedidoConfirmado');
}

document.addEventListener('DOMContentLoaded', mostrarResumenPedido);
