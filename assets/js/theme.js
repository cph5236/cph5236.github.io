// ===== Theme Switcher (Radio Buttons) =====
document.addEventListener('DOMContentLoaded', (event) => {
    const htmlElement = document.documentElement;
    const themeRadioButtons = document.querySelectorAll('input[name="btnradio"]');

    // Set the default theme to dark if no setting is found in local storage
    const currentTheme = localStorage.getItem('bsTheme') || 'dark';
    htmlElement.setAttribute('data-bs-theme', currentTheme);
    
    // Set the checked radio button based on current theme
    document.getElementById(currentTheme === 'dark' ? 'DarkTheme' : 'LightTheme').checked = true;

    // Listen for radio button changes
    themeRadioButtons.forEach(radio => {
        radio.addEventListener('change', function () {
            const selectedTheme = this.id === 'DarkTheme' ? 'dark' : 'light';
            htmlElement.setAttribute('data-bs-theme', selectedTheme);
            localStorage.setItem('bsTheme', selectedTheme);
        });
    });
});
