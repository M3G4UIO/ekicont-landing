/**
 * Ekicont Landing — app.js
 * Handles: theme toggle, scroll animations, apps grid, Odoo API fetch
 */

'use strict';

// =================== ODOO CONFIG ===================
const ODOO_URL = 'https://ekicontv1-production.up.railway.app';
const ODOO_DB = 'ekicont'; // Master DB for pricing/config

// =================== APP DATA (fallback if API unavailable) ===================
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
        btnTheme.textContent = '☀️';
        btnTheme.title = 'Cambiar a modo claro';
    } else {
        body.classList.add('light');
        btnTheme.textContent = '🌙';
        btnTheme.title = 'Cambiar a modo oscuro';
    }
    localStorage.setItem('eki-theme', isDark ? 'dark' : 'light');
}

// Init theme from localStorage
const savedTheme = localStorage.getItem('eki-theme');
applyTheme(savedTheme !== 'light'); // default dark

btnTheme.addEventListener('click', () => {
    applyTheme(body.classList.contains('light'));
});

// =================== SCROLL ANIMATIONS ===================
function initScrollAnimations() {
    const elements = document.querySelectorAll('.animate-in');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                // Stagger children if needed
                const children = entry.target.querySelectorAll('.animate-in');
                children.forEach((child, i) => {
                    setTimeout(() => child.classList.add('visible'), i * 80);
                });
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    elements.forEach(el => observer.observe(el));

    // Hero visible immediately
    const heroContent = document.getElementById('heroContent');
    if (heroContent) {
        requestAnimationFrame(() => {
            setTimeout(() => heroContent.classList.add('visible'), 100);
        });
    }
}

// =================== APPS GRID ===================
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
                    <span style="filter: drop-shadow(0 0 4px ${app.color})">${app.icon}</span>
                </div>
                <span class="app-name">${app.name}</span>
                ${app.badge ? `<span class="app-badge">${app.badge}</span>` : ''}
            `;
            col.appendChild(card);
        });

        grid.appendChild(col);
    });

    // Re-observe new elements
    document.querySelectorAll('.app-category.animate-in').forEach(el => {
        scrollObserver && scrollObserver.observe(el);
    });
}

// =================== ODOO API FETCH ===================
async function fetchPricingFromOdoo() {
    try {
        const response = await fetch(`${ODOO_URL}/ekiworld/api/pricing`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            // Short timeout so fallback data appears fast
            signal: AbortSignal.timeout(4000)
        });
        if (!response.ok) return null;
        const data = await response.json();
        return data.result || null;
    } catch (e) {
        console.warn('[Ekicont] Odoo API unavailable, using static data.', e.message);
        return null;
    }
}

// =================== INIT ===================
let scrollObserver;

document.addEventListener('DOMContentLoaded', async () => {
    // 1. Render static apps immediately
    renderAppsGrid(APP_CATEGORIES);

    // 2. Init scroll animations
    scrollObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) entry.target.classList.add('visible');
        });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    document.querySelectorAll('.animate-in').forEach(el => scrollObserver.observe(el));

    // Hero always visible
    requestAnimationFrame(() => {
        const heroContent = document.getElementById('heroContent');
        if (heroContent) setTimeout(() => heroContent.classList.add('visible'), 120);
    });

    // 3. Try to fetch dynamic data from Odoo (non-blocking)
    fetchPricingFromOdoo().then(apiData => {
        if (apiData && apiData.categories) {
            renderAppsGrid(apiData.categories);
        }
    });

    // 4. Navbar scroll shadow
    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 20) {
            navbar.style.boxShadow = '0 8px 32px rgba(0,0,0,0.3)';
        } else {
            navbar.style.boxShadow = 'none';
        }
    }, { passive: true });
});
