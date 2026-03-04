/**
 * Ekicont Landing — auto-close.js
 * Inactivity-based auto-close / session timeout.
 * After WARN_AFTER ms of no activity → shows warning modal.
 * After CLOSE_AFTER ms more → redirects to home (or closes tab).
 */

'use strict';

const AUTO_CLOSE = {
    WARN_AFTER: 15 * 60 * 1000, // 15 minutes idle → warn
    CLOSE_AFTER: 1 * 60 * 1000, // 1 minute after warn → close/redirect
    COUNTDOWN: 60,              // seconds shown in warning
};

let warnTimer, closeTimer, countdownInterval;
let isWarningShown = false;

// ---- Inject the warning modal into DOM ----
function injectAutoCloseModal() {
    const el = document.createElement('div');
    el.id = 'autoCloseModal';
    el.setAttribute('role', 'alertdialog');
    el.setAttribute('aria-live', 'assertive');
    el.innerHTML = `
        <div class="ac-backdrop">
            <div class="ac-box">
                <div class="ac-icon">⏱️</div>
                <h3 class="ac-title">¿Sigues ahí?</h3>
                <p class="ac-desc">
                    Por seguridad, esta sesión se cerrará en
                    <strong id="acCountdown">${AUTO_CLOSE.COUNTDOWN}</strong> segundos.
                </p>
                <div class="ac-actions">
                    <button class="ac-btn-stay" id="acBtnStay">Seguir aquí</button>
                    <button class="ac-btn-close" id="acBtnClose">Cerrar página</button>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(el);

    document.getElementById('acBtnStay').addEventListener('click', resetActivityTimer);
    document.getElementById('acBtnClose').addEventListener('click', autoClosePage);
}

// ---- Show the warning ----
function showAutoCloseWarning() {
    isWarningShown = true;
    const modal = document.getElementById('autoCloseModal');
    if (modal) modal.classList.add('visible');

    let remaining = AUTO_CLOSE.COUNTDOWN;
    countdownInterval = setInterval(() => {
        remaining--;
        const el = document.getElementById('acCountdown');
        if (el) el.textContent = remaining;
        if (remaining <= 0) {
            clearInterval(countdownInterval);
            autoClosePage();
        }
    }, 1000);

    closeTimer = setTimeout(autoClosePage, AUTO_CLOSE.CLOSE_AFTER);
}

// ---- Auto close the tab/page ----
function autoClosePage() {
    clearAll();
    // Best-effort: browsers restrict window.close() unless opened by script.
    // Fallback: redirect to a "closed session" page or the home.
    window.close();
    // If window.close() doesn't work (most browsers):
    setTimeout(() => {
        window.location.href = '/?session=timeout';
    }, 300);
}

// ---- Reset all timers (on any user activity) ----
function resetActivityTimer() {
    clearAll();
    isWarningShown = false;
    const modal = document.getElementById('autoCloseModal');
    if (modal) modal.classList.remove('visible');

    warnTimer = setTimeout(showAutoCloseWarning, AUTO_CLOSE.WARN_AFTER);
}

function clearAll() {
    clearTimeout(warnTimer);
    clearTimeout(closeTimer);
    clearInterval(countdownInterval);
}

// ---- Track user activity ----
const ACTIVITY_EVENTS = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];

function initAutoClose() {
    injectAutoCloseModal();

    // Throttled activity listener (max once per 10s)
    let lastActivity = 0;
    ACTIVITY_EVENTS.forEach(evt => {
        window.addEventListener(evt, () => {
            const now = Date.now();
            if (!isWarningShown && now - lastActivity > 10_000) {
                lastActivity = now;
                resetActivityTimer();
            }
        }, { passive: true });
    });

    // Start the first timer
    warnTimer = setTimeout(showAutoCloseWarning, AUTO_CLOSE.WARN_AFTER);
}

// Auto-init when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAutoClose);
} else {
    initAutoClose();
}
