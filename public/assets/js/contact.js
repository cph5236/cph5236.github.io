// ===== Contact pop-up =====
// Any mailto: link opens a small dialog showing the address with a Copy
// button instead of launching a mail app. Without JS the links still work.
(() => {
    let dialog;

    function build() {
        dialog = document.createElement('dialog');
        dialog.className = 'contact-dialog';
        dialog.setAttribute('aria-labelledby', 'contact-dialog-title');
        dialog.innerHTML = `
            <form method="dialog" class="contact-close-form">
                <button class="contact-close" aria-label="Close">&times;</button>
            </form>
            <p class="contact-kicker">&gt; get_in_touch</p>
            <h2 id="contact-dialog-title">Send us an email</h2>
            <p class="contact-note">Questions, business enquiries or press — we'll get back to you.</p>
            <div class="contact-row">
                <span class="contact-email"></span>
                <button type="button" class="contact-copy">Copy</button>
            </div>
            <p class="contact-status" role="status" aria-live="polite"></p>
            <a class="contact-open">Open in mail app</a>`;
        document.body.appendChild(dialog);

        dialog.querySelector('.contact-copy').addEventListener('click', async () => {
            const email = dialog.querySelector('.contact-email').textContent;
            const status = dialog.querySelector('.contact-status');
            try {
                await navigator.clipboard.writeText(email);
                status.textContent = 'Copied to clipboard';
            } catch {
                // Clipboard blocked: select the text so it can be copied by hand
                const range = document.createRange();
                range.selectNodeContents(dialog.querySelector('.contact-email'));
                const sel = getSelection();
                sel.removeAllRanges();
                sel.addRange(range);
                status.textContent = 'Press Ctrl+C (or ⌘C) to copy';
            }
        });
        // Click on the backdrop closes the dialog
        dialog.addEventListener('click', e => { if (e.target === dialog) dialog.close(); });
    }

    function open(href) {
        if (!dialog) build();
        const email = decodeURIComponent(href.slice('mailto:'.length).split('?')[0]);
        dialog.querySelector('.contact-email').textContent = email;
        dialog.querySelector('.contact-open').href = href;
        dialog.querySelector('.contact-status').textContent = '';
        dialog.showModal();
        dialog.querySelector('.contact-copy').focus();
    }

    document.addEventListener('click', e => {
        const link = e.target.closest('a[href^="mailto:"]');
        if (!link || link.classList.contains('contact-open') || typeof HTMLDialogElement !== 'function') return;
        e.preventDefault();
        open(link.getAttribute('href'));
    });
})();
