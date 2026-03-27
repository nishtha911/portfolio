'use strict';

/* ════════════════════════════════════════════
   LOADER
════════════════════════════════════════════ */
const loaderEl   = document.getElementById('loader');
const loaderFill = document.getElementById('loaderFill');
const loaderText = document.getElementById('loaderText');
const loadSteps  = ['Initializing...', 'Loading assets...', 'Rendering UI...', 'Ready ✦'];
let loadProgress = 0;

function runLoader() {
  const interval = setInterval(() => {
    loadProgress += Math.random() * 22 + 8;
    if (loadProgress > 100) loadProgress = 100;
    loaderFill.style.width = loadProgress + '%';
    const stepIdx = Math.min(Math.floor((loadProgress / 100) * loadSteps.length), loadSteps.length - 1);
    loaderText.textContent = loadSteps[stepIdx];
    if (loadProgress >= 100) {
      clearInterval(interval);
      setTimeout(() => {
        loaderEl.classList.add('done');
        document.body.classList.add('loaded');
        initScrollReveal();
        initSGPALineGraph();
      }, 350);
    }
  }, 90);
}
runLoader();

/* ════════════════════════════════════════════
   THEME TOGGLE (Dark default)
════════════════════════════════════════════ */
const html = document.documentElement;
const themeToggle = document.getElementById('themeToggle');

// Default is dark — already set via data-theme="dark" on html
let currentTheme = 'dark';

if (themeToggle) {
  themeToggle.addEventListener('click', () => {
    currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', currentTheme);
    localStorage.setItem('np-theme', currentTheme);
    // Redraw SGPA graph with new theme colors
    setTimeout(drawSGPAGraph, 50);
  });
}

// Restore saved theme (but keep dark as default for first visit)
const savedTheme = localStorage.getItem('np-theme');
if (savedTheme) {
  currentTheme = savedTheme;
  html.setAttribute('data-theme', currentTheme);
}

/* ════════════════════════════════════════════
   CUSTOM CURSOR
════════════════════════════════════════════ */
const cursorEl = document.getElementById('cursor');
if (cursorEl) {
  document.addEventListener('mousemove', (e) => {
    cursorEl.style.transform = `translate(calc(${e.clientX}px - 50%), calc(${e.clientY}px - 50%))`;
  }, { passive: true });
  document.querySelectorAll('a, button, .proj-card, .skill-item, .contact-link-row, .id-card, .cert-card')
    .forEach(el => {
      el.addEventListener('mouseenter', () => cursorEl.classList.add('hovering'));
      el.addEventListener('mouseleave', () => cursorEl.classList.remove('hovering'));
    });
}

/* ════════════════════════════════════════════
   HERO PARTICLE CANVAS
════════════════════════════════════════════ */
(function initHeroCanvas() {
  const canvas = document.getElementById('heroCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, particles = [], animFrame;

  const colors = ['#00C874', '#00FF94', '#4DFFAC', '#AAFF5C', '#00E5FF'];

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize, { passive: true });

  class Star {
    constructor() { this.reset(true); }
    reset(init) {
      this.x = Math.random() * W;
      this.y = init ? Math.random() * H : (Math.random() > 0.5 ? -5 : H + 5);
      this.r = Math.random() * 1.2 + 0.3;
      this.vx = (Math.random() - 0.5) * 0.2;
      this.vy = (Math.random() - 0.5) * 0.2;
      this.alpha = Math.random() * 0.5 + 0.1;
      this.color = colors[Math.floor(Math.random() * colors.length)];
      this.twinkleSpeed = Math.random() * 0.02 + 0.005;
      this.twinkleOffset = Math.random() * Math.PI * 2;
    }
    update(t) {
      this.x += this.vx;
      this.y += this.vy;
      if (this.x < -10 || this.x > W + 10 || this.y < -10 || this.y > H + 10) this.reset(false);
      this.alpha = 0.15 + 0.25 * Math.abs(Math.sin(t * this.twinkleSpeed + this.twinkleOffset));
    }
    draw() {
      ctx.save();
      ctx.globalAlpha = this.alpha;
      ctx.fillStyle = this.color;
      ctx.shadowBlur = 6;
      ctx.shadowColor = this.color;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  function drawConnections() {
    ctx.globalAlpha = 1;
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const d  = Math.sqrt(dx * dx + dy * dy);
        if (d < 100) {
          ctx.save();
          ctx.globalAlpha = 0.04 * (1 - d / 100);
          ctx.strokeStyle = '#00C874';
          ctx.lineWidth = 0.5;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
          ctx.restore();
        }
      }
    }
  }

  for (let i = 0; i < 100; i++) particles.push(new Star());

  let t = 0;
  function animate() {
    animFrame = requestAnimationFrame(animate);
    ctx.clearRect(0, 0, W, H);
    t++;
    particles.forEach(p => { p.update(t); p.draw(); });
    drawConnections();
  }
  animate();
})();

/* ════════════════════════════════════════════
   NAVBAR MOBILE
════════════════════════════════════════════ */
const nav    = document.getElementById('nav');
const burger = document.getElementById('burger');
const navMenu = document.getElementById('navMenu');
if (burger) {
  burger.addEventListener('click', () => {
    const open = navMenu.classList.toggle('open');
    burger.setAttribute('aria-expanded', open);
    if (open) {
      navMenu.style.cssText = `
        display: flex;
        flex-direction: column;
        position: fixed;
        top: 68px; left: 0; right: 0;
        background: rgba(3,10,6,0.97);
        backdrop-filter: blur(24px);
        padding: 24px clamp(16px,4vw,60px) 40px;
        border-bottom: 1px solid rgba(0,200,116,0.12);
        gap: 8px; z-index: 190;
        animation: dropDown .3s cubic-bezier(0.22,1,0.36,1);
      `;
    } else {
      navMenu.removeAttribute('style');
    }
  });
  document.querySelectorAll('.nav-item').forEach(link => {
    link.addEventListener('click', () => {
      navMenu.classList.remove('open');
      navMenu.removeAttribute('style');
    });
  });
}

// Nav style on scroll
window.addEventListener('scroll', () => {
  const isDark = html.getAttribute('data-theme') !== 'light';
  if (window.scrollY > 80) {
    nav.style.background = isDark ? 'rgba(3,10,6,0.97)' : 'rgba(242,251,245,0.97)';
  } else {
    nav.style.background = isDark ? 'rgba(3,10,6,0.72)' : 'rgba(242,251,245,0.82)';
  }
  updateNavActive();
}, { passive: true });

function updateNavActive() {
  const sections = document.querySelectorAll('section[id]');
  let current = '';
  sections.forEach(s => {
    if (window.scrollY >= s.offsetTop - 100) current = s.id;
  });
  document.querySelectorAll('.nav-item').forEach(a => {
    a.style.color = (a.getAttribute('href') === '#' + current) ? 'var(--text)' : '';
  });
}

/* ════════════════════════════════════════════
   SMOOTH SCROLL
════════════════════════════════════════════ */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    window.scrollTo({ top: target.offsetTop - 68, behavior: 'smooth' });
  });
});

/* ════════════════════════════════════════════
   HERO ROLE CYCLE
════════════════════════════════════════════ */
const roles = ['AI Engineer', 'Full Stack Dev', 'Data Scientist', 'ML Enthusiast', 'Problem Solver'];
const roleEl = document.getElementById('roleWord');
let roleIdx = 0;
if (roleEl) {
  setInterval(() => {
    roleEl.style.opacity = '0';
    roleEl.style.transform = 'translateY(-8px)';
    setTimeout(() => {
      roleIdx = (roleIdx + 1) % roles.length;
      roleEl.textContent = roles[roleIdx];
      roleEl.style.transition = 'none';
      roleEl.style.transform = 'translateY(8px)';
      roleEl.style.opacity = '0';
      setTimeout(() => {
        roleEl.style.transition = 'opacity .4s, transform .4s';
        roleEl.style.opacity = '1';
        roleEl.style.transform = 'translateY(0)';
      }, 20);
    }, 300);
    roleEl.style.transition = 'opacity .3s, transform .3s';
  }, 2800);
}

/* ════════════════════════════════════════════
   SCROLL REVEAL
════════════════════════════════════════════ */
function initScrollReveal() {
  const els = document.querySelectorAll('[data-scroll-reveal]');
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry, idx) => {
      if (entry.isIntersecting) {
        setTimeout(() => entry.target.classList.add('in-view'), idx * 80);
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });
  els.forEach(el => io.observe(el));
}

/* ════════════════════════════════════════════
   SGPA LINE GRAPH — Canvas draw-in with hover tooltips
════════════════════════════════════════════ */
const sgpaData = [
  { sem: 'Sem 1', val: 9.09 },
  { sem: 'Sem 2', val: 8.55 },
  { sem: 'Sem 3', val: 9.18 },
  { sem: 'Sem 4', val: 9.05 },
  { sem: 'Sem 5', val: 9.29 },
];

