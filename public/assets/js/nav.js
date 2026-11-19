// ===== About page section navigation =====
document.addEventListener('DOMContentLoaded', function() {
    // select all elements that can trigger navigation or resume modal
    const buttons = document.querySelectorAll('.nav-btn, #view-resume');
    const sections = document.querySelectorAll('main section');

    // Mobile drawer
    const navToggle = document.getElementById('nav-toggle');
    const navMenu   = document.getElementById('navbarNav');
    const backdrop  = document.getElementById('nav-backdrop');

    function openMenu() {
        if (!navMenu) return;
        navMenu.classList.add('drawer-open');
        backdrop.classList.add('show');
        navToggle.classList.add('is-open');
        document.body.style.overflow = 'hidden';
    }
    function closeMenu() {
        if (!navMenu) return;
        navMenu.classList.remove('drawer-open');
        backdrop.classList.remove('show');
        navToggle.classList.remove('is-open');
        document.body.style.overflow = '';
    }

    if (navToggle && navMenu && backdrop) {
        navToggle.addEventListener('click', () =>
            navMenu.classList.contains('drawer-open') ? closeMenu() : openMenu()
        );
        backdrop.addEventListener('click', closeMenu);
    }
    document.addEventListener('keydown', e => e.key === 'Escape' && closeMenu());

    function activateNav(id) {
        buttons.forEach(btn => btn.classList.toggle('active', btn.dataset.target === id));
    }

    function scrollToSection(id) {
        const sec = document.getElementById(id);
        if (sec) {
            sec.scrollIntoView({behavior:'smooth'});
        }
    }

    // click handlers for nav and resume buttons
    buttons.forEach(btn => {
        btn.addEventListener('click', e => {
            closeMenu();
            const target = btn.dataset.target;
            if (target === 'cv') {
                const embed = document.getElementById('resumeEmbed');
                embed.src = '/cv.pdf';
                const modalEl = document.getElementById('resumeModal');
                const modal = new bootstrap.Modal(modalEl);
                modal.show();
            } else {
                e.preventDefault();
                activateNav(target);
                scrollToSection(target);
                history.replaceState(null, '', '#'+target);
            }
        });
    });

    // highlight nav on scroll
    // A section is current once its top reaches the bottom of the sticky
    // header(s), measured live since the header height differs by page/width.
    function headerBottom() {
        const bars = document.querySelectorAll('.studio-nav, .about-subnav, #main-nav');
        return Math.max(0, ...[...bars].map(b => b.getBoundingClientRect().bottom));
    }

    function updateActive() {
        const line = headerBottom() + 40;
        let current = sections.length ? sections[0].id : '';
        sections.forEach(sec => {
            if (sec.getBoundingClientRect().top <= line) current = sec.id;
        });
        // At the bottom of the page the last section can't scroll any higher
        if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2 && sections.length) {
            current = sections[sections.length - 1].id;
        }
        if (current) activateNav(current);
    }

    window.addEventListener('scroll', updateActive, { passive: true });

    // deep link at load
    if (window.location.hash) {
        const hash = window.location.hash.substring(1);
        if (hash !== 'cv') {
            activateNav(hash);
            scrollToSection(hash);
        }
    }
});
