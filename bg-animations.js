/**
 * bg-animations.js
 * ────────────────────────────────────────────────────────
 * Per-page canvas background animations for Type Like Sherlock.
 *
 * Detects body class (page-home | page-practice | page-competition | page-leaderboard)
 * and runs the matching animation.
 *
 * Respects prefers-reduced-motion.
 */

(function () {
  'use strict';

  /* ── helpers ────────────────────────────────────── */

  const canvas = document.getElementById('bg-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resize);
  resize();

  /* respect reduced motion */
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function rand(min, max) { return Math.random() * (max - min) + min; }
  function randInt(min, max) { return Math.floor(rand(min, max + 1)); }

  const PAGE = document.body.className;

  /* ══════════════════════════════════════════════════
     HOME — Floating Typewriter Keys
     ══════════════════════════════════════════════════ */
  if (PAGE.includes('page-home')) {

    const KEYS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789.,;:!?&@#'.split('');
    const particles = [];
    const COUNT = Math.min(55, Math.floor(window.innerWidth / 22));

    class FloatingKey {
      constructor() { this.reset(true); }
      reset(initial) {
        this.x = rand(0, canvas.width);
        this.y = initial ? rand(0, canvas.height) : canvas.height + 40;
        this.size = rand(22, 44);
        this.speed = rand(0.2, 0.7);
        this.drift = rand(-0.15, 0.15);
        this.rotation = rand(0, Math.PI * 2);
        this.rotSpeed = rand(-0.003, 0.003);
        this.opacity = rand(0.04, 0.14);
        this.char = KEYS[randInt(0, KEYS.length - 1)];
        this.borderRadius = rand(4, 8);
      }
      update() {
        this.y -= this.speed;
        this.x += this.drift;
        this.rotation += this.rotSpeed;
        if (this.y < -60) this.reset(false);
      }
      draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        ctx.globalAlpha = this.opacity;

        // key cap shape
        const half = this.size / 2;
        const r = this.borderRadius;
        ctx.beginPath();
        ctx.moveTo(-half + r, -half);
        ctx.lineTo(half - r, -half);
        ctx.quadraticCurveTo(half, -half, half, -half + r);
        ctx.lineTo(half, half - r);
        ctx.quadraticCurveTo(half, half, half - r, half);
        ctx.lineTo(-half + r, half);
        ctx.quadraticCurveTo(-half, half, -half, half - r);
        ctx.lineTo(-half, -half + r);
        ctx.quadraticCurveTo(-half, -half, -half + r, -half);
        ctx.closePath();

        ctx.strokeStyle = '#e8a838';
        ctx.lineWidth = 1.2;
        ctx.stroke();

        // letter
        ctx.fillStyle = '#ffc861';
        ctx.font = `${Math.round(this.size * 0.45)}px "JetBrains Mono", monospace`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.char, 0, 1);

        ctx.restore();
      }
    }

    for (let i = 0; i < COUNT; i++) particles.push(new FloatingKey());

    function animateHome() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const p of particles) { p.update(); p.draw(); }
      if (!reducedMotion) requestAnimationFrame(animateHome);
    }
    animateHome();
  }

  /* ══════════════════════════════════════════════════
     PRACTICE — Falling Characters Matrix Rain
     ══════════════════════════════════════════════════ */
  if (PAGE.includes('page-practice')) {

    const FONT_SIZE = 15;
    let columns = Math.floor(canvas.width / FONT_SIZE);
    let drops = new Array(columns).fill(1);

    const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789.,;:!?—"\'@#&Elementary'.split('');

    window.addEventListener('resize', () => {
      columns = Math.floor(canvas.width / FONT_SIZE);
      drops = new Array(columns).fill(1);
    });

    function animatePractice() {
      // semi-transparent black to create trail effect
      ctx.fillStyle = 'rgba(6, 9, 15, 0.06)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < columns; i++) {
        const char = CHARS[randInt(0, CHARS.length - 1)];
        const x = i * FONT_SIZE;
        const y = drops[i] * FONT_SIZE;

        // head character is bright
        const headAlpha = rand(0.6, 1.0);
        ctx.fillStyle = `rgba(74, 234, 170, ${headAlpha * 0.25})`;
        ctx.font = `${FONT_SIZE}px "JetBrains Mono", monospace`;
        ctx.fillText(char, x, y);

        // trail chars in amber
        if (drops[i] > 1) {
          ctx.fillStyle = `rgba(232, 168, 56, ${rand(0.02, 0.08)})`;
          ctx.fillText(CHARS[randInt(0, CHARS.length - 1)], x, y - FONT_SIZE);
        }

        if (y > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }

      if (!reducedMotion) requestAnimationFrame(animatePractice);
    }

    // initial fill with dark bg
    ctx.fillStyle = 'rgba(6, 9, 15, 1)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    animatePractice();
  }

  /* ══════════════════════════════════════════════════
     COMPETITION — Racing Particles
     ══════════════════════════════════════════════════ */
  if (PAGE.includes('page-competition')) {

    const streams = [];
    const STREAM_COUNT = 40;

    class RacingParticle {
      constructor(team) {
        this.team = team; // 'amber' or 'mint'
        this.reset();
      }
      reset() {
        this.x = rand(-200, -20);
        this.y = rand(0, canvas.height);
        this.speed = rand(1.5, 5);
        this.size = rand(1.5, 4);
        this.opacity = rand(0.15, 0.55);
        this.trail = [];
        this.trailLength = randInt(8, 22);
        this.pulse = rand(0, Math.PI * 2);
        this.pulseSpeed = rand(0.02, 0.06);
      }
      update() {
        this.trail.push({ x: this.x, y: this.y });
        if (this.trail.length > this.trailLength) this.trail.shift();

        this.x += this.speed;
        this.y += Math.sin(this.pulse) * 0.3;
        this.pulse += this.pulseSpeed;

        if (this.x > canvas.width + 60) this.reset();
      }
      draw() {
        const color = this.team === 'amber' ? [232, 168, 56] : [74, 234, 170];

        // trail
        for (let i = 0; i < this.trail.length; i++) {
          const t = this.trail[i];
          const frac = i / this.trail.length;
          ctx.beginPath();
          ctx.arc(t.x, t.y, this.size * frac * 0.6, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${this.opacity * frac * 0.3})`;
          ctx.fill();
        }

        // head
        const glow = Math.sin(this.pulse) * 0.15 + 0.85;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${this.opacity * glow})`;
        ctx.fill();

        // glow
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size * 3, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${this.opacity * 0.08})`;
        ctx.fill();
      }
    }

    for (let i = 0; i < STREAM_COUNT; i++) {
      const team = i < STREAM_COUNT / 2 ? 'amber' : 'mint';
      const p = new RacingParticle(team);
      p.x = rand(0, canvas.width); // start spread
      streams.push(p);
    }

    function animateCompetition() {
      ctx.fillStyle = 'rgba(6, 9, 15, 0.12)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      for (const p of streams) { p.update(); p.draw(); }
      if (!reducedMotion) requestAnimationFrame(animateCompetition);
    }

    ctx.fillStyle = 'rgba(6, 9, 15, 1)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    animateCompetition();
  }

  /* ══════════════════════════════════════════════════
     LEADERBOARD — Rising Rank Stars
     ══════════════════════════════════════════════════ */
  if (PAGE.includes('page-leaderboard')) {

    const stars = [];
    const STAR_COUNT = 60;

    class RisingStar {
      constructor() { this.reset(true); }
      reset(initial) {
        this.x = rand(0, canvas.width);
        this.y = initial ? rand(0, canvas.height) : canvas.height + rand(10, 60);
        this.size = rand(1, 3.5);
        this.speed = 0.15 + this.size * 0.25; // bigger = faster = top performers
        this.opacity = 0.1 + this.size * 0.1;
        this.drift = rand(-0.1, 0.1);
        this.shimmer = rand(0, Math.PI * 2);
        this.shimmerSpeed = rand(0.02, 0.08);
        this.sparkleTimer = rand(200, 800);
        this.sparkleCount = 0;
        this.sparkles = [];
      }
      update() {
        this.y -= this.speed;
        this.x += this.drift;
        this.shimmer += this.shimmerSpeed;
        this.sparkleCount++;

        // occasional sparkle burst for big stars
        if (this.size > 2.5 && this.sparkleCount > this.sparkleTimer) {
          this.sparkleCount = 0;
          this.sparkleTimer = rand(200, 800);
          for (let i = 0; i < 5; i++) {
            this.sparkles.push({
              x: this.x, y: this.y,
              vx: rand(-1.5, 1.5), vy: rand(-1.5, 1.5),
              life: 1, decay: rand(0.015, 0.035),
              size: rand(0.5, 1.5)
            });
          }
        }

        // update sparkles
        for (let i = this.sparkles.length - 1; i >= 0; i--) {
          const s = this.sparkles[i];
          s.x += s.vx;
          s.y += s.vy;
          s.life -= s.decay;
          if (s.life <= 0) this.sparkles.splice(i, 1);
        }

        if (this.y < -20) this.reset(false);
      }
      draw() {
        const glow = Math.sin(this.shimmer) * 0.3 + 0.7;
        const alpha = this.opacity * glow;

        // outer glow
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size * 4, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(232, 168, 56, ${alpha * 0.06})`;
        ctx.fill();

        // star core
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 200, 97, ${alpha})`;
        ctx.fill();

        // cross-flare for bigger stars
        if (this.size > 2) {
          ctx.strokeStyle = `rgba(255, 200, 97, ${alpha * 0.4})`;
          ctx.lineWidth = 0.5;
          const len = this.size * 3;
          ctx.beginPath();
          ctx.moveTo(this.x - len, this.y);
          ctx.lineTo(this.x + len, this.y);
          ctx.moveTo(this.x, this.y - len);
          ctx.lineTo(this.x, this.y + len);
          ctx.stroke();
        }

        // sparkles
        for (const s of this.sparkles) {
          ctx.beginPath();
          ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 200, 97, ${s.life * 0.7})`;
          ctx.fill();
        }
      }
    }

    for (let i = 0; i < STAR_COUNT; i++) stars.push(new RisingStar());

    function animateLeaderboard() {
      ctx.fillStyle = 'rgba(6, 9, 15, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      for (const s of stars) { s.update(); s.draw(); }
      if (!reducedMotion) requestAnimationFrame(animateLeaderboard);
    }

    ctx.fillStyle = 'rgba(6, 9, 15, 1)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    animateLeaderboard();
  }

})();
