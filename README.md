# HuertoHogar · Forma A (MVP educativo)

Sitio estático que cumple los criterios de la rúbrica: HTML5 semántico, CSS externo y responsive, validaciones JS y flujo de compra simulado con localStorage.

## Estructura
- index.html, catalogo.html, carrito.html, pedido.html, registro.html, login.html, perfil.html, nosotros.html, blog.html, contacto.html
- assets/css/styles.css
- assets/js/app.js
- data/productos.json

## Ejecutar local
Abrir `index.html` con extensión Live Server o un servidor simple:
```bash
python -m http.server 8000
```

## Git
```bash
git init
git add .
git commit -m "feat: estructura HTML5 semántica y estilos base"
git branch -M main
git remote add origin https://github.com/usuario/huertohogar.git
git push -u origin main
```
Commits sugeridos:
- `feat(html): páginas base con header/nav/footer`
- `feat(css): paleta y responsive`
- `feat(js): validaciones de registro y login`
- `feat(catalogo): filtros y carrito en localStorage`
- `feat(pedido): confirmación y estados`
