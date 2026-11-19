// ===== Portfolio Navigation =====
document.addEventListener('DOMContentLoaded', function() {
    // select all elements that can trigger navigation or resume modal
    const buttons = document.querySelectorAll('.nav-btn, #view-resume');
    const sections = document.querySelectorAll('main section');

    // Mobile drawer
    const navToggle = document.getElementById('nav-toggle');
    const navMenu   = document.getElementById('navbarNav');
    const backdrop  = document.getElementById('nav-backdrop');

    function openMenu() {
        navMenu.classList.add('drawer-open');
        backdrop.classList.add('show');
        navToggle.classList.add('is-open');
        document.body.style.overflow = 'hidden';
    }
    function closeMenu() {
        navMenu.classList.remove('drawer-open');
        backdrop.classList.remove('show');
        navToggle.classList.remove('is-open');
        document.body.style.overflow = '';
    }

    navToggle.addEventListener('click', () =>
        navMenu.classList.contains('drawer-open') ? closeMenu() : openMenu()
    );
    backdrop.addEventListener('click', closeMenu);
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
                embed.src = 'cv.pdf';
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
    window.addEventListener('scroll', () => {
        let current = '';
        sections.forEach(sec => {
            const top = sec.offsetTop - 80;
            if (window.scrollY >= top) {
                current = sec.id;
            }
        });
        if (current) activateNav(current);
    });

    // deep link at load
    if (window.location.hash) {
        const hash = window.location.hash.substring(1);
        if (hash !== 'cv') {
            activateNav(hash);
            scrollToSection(hash);
        }
    }
});
