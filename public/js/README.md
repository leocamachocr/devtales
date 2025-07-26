# JavaScript - DevTales

## Hamburger Menu (`hamburger-menu.js`)

### Descripción

Maneja la funcionalidad del menú hamburguesa para dispositivos móviles. Proporciona una navegación elegante que se desliza desde la derecha en pantallas pequeñas.

### Características

#### 🎯 **Funcionalidad Principal**

- ✅ Toggle del menú al hacer clic en el botón hamburguesa
- ✅ Cierre automático al hacer clic en enlaces de navegación
- ✅ Cierre automático al redimensionar a pantalla grande (>768px)
- ✅ Cierre al hacer clic fuera del menú
- ✅ Cierre con tecla Escape

#### 🔧 **Accesibilidad**

- ✅ Atributos ARIA (`aria-expanded`)
- ✅ Gestión de foco para navegación por teclado
- ✅ Soporte completo para lectores de pantalla

#### 🎨 **Animaciones**

- ✅ Transformación del ícono hamburguesa a X
- ✅ Deslizamiento suave del menú desde la derecha
- ✅ Transiciones CSS coordinadas con JavaScript

### Uso

#### **Inicialización Automática**

El script se inicializa automáticamente cuando se carga:

```html
<script src="/js/hamburger-menu.js"></script>
```

#### **Estructura HTML Requerida**

```html
<button class="menu-toggle" aria-label="Toggle menu" aria-expanded="false">
  <span class="hamburger-line"></span>
  <span class="hamburger-line"></span>
  <span class="hamburger-line"></span>
</button>

<nav class="nav-menu">
  <a href="/">Home</a>
  <a href="/posts">Posts</a>
  <!-- más enlaces... -->
</nav>
```

#### **CSS Requerido**

Los estilos están definidos en `/styles/base.css` en las secciones:

- `.menu-toggle` - Botón hamburguesa
- `.hamburger-line` - Líneas del ícono
- `.nav-menu` - Menú de navegación
- Responsive queries para mobile

### API

#### **Clase HamburgerMenu**

```javascript
const menu = new HamburgerMenu();

// Métodos disponibles:
menu.openMenu(); // Abrir menú
menu.closeMenu(); // Cerrar menú
menu.toggleMenu(); // Toggle menú
menu.isMenuOpen(); // Estado del menú
menu.destroy(); // Limpiar listeners
```

#### **Funciones Globales**

```javascript
// Reinicializar el menú
initHamburgerMenu();

// Acceso a la clase
window.HamburgerMenu;
```

### Eventos

#### **Eventos que Disparan Acciones**

- `click` en `.menu-toggle` → Toggle menú
- `click` en enlaces del menú → Cerrar menú
- `resize` de window → Cerrar si desktop
- `click` fuera del menú → Cerrar menú
- `keydown` (Escape) → Cerrar menú

#### **Clases CSS Aplicadas**

- `menu-toggle.active` → Animación a X
- `nav-menu.active` → Menú visible
- `body.menu-open` → Prevenir scroll

### Breakpoints

```css
/* Desktop */
@media (min-width: 769px) {
  /* Menú horizontal normal */
}

/* Mobile */
@media (max-width: 768px) {
  /* Menú hamburguesa activo */
}
```

### Compatibilidad

- ✅ Todos los navegadores modernos
- ✅ IE11+ (con polyfills si es necesario)
- ✅ Dispositivos táctiles
- ✅ Navegación por teclado

### Dependencias

- CSS: `/styles/base.css`
- HTML: Estructura de header en layouts
- Sin librerías externas (Vanilla JS)

---

_Última actualización: Enero 2025_
