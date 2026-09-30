/* ═══════════════════════════════════════════════════════════════════════
   HeritGoa – script.js
   Interactions: navbar scroll, counters, filter, particles, animations
═══════════════════════════════════════════════════════════════════════ */

/* ─── Navbar scroll behaviour ────────────────────────────────────────── */
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  if (window.scrollY > 60) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
}, { passive: true });

/* ─── Mobile nav toggle ──────────────────────────────────────────────── */
const navToggle = document.getElementById('nav-toggle');
const navLinks  = document.getElementById('nav-links');
navToggle?.addEventListener('click', () => {
  navLinks.style.display = navLinks.style.display === 'flex' ? 'none' : 'flex';
  navLinks.style.flexDirection = 'column';
  navLinks.style.position = 'absolute';
  navLinks.style.top = '100%';
  navLinks.style.left = '0';
  navLinks.style.right = '0';
  navLinks.style.background = 'rgba(10,22,40,.96)';
  navLinks.style.padding = '1rem';
  navLinks.style.backdropFilter = 'blur(20px)';
  navLinks.style.borderBottom = '1px solid rgba(255,255,255,.1)';
});

/* ─── Smooth scroll nav links ────────────────────────────────────────── */
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', e => {
    const target = document.querySelector(link.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

/* ─── Hero particle canvas ───────────────────────────────────────────── */
(function initParticles() {
  const container = document.getElementById('hero-particles');
  if (!container) return;

  const canvas = document.createElement('canvas');
  canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;pointer-events:none;';
  container.appendChild(canvas);
  const ctx = canvas.getContext('2d');

  let W, H, particles = [];

  function resize() {
    W = canvas.width  = container.offsetWidth;
    H = canvas.height = container.offsetHeight;
  }
  resize();
  window.addEventListener('resize', resize, { passive: true });

  class Particle {
    constructor() { this.reset(); }
    reset() {
      this.x  = Math.random() * W;
      this.y  = Math.random() * H;
      this.r  = Math.random() * 2 + 0.5;
      this.vx = (Math.random() - .5) * .3;
      this.vy = -Math.random() * .5 - .1;
      this.a  = Math.random() * .5 + .1;
    }
    update() {
      this.x += this.vx;
      this.y += this.vy;
      if (this.y < -5) this.reset();
      if (this.x < 0 || this.x > W) this.vx *= -1;
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(147,197,253,${this.a})`;
      ctx.fill();
    }
  }

  for (let i = 0; i < 60; i++) particles.push(new Particle());

  function loop() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => { p.update(); p.draw(); });
    requestAnimationFrame(loop);
  }
  loop();
})();

/* ─── Counter animation ──────────────────────────────────────────────── */
function animateCounters(entries, observer) {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    observer.unobserve(entry.target);

    const el = entry.target;
    const target = parseInt(el.dataset.target, 10);
    const duration = 1800;
    const start = performance.now();

    function step(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.floor(eased * target).toLocaleString();
      if (progress < 1) requestAnimationFrame(step);
      else el.textContent = target.toLocaleString();
    }
    requestAnimationFrame(step);
  });
}

const counterObserver = new IntersectionObserver(animateCounters, { threshold: .3 });
document.querySelectorAll('.counter').forEach(el => counterObserver.observe(el));

/* Hero mini-counters (data-count) */
function animateHeroCounters(entries, observer) {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    observer.unobserve(entry.target);
    const el = entry.target;
    const target = parseInt(el.dataset.count, 10);
    const duration = 1200;
    const start = performance.now();
    function step(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.floor(eased * target);
      if (progress < 1) requestAnimationFrame(step);
      else el.textContent = target;
    }
    requestAnimationFrame(step);
  });
}
const heroCounterObs = new IntersectionObserver(animateHeroCounters, { threshold: .5 });
document.querySelectorAll('.stat-num[data-count]').forEach(el => heroCounterObs.observe(el));

/* ─── Heritage site filter ───────────────────────────────────────────── */
const filterBtns = document.querySelectorAll('.filter-btn');
const siteCards  = document.querySelectorAll('.site-card:not(.site-card--explore)');

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const filter = btn.dataset.filter;
    siteCards.forEach(card => {
      const match = filter === 'all' || card.dataset.cat === filter;
      card.style.transition = 'opacity .3s, transform .3s';
      if (match) {
        card.style.opacity = '1';
        card.style.transform = '';
        card.style.pointerEvents = '';
      } else {
        card.style.opacity = '0.25';
        card.style.transform = 'scale(.96)';
        card.style.pointerEvents = 'none';
      }
    });
  });
});

/* ─── Scroll reveal for section elements ────────────────────────────── */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.animationPlayState = 'running';
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: .1, rootMargin: '0px 0px -60px 0px' });

document.querySelectorAll(
  '.feature-card, .site-card, .story-card, .stat-card, .about-feat'
).forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(24px)';
  el.style.transition = 'opacity .5s ease, transform .5s ease';
  revealObserver.observe(el);
});

document.querySelectorAll('.visible').forEach(el => {
  el.style.opacity = '1';
  el.style.transform = 'translateY(0)';
});

// Trigger on intersection
const visibObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
      visibObserver.unobserve(entry.target);
    }
  });
}, { threshold: .1, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll(
  '.feature-card, .site-card, .story-card, .stat-card, .about-feat'
).forEach(el => visibObserver.observe(el));

/* ─── Story like button toggle ───────────────────────────────────────── */
document.querySelectorAll('.story-like').forEach(btn => {
  btn.addEventListener('click', () => {
    const liked = btn.classList.toggle('liked');
    const current = parseInt(btn.textContent.replace(/[^\d]/g, ''));
    btn.textContent = `❤️ ${liked ? current + 1 : current - 1}`;
    if (liked) btn.style.cssText = 'border-color:#ec4899;color:#ec4899;background:#fdf2f8;';
    else btn.style.cssText = '';
  });
});

/* ─── AI upload box drag ─────────────────────────────────────────────── */
const uploadBox = document.getElementById('ai-upload-box');
if (uploadBox) {
  ['dragenter', 'dragover'].forEach(ev => {
    uploadBox.addEventListener(ev, e => {
      e.preventDefault();
      uploadBox.style.borderColor = 'var(--blue-500)';
      uploadBox.style.background  = 'var(--blue-50)';
    });
  });
  ['dragleave', 'drop'].forEach(ev => {
    uploadBox.addEventListener(ev, e => {
      e.preventDefault();
      uploadBox.style.borderColor = '';
      uploadBox.style.background  = '';
    });
  });
}

/* ─── Indicator bars animate on scroll ──────────────────────────────── */
const indObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.querySelectorAll('.ind-fill').forEach(bar => {
        const w = bar.style.width;
        bar.style.width = '0';
        requestAnimationFrame(() => {
          bar.style.transition = 'width 1s ease';
          bar.style.width = w;
        });
      });
      indObserver.unobserve(entry.target);
    }
  });
}, { threshold: .4 });
document.querySelectorAll('.detr-indicators').forEach(el => indObserver.observe(el));

/* ─── Staggered card animations ─────────────────────────────────────── */
document.querySelectorAll('.features-grid, .sites-grid, .stories-grid, .stats-grid').forEach(grid => {
  const observer = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting) {
      grid.querySelectorAll(':scope > *').forEach((child, i) => {
        child.style.transitionDelay = `${i * 0.07}s`;
        child.style.opacity = '1';
        child.style.transform = 'translateY(0)';
      });
      observer.unobserve(grid);
    }
  }, { threshold: .05 });
  observer.observe(grid);
});

/* ─── Console branding ───────────────────────────────────────────────── */
console.log(
  '%c🏛️ HeritGoa',
  'color:#2563eb;font-size:24px;font-weight:900;',
);
console.log(
  '%cAI Heritage Intelligence Platform — Goa, India',
  'color:#64748b;font-size:13px;',
);
