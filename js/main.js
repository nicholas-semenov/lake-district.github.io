// main.js
document.addEventListener('DOMContentLoaded', () => {
    // Initialize Icons
    lucide.createIcons();

    // Initialize AOS Animation Library
    AOS.init({
        duration: 800,
        easing: 'ease-out-cubic',
        once: true,
        offset: 50
    });

    // Navbar scroll effect
    const navbar = document.getElementById('navbar');
    if (navbar) {
        const handleScroll = () => {
            if (window.scrollY > 50) {
                navbar.classList.add('nav-scrolled');
                // Optional: Swap logo color if needed, handled via CSS currently
            } else {
                navbar.classList.remove('nav-scrolled');
            }
        };
        window.addEventListener('scroll', handleScroll);
        handleScroll(); // Check on load
    }

    // Mobile menu toggle
    const mobileBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    
    if (mobileBtn && mobileMenu) {
        mobileBtn.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
        });
    }

    // Lightbox Logic for Gallery Page
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const closeLightboxBtn = document.getElementById('close-lightbox');
    const galleryItems = document.querySelectorAll('.gallery-item img');

    if (lightbox && galleryItems.length > 0) {
        galleryItems.forEach(img => {
            img.closest('.gallery-item').addEventListener('click', () => {
                lightboxImg.src = img.src.replace('w=600', 'w=1600'); // Load higher res
                lightboxImg.alt = img.alt; // Mirror the source photo's description

                // Show Lightbox with fade effect
                lightbox.classList.remove('hidden');
                // Small delay to allow display:block to apply before changing opacity
                setTimeout(() => {
                    lightbox.classList.remove('opacity-0');
                    lightboxImg.classList.remove('scale-95');
                    lightboxImg.classList.add('scale-100');
                }, 10);
            });
        });

        const closeLightbox = () => {
            lightbox.classList.add('opacity-0');
            lightboxImg.classList.remove('scale-100');
            lightboxImg.classList.add('scale-95');
            
            setTimeout(() => {
                lightbox.classList.add('hidden');
                lightboxImg.src = '';
            }, 300); // match transition duration
        };

        closeLightboxBtn.addEventListener('click', closeLightbox);
        
        // Close on background click
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) {
                closeLightbox();
            }
        });

        // Close on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && !lightbox.classList.contains('hidden')) {
                closeLightbox();
            }
        });
    }

    // Live weather widget (Contact page) — powered by Open-Meteo (free, no API key)
    const weatherWidget = document.getElementById('weather-widget');
    if (weatherWidget) {
        loadWeather();
    }
});

// Maps Open-Meteo WMO weather codes to a label and a Lucide icon name
function describeWeatherCode(code) {
    const map = {
        0: ['Clear Sky', 'sun'],
        1: ['Mainly Clear', 'sun'],
        2: ['Partly Cloudy', 'cloud-sun'],
        3: ['Overcast', 'cloud'],
        45: ['Foggy', 'cloud-fog'],
        48: ['Freezing Fog', 'cloud-fog'],
        51: ['Light Drizzle', 'cloud-drizzle'],
        53: ['Drizzle', 'cloud-drizzle'],
        55: ['Heavy Drizzle', 'cloud-drizzle'],
        61: ['Light Rain', 'cloud-rain'],
        63: ['Rain', 'cloud-rain'],
        65: ['Heavy Rain', 'cloud-rain-wind'],
        71: ['Light Snow', 'cloud-snow'],
        73: ['Snow', 'cloud-snow'],
        75: ['Heavy Snow', 'cloud-snow'],
        80: ['Rain Showers', 'cloud-rain'],
        81: ['Rain Showers', 'cloud-rain'],
        82: ['Violent Showers', 'cloud-rain-wind'],
        95: ['Thunderstorm', 'cloud-lightning'],
        96: ['Thunderstorm + Hail', 'cloud-lightning'],
        99: ['Severe Thunderstorm', 'cloud-lightning'],
    };
    return map[code] || ['Unknown', 'cloud-sun'];
}

// Fetches current conditions for Windermere (Lake District) from Open-Meteo
async function loadWeather() {
    const tempEl = document.getElementById('weather-temp');
    const descEl = document.getElementById('weather-desc');
    const iconEl = document.getElementById('weather-icon');

    // Windermere, Lake District — no API key required
    const LAT = 54.37;
    const LON = -2.90;
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${LAT}&longitude=${LON}&current=temperature_2m,weather_code,visibility&timezone=auto`;

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('Weather request failed');
        const data = await response.json();

        const temp = Math.round(data.current.temperature_2m);
        const [label, iconName] = describeWeatherCode(data.current.weather_code);
        const visibilityKm = data.current.visibility ? (data.current.visibility / 1000).toFixed(0) : null;
        const visibilityText = visibilityKm
            ? (visibilityKm >= 10 ? 'Good Visibility' : visibilityKm >= 4 ? 'Moderate Visibility' : 'Poor Visibility')
            : '';

        tempEl.textContent = `${temp}°C`;
        descEl.textContent = visibilityText ? `${label} • ${visibilityText}` : label;

        iconEl.setAttribute('data-lucide', iconName);
        iconEl.classList.remove('animate-spin');
        iconEl.removeAttribute('data-lucide-loaded');
        // Re-render the icon since lucide.createIcons() already ran once on page load
        if (window.lucide) {
            lucide.createIcons();
        }
    } catch (err) {
        descEl.textContent = 'Forecast unavailable — please check back later.';
        tempEl.textContent = '--°C';
        iconEl.classList.remove('animate-spin');
        iconEl.setAttribute('data-lucide', 'cloud-off');
        if (window.lucide) {
            lucide.createIcons();
        }
    }
}
