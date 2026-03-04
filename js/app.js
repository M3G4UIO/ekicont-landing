/**
 * Ekicont Landing — app.js
 * Features: theme toggle, scroll animations, apps grid, Odoo API fetch, login role modal
 */

'use strict';

// =================== ODOO CONFIG ===================
const ODOO_URL = 'https://ekicontv1-production.up.railway.app';

// DB routing for login modal
const DB_ADMIN = 'ekicont';      // Administrador → master DB
const DB_USUARIO = 'GALAPAGOS';    // Usuario/Cliente → client DB

// =================== APP DATA ===================
const APP_CATEGORIES = [
    {
        title: 'Finanzas',
        apps: [
            { name: 'Contabilidad', icon: '📊', color: '#318CDD' },
            { name: 'Facturación', icon: '🧾', color: '#F3426D' },
            { name: 'Gastos', icon: '💼', color: '#EDDB00' },
        ]
    },
    {
        title: 'Ventas',
        apps: [
            { name: 'CRM', icon: '🎯', color: '#F3426D', badge: 'Popular' },
            { name: 'Ventas', icon: '⚡', color: '#318CDD' },
            { name: 'Punto de Venta', icon: '🏪', color: '#35D32F' },
        ]
    },
    {
        title: 'Sitios Web',
        apps: [
            { name: 'eCommerce', icon: '🛒', color: '#EDDB00' },
            { name: 'Creador Web', icon: '🌐', color: '#318CDD' },
        ]
    },
    {
        title: 'Operaciones',
        apps: [
            { name: 'Inventario', icon: '📦', color: '#F3426D' },
            { name: 'Proyectos', icon: '📋', color: '#318CDD' },
            { name: 'RRHH', icon: '👥', color: '#35D32F' },
        ]
    }
];

// =================== THEME TOGGLE ===================
const body = document.body;
const btnTheme = document.getElementById('btnTheme');

function applyTheme(isDark) {
    if (isDark) {
        body.classList.remove('light');
        if (btnTheme) { btnTheme.textContent = '☀️'; btnTheme.title = 'Modo claro'; }
    } else {
        body.classList.add('light');
        if (btnTheme) { btnTheme.textContent = '🌙'; btnTheme.title = 'Modo oscuro'; }
    }
    localStorage.setItem('eki-theme', isDark ? 'dark' : 'light');
}

// Default to light (diurno). 
// Automatic switch to light between 6 AM and 7 PM.
const hour = new Date().getHours();
const isDaytime = hour >= 6 && hour < 19;
const savedTheme = localStorage.getItem('eki-theme');

// If it's daytime, force light mode. Otherwise, check saved preference.
// Default to light if no preference exists.
let shouldBeDark = false;
if (isDaytime) {
    shouldBeDark = false;
    localStorage.removeItem('eki-theme'); // Reset on day
} else {
    shouldBeDark = savedTheme === 'dark';
}

applyTheme(shouldBeDark);
if (btnTheme) btnTheme.addEventListener('click', () => applyTheme(body.classList.contains('light')));

// =================== LOGIN ROLE MODAL ===================
/**
 * Creates and injects the login role modal into the DOM.
 * Admin → db=ekicont (master / back-office)
 * Usuario → db=GALAPAGOS (client tenant)
 */