const MIN_VAL = 8.0;
const MAX_VAL = 9.5;

let sgpaAnimProgress = 0;
let sgpaAnimId = null;
let sgpaPoints = []; // computed pixel positions

function drawSGPAGraph(progress = 1) {
  const canvas = document.getElementById('sgpaCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  // Sync canvas pixel size to display size
  const W = canvas.offsetWidth;
  const H = canvas.offsetHeight;
  canvas.width = W;
  canvas.height = H;

  const PAD_L = 12, PAD_R = 12, PAD_T = 24, PAD_B = 10;
  const graphW = W - PAD_L - PAD_R;
  const graphH = H - PAD_T - PAD_B;

  const isDark = document.documentElement.getAttribute('data-theme') !== 'light';
  const emerald = isDark ? '#00C874' : '#007A47';
  const emeraldL = isDark ? '#4DFFAC' : '#00A660';
  const gridColor = isDark ? 'rgba(0,200,116,0.07)' : 'rgba(0,150,80,0.1)';
  const labelColor = isDark ? 'rgba(58,94,74,0.8)' : 'rgba(42,102,68,0.7)';

  ctx.clearRect(0, 0, W, H);

  // Compute point positions
  sgpaPoints = sgpaData.map((d, i) => {
    const x = PAD_L + (i / (sgpaData.length - 1)) * graphW;
    const y = PAD_T + graphH - ((d.val - MIN_VAL) / (MAX_VAL - MIN_VAL)) * graphH;
    return { x, y, sem: d.sem, val: d.val };
  });

  // Horizontal grid lines
  ctx.strokeStyle = gridColor;
  ctx.lineWidth = 1;
  [8.0, 8.5, 9.0, 9.5].forEach(v => {
    const y = PAD_T + graphH - ((v - MIN_VAL) / (MAX_VAL - MIN_VAL)) * graphH;
    ctx.beginPath();
    ctx.moveTo(PAD_L, y);
    ctx.lineTo(W - PAD_R, y);
    ctx.stroke();
    // Y axis label
    ctx.fillStyle = labelColor;
    ctx.font = `500 10px 'Space Mono', monospace`;
    ctx.fillText(v.toFixed(1), 0, y + 3);
  });

  // Draw gradient fill under the line (clipped to progress)
  const drawUpToX = PAD_L + sgpaPoints[sgpaPoints.length - 1].x * progress;
  const clipCount = Math.floor(progress * (sgpaPoints.length - 1));
  const fracPt = progress * (sgpaPoints.length - 1) - clipCount;
  const pts = sgpaPoints.slice(0, clipCount + 1);

  if (pts.length < 2 && clipCount === 0 && progress > 0) {
    // Handle interpolation for first segment
    const p0 = sgpaPoints[0];
    const p1 = sgpaPoints[1];
    pts.push({ x: p0.x + (p1.x - p0.x) * fracPt, y: p0.y + (p1.y - p0.y) * fracPt });
  } else if (clipCount < sgpaPoints.length - 1 && progress < 1) {
    const p0 = sgpaPoints[clipCount];
    const p1 = sgpaPoints[clipCount + 1];
    pts.push({ x: p0.x + (p1.x - p0.x) * fracPt, y: p0.y + (p1.y - p0.y) * fracPt });
  }

  if (pts.length >= 2) {
    // Fill area
    const grad = ctx.createLinearGradient(0, PAD_T, 0, H);
    grad.addColorStop(0, isDark ? 'rgba(0,200,116,0.22)' : 'rgba(0,122,71,0.15)');
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.beginPath();
    ctx.moveTo(pts[0].x, H - PAD_B);
    ctx.lineTo(pts[0].x, pts[0].y);
    for (let i = 1; i < pts.length; i++) {
      // Smooth bezier
      const cpX = (pts[i - 1].x + pts[i].x) / 2;
      ctx.bezierCurveTo(cpX, pts[i - 1].y, cpX, pts[i].y, pts[i].x, pts[i].y);
    }
    ctx.lineTo(pts[pts.length - 1].x, H - PAD_B);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();

    // Line stroke
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i < pts.length; i++) {
      const cpX = (pts[i - 1].x + pts[i].x) / 2;
      ctx.bezierCurveTo(cpX, pts[i - 1].y, cpX, pts[i].y, pts[i].x, pts[i].y);
    }
    ctx.strokeStyle = emerald;
    ctx.lineWidth = 2.5;
    ctx.shadowBlur = 10;
    ctx.shadowColor = emerald;
    ctx.stroke();
    ctx.shadowBlur = 0;
  }

  // Data points (dots)
  sgpaPoints.forEach((pt, i) => {
    const drawn = i / (sgpaData.length - 1) <= progress;
    if (!drawn) return;
    const isHighlight = pt.val === Math.max(...sgpaData.map(d => d.val));
    const r = isHighlight ? 7 : 5;

    // Glow
    ctx.beginPath();
    ctx.arc(pt.x, pt.y, r + 4, 0, Math.PI * 2);
    ctx.fillStyle = isHighlight
      ? (isDark ? 'rgba(77,255,172,0.18)' : 'rgba(0,166,96,0.15)')
      : (isDark ? 'rgba(0,200,116,0.12)' : 'rgba(0,122,71,0.10)');
    ctx.fill();

    // Dot
    ctx.beginPath();
    ctx.arc(pt.x, pt.y, r, 0, Math.PI * 2);
    ctx.fillStyle = isHighlight ? emeraldL : emerald;
    ctx.shadowBlur = isHighlight ? 18 : 8;
    ctx.shadowColor = emerald;
    ctx.fill();
    ctx.shadowBlur = 0;

    // White center
    ctx.beginPath();
    ctx.arc(pt.x, pt.y, r - 3, 0, Math.PI * 2);
    ctx.fillStyle = isDark ? '#030A06' : '#F2FBF5';
    ctx.fill();

    // Value label above dot
    ctx.fillStyle = isHighlight ? emeraldL : (isDark ? 'rgba(77,255,172,0.7)' : 'rgba(0,166,96,0.8)');
    ctx.font = `700 10px 'Space Mono', monospace`;
    ctx.textAlign = 'center';
    ctx.fillText(pt.val.toFixed(2), pt.x, pt.y - r - 6);
  });

  ctx.textAlign = 'start';
}

