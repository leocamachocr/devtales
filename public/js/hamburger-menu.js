/**
 * Menú Hamburguesa - JavaScript para navegación móvil
 * Maneja la funcionalidad del menú hamburguesa en dispositivos móviles
 */

class HamburgerMenu {
  constructor() {
    this.menuToggle = null;
    this.navMenu = null;
    this.body = document.body;
    this.isInitialized = false;

    this.init();
  }

  init() {
    // Esperar a que el DOM esté completamente cargado
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () => this.setup());
    } else {
      this.setup();
    }
  }

  setup() {
    this.menuToggle = document.querySelector(".menu-toggle");
    this.navMenu = document.querySelector(".nav-menu");

    if (!this.menuToggle || !this.navMenu) {
      console.warn("Hamburger menu elements not found");
      return;
    }

    this.bindEvents();
    this.isInitialized = true;
  }

  bindEvents() {
    // Evento principal del botón hamburguesa
    this.menuToggle.addEventListener("click", (e) => {
      e.preventDefault();
      this.toggleMenu();
    });

    // Cerrar menú cuando se hace clic en un enlace
    this.navMenu.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        this.closeMenu();
      });
    });

    // Cerrar menú al redimensionar la ventana si es desktop
    window.addEventListener("resize", () => {
      if (window.innerWidth > 768) {
        this.closeMenu();
      }
    });

    // Cerrar menú al hacer clic fuera de él
    document.addEventListener("click", (e) => {
      if (
        this.isMenuOpen() &&
        !this.navMenu.contains(e.target) &&
        !this.menuToggle.contains(e.target)
      ) {
        this.closeMenu();
      }
    });

    // Cerrar menú con tecla Escape
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && this.isMenuOpen()) {
        this.closeMenu();
        this.menuToggle.focus(); // Devolver foco al botón
      }
    });
  }

  toggleMenu() {
    if (this.isMenuOpen()) {
      this.closeMenu();
    } else {
      this.openMenu();
    }
  }

  openMenu() {
    this.menuToggle.setAttribute("aria-expanded", "true");
    this.menuToggle.classList.add("active");
    this.navMenu.classList.add("active");
    this.body.classList.add("menu-open");

    // Track mobile menu open event
    this.trackMobileMenu("open");

    // Enfocar el primer enlace del menú para accesibilidad
    const firstLink = this.navMenu.querySelector("a");
    if (firstLink) {
      setTimeout(() => firstLink.focus(), 300); // Esperar a que termine la animación
    }
  }

  closeMenu() {
    this.menuToggle.setAttribute("aria-expanded", "false");
    this.menuToggle.classList.remove("active");
    this.navMenu.classList.remove("active");
    this.body.classList.remove("menu-open");

    // Track mobile menu close event
    this.trackMobileMenu("close");
  }

  isMenuOpen() {
    return this.navMenu && this.navMenu.classList.contains("active");
  }

  // Método público para destruir el menú si es necesario
  destroy() {
    if (!this.isInitialized) return;

    this.closeMenu();

    // Remover event listeners
    const newMenuToggle = this.menuToggle.cloneNode(true);
    this.menuToggle.parentNode.replaceChild(newMenuToggle, this.menuToggle);

    this.isInitialized = false;
  }

  // Función para tracking del sistema de analytics (compatible con múltiples proveedores)
  trackMobileMenu(action) {
    // Use new analytics system
    if (typeof window !== "undefined" && window.devTalesAnalytics) {
      window.devTalesAnalytics.trackMobileMenu(action);
    }
  }
}

// Inicializar el menú hamburguesa cuando se carga el script
let hamburgerMenu;

// Función de inicialización global
function initHamburgerMenu() {
  if (hamburgerMenu) {
    hamburgerMenu.destroy();
  }
  hamburgerMenu = new HamburgerMenu();
}

// Auto-inicializar
initHamburgerMenu();

// Exponer funciones globalmente si es necesario
window.HamburgerMenu = HamburgerMenu;
window.initHamburgerMenu = initHamburgerMenu;
