const AppState = {
    currentLang: 'en',
    currentTheme: 'dark',
    currentSection: 'home',
    isMenuOpen: false,
    isLoaded: false
};

document.addEventListener('DOMContentLoaded', () => {
    // Bloquear scroll inicial para evitar saltos visuales tras el loader
    document.body.style.overflow = 'hidden';
    initializeApp();
});

function initializeApp() {
    loadPreferences();
    initTheme();
    initFormHandlers();
    initMobileMenu();
    
    // 1. Escuchar el idioma para el Disclaimer
    updateLanguageUI();

    // 2. Orquestación con Callback
    PortfolioAnimations.initLoaderAnimation(() => {
        // ACTIVAR WEBGL JUSTO AQUÍ (Si no se inició antes)
        if(typeof initShaderEngine === 'function') initShaderEngine();
        
        document.body.style.overflow = '';
        
        // Lanzamiento staggered (escalonado) de animaciones
        PortfolioAnimations.initHeroAnimations();
        PortfolioAnimations.initParallax();
        PortfolioAnimations.initSkillAnimations();
        PortfolioAnimations.animateStats();
        
        // EFECTO EXTRA: Escribir el disclaimer automáticamente
        const disclaimer = document.querySelector('.disclaimer-text');
        if(disclaimer) {
            const text = disclaimer.innerText;
            disclaimer.innerText = '';
            glitchText(disclaimer, text, 2000);
        }

        generateParticles();
        initNavigation(); 
        AppState.isLoaded = true;
    });
}



function loadPreferences() {
    const savedLang = localStorage.getItem('portfolio-lang');
    const savedTheme = localStorage.getItem('portfolio-theme');
    if (savedLang) AppState.currentLang = savedLang;
    if (savedTheme) AppState.currentTheme = savedTheme;
}

function toggleLanguage() {
    AppState.currentLang = AppState.currentLang === 'en' ? 'es' : 'en';
    localStorage.setItem('portfolio-lang', AppState.currentLang);
    updateLanguageUI();
}

function updateLanguageUI() {
    const lang = AppState.currentLang; // 'en' o 'es'

    // 1. Actualizar Textos
    const textElements = document.querySelectorAll('[data-text-en], [data-text-es]');
    textElements.forEach(el => {
        // Buscamos directamente el atributo según el idioma actual
        const text = el.getAttribute(`data-text-${lang}`);
        if (text) el.textContent = text;
    });
    
    // 2. Actualizar Placeholders (Formularios)
    const placeholders = document.querySelectorAll('[data-placeholder-en], [data-placeholder-es]');
    placeholders.forEach(el => {
        const ph = el.getAttribute(`data-placeholder-${lang}`);
        if (ph) el.setAttribute('placeholder', ph);
    });
    
    // 3. Actualizar UI del Botón (UX: Muestra el destino)
    const langText = document.querySelector('.lang-text');
    if (langText) {
        // Si estoy en inglés, el botón ofrece cambiar a "ES"
        langText.textContent = lang === 'en' ? 'ES' : 'EN';
    }
    
    // 4. SEO y Accesibilidad
    document.documentElement.lang = lang;
}


// --- Gestión de Tema ---
function initTheme() {
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }
    document.body.setAttribute('data-theme', AppState.currentTheme);
}

function updateThemeUI() {
    const icon = document.querySelector('#themeToggle i');
    if (icon) {
        icon.className = AppState.currentTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    }
}

function toggleTheme() {
    AppState.currentTheme = AppState.currentTheme === 'dark' ? 'light' : 'dark';
    document.body.setAttribute('data-theme', AppState.currentTheme);
    localStorage.setItem('portfolio-theme', AppState.currentTheme);
    updateThemeUI();
}



// --- Navegación y Scroll ---
function initNavigation() {
    const navLinks = document.querySelectorAll('.nav-link[href^="#"]');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const target = document.querySelector(link.getAttribute('href'));
            if (target) {
                const headerHeight = document.querySelector('.main-header').offsetHeight;
                window.scrollTo({
                    top: target.offsetTop - headerHeight,
                    behavior: 'smooth'
                });
                if (AppState.isMenuOpen) toggleMobileMenu();
            }
        });
    });
    
    window.addEventListener('scroll', () => {
        const header = document.querySelector('.main-header');
        header.classList.toggle('scrolled', window.scrollY > 50);
    });
}

// --- Formulario ---
function initFormHandlers() {
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const msg = AppState.currentLang === 'es' ? '¡Mensaje enviado con éxito!' : 'Message sent successfully!';
            alert(msg);
            e.target.reset();
        });
    }
}

// --- Mobile Menu ---
function initMobileMenu() {
    const menuToggle = document.getElementById('menuToggle');
    if (menuToggle) menuToggle.addEventListener('click', toggleMobileMenu);
}

function toggleMobileMenu() {
    AppState.isMenuOpen = !AppState.isMenuOpen;
    document.getElementById('navMenu').classList.toggle('active', AppState.isMenuOpen);
    document.getElementById('menuToggle').classList.toggle('active', AppState.isMenuOpen);
}

// --- Partículas (Efecto IA) ---
function generateParticles() {
    const container = document.getElementById('particles');
    if (!container) return;
    container.innerHTML = ''; // Limpiar por si acaso
    
    const symbols = ['{', '}', '[', ']', '0', '1', '<', '>', '/', '*'];
    for (let i = 0; i < 25; i++) {
        const p = document.createElement('div');
        p.className = 'particle';
        p.textContent = symbols[Math.floor(Math.random() * symbols.length)];
        p.style.left = Math.random() * 100 + '%';
        p.style.animationDelay = Math.random() * 5 + 's';
        p.style.fontSize = (Math.random() * 20 + 10) + 'px';
        container.appendChild(p);
    }
}