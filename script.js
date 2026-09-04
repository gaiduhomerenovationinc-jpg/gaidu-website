/* Gaidu Home Renovation — interactions & animations */
(function () {
  'use strict';

  var prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Loader ---------- */
  window.addEventListener('load', function () {
    var loader = document.getElementById('loader');
    setTimeout(function () { loader.classList.add('hidden'); }, 450);
  });
  // Safety: hide loader even if some resource hangs
  setTimeout(function () {
    var loader = document.getElementById('loader');
    if (loader) loader.classList.add('hidden');
  }, 3000);

  /* ---------- Footer year ---------- */
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Nav: scrolled state, mobile menu, active link ---------- */
  var nav = document.getElementById('nav');
  var navToggle = document.getElementById('navToggle');
  var navLinks = document.getElementById('navLinks');

  function onScrollNav() {
    if (window.scrollY > 40) nav.classList.add('scrolled');
    else nav.classList.remove('scrolled');
  }
  window.addEventListener('scroll', onScrollNav, { passive: true });
  onScrollNav();

  navToggle.addEventListener('click', function () {
    navToggle.classList.toggle('open');
    navLinks.classList.toggle('open');
  });
  navLinks.querySelectorAll('a').forEach(function (a) {
    a.addEventListener('click', function () {
      navToggle.classList.remove('open');
      navLinks.classList.remove('open');
    });
  });

  // Highlight active section link
  var sections = document.querySelectorAll('section[id]');
  var linkMap = {};
  navLinks.querySelectorAll('a[href^="#"]').forEach(function (a) {
    linkMap[a.getAttribute('href').slice(1)] = a;
  });
  var activeObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        Object.keys(linkMap).forEach(function (k) { linkMap[k].classList.remove('active'); });
        var link = linkMap[entry.target.id];
        if (link) link.classList.add('active');
      }
    });
  }, { rootMargin: '-40% 0px -55% 0px' });
  sections.forEach(function (s) { activeObserver.observe(s); });

  /* ---------- Scroll reveal ---------- */
  var revealObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  document.querySelectorAll('.reveal').forEach(function (el) { revealObserver.observe(el); });

  /* ---------- Animated counters ---------- */
  function animateCount(el) {
    var target = parseInt(el.getAttribute('data-count'), 10);
    var duration = 1600;
    var start = null;
    function step(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / duration, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased);
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  var countObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        animateCount(entry.target);
        countObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.6 });
  document.querySelectorAll('.stat-num').forEach(function (el) { countObserver.observe(el); });

  /* ---------- 3D tilt on cards ---------- */
  var supportsHover = window.matchMedia('(hover: hover)').matches;
  if (supportsHover && !prefersReduced) {
    document.querySelectorAll('.tilt').forEach(function (card) {
      var maxTilt = 8;
      card.addEventListener('mousemove', function (e) {
        var r = card.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width - 0.5;
        var y = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform =
          'perspective(800px) rotateY(' + (x * maxTilt) + 'deg) rotateX(' + (-y * maxTilt) + 'deg) translateY(-4px)';
      });
      card.addEventListener('mouseleave', function () {
        card.style.transform = '';
      });
    });
  }

  /* ---------- Hero particle canvas ---------- */
  var canvas = document.getElementById('heroCanvas');
  if (canvas && !prefersReduced) {
    var ctx = canvas.getContext('2d');
    var particles = [];
    var W, H;

    function resize() {
      W = canvas.width = canvas.offsetWidth;
      H = canvas.height = canvas.offsetHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    var COUNT = Math.min(70, Math.floor(window.innerWidth / 18));
    for (var i = 0; i < COUNT; i++) {
      particles.push({
        x: Math.random(),
        y: Math.random(),
        vx: (Math.random() - 0.5) * 0.0004,
        vy: (Math.random() - 0.5) * 0.0004,
        r: Math.random() * 1.8 + 0.6
      });
    }

    function drawParticles() {
      ctx.clearRect(0, 0, W, H);
      var linkDist = 130;
      for (var i = 0; i < particles.length; i++) {
        var p = particles[i];
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > 1) p.vx *= -1;
        if (p.y < 0 || p.y > 1) p.vy *= -1;
        var px = p.x * W, py = p.y * H;

        ctx.beginPath();
        ctx.arc(px, py, p.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(245, 158, 11, 0.5)';
        ctx.fill();

        for (var j = i + 1; j < particles.length; j++) {
          var q = particles[j];
          var dx = (q.x - p.x) * W, dy = (q.y - p.y) * H;
          var d = Math.sqrt(dx * dx + dy * dy);
          if (d < linkDist) {
            ctx.beginPath();
            ctx.moveTo(px, py);
            ctx.lineTo(q.x * W, q.y * H);
            ctx.strokeStyle = 'rgba(148, 163, 184, ' + (0.14 * (1 - d / linkDist)) + ')';
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }
      requestAnimationFrame(drawParticles);
    }
    drawParticles();
  }

  /* ---------- Before / After sliders ---------- */
  document.querySelectorAll('.ba-slider').forEach(function (slider, idx) {
    var after = slider.querySelector('.ba-after');
    var handle = slider.querySelector('.ba-handle');
    if (!after || !handle) return;

    var dragging = false;

    function setSplit(clientX) {
      var r = slider.getBoundingClientRect();
      var pct = ((clientX - r.left) / r.width) * 100;
      pct = Math.max(2, Math.min(98, pct));
      after.style.clipPath = 'inset(0 0 0 ' + pct + '%)';
      handle.style.left = pct + '%';
    }

    slider.addEventListener('pointerdown', function (e) {
      dragging = true;
      slider.setPointerCapture(e.pointerId);
      setSplit(e.clientX);
    });
    slider.addEventListener('pointermove', function (e) {
      if (dragging) setSplit(e.clientX);
    });
    ['pointerup', 'pointercancel'].forEach(function (evt) {
      slider.addEventListener(evt, function () { dragging = false; });
    });

    // Gentle auto demo until first interaction
    if (!prefersReduced) {
      var demoActive = true;
      slider.addEventListener('pointerdown', function () { demoActive = false; }, { once: true });
      var t0 = null;
      var phase = idx * 900; // stagger the sliders slightly
      function demo(ts) {
        if (!demoActive) return;
        if (!t0) t0 = ts;
        var pct = 50 + Math.sin((ts - t0 + phase) / 1400) * 14;
        after.style.clipPath = 'inset(0 0 0 ' + pct + '%)';
        handle.style.left = pct + '%';
        requestAnimationFrame(demo);
      }
      requestAnimationFrame(demo);
    }
  });

  /* ---------- Contact form (AJAX submit via FormSubmit) ---------- */
  var form = document.getElementById('contactForm');
  if (form) {
    var nextField = document.getElementById('nextField');
    if (nextField) {
      nextField.value = window.location.href.split('#')[0] + '#contact';
    }
    var statusEl = document.getElementById('formStatus');
    var btn = form.querySelector('button[type="submit"]');
    var AJAX_URL = 'https://formsubmit.co/ajax/gaiduhomerenovationinc@gmail.com';

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (btn) { btn.textContent = 'Sending…'; btn.disabled = true; }
      if (statusEl) { statusEl.className = 'form-status'; statusEl.textContent = ''; }

      var data = new FormData(form);

      fetch(AJAX_URL, {
        method: 'POST',
        body: data,
        headers: { 'Accept': 'application/json' }
      })
        .then(function (res) { return res.json(); })
        .then(function (json) {
          if (json.success === 'true' || json.success === true) {
            if (statusEl) {
              statusEl.className = 'form-status ok';
              statusEl.textContent = '✅ Thank you! Your request was sent. We will contact you within 24 hours.';
            }
            form.reset();
          } else {
            throw new Error(json.message || 'Send failed');
          }
        })
        .catch(function () {
          if (statusEl) {
            statusEl.className = 'form-status err';
            statusEl.textContent = '⚠️ Something went wrong. Please call or WhatsApp us at 780-902-8225.';
          }
        })
        .then(function () {
          if (btn) { btn.textContent = 'Send My Free Estimate Request'; btn.disabled = false; }
        });
    });
  }
})();
