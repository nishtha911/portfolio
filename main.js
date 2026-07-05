/* ================================================
   CLAYMORPHIC PORTFOLIO V3
   JavaScript — Theme Toggle, Interactions
   ================================================ */

'use strict';

// ================== THEME TOGGLE ==================

const themeToggle = document.getElementById('themeToggle');
const html = document.documentElement;

// Get saved theme or default to dark
let currentTheme = localStorage.getItem('theme') || 'dark';

function setTheme(theme) {
  html.setAttribute('data-theme', theme);
  localStorage.setItem('theme', theme);
  currentTheme = theme;
}

// Set initial theme
setTheme(currentTheme);

// Toggle theme on button click
if (themeToggle) {
  themeToggle.addEventListener('click', () => {
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
  });
}

// ================== MOBILE MENU ==================

const navToggle = document.getElementById('navToggle');
const navMenu = document.getElementById('navMenu');

if (navToggle) {
  navToggle.addEventListener('click', () => {
    navMenu.classList.toggle('active');
    navToggle.classList.toggle('active');
  });

  // Close menu on nav item click
  document.querySelectorAll('.nav-menu a').forEach(link => {
    link.addEventListener('click', () => {
      navMenu.classList.remove('active');
      navToggle.classList.remove('active');
    });
  });
}

// Close menu on outside click
document.addEventListener('click', (e) => {
  if (!e.target.closest('.nav') && navMenu && navMenu.classList.contains('active')) {
    navMenu.classList.remove('active');
    navToggle.classList.remove('active');
  }
});

// ================== SMOOTH SCROLL & NAV HIGHLIGHT ==================

const navItems = document.querySelectorAll('.nav-menu a');
const sections = document.querySelectorAll('.section, .hero');

function highlightNav() {
  let current = '';

  sections.forEach(section => {
    const sectionTop = section.offsetTop;
    if (window.scrollY >= sectionTop - 200) {
      current = section.getAttribute('id');
    }
  });

  navItems.forEach(item => {
    item.classList.remove('active');
    if (item.getAttribute('href') === `#${current}`) {
      item.classList.add('active');
    }
  });
}

window.addEventListener('scroll', highlightNav, { passive: true });
highlightNav(); // Initial call

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const href = this.getAttribute('href');
    if (href !== '#' && document.querySelector(href)) {
      e.preventDefault();
      const target = document.querySelector(href);
      target.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  });
});

// ================== NAV SHADOW ON SCROLL ==================

const nav = document.querySelector('.nav');

window.addEventListener('scroll', () => {
  if (window.scrollY > 10) {
    nav.style.boxShadow = 'var(--shadow)';
  } else {
    nav.style.boxShadow = 'none';
  }
}, { passive: true });

// ================== CARD ANIMATIONS ON SCROLL ==================

const cards = document.querySelectorAll(
  '.project-card, .skill-category, .experience-highlight, .contact-link, .cert-card, .edu-content, .hackathon-card'
);

const cardObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry, index) => {
    if (entry.isIntersecting) {
      setTimeout(() => {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }, index * 50);
      cardObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

cards.forEach(card => {
  card.style.opacity = '0';
  card.style.transform = 'translateY(20px)';
  card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
  cardObserver.observe(card);
});

// ================== EXTERNAL LINK TRACKING ==================

document.querySelectorAll('a[target="_blank"], a[href^="https"]').forEach(link => {
  if (!link.hostname || link.hostname === window.location.hostname) return;
  
  link.addEventListener('click', function(e) {
    // Optional: Add analytics tracking here
    console.log('External link clicked:', this.href);
  });
});

// ================== ACCESSIBILITY: SKIP TO CONTENT ==================

const skipLink = document.createElement('a');
skipLink.href = '#hero';
skipLink.textContent = 'Skip to content';
skipLink.style.position = 'absolute';
skipLink.style.top = '-40px';
skipLink.style.left = '0';
skipLink.style.background = 'var(--accent-strong)';
skipLink.style.color = 'white';
skipLink.style.padding = '8px';
skipLink.style.textDecoration = 'none';
skipLink.style.zIndex = '100';

skipLink.addEventListener('focus', () => {
  skipLink.style.top = '0';
});

skipLink.addEventListener('blur', () => {
  skipLink.style.top = '-40px';
});

document.body.insertBefore(skipLink, document.body.firstChild);

// ================== LOG ==================

console.log('Soft lavender clay portfolio V3 loaded successfully');
