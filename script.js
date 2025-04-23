let ticking = false;
let lastScrollY = 0;

function onScroll() {
    lastScrollY = window.scrollY;
    if (!ticking) {
        requestAnimationFrame(() => {
            ticking = false;
        });
        ticking = true;
    }
}

window.addEventListener('scroll', onScroll, { passive: true });

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        const targetElement = document.querySelector(targetId);
        if (!targetElement) return;

        const headerOffset = 100;
        const elementPosition = targetElement.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
        });
    });
});

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

const forms = {
    volunteer: document.getElementById('volunteerForm'),
    contact: document.getElementById('contactForm'),
    newsletter: document.getElementById('newsletterForm')
};

const handleSubmit = (formId, successMessage) => {
    forms[formId]?.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const submitBtn = this.querySelector('button[type="submit"]');
        if (!submitBtn) return;

        const formData = new FormData(this);
        const data = Object.fromEntries(formData.entries());
        
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Sending...';
        submitBtn.disabled = true;
        
        setTimeout(() => {
            submitBtn.textContent = 'Success!';
            submitBtn.style.backgroundColor = '#4CAF50';
            
            const message = document.createElement('div');
            message.className = 'success-message';
            message.textContent = successMessage;
            message.style.cssText = `
                color: #4CAF50;
                padding: 1rem;
                margin-top: 1rem;
                border-radius: 5px;
                text-align: center;
                animation: fadeInUp 0.5s ease forwards;
            `;
            this.appendChild(message);
            
            setTimeout(() => {
                this.reset();
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
                submitBtn.style.backgroundColor = '';
                message.remove();
            }, 3000);
        }, 1500);
    });
};

Object.keys(forms).forEach(formId => {
    const messages = {
        volunteer: 'Thank you for volunteering! We will contact you soon.',
        contact: 'Message sent successfully! We\'ll get back to you shortly.',
        newsletter: 'Successfully subscribed to our newsletter!'
    };
    if (forms[formId]) {
        handleSubmit(formId, messages[formId]);
    }
});


const observerOptions = {
    threshold: 0.2,
    rootMargin: '0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            requestAnimationFrame(() => {
                entry.target.classList.add('animate');
                if (entry.target.classList.contains('story-card')) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0) rotateX(0)';
                }
            });
        }
    });
}, observerOptions);

const animatedElements = document.querySelectorAll('.section-fade-in, .story-card, .resource-card');
animatedElements.forEach(element => observer.observe(element));

document.addEventListener('DOMContentLoaded', function() {
    requestAnimationFrame(() => {
        document.querySelectorAll('.story-card, .about-grid, .contact-grid').forEach(el => {
            observer.observe(el);
            if (el.classList.contains('story-card')) {
                el.style.opacity = '0';
                el.style.transform = 'translateY(30px) rotateX(-10deg)';
                el.style.transition = 'all 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
            }
        });
    });
});

document.querySelector('.cta-button').addEventListener('click', function() {
    const volunteerSection = document.querySelector('#volunteer');
    volunteerSection.scrollIntoView({ behavior: 'smooth' });
});

document.getElementById('hamburger-menu').addEventListener('click', function() {
    document.querySelector('.navbar').classList.toggle('active');
});