// Animate draw-in
function animateSGPA() {
  if (sgpaAnimProgress >= 1) {
    drawSGPAGraph(1);
    return;
  }
  sgpaAnimProgress += 0.022;
  drawSGPAGraph(Math.min(sgpaAnimProgress, 1));
  sgpaAnimId = requestAnimationFrame(animateSGPA);
}

function initSGPALineGraph() {
  const canvas = document.getElementById('sgpaCanvas');
  if (!canvas) return;

  // IntersectionObserver — animate when in view
  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        sgpaAnimProgress = 0;
        if (sgpaAnimId) cancelAnimationFrame(sgpaAnimId);
        animateSGPA();
        io.disconnect();
      }
    });
  }, { threshold: 0.35 });
  io.observe(canvas);

  // Hover tooltip
  const tooltip = document.getElementById('sgpaTooltip');
  const HIT_RADIUS = 24;

  canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    const mx = (e.clientX - rect.left) * (canvas.width / rect.width);
    const my = (e.clientY - rect.top) * (canvas.height / rect.height);

    let found = null;
    sgpaPoints.forEach(pt => {
      const dx = mx - pt.x;
      const dy = my - pt.y;
      if (Math.sqrt(dx * dx + dy * dy) < HIT_RADIUS) found = pt;
    });

    if (found && tooltip) {
      const scaleX = rect.width / canvas.width;
      const scaleY = rect.height / canvas.height;
      tooltip.style.left = (found.x * scaleX) + 'px';
      tooltip.style.top  = (found.y * scaleY) + 'px';
      tooltip.textContent = `${found.sem}: ${found.val.toFixed(2)} SGPA`;
      tooltip.classList.add('visible');
    } else if (tooltip) {
      tooltip.classList.remove('visible');
    }
  });

  canvas.addEventListener('mouseleave', () => {
    if (tooltip) tooltip.classList.remove('visible');
  });

  // Redraw on resize
  window.addEventListener('resize', () => drawSGPAGraph(1), { passive: true });
}

/* ════════════════════════════════════════════
   PROJECT CARD 3D TILT
════════════════════════════════════════════ */
document.querySelectorAll('.proj-card:not(.more)').forEach(card => {
  card.style.transformStyle = 'preserve-3d';
  card.addEventListener('mousemove', e => {
    const r = card.getBoundingClientRect();
    const cx = r.left + r.width  / 2;
    const cy = r.top  + r.height / 2;
    const rx =  (e.clientY - cy) / (r.height * 0.55) * 8;
    const ry = -(e.clientX - cx) / (r.width  * 0.55) * 8;
    card.style.transform = `translateY(-8px) rotateX(${rx}deg) rotateY(${ry}deg)`;
  });
  card.addEventListener('mouseleave', () => {
    card.style.transform = '';
  });
});

/* ════════════════════════════════════════════
   ABOUT ID CARD PARALLAX
════════════════════════════════════════════ */
const idCard = document.querySelector('.id-card');
if (idCard) {
  document.addEventListener('mousemove', e => {
    const r   = idCard.getBoundingClientRect();
    const cx2 = r.left + r.width  / 2;
    const cy2 = r.top  + r.height / 2;
    const dx  = (e.clientX - cx2) / window.innerWidth;
    const dy  = (e.clientY - cy2) / window.innerHeight;
    idCard.style.transform = `translateY(-6px) rotateY(${-dx * 14}deg) rotateX(${dy * 8}deg)`;
  });
}

/* ════════════════════════════════════════════
   SKILLS MARQUEE PAUSE ON HOVER
════════════════════════════════════════════ */
document.querySelectorAll('.skills-marquee').forEach(m => {
  m.addEventListener('mouseenter', () => {
    m.querySelector('.skills-track').style.animationPlayState = 'paused';
  });
  m.addEventListener('mouseleave', () => {
    m.querySelector('.skills-track').style.animationPlayState = 'running';
  });
});

/* ════════════════════════════════════════════
   GLITCH / SHIMMER ON HERO NAME HOVER
════════════════════════════════════════════ */
const heroName = document.getElementById('heroName');
if (heroName) {
  heroName.addEventListener('mouseover', () => {
    heroName.style.filter = 'drop-shadow(0 0 30px rgba(0,200,116,0.6))';
  });
  heroName.addEventListener('mouseleave', () => {
    heroName.style.filter = '';
  });
}

/* ════════════════════════════════════════════
   STAR SPARKLE on interactive elements
════════════════════════════════════════════ */
function sparkle(x, y) {
  const symbols = ['✦', '✧', '★', '✨'];
  for (let i = 0; i < 3; i++) {
    const s = document.createElement('span');
    s.textContent = symbols[Math.floor(Math.random() * symbols.length)];
    const angle = (i / 3) * Math.PI * 2 + Math.random() * 0.5;
    const dist  = 20 + Math.random() * 30;
    s.style.cssText = `
      position:fixed; left:${x}px; top:${y}px;
      font-size:${10 + Math.random() * 8}px;
      color:${['#00C874','#4DFFAC','#AAFF5C','#00E5FF'][Math.floor(Math.random() * 4)]};
      pointer-events:none; z-index:9999;
      transform:translate(-50%,-50%);
      animation: sparkleAnim .6s ease-out forwards;
      --tx: ${Math.cos(angle) * dist}px;
      --ty: ${Math.sin(angle) * dist}px;
    `;
    document.body.appendChild(s);
    setTimeout(() => s.remove(), 620);
  }
}

const sparkleStyle = document.createElement('style');
sparkleStyle.textContent = `
  @keyframes sparkleAnim {
    from { opacity:1; transform:translate(-50%,-50%) scale(1); }
    to   { opacity:0; transform:translate(calc(-50% + var(--tx)), calc(-50% + var(--ty))) scale(0); }
  }
  @keyframes dropDown {
    from { opacity:0; transform:translateY(-8px); }
    to   { opacity:1; transform:none; }
  }
`;
document.head.appendChild(sparkleStyle);

document.querySelectorAll('.cta-primary, .feat-btn, .nav-cta, .more-cta').forEach(btn => {
  btn.addEventListener('click', e => sparkle(e.clientX, e.clientY));
});

/* ════════════════════════════════════════════
   PROJECT CARD — CLICK TO OPEN GITHUB REPO
════════════════════════════════════════════ */
document.querySelectorAll('.proj-card[data-href]').forEach(card => {
  card.style.cursor = 'pointer';
  card.addEventListener('click', () => {
    window.open(card.dataset.href, '_blank', 'noopener,noreferrer');
  });
});

/* ════════════════════════════════════════════
   PERFORMANCE: pause animations when hidden
════════════════════════════════════════════ */
document.addEventListener('visibilitychange', () => {
  const tracks = document.querySelectorAll('.skills-track, .ticker-track');
  tracks.forEach(t => {
    t.style.animationPlayState = document.hidden ? 'paused' : 'running';
  });
});
