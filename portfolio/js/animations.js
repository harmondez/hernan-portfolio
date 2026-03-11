

/**
 * PORTFOLIO ANIMATIONS ENGINE - Cyberpunk / Synthwave Edition
 */

// --- 1. Utilidades Glitch ---
// --- 1. Utilidades Glitch ---
const glitchText = (element, targetText, duration = 1500) => {
    const chars = '01ABCDEF#$&*@_+%/¿X?Z█▓▒░<>';
    let iteration = 0;
    
    // CAPTURAMOS EL COLOR ORIGINAL AQUÍ (Fix crítico)
    const originalColor = window.getComputedStyle(element).color;
    const glitchColors = ['#ff00ff', '#00ffff', '#fff', '#7000ff'];
    
    const interval = setInterval(() => {
        element.innerText = targetText
            .split("")
            .map((letter, index) => {
                if (index < iteration) return targetText[index];
                return chars[Math.floor(Math.random() * chars.length)];
            })
            .join("");

        const randomColor = glitchColors[Math.floor(Math.random() * glitchColors.length)];
        element.style.textShadow = `2px 0 ${randomColor}, -2px 0 #ff00ff, 0 0 8px ${randomColor}`;
        
        // USO DE LA VARIABLE CORREGIDO
        element.style.color = Math.random() > 0.8 ? '#fff' : originalColor;

        if (iteration >= targetText.length) {
            clearInterval(interval);
            element.style.textShadow = "0 0 8px rgba(0, 255, 255, 0.3)";
            element.style.color = originalColor; 
        }
        
        iteration += targetText.length / (duration / 40); // Ajustado para suavidad
    }, 40);
};



const initCyberCards = () => {
    const cards = document.querySelectorAll('.glass-panel, .about-image-container');
    
    cards.forEach(card => {
        inView(card, () => {
            if (typeof anime !== 'undefined') {
                anime({
                    targets: card,
                    opacity: [0, 1],
                    translateX: [40, 0],
                    skewX: [20, 0], // Efecto de deformación al aparecer
                    duration: 1000,
                    easing: 'easeOutExpo',
                    begin: () => {
                        card.style.filter = 'hue-rotate(90deg) brightness(2)';
                    },
                    update: (anim) => {
                        // A mitad de camino quitamos el filtro para el efecto "flash"
                        if(anim.progress > 50) card.style.filter = 'none';
                    }
                });
            }
        }, { amount: 0.3 });
    });
};

const inView = (element, callback, options = {}) => {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Pequeño delay para asegurar que el renderizado del navegador es estable
                setTimeout(() => {
                    callback(entry);
                }, 50); 
                
                // Si options.once es true (por defecto), dejamos de observar para ahorrar CPU
                if (options.once !== false) observer.unobserve(entry.target);
            }
        });
    }, { 
        // rootMargin ayuda a que la animación empiece un poco antes de que entre el elemento
        rootMargin: options.rootMargin || '0px 0px -50px 0px',
        threshold: options.amount || 0.1 
    });
    observer.observe(element);
};



const initAboutGlitch = () => {
    const glitchElements = document.querySelectorAll('.about-text, .stat-label, .section-title .title-text');

    glitchElements.forEach((el) => {
        inView(el, () => {
            // Detectamos idioma para evitar el parpadeo de traducción
            const lang = document.documentElement.lang || 'en';
            const targetText = el.getAttribute(`data-text-${lang}`) || el.innerText;
            
            
            glitchText(el, targetText, 400); 
        }, { amount: 0.5 }); // Un poco más de margen
    });
};






// --- 2. Funciones de Animación Cyberpunk ---



const initHeroAnimations = () => {
    if (typeof anime === 'undefined') return;
    
    const nameValue = document.querySelector('.name-value');
    if (nameValue) {
        // Efecto Hacker Glitch en el nombre
        const originalText = nameValue.textContent;
        glitchText(nameValue, originalText, 600);
    }

    // Los badges aparecen con un rebote neón
    anime({
        targets: '.floating-badge',
        opacity: [0, 1],
        translateY: [20, 0],
        scale: [0.5, 1],
        rotate: '1turn',
        delay: anime.stagger(150, {start: 800}),
        easing: 'easeOutElastic(1, .6)'
    });
};