function initMap() {
    const mapContainer = document.getElementById('map');
    if (!mapContainer) return;

    let map = L.map('map').setView([40.7128, -74.0060], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    const locations = [
        { type: 'parks', name: 'Central Bark Park', coords: [40.7129, -74.0064], rating: 4.8 },
        { type: 'cafes', name: 'Pawsome Cafe', coords: [40.7135, -74.0070], rating: 4.5 },
        { type: 'vets', name: 'Pet Care Clinic', coords: [40.7140, -74.0055], rating: 4.9 },
        { type: 'stores', name: 'Pet Supplies Plus', coords: [40.7120, -74.0080], rating: 4.6 }
    ];

    const markers = new Map();
    const typeColors = {
        parks: '#2e7d32',
        cafes: '#ef6c00',
        vets: '#1565c0',
        stores: '#7b1fa2'
    };

    function addMarkersToMap(locations) {
        locations.forEach(location => {
            const marker = L.marker(location.coords).addTo(map);
            markers.set(location.name, marker);
            
            const popupContent = `
                <strong>${location.name}</strong><br>
                Rating: ${location.rating} ⭐<br>
                Type: ${location.type.charAt(0).toUpperCase() + location.type.slice(1)}
            `;
            marker.bindPopup(popupContent);
        });
    }

    function updateLocationsList(locations) {
        const listContainer = document.getElementById('locations-list');
        listContainer.innerHTML = '';
        
        locations.forEach(location => {
            const locationElement = document.createElement('div');
            locationElement.className = 'location-item';
            locationElement.innerHTML = `
                <h4>${location.name}</h4>
                <p>Rating: ${location.rating} ⭐</p>
                <span class="location-type type-${location.type}">${location.type}</span>
            `;
            locationElement.addEventListener('click', () => {
                const marker = markers.get(location.name);
                marker.openPopup();
                map.setView(location.coords, 15);
            });
            listContainer.appendChild(locationElement);
        });
    }

    document.querySelectorAll('.filter-btn').forEach(button => {
        button.addEventListener('click', () => {
            const type = button.dataset.type;
            document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            const filteredLocations = type === 'all' 
                ? locations 
                : locations.filter(location => location.type === type);
                
            updateLocationsList(filteredLocations);
        });
    });

    addMarkersToMap(locations);
    updateLocationsList(locations);
}

document.getElementById('location-search').addEventListener('input', function(e) {
    const searchQuery = e.target.value.toLowerCase();
    const markers = document.querySelectorAll('.marker');
    
    markers.forEach(marker => {
        const locationName = marker.getAttribute('data-location').toLowerCase();
        if (locationName.includes(searchQuery)) {
            marker.style.display = 'block';
        } else {
            marker.style.display = 'none';
        }
    });
});


const chatIcon = document.querySelector('.chat-icon');
const chatContainer = document.querySelector('.chat-container');
const chatInput = document.querySelector('.chat-input input');
const chatSendBtn = document.querySelector('.chat-input button');
const chatMessages = document.querySelector('.chat-messages');
const closeChat = document.querySelector('.close-chat');

chatIcon.addEventListener('click', () => {
    chatContainer.style.display = chatContainer.style.display === 'none' ? 'block' : 'none';
});

closeChat.addEventListener('click', () => {
    chatContainer.style.display = 'none';
});

function addMessage(message, isUser = false) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `chat-message ${isUser ? 'user' : 'bot'}`;
    messageDiv.textContent = message;
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

chatSendBtn.addEventListener('click', () => {
    if (chatInput.value.trim()) {
        addMessage(chatInput.value, true);
  
        setTimeout(() => {
            addMessage("Thanks for your message! Our team will get back to you soon.");
        }, 1000);
        chatInput.value = '';
    }
});

chatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        chatSendBtn.click();
    }
});


const successMessages = {
    volunteer: "Thanks for volunteering! We'll contact you soon.",
    contact: "Message sent successfully! We'll respond within 24 hours.",
    newsletter: "You're subscribed! Check your email for confirmation."
};

Object.keys(forms).forEach(formId => {
    if (forms[formId]) {
        forms[formId].addEventListener('submit', function(e) {
            e.preventDefault();
            const submitBtn = this.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            
            submitBtn.disabled = true;
            submitBtn.textContent = 'Sending...';
            
            
            setTimeout(() => {
                submitBtn.textContent = '✓ Sent';
                alert(successMessages[formId]);
                this.reset();
                
                setTimeout(() => {
                    submitBtn.disabled = false;
                    submitBtn.textContent = originalText;
                }, 2000);
            }, 1500);
        });
    }
});


const socialLinks = {
    linkedin: 'https://www.linkedin.com/in/tanmay-jadhav-795a96293',
    github: 'https://github.com/Tanmayjadhav2305'
};


document.querySelectorAll('.social-links a').forEach(link => {
    const platform = link.getAttribute('data-platform');
    if (socialLinks[platform]) {
        link.href = socialLinks[platform];
    }
});


document.addEventListener('DOMContentLoaded', function() {
    
    requestAnimationFrame(() => {
        document.querySelectorAll('.story-card, .about-grid, .contact-grid').forEach(el => {
            observer.observe(el);
            if (el.classList.contains('story-card')) {
                el.style.opacity = '0';
                el.style.transform = 'translateY(30px) rotateX(-10deg)';
                el.style.transition = 'all 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
            }
        });
    });

    
    initMap();
    loadEvents();

    
    const animatedSections = document.querySelectorAll('.map-section, .events-section, .resources-section');
    animatedSections.forEach(section => {
        observer.observe(section);
    });

    
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            const filterType = this.dataset.type;
            // Filter map markers based on type
            console.log('Filtering map for:', filterType);
        });
    });
});