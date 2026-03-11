/* Accent color switcher — persists to localStorage, syncs across pages */

const ACCENT_PRESETS = [
    { name: 'Emerald', value: '#10b981', hover: '#059669' },
    { name: 'Violet',  value: '#8b5cf6', hover: '#7c3aed' },
    { name: 'Cyan',    value: '#0dcaf0', hover: '#0aa5cc' },
    { name: 'Blue',    value: '#3b82f6', hover: '#2563eb' },
    { name: 'Coral',   value: '#f97316', hover: '#ea6d10' },
    { name: 'Amber',   value: '#ffc107', hover: '#f3ab03' },
];

function hexToRgba(hex, alpha) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r},${g},${b},${alpha})`;
}

function applyAccent(value, hover) {
    const root = document.documentElement;
    root.style.setProperty('--accent-color', value);
    root.style.setProperty('--accent-hover', hover);
    root.style.setProperty('--accent-dim', hexToRgba(value, 0.12));
    root.style.setProperty('--accent-glow', hexToRgba(value, 0.18));
    root.style.setProperty('--accent-border', hexToRgba(value, 0.35));
    localStorage.setItem('accentColor', value);

    // Update active swatch indicator
    document.querySelectorAll('.accent-swatch').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.value === value);
    });
}

function renderSwatches(containerSelector) {
    const container = document.querySelector(containerSelector);
    if (!container) return;

    const picker = document.createElement('div');
    picker.className = 'accent-picker';

    ACCENT_PRESETS.forEach(preset => {
        const btn = document.createElement('button');
        btn.className = 'accent-swatch';
        btn.dataset.value = preset.value;
        btn.dataset.hover = preset.hover;
        btn.title = preset.name;
        btn.style.backgroundColor = preset.value;
        btn.setAttribute('aria-label', `${preset.name} accent color`);
        btn.addEventListener('click', () => applyAccent(preset.value, preset.hover));
        picker.appendChild(btn);
    });

    container.appendChild(picker);
}

// Restore saved accent or default to violet on page load
(function () {
    const saved = localStorage.getItem('accentColor');
    const match = ACCENT_PRESETS.find(p => p.value === saved) || ACCENT_PRESETS[0];
    // Apply immediately (before DOM ready) to avoid flash
    const root = document.documentElement;
    root.style.setProperty('--accent-color', match.value);
    root.style.setProperty('--accent-hover', match.hover);
    root.style.setProperty('--accent-dim', hexToRgba(match.value, 0.12));
    root.style.setProperty('--accent-glow', hexToRgba(match.value, 0.18));
    root.style.setProperty('--accent-border', hexToRgba(match.value, 0.35));
})();

// Render swatches into the navbar once DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    renderSwatches('#accent-picker-container');

    // Set active state on whichever swatch matches the current accent
    const current = getComputedStyle(document.documentElement)
        .getPropertyValue('--accent-color').trim();
    document.querySelectorAll('.accent-swatch').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.value === current);
    });
});