function injectLoginModal() {
    const modal = document.createElement('div');
    modal.id = 'loginModal';
    modal.className = 'login-modal-backdrop';
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-labelledby', 'loginModalTitle');

    modal.innerHTML = `
        <div class="login-modal">
            <button class="login-modal-close" id="loginModalClose" aria-label="Cerrar">✕</button>

            <div class="login-modal-badge">
                <span class="login-modal-badge-dot">●</span> Ekicont — Acceso
            </div>

            <h2 class="login-modal-title" id="loginModalTitle">¿Cómo deseas ingresar?</h2>
            <p class="login-modal-sub">Selecciona tu tipo de acceso para continuar.</p>

            <div class="login-role-cards">

                <!-- ADMIN CARD -->
                <a href="${ODOO_URL}/web/login?db=${DB_ADMIN}"
                   class="login-role-card admin"
                   id="roleAdmin">
                    <div class="role-icon">🛡️</div>
                    <div class="role-info">
                        <div class="role-name">Administrador</div>
                        <div class="role-desc">Acceso al panel de control y configuración</div>
                    </div>
                    <span class="role-db-badge">${DB_ADMIN}</span>
                    <span class="role-arrow">→</span>
                </a>

                <!-- USUARIO CARD -->
                <a href="${ODOO_URL}/web/login?db=${DB_USUARIO}"
                   class="login-role-card user"
                   id="roleUser">
                    <div class="role-icon">👤</div>
                    <div class="role-info">
                        <div class="role-name">Usuario / Cliente</div>
                        <div class="role-desc">Accede a tu contabilidad y servicios</div>
                    </div>
                    <span class="role-db-badge">${DB_USUARIO}</span>
                    <span class="role-arrow">→</span>
                </a>

            </div>

            <div class="login-modal-footer">
                Conexión segura · Powered by Ekicont
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    // Close on backdrop click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeLoginModal();
    });

    // Close button
    document.getElementById('loginModalClose').addEventListener('click', closeLoginModal);

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('open')) closeLoginModal();
    });
}

function openLoginModal(e) {
    if (e) e.preventDefault();
    const modal = document.getElementById('loginModal');
    if (modal) {
        modal.classList.add('open');
        document.body.style.overflow = 'hidden';
    }
}

function closeLoginModal() {
    const modal = document.getElementById('loginModal');
    if (modal) {
        modal.classList.remove('open');
        document.body.style.overflow = '';
    }
}

/** Wire up all login buttons on the page to open the modal */
function wireLoginButtons() {
    // Collect all elements with data-login attribute OR class btn-login
    const triggers = document.querySelectorAll(
        '[data-login], #loginBtn, #heroCTA, .btn-cta, #heroSignup'
    );
    triggers.forEach(el => {
        // Only intercept "Iniciar sesión" and "Comienza ahora" links
        // (Not pricing links or other CTAs that go elsewhere)
        const href = el.getAttribute('href') || '';
        if (href.includes('/web/login') || href.includes('/web/signup') || el.id === 'loginBtn') {
            el.addEventListener('click', openLoginModal);
        }
    });
}

// =================== APPS GRID ===================
let scrollObserver;

function renderAppsGrid(categories) {
    const grid = document.getElementById('appsGrid');
    if (!grid) return;
    grid.innerHTML = '';

    categories.forEach((category, catIdx) => {
        const col = document.createElement('div');
        col.className = 'app-category animate-in';
        col.style.transitionDelay = `${catIdx * 0.08}s`;
        col.innerHTML = `<div class="app-category-title">${category.title}</div>`;

        category.apps.forEach(app => {
            const card = document.createElement('div');
            card.className = 'app-card';
            card.innerHTML = `
                <div class="app-icon" style="background:${app.color}22;">
                    <span style="filter:drop-shadow(0 0 4px ${app.color})">${app.icon}</span>
                </div>
                <span class="app-name">${app.name}</span>
                ${app.badge ? `<span class="app-badge">${app.badge}</span>` : ''}
            `;
            col.appendChild(card);
        });
        grid.appendChild(col);
    });

    document.querySelectorAll('.app-category.animate-in').forEach(el => {
        scrollObserver && scrollObserver.observe(el);
    });
}

// =================== ODOO API FETCH ===================
async function fetchConfigFromOdoo() {
    try {
        const res = await fetch(`${ODOO_URL}/ekiworld/api/config`, {
            signal: AbortSignal.timeout(4000)
        });
        if (!res.ok) return null;
        const json = await res.json();
        return json.result || null;
    } catch (e) {
        console.warn('[Ekicont] Config API unavailable.', e.message);
        return null;
    }
}

async function fetchPricingFromOdoo() {
    try {
        const res = await fetch(`${ODOO_URL}/ekiworld/api/pricing`, {
            signal: AbortSignal.timeout(4000)
        });
        if (!res.ok) return null;
        const json = await res.json();
        return json.result || null;
    } catch (e) {
        return null;
    }
}

// =================== APPLY DYNAMIC CONFIG ===================
function applyConfig(config) {
    if (!config) return;

    // Hero title
    if (config.hero_title) {
        const h1 = document.querySelector('.hero-title');
        if (h1) h1.innerHTML = config.hero_title;
    }
    // Hero subtitle
    if (config.hero_subtitle) {
        const sub = document.querySelector('.hero-sub');
        if (sub) sub.textContent = config.hero_subtitle;
    }
    // Primary color
    if (config.primary_color) {
        document.documentElement.style.setProperty('--pink', config.primary_color);
    }
    // Secondary color
    if (config.secondary_color) {
        document.documentElement.style.setProperty('--blue', config.secondary_color);
    }
    // Logo
    if (config.logo_url) {
        const logos = document.querySelectorAll('.site-logo');
        logos.forEach(el => { el.src = config.logo_url; el.style.display = 'block'; });
    }
}

// =================== INIT ===================
document.addEventListener('DOMContentLoaded', async () => {
    // 1. Inject login modal
    injectLoginModal();
    wireLoginButtons();

    // 2. Render static apps
    renderAppsGrid(APP_CATEGORIES);

    // 3. Scroll animations
    scrollObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => { if (entry.isIntersecting) entry.target.classList.add('visible'); });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    document.querySelectorAll('.animate-in').forEach(el => scrollObserver.observe(el));

    // Hero immediately visible
    requestAnimationFrame(() => {
        const heroContent = document.getElementById('heroContent');
        if (heroContent) setTimeout(() => heroContent.classList.add('visible'), 120);
    });

    // 4. Non-blocking API calls
    fetchConfigFromOdoo().then(applyConfig);
    fetchPricingFromOdoo().then(apiData => {
        if (apiData && apiData.categories) renderAppsGrid(apiData.categories);
    });

    // 5. Navbar shadow
    const navbar = document.getElementById('navbar');
    if (navbar) {
        window.addEventListener('scroll', () => {
            navbar.style.boxShadow = window.scrollY > 20 ? '0 8px 32px rgba(0,0,0,0.3)' : 'none';
        }, { passive: true });
    }
});