const initSkillAnimations = () => {
    const skillItems = document.querySelectorAll('.skill-item');
    skillItems.forEach(item => {
        inView(item, () => {
            const bar = item.querySelector('.skill-progress');
            const percent = item.getAttribute('data-percent');
            if(bar) {
                anime({
                    targets: bar,
                    width: [0, percent + '%'],
                    duration: 2000,
                    // Efecto de carga segmentada
                    easing: 'steps(10)' 
                });
            }
        });
    });
};

const animateStats = () => {
    const statNumbers = document.querySelectorAll('.stat-number');
    statNumbers.forEach(stat => {
        const target = parseInt(stat.getAttribute('data-count') || 0);
        inView(stat, () => {
            anime({
                targets: { value: 0 },
                value: target,
                round: 1, // Números enteros
                duration: 2000,
                easing: 'easeOutExpo',
                update: (anim) => {
                    stat.textContent = anim.animatables[0].target.value + (Math.random() > 0.9 ? ' ERR' : '');
                },
                complete: (anim) => {
                    stat.textContent = target; // Limpiar el "ERR" al final
                }
            });
        }, { amount: 0.5 });
    });
};

const initParallax = () => {
    const profileImage = document.getElementById('profileImage');
    const gridBg = document.querySelector('.code-grid-bg');
    
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        // El fondo se mueve en dirección contraria para marear un poco (estilo cyberpunk)
        if (profileImage) profileImage.style.transform = `translateY(${scrolled * -0.1}px) rotate(${scrolled * 0.02}deg)`;
        if (gridBg) gridBg.style.transform = `translateY(${scrolled * 0.3}px)`;
    });
};

/**
 * PORTFOLIO ANIMATIONS ENGINE
 * Seccion: Core & Loader
 */

// 1. Definimos la función PRIMERO para evitar errores de referencia
const initLoaderAnimation = (callback) => {
    const loader = document.getElementById('loader');
    const loaderPercent = document.getElementById('loaderPercent');
    const progressBar = document.querySelector('.loader-progress-bar');
    
    if (!loader || !loaderPercent) return;
    
    document.body.style.overflow = 'hidden';

    let progress = 0;
    const progressInterval = setInterval(() => {
        // Incremento orgánico
        progress += Math.random() > 0.8 ? 12 : 3; 

        if (progress >= 100) {
            progress = 100;
            clearInterval(progressInterval);
            
            loaderPercent.textContent = 'SYSTEM_READY_';

            // --- EL BROCHE DE ORO ---
            // Activamos el destello del prisma justo al llegar al 100%
            if (window.activatePrismBoost) window.activatePrismBoost();
            
            setTimeout(() => {
                if (typeof anime !== 'undefined') {
                    anime({
                        targets: loader,
                        opacity: [1, 0, 1, 0, 0],
                        easing: 'steps(4)', 
                        duration: 800,
                        complete: () => {
                            loader.style.display = 'none';
                            loader.classList.add('hidden');
                            document.body.style.overflow = '';
                            
                            // Disparamos el callback para iniciar el resto de la web
                            if (typeof callback === 'function') callback();
                        }
                    });
                }
            }, 600);
        } else {
            loaderPercent.textContent = `BOOTING_ ${Math.floor(progress)}%`;
            if(progressBar) progressBar.style.width = progress + '%';
        }
    }, 50);
};

// 2. Exportamos al objeto global AL FINAL
window.PortfolioAnimations = {
    initLoaderAnimation,
    initHeroAnimations: typeof initHeroAnimations !== 'undefined' ? initHeroAnimations : () => {},
    initSkillAnimations: typeof initSkillAnimations !== 'undefined' ? initSkillAnimations : () => {},
    animateStats: typeof animateStats !== 'undefined' ? animateStats : () => {},
    initParallax: typeof initParallax !== 'undefined' ? initParallax : () => {},
};



document.addEventListener('DOMContentLoaded', () => {
    initAboutGlitch();
        const lang = document.documentElement.lang || 'en'; // Detectamos el idioma actual
        const targetText = el.getAttribute(`data-text-${lang}`) || el.innerText;
        glitchText(el, targetText, 750);
    });




















