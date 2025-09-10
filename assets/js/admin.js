// admin.js - Panel de administración

// Utilidades para obtener y guardar datos (simulación local)
const getProductos = async () => {
  const resp = await fetch('data/productos.json');
  return await resp.json();
};
const getUsuarios = () => JSON.parse(localStorage.getItem('usuarios') || '[]');
const setUsuarios = (usuarios) => localStorage.setItem('usuarios', JSON.stringify(usuarios));

const adminContent = document.getElementById('adminContent');

// Utilidad para mostrar categorías en el select
async function cargarCategoriasSelect(selId) {
  const productos = await getProductos();
  const cats = [...new Set(productos.map(p=>p.categoria))];
  const sel = document.getElementById(selId);
  sel.innerHTML = cats.map(c=>`<option value="${c}">${c}</option>`).join('');
}
let productosMem = null;

// Modal Producto
const modalProducto = new bootstrap.Modal(document.getElementById('modalProducto'));
document.getElementById('btnNuevoProducto').addEventListener('click', async ()=>{
  if (!productosMem) productosMem = await getProductos();
  document.getElementById('modalProductoLabel').textContent = 'Nuevo Producto';
  document.getElementById('formProducto').reset();
  document.getElementById('prodIdx').value = '';
  await cargarCategoriasSelect('prodCategoria');
  document.getElementById('prodMsg').textContent = '';
  modalProducto.show();
});

// Modal Usuario
const modalUsuario = new bootstrap.Modal(document.getElementById('modalUsuario'));
document.getElementById('btnVerUsuarios').insertAdjacentHTML('afterend', '<button class="btn btn-success" id="btnNuevoUsuario">Nuevo Usuario</button>');
// Cargar regiones y comunas
function poblarRegiones(regionSelId, comunaSelId, regionVal = '', comunaVal = '') {
  const selRegion = document.getElementById(regionSelId);
  const selComuna = document.getElementById(comunaSelId);
  selRegion.innerHTML = '<option value="">Seleccione región...</option>' +
    regionesYComunas.map(r => `<option value="${r.region}">${r.region}</option>`).join('');
  selRegion.value = regionVal || '';
  poblarComunas(regionSelId, comunaSelId, comunaVal);
  selRegion.onchange = () => poblarComunas(regionSelId, comunaSelId);
}
function poblarComunas(regionSelId, comunaSelId, comunaVal = '') {
  const selRegion = document.getElementById(regionSelId);
  const selComuna = document.getElementById(comunaSelId);
  selComuna.innerHTML = '<option value="">Seleccione comuna...</option>';
  const region = regionesYComunas.find(r => r.region === selRegion.value);
  if(region) {
    selComuna.innerHTML += region.comunas.map(c => `<option value="${c}">${c}</option>`).join('');
    selComuna.value = comunaVal || '';
  }
}

document.getElementById('btnNuevoUsuario').addEventListener('click', ()=>{
  document.getElementById('modalUsuarioLabel').textContent = 'Nuevo Usuario';
  document.getElementById('formUsuario').reset();
  document.getElementById('userIdx').value = '';
  document.getElementById('userMsg').textContent = '';
  poblarRegiones('userRegion', 'userComuna');
  modalUsuario.show();
});

// Guardar Producto
document.getElementById('btnGuardarProducto').addEventListener('click', async ()=>{
  const idx = document.getElementById('prodIdx').value;
  const codigo = document.getElementById('prodCodigo').value.trim();
  const nombre = document.getElementById('prodNombre').value.trim();
  const desc = document.getElementById('prodDesc').value.trim();
  const precio = parseFloat(document.getElementById('prodPrecio').value);
  const stock = parseInt(document.getElementById('prodStock').value);
  const stockCritico = document.getElementById('prodStockCritico').value ? parseInt(document.getElementById('prodStockCritico').value) : null;
  const categoria = document.getElementById('prodCategoria').value;
  const img = document.getElementById('prodImg').value.trim();
  let msg = '';
  if(!codigo || codigo.length<3) msg = 'Código requerido (mínimo 3 caracteres).';
  else if(!nombre || nombre.length>100) msg = 'Nombre requerido (máx 100).';
  else if(desc.length>500) msg = 'Descripción máx 500.';
  else if(isNaN(precio) || precio<0) msg = 'Precio requerido, mínimo 0.';
  else if(!Number.isInteger(stock) || stock<0) msg = 'Stock requerido, entero y mínimo 0.';
  else if(stockCritico!==null && (!Number.isInteger(stockCritico) || stockCritico<0)) msg = 'Stock crítico debe ser entero y mínimo 0.';
  else if(!categoria) msg = 'Categoría requerida.';
  if(msg){ document.getElementById('prodMsg').textContent = msg; return; }
  if (!productosMem) productosMem = await getProductos();
  if(idx === '') {
    productosMem.push({codigo, nombre, descripcion: desc, precio, stock, stockCritico, categoria, img});
  } else {
    productosMem[idx] = {codigo, nombre, descripcion: desc, precio, stock, stockCritico, categoria, img};
  }
  modalProducto.hide();
  document.getElementById('btnVerProductos').click();
});

