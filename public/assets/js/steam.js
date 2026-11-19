// ===== Craft Brewery Simulator — Steam link =====
// The one place to set the Steam store URL. While it's empty, every
// .steam-btn shows "Coming soon to Steam". Once set, they become
// "Wishlist on Steam" links.
const STEAM_URL = '';

document.addEventListener('DOMContentLoaded', () => {
    if (!STEAM_URL) return;
    document.querySelectorAll('.steam-btn').forEach(el => {
        const a = document.createElement('a');
        a.className = el.className.replace('is-soon', '').trim();
        a.href = STEAM_URL;
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
        a.textContent = 'Wishlist on Steam';
        el.replaceWith(a);
    });
});
