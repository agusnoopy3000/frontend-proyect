
// HuertoHogar front-end educativo. Sin backend.
const $ = (sel, ctx=document) => ctx.querySelector(sel);
const $$ = (sel, ctx=document) => Array.from(ctx.querySelectorAll(sel));

const store = {
  get(key, fallback) { try { return JSON.parse(localStorage.getItem(key)) ?? fallback } catch { return fallback } },
  set(key, val) { localStorage.setItem(key, JSON.stringify(val)) }
};

async function cargarProductos(){
  const resp = await fetch('data/productos.json');
  return await resp.json();
}

function formatoPrecio(n){ return new Intl.NumberFormat('es-CL',{style:'currency',currency:'CLP',maximumFractionDigits:0}).format(n) }

// ------ Home categorías ------
async function renderCatsHome(){
  const wrap = $('#catsHome'); if(!wrap) return;
  const prods = await cargarProductos();
  const cats = [...new Set(prods.map(p=>p.categoria))];
  wrap.innerHTML = cats.map(c=>`
    <article class="card">
      <span class="badge">${c}</span>
      <h3>${c}</h3>
      <p class="help">Ver productos</p>
      <a class="btn" href="catalogo.html?cat=${encodeURIComponent(c)}">Explorar</a>
    </article>
  `).join('');
}

// ------ Catálogo ------
async function renderCatalogo(){
  const grid = $('#gridProductos'); if(!grid) return;
  const sel = $('#categoria'); const q = $('#q');
  const btnLimpiar = $('#btnLimpiar');
  const data = await cargarProductos();
  const cats = [...new Set(data.map(p=>p.categoria))];
  cats.forEach(c=>{ const opt = document.createElement('option'); opt.value=c; opt.textContent=c; sel.appendChild(opt) });
  const url = new URL(location.href); const preset = url.searchParams.get('cat')||''; sel.value = preset;

  function aplicaFiltros(){
    const term = (q.value||'').toLowerCase();
    const cat = sel.value;
    const items = data.filter(p => (!cat || p.categoria===cat) && (!term || p.nombre.toLowerCase().includes(term) || p.codigo.toLowerCase().includes(term)));
    grid.innerHTML = items.map(p=>{
      // Usar imagen del producto o una por defecto
      const imgSrc = p.img && p.img.trim() ? p.img : 'assets/img/default-fruta.png';
      return `
      <article class="card">
        <span class="badge">${p.categoria}</span>
        <img src="${imgSrc}" alt="${p.nombre}" style="width:100px;height:100px;object-fit:cover;display:block;margin:0 auto 8px;" />
        <h3>${p.nombre}</h3>
        <div class="price">${formatoPrecio(p.precio)}</div>
        <p class="help">Origen: ${p.origen} · Stock: ${p.stock}</p>
        <div class="controls">
          <button data-add="${p.codigo}">Agregar</button>
        </div>
      </article>
      `;
    }).join('');
  }

  q.addEventListener('input',aplicaFiltros);
  sel.addEventListener('change',aplicaFiltros);
  btnLimpiar.addEventListener('click',()=>{ q.value=''; sel.value=''; aplicaFiltros(); });

  grid.addEventListener('click',e=>{
    const code = e.target?.dataset?.add; if(!code) return;
    const cart = store.get('cart',{});
    cart[code] = (cart[code]||0)+1;
    store.set('cart',cart);
    // Interacción visual: animar el botón y mostrar mensaje flotante
    e.target.classList.add('btn-success');
    e.target.textContent = '¡Agregado!';
    setTimeout(()=>{
      e.target.classList.remove('btn-success');
      e.target.textContent = 'Agregar';
    }, 900);
    // Mensaje flotante
    let toast = document.createElement('div');
    toast.textContent = 'Producto agregado al carrito';
    toast.style.position = 'fixed';
    toast.style.top = '24px';
    toast.style.right = '24px';
    toast.style.background = '#198754';
    toast.style.color = '#fff';
    toast.style.padding = '12px 24px';
    toast.style.borderRadius = '8px';
    toast.style.boxShadow = '0 2px 8px #0002';
    toast.style.zIndex = 9999;
    document.body.appendChild(toast);
    setTimeout(()=>{ toast.remove(); }, 1200);
  });

  aplicaFiltros();
}

// ------ Carrito ------
async function renderCarrito(){
  const tbody = $('#tablaCarrito tbody'); if(!tbody) return;
  const totalEl = $('#total');
  const data = await cargarProductos();
  const cart = store.get('cart',{});

  function pintar(){
    const rows = Object.entries(cart).map(([code,qty])=>{
      const p = data.find(x=>x.codigo===code);
      const sub = p.precio*qty;
      return `<tr>
        <td>${p.nombre} <span class="help">(${code})</span></td>
        <td>${formatoPrecio(p.precio)}</td>
        <td>
          <button data-dec="${code}">-</button>
          <span style="padding:0 8px">${qty}</span>
          <button data-inc="${code}">+</button>
        </td>
        <td>${formatoPrecio(sub)}</td>
        <td><button class="ghost" data-del="${code}">Quitar</button></td>
      </tr>`
    });
    tbody.innerHTML = rows.join('') || '<tr><td colspan="5">Carrito vacío</td></tr>';
    const total = Object.entries(cart).reduce((acc,[code,qty])=>{
      const p = data.find(x=>x.codigo===code);
      return acc + p.precio*qty;
    },0);
    totalEl.textContent = formatoPrecio(total);
  }

  $('#tablaCarrito').addEventListener('click',e=>{
    const t = e.target;
    if(t.dataset.inc){ cart[t.dataset.inc] = (cart[t.dataset.inc]||1)+1; }
    if(t.dataset.dec){ cart[t.dataset.dec] = Math.max(1,(cart[t.dataset.dec]||1)-1); }
    if(t.dataset.del){ delete cart[t.dataset.del]; }
    store.set('cart',cart); pintar();
  });

  pintar();
}