// Guardar Usuario
document.getElementById('btnGuardarUsuario').addEventListener('click', ()=>{
  const idx = document.getElementById('userIdx').value;
  const run = document.getElementById('userRun').value.trim();
  const nombre = document.getElementById('userNombre').value.trim();
  const apellidos = document.getElementById('userApellidos').value.trim();
  const email = document.getElementById('userEmail').value.trim();
  const tipo = document.getElementById('userTipo').value;
  const region = document.getElementById('userRegion').value;
  const comuna = document.getElementById('userComuna').value;
  const direccion = document.getElementById('userDireccion').value.trim();
  const fechaNac = document.getElementById('userFechaNac').value;
  let msg = '';
  function validarRun(run) {
    return /^[0-9kK]{7,9}$/.test(run);
  }
  if(!run || !validarRun(run)) msg = 'RUN requerido, 7-9 caracteres, sin puntos ni guion.';
  else if(!nombre || nombre.length>50) msg = 'Nombre requerido, máx 50.';
  else if(!apellidos || apellidos.length>100) msg = 'Apellidos requeridos, máx 100.';
  else if(!email || email.length>100) msg = 'Correo requerido, máx 100.';
  else if(!/^.+@(duoc\.cl|profesor\.duoc\.cl|gmail\.com)$/.test(email)) msg = 'Solo correos @duoc.cl, @profesor.duoc.cl o @gmail.com.';
  else if(!tipo) msg = 'Debe seleccionar tipo de usuario.';
  else if(!region) msg = 'Debe seleccionar región.';
  else if(!comuna) msg = 'Debe seleccionar comuna.';
  else if(!direccion || direccion.length>300) msg = 'Dirección requerida, máx 300.';
  // Fecha de nacimiento es opcional
  if(msg){ document.getElementById('userMsg').textContent = msg; return; }
  // Guardar usuario en localStorage (simulado)
  let usuarios = getUsuarios();
  const userObj = {run, nombre, apellidos, email, tipo, region, comuna, direccion, fechaNac};
  if(idx === '') usuarios.push(userObj);
  else usuarios[idx] = userObj;
  setUsuarios(usuarios);
  modalUsuario.hide();
  document.getElementById('btnVerUsuarios').click();
});

document.getElementById('btnVerProductos').addEventListener('click', async () => {
  if (!productosMem) productosMem = await getProductos();
  const productos = productosMem;
  adminContent.innerHTML = `
    <h3>Lista de Productos</h3>
    <div class="table-responsive">
      <table class="table table-bordered" id="tablaProductos">
        <thead><tr><th>Código</th><th>Nombre</th><th>Precio</th><th>Stock</th><th>Acción</th></tr></thead>
        <tbody>
          ${productos.map((p,i) => `
            <tr data-index="${i}" class="filaProducto">
              <td>${p.codigo}</td>
              <td>${p.nombre}</td>
              <td>${p.precio}</td>
              <td>${p.stock}</td>
              <td><button class="btn btn-sm btn-success btnEditarProd">Editar</button></td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
    <p class="help">Haz clic en "Editar" para modificar un producto.</p>
  `;
  // Evento para editar producto
  document.querySelectorAll('.btnEditarProd').forEach(btn => {
    btn.addEventListener('click', async function() {
      const tr = this.closest('tr');
      const idx = tr.dataset.index;
      const p = productos[idx];
      document.getElementById('modalProductoLabel').textContent = 'Editar Producto';
      document.getElementById('prodIdx').value = idx;
      document.getElementById('prodCodigo').value = p.codigo;
      document.getElementById('prodNombre').value = p.nombre;
      document.getElementById('prodDesc').value = p.descripcion||'';
      document.getElementById('prodPrecio').value = p.precio;
      document.getElementById('prodStock').value = p.stock;
      document.getElementById('prodStockCritico').value = p.stockCritico||'';
      await cargarCategoriasSelect('prodCategoria');
      document.getElementById('prodCategoria').value = p.categoria;
      document.getElementById('prodImg').value = p.img||'';
      document.getElementById('prodMsg').textContent = '';
      modalProducto.show();
    });
  });
});

document.getElementById('btnVerUsuarios').addEventListener('click', () => {
  let usuarios = getUsuarios();
  adminContent.innerHTML = `
    <h3>Lista de Usuarios</h3>
    <div class="table-responsive">
      <table class="table table-bordered" id="tablaUsuarios">
        <thead><tr><th>Nombre</th><th>Apellidos</th><th>Email</th><th>RUN</th><th>Tipo</th><th>Región</th><th>Comuna</th><th>Dirección</th><th>Acción</th></tr></thead>
        <tbody>
          ${usuarios.map((u,i) => `
            <tr data-index="${i}" class="filaUsuario">
              <td>${u.nombre||''}</td>
              <td>${u.apellidos||''}</td>
              <td>${u.email||''}</td>
              <td>${u.run||u.rut||''}</td>
              <td>${u.tipo||''}</td>
              <td>${u.region||''}</td>
              <td>${u.comuna||''}</td>
              <td>${u.direccion||''}</td>
              <td><button class="btn btn-sm btn-success btnEditarUser">Editar</button></td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
    <p class="help">Haz clic en "Editar" para modificar un usuario.</p>
  `;
  // Evento para editar usuario
  document.querySelectorAll('.btnEditarUser').forEach(btn => {
    btn.addEventListener('click', function() {
      const tr = this.closest('tr');
      const idx = tr.dataset.index;
      const u = usuarios[idx];
      document.getElementById('modalUsuarioLabel').textContent = 'Editar Usuario';
      document.getElementById('userIdx').value = idx;
      document.getElementById('userRun').value = u.run||u.rut||'';
      document.getElementById('userNombre').value = u.nombre||'';
      document.getElementById('userApellidos').value = u.apellidos||'';
      document.getElementById('userEmail').value = u.email||'';
      document.getElementById('userTipo').value = u.tipo||'';
      poblarRegiones('userRegion', 'userComuna', u.region||'', u.comuna||'');
      document.getElementById('userDireccion').value = u.direccion||'';
      document.getElementById('userFechaNac').value = u.fechaNac||'';
      document.getElementById('userMsg').textContent = '';
      modalUsuario.show();
    });
  });
});
