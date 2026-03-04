/**
 * Ekicont — pricing.js
 * Handles pricing page: profile/cycle toggles, card render, Odoo API fetch
 */

'use strict';

const ODOO_URL = 'https://ekicontv1-production.up.railway.app';

// =================== STATIC PRICING DATA ===================
// These are the fallback prices. If Odoo API is available, these are replaced.
const PRICING_CONFIG = {
    natural: {
        label: 'Independiente',
        plans: [
            {
                id: 'starter',
                name: 'Mochilero',
                icon: '🧭',
                description: 'Lo esencial para llevar tu contabilidad a cualquier lugar del mundo.',
                features: ['Declaración simplificada', 'Control de gastos', 'Soporte básico', 'Modo Offline'],
                prices: { mensual: 0, semestral: 0, anual: 0 },
                buttonText: 'Empezar Ruta',
                highlight: false
            },
            {
                id: 'pro',
                name: 'Nómada Pro',
                icon: '🗺️',
                description: 'Automatización total para los que no tienen oficina fija.',
                features: ['Multi-divisa real', 'Facturas ilimitadas', 'Asistente AI', 'Integración Global', 'Reportes de viaje'],
                prices: { mensual: 22, semestral: 19, anual: 17 },
                buttonText: 'Elegir Libertad',
                highlight: true,
                badge: 'Recomendado'
            },
            {
                id: 'vip',
                name: 'Residente VIP',
                icon: '👑',
                description: 'Gestión total de impuestos internacionales y asesoría experta.',
                features: ['Todo lo de Pro', 'Asesoría Tax-Nomad', 'Optimización Fiscal', 'Prioridad Global'],
                prices: { mensual: 55, semestral: 49, anual: 45 },
                buttonText: 'Unirme al Club',
                highlight: false
            }
        ]
    },
    empresa: {
        label: 'Equipos Remotos',
        plans: [
            {
                id: 'pyme',
                name: 'Base Camp',
                icon: '🚀',
                description: 'Estructura contable para startups con ADN remoto.',
                features: ['Libros Globales', 'Nómina Internacional', 'Facturación Multi-región', 'Soporte Sync'],
                prices: { mensual: 35, semestral: 31, anual: 28 },
                buttonText: 'Crear Base',
                highlight: false
            },
            {
                id: 'scale',
                name: 'Expedición',
                icon: '⚡',
                description: 'Escalabilidad para empresas que cruzan fronteras.',
                features: ['Todo lo de Base', 'Nómina 20+ países', 'Multiusuario', 'API Enterprise', 'Dashboards'],
                prices: { mensual: 95, semestral: 85, anual: 75 },
                buttonText: 'Iniciar Expedición',
                highlight: true,
                badge: 'Escalable'
            },
            {
                id: 'enterprise',
                name: 'Global',
                icon: '🌍',
                description: 'Control financiero total para corporaciones distribuidas.',
                features: ['CFO on-demand', 'Auditoría Global', 'Manejo de Activos', 'Account Manager'],
                prices: { mensual: 250, semestral: 220, anual: 199 },
                buttonText: 'Solicitar Demo',
                highlight: false
            }
        ]
    }
};

// =================== STATE ===================
let currentProfile = 'natural';
let currentCycle = 'mensual';
let configData = PRICING_CONFIG; // May be replaced by API data

// =================== CARD RENDERER ===================
function buildCard(plan, cycle) {
    const price = plan.prices[cycle];
    const savings = plan.prices.mensual - price;
    const cycleMonths = cycle === 'anual' ? 12 : 6;

    const card = document.createElement('div');
    card.className = `pricing-card${plan.highlight ? ' highlighted' : ''}`;
    card.style.animationDelay = `${['starter', 'pyme'].includes(plan.id) ? 0 : plan.id === 'pro' || plan.id === 'scale' ? 80 : 160}ms`;

    card.innerHTML = `
        ${plan.badge ? `<div class="card-badge">${plan.badge}</div>` : ''}
        <div class="card-icon-wrap">${plan.icon}</div>
        <h3 class="card-name">${plan.name}</h3>
        <p class="card-desc">${plan.description}</p>

        <div class="card-price-wrap">
            <span class="card-price">$${price}</span>
            <span class="card-price-unit">/mes</span>
            ${savings > 0 && cycle !== 'mensual'
            ? `<div class="card-savings">Ahorro: $${savings * cycleMonths} ${cycle === 'anual' ? 'al año' : 'semestral'}</div>`
            : ''}
        </div>

        <ul class="card-features">
            ${plan.features.map(f => `
                <li>
                    <span class="feature-check">✓</span>
                    ${f}
                </li>
            `).join('')}
        </ul>

        <a href="https://ekicontv1-production.up.railway.app/web/login" 
           class="card-btn ${plan.highlight ? 'card-btn-highlight' : 'card-btn-default'}">
            <span>${plan.buttonText}</span>
            <span class="card-btn-arrow">→</span>
        </a>
    `;
    return card;
}

function renderCards() {
    const grid = document.getElementById('pricingGrid');
    if (!grid) return;
    grid.innerHTML = '';
    const plans = configData[currentProfile].plans;
    plans.forEach(plan => grid.appendChild(buildCard(plan, currentCycle)));
}

// =================== CONTROLS ===================
function initControls() {
    // Profile buttons
    document.querySelectorAll('.profile-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.profile-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentProfile = btn.dataset.profile;
            renderCards();
        });
    });

    // Cycle buttons
    document.querySelectorAll('.cycle-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.cycle-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentCycle = btn.dataset.cycle;
            renderCards();
        });
    });
}

// =================== ODOO API ===================
async function fetchPricingData() {
    try {
        const res = await fetch(`${ODOO_URL}/ekiworld/api/pricing`, {
            method: 'GET',
            headers: { 'Accept': 'application/json' },
            signal: AbortSignal.timeout(5000)
        });
        if (!res.ok) return;
        const json = await res.json();
        const data = json.result;
        if (data && data.pricing) {
            // Merge API data: override prices if available
            Object.keys(data.pricing).forEach(profileKey => {
                if (configData[profileKey]) {
                    data.pricing[profileKey].forEach(apiPlan => {
                        const local = configData[profileKey].plans.find(p => p.id === apiPlan.id);
                        if (local) local.prices = apiPlan.prices;
                    });
                }
            });
            renderCards(); // Re-render with live prices
        }
    } catch (e) {
        console.warn('[Ekicont Pricing] Using static pricing data.', e.message);
    }
}

// =================== INIT ===================
document.addEventListener('DOMContentLoaded', () => {
    initControls();
    renderCards();
    fetchPricingData();

    // Animate header
    const header = document.getElementById('pricingHeader');
    if (header) setTimeout(() => header.classList.add('visible'), 100);
});