// ------ Registro, Login, Perfil ------
function validarEmail(v){ return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) }
function validarTel(v){ return /^\+?\d[\d\s-]{6,}$/.test(v) }

function setupRegistro(){
  const btn = $('#btnRegistro'); if(!btn) return;
  btn.addEventListener('click', ()=>{
    const nombre = $('#regNombre').value.trim();
    const email = $('#regEmail').value.trim();
    const tel = $('#regTel').value.trim();
    const pass = $('#regPass').value;
    const pass2 = $('#regPass2').value;
    const msg = $('#regMsg');
    // Validaciones
    if(!nombre) return msg.textContent='El nombre es obligatorio';
    if(!validarEmail(email)) return msg.textContent='Ingresa un correo válido';
    if(!validarTel(tel)) return msg.textContent='Ingresa un teléfono válido';
    if(pass.length<6) return msg.textContent='La contraseña debe tener 6+ caracteres';
    if(pass!==pass2) return msg.textContent='Las contraseñas no coinciden';
    msg.textContent='';
    const users = store.get('users',{});
    if(users[email]){ msg.textContent='Ya existe una cuenta con este correo'; return; }
    users[email] = { nombre, email, tel, pass };
    store.set('users', users);
    store.set('session', { email });
    location.href='perfil.html';
  });
}

function setupLogin(){
  const btn = $('#btnLogin'); if(!btn) return;
  btn.addEventListener('click', ()=>{
    const email = $('#logEmail').value.trim();
    const pass = $('#logPass').value;
    const msg = $('#loginMsg');
    if(!validarEmail(email)) return msg.textContent='Correo inválido';
    const users = store.get('users',{});
    if(!users[email] || users[email].pass!==pass){ msg.textContent='Credenciales incorrectas'; return; }
    store.set('session',{email});
    location.href='perfil.html';
  });
}

function setupPerfil(){
  const save = $('#btnGuardarPerfil'); if(!save) return;
  const ses = store.get('session',null);
  if(!ses){ location.href='login.html'; return; }
  const users = store.get('users',{});
  const u = users[ses.email];
  $('#perNombre').value = u.nombre;
  $('#perEmail').value = u.email;
  $('#perTel').value = u.tel;
  save.addEventListener('click',()=>{
    const nombre = $('#perNombre').value.trim();
    const tel = $('#perTel').value.trim();
    if(!nombre) return $('#perfilMsg').textContent='El nombre es obligatorio';
    if(!validarTel(tel)) return $('#perfilMsg').textContent='Teléfono inválido';
    u.nombre = nombre; u.tel = tel; users[ses.email]=u; store.set('users',users);
    $('#perfilMsg').textContent='Perfil actualizado';
  });
}

// ------ Pedido ------
function setupPedido(){
  const btn = $('#confirmarPedido'); if(!btn) return;
  const fecha = $('#fecha'); const dir = $('#direccion'); const msg = $('#msgPedido');
  const manana = new Date(Date.now()+24*3600*1000).toISOString().slice(0,10);
  fecha.min = manana;
  btn.addEventListener('click',()=>{
    if(!fecha.value) return msg.textContent='Selecciona una fecha';
    if(!dir.value.trim()) return msg.textContent='Escribe una dirección';
    msg.textContent='Pedido confirmado. Estado: En preparación';
    const estado = $('#estadoPedido'); estado.querySelectorAll('li').forEach((li,i)=>{
      li.style.color = i<=2 ? 'var(--green)' : '';
      li.style.fontWeight = i<=2 ? '700' : '400';
    });
    // limpiar carrito
    store.set('cart',{});
  });
}

// ------ Nosotros ------
function setupTiendas(){
  const ul = $('#listaTiendas'); if(!ul) return;
  const ciudades = ['Santiago','Puerto Montt','Villarrica','Nacimiento','Viña del Mar','Valparaíso','Concepción'];
  ul.innerHTML = ciudades.map(c=>`<li>${c}</li>`).join('');
}

// ------ Contacto ------
function setupContacto(){
  const b = $('#btnContacto'); if(!b) return;
  b.addEventListener('click',()=>{
    const n = $('#conNombre').value.trim();
    const e = $('#conEmail').value.trim();
    const m = $('#conMsj').value.trim();
    if(!n||!validarEmail(e)||m.length<5){ $('#conMsg').textContent='Revisa los datos'; return; }
    $('#conMsg').textContent='Mensaje enviado (simulado)';
  });
}

document.addEventListener('DOMContentLoaded',()=>{
  renderCatsHome();
  renderCatalogo();
  renderCarrito();
  setupRegistro();
  setupLogin();
  setupPerfil();
  setupPedido();
  setupTiendas();
  setupContacto();
});
