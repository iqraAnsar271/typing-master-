/**
 * bg-animations.js
 * ────────────────────────────────────────────────────────
 * Ultra-Premium, Executive Canvas Background Animations
 * for "Type Like Sherlock".
 *
 * Page Modes:
 *  - Competition : Kinetic Velocity Stream & Precision HUD Telemetry
 *  - Leaderboard : Executive Luminous Aurora Waves & Prestige Coordinate Grid
 *  - Practice    : Cyberpunk Typographic Code Matrix Stream
 *  - Home        : Floating Luminous Typewriter Elements & Amber Depth
 *  - Default     : Smooth Ambient Dark-Matter Mesh & Floating Nodes
 *
 * Built with High-DPI crisp rendering, 60fps performance optimizations,
 * and prefers-reduced-motion accessibility support.
 */

(function () {
  'use strict';

  const canvas = document.getElementById('bg-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let width = 0;
  let height = 0;
  let dpr = window.devicePixelRatio || 1;

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  window.addEventListener('resize', resize);
  resize();

  /* Accessibility check */
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Helper functions */
  function rand(min, max) { return Math.random() * (max - min) + min; }
  function randInt(min, max) { return Math.floor(rand(min, max + 1)); }

  /* Mouse tracking for subtle interactive depth */
  const mouse = { x: width * 0.5, y: height * 0.5, targetX: width * 0.5, targetY: height * 0.5, active: false };
  window.addEventListener('mousemove', (e) => {
    mouse.targetX = e.clientX;
    mouse.targetY = e.clientY;
    mouse.active = true;
  });
  window.addEventListener('mouseleave', () => {
    mouse.active = false;
  });

  function updateMouse() {
    mouse.x += (mouse.targetX - mouse.x) * 0.05;
    mouse.y += (mouse.targetY - mouse.y) * 0.05;
  }

  const bodyClass = document.body.className || '';
  const pageAttr = document.body.dataset.page || '';
  const PAGE = (bodyClass + ' ' + pageAttr).toLowerCase();

  /* ════════════════════════════════════════════════════════════════════
     1. COMPETITION — Kinetic Velocity Stream & Precision HUD Telemetry
     Sleek, dark, high-speed telemetry lines with glowing heads,
     kinetic depth streams, and subtle precision HUD markers.
     ════════════════════════════════════════════════════════════════════ */
  if (PAGE.includes('competition')) {

    const STREAMS_COUNT = Math.min(65, Math.floor(width / 22));
    const streams = [];

    // Subtle coordinate tick marks
    const hudTicks = [];
    const TICK_ROWS = 4;
    const TICK_COLS = 6;
    for (let r = 0; r < TICK_ROWS; r++) {
      for (let c = 0; c < TICK_COLS; c++) {
        hudTicks.push({
          relX: (c + 0.5) / TICK_COLS + rand(-0.02, 0.02),
          relY: (r + 0.5) / TICK_ROWS + rand(-0.02, 0.02),
          alpha: rand(0.04, 0.12),
          pulseSpeed: rand(0.01, 0.03),
          phase: rand(0, Math.PI * 2)
        });
      }
    }

    class VelocityStream {
      constructor() { this.reset(true); }
      reset(initial) {
        this.x = initial ? rand(0, width) : -rand(50, 200);
        this.y = rand(0, height);
        this.length = rand(80, 260);
        this.speed = rand(1.8, 5.5);
        this.thickness = rand(0.8, 2.0);
        this.alpha = rand(0.12, 0.45);
        this.laneDrift = rand(-0.04, 0.04);
        
        // Color distribution: high-end gold / cyber coral / neon mint
        const roll = Math.random();
        if (roll < 0.60) {
          this.color = [232, 168, 56];    // Amber Gold
        } else if (roll < 0.85) {
          this.color = [255, 107, 117];  // Cyber Crimson
        } else {
          this.color = [74, 234, 170];   // Neon Mint
        }
      }
      update() {
        this.x += this.speed;
        this.y += this.laneDrift;

        // Mouse avoidance/acceleration effect
        if (mouse.active) {
          const dx = this.x - mouse.x;
          const dy = this.y - mouse.y;
          const distSq = dx * dx + dy * dy;
          if (distSq < 22500) { // 150px radius
            const factor = (1 - Math.sqrt(distSq) / 150);
            this.x += factor * 2;
          }
        }

        if (this.x - this.length > width) {
          this.reset(false);
        }
      }
      draw() {
        const [r, g, b] = this.color;
        
        // Head glow
        const headX = this.x;
        const tailX = this.x - this.length;

        const grad = ctx.createLinearGradient(tailX, this.y, headX, this.y);
        grad.addColorStop(0, `rgba(${r}, ${g}, ${b}, 0)`);
        grad.addColorStop(0.7, `rgba(${r}, ${g}, ${b}, ${this.alpha * 0.4})`);
        grad.addColorStop(1, `rgba(${r}, ${g}, ${b}, ${this.alpha})`);

        ctx.beginPath();
        ctx.moveTo(tailX, this.y);
        ctx.lineTo(headX, this.y);
        ctx.strokeStyle = grad;
        ctx.lineWidth = this.thickness;
        ctx.lineCap = 'round';
        ctx.stroke();

        // Glowing particle at the head
        ctx.beginPath();
        ctx.arc(headX, this.y, this.thickness * 1.4, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${Math.min(1, this.alpha * 1.8)})`;
        ctx.fill();

        // Subtle ambient blur aura on head
        if (this.thickness > 1.4) {
          ctx.beginPath();
          ctx.arc(headX, this.y, this.thickness * 3.5, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${this.alpha * 0.15})`;
          ctx.fill();
        }
      }
    }

    for (let i = 0; i < STREAMS_COUNT; i++) {
      streams.push(new VelocityStream());
    }

    let frame = 0;
    function animateCompetition() {
      frame++;
      updateMouse();
      ctx.clearRect(0, 0, width, height);

      // 1. Precision HUD Coordinates Grid
      for (const t of hudTicks) {
        t.phase += t.pulseSpeed;
        const currentAlpha = t.alpha * (0.6 + 0.4 * Math.sin(t.phase));
        const px = t.relX * width;
        const py = t.relY * height;
        const size = 4;

        ctx.strokeStyle = `rgba(170, 188, 205, ${currentAlpha})`;
        ctx.lineWidth = 0.75;
        
        // Minimalist Crosshair (+)
        ctx.beginPath();
        ctx.moveTo(px - size, py);
        ctx.lineTo(px + size, py);
        ctx.moveTo(px, py - size);
        ctx.lineTo(px, py + size);
        ctx.stroke();
      }

      // 2. Telemetry horizontal guideline tracks
      ctx.strokeStyle = 'rgba(232, 168, 56, 0.025)';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 20]);
      for (let y = 80; y < height; y += 140) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }
      ctx.setLineDash([]); // Reset dash

      // 3. Velocity Streams
      for (const s of streams) {
        s.update();
        s.draw();
      }

      if (!reducedMotion) requestAnimationFrame(animateCompetition);
    }

    animateCompetition();
  }

  /* ════════════════════════════════════════════════════════════════════
     2. LEADERBOARD — Executive Luminous Aurora Waves & Prestige Grid
     Harmonic, silky multi-layer sine waves flowing with mathematical
     elegance, accompanied by golden celestial micro-sparkles.
     ════════════════════════════════════════════════════════════════════ */
  else if (PAGE.includes('leaderboard')) {

    const waves = [
      { amp: 45, freq: 0.0018, speed: 0.008, yRatio: 0.68, color: [232, 168, 56], alpha: 0.09, phase: 0 },
      { amp: 60, freq: 0.0012, speed: -0.006, yRatio: 0.76, color: [255, 200, 97], alpha: 0.06, phase: 1.5 },
      { amp: 35, freq: 0.0024, speed: 0.010, yRatio: 0.84, color: [74, 234, 170], alpha: 0.04, phase: 3.2 },
      { amp: 50, freq: 0.0015, speed: -0.007, yRatio: 0.60, color: [160, 140, 240], alpha: 0.03, phase: 4.8 }
    ];

    // Luminous Star Sparkles (Prestige / Hall of Fame)
    const sparkles = [];
    const SPARKLE_COUNT = Math.min(45, Math.floor(width / 28));

    class PrestigeSparkle {
      constructor() { this.reset(true); }
      reset(initial) {
        this.x = rand(0, width);
        this.y = initial ? rand(0, height) : rand(height * 0.4, height);
        this.baseSize = rand(0.8, 1.8);
        this.speedY = -rand(0.05, 0.18);
        this.speedX = rand(-0.04, 0.04);
        this.alpha = rand(0.1, 0.45);
        this.pulse = rand(0, Math.PI * 2);
        this.pulseSpeed = rand(0.012, 0.028);
        this.isDiamond = Math.random() < 0.25;
      }
      update() {
        this.y += this.speedY;
        this.x += this.speedX;
        this.pulse += this.pulseSpeed;
        if (this.y < -10) this.reset(false);
      }
      draw() {
        const a = this.alpha * (0.5 + 0.5 * Math.sin(this.pulse));
        const size = this.baseSize * (0.8 + 0.3 * Math.sin(this.pulse));

        if (this.isDiamond) {
          // Render elegant mini diamond marker
          ctx.save();
          ctx.translate(this.x, this.y);
          ctx.beginPath();
          ctx.moveTo(0, -size * 2);
          ctx.lineTo(size * 1.4, 0);
          ctx.lineTo(0, size * 2);
          ctx.lineTo(-size * 1.4, 0);
          ctx.closePath();
          ctx.fillStyle = `rgba(255, 215, 120, ${a * 0.8})`;
          ctx.fill();
          ctx.restore();
        } else {
          // Luminous micro-dot
          ctx.beginPath();
          ctx.arc(this.x, this.y, size, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(232, 168, 56, ${a})`;
          ctx.fill();
        }
      }
    }

    for (let i = 0; i < SPARKLE_COUNT; i++) {
      sparkles.push(new PrestigeSparkle());
    }

    let time = 0;

    function animateLeaderboard() {
      time += 1;
      updateMouse();
      ctx.clearRect(0, 0, width, height);

      // 1. Soft Prestige Radial Gradient at center-bottom
      const radialGlow = ctx.createRadialGradient(
        width * 0.5, height * 0.85, 20,
        width * 0.5, height * 0.85, width * 0.6
      );
      radialGlow.addColorStop(0, 'rgba(232, 168, 56, 0.06)');
      radialGlow.addColorStop(0.5, 'rgba(232, 168, 56, 0.015)');
      radialGlow.addColorStop(1, 'rgba(6, 9, 15, 0)');
      ctx.fillStyle = radialGlow;
      ctx.fillRect(0, 0, width, height);

      // 2. Harmonic Aurora Waves
      for (const w of waves) {
        w.phase += w.speed;
        const [r, g, b] = w.color;
        const baseY = height * w.yRatio;

        ctx.beginPath();
        ctx.moveTo(0, height);

        const step = Math.max(12, Math.floor(width / 60));
        for (let x = 0; x <= width + step; x += step) {
          const sine1 = Math.sin(x * w.freq + w.phase);
          const sine2 = Math.cos(x * w.freq * 0.6 + w.phase * 0.8);
          const y = baseY + (sine1 + sine2 * 0.5) * w.amp;
          ctx.lineTo(x, y);
        }

        ctx.lineTo(width, height);
        ctx.closePath();

        const waveGrad = ctx.createLinearGradient(0, baseY - w.amp, 0, height);
        waveGrad.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${w.alpha})`);
        waveGrad.addColorStop(0.4, `rgba(${r}, ${g}, ${b}, ${w.alpha * 0.4})`);
        waveGrad.addColorStop(1, 'rgba(6, 9, 15, 0)');

        ctx.fillStyle = waveGrad;
        ctx.fill();

        // Stroke line on wave edge
        ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${w.alpha * 1.8})`;
        ctx.lineWidth = 1.0;
        ctx.stroke();
      }

      // 3. Prestige Sparkles
      for (const sp of sparkles) {
        sp.update();
        sp.draw();
      }

      if (!reducedMotion) requestAnimationFrame(animateLeaderboard);
    }

    animateLeaderboard();
  }

  /* ════════════════════════════════════════════════════════════════════
     3. PRACTICE — Cyberpunk Matrix Stream
     ════════════════════════════════════════════════════════════════════ */
  else if (PAGE.includes('practice')) {

    const FONT_SIZE = 14;
    let columns = Math.floor(width / FONT_SIZE);
    let drops = new Array(columns).fill(1);
    const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789.,;:!?—"\'@#&Elementary'.split('');

    window.addEventListener('resize', () => {
      columns = Math.floor(width / FONT_SIZE);
      drops = new Array(columns).fill(1);
    });

    function animatePractice() {
      ctx.fillStyle = 'rgba(6, 9, 15, 0.08)';
      ctx.fillRect(0, 0, width, height);

      for (let i = 0; i < columns; i++) {
        const char = CHARS[randInt(0, CHARS.length - 1)];
        const x = i * FONT_SIZE;
        const y = drops[i] * FONT_SIZE;

        const headAlpha = rand(0.5, 0.9);
        ctx.fillStyle = `rgba(74, 234, 170, ${headAlpha * 0.22})`;
        ctx.font = `${FONT_SIZE}px "JetBrains Mono", monospace`;
        ctx.fillText(char, x, y);

        if (drops[i] > 1) {
          ctx.fillStyle = `rgba(232, 168, 56, ${rand(0.015, 0.05)})`;
          ctx.fillText(CHARS[randInt(0, CHARS.length - 1)], x, y - FONT_SIZE);
        }

        if (y > height && Math.random() > 0.98) {
          drops[i] = 0;
        }
        drops[i]++;
      }

      if (!reducedMotion) requestAnimationFrame(animatePractice);
    }

    ctx.fillStyle = 'rgba(6, 9, 15, 1)';
    ctx.fillRect(0, 0, width, height);
    animatePractice();
  }

  /* ════════════════════════════════════════════════════════════════════
     4. HOME & DEFAULT — Floating Luminous Typewriter Elements
     ════════════════════════════════════════════════════════════════════ */
  else {

    const KEYS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789.,;:!?&@#'.split('');
    const particles = [];
    const COUNT = Math.min(45, Math.floor(width / 26));

    class FloatingKey {
      constructor() { this.reset(true); }
      reset(initial) {
        this.x = rand(0, width);
        this.y = initial ? rand(0, height) : height + 40;
        this.size = rand(22, 40);
        this.speed = rand(0.2, 0.6);
        this.drift = rand(-0.12, 0.12);
        this.rotation = rand(0, Math.PI * 2);
        this.rotSpeed = rand(-0.002, 0.002);
        this.opacity = rand(0.04, 0.12);
        this.char = KEYS[randInt(0, KEYS.length - 1)];
        this.borderRadius = rand(4, 7);
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
        ctx.lineWidth = 1.0;
        ctx.stroke();

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
      updateMouse();
      ctx.clearRect(0, 0, width, height);
      for (const p of particles) { p.update(); p.draw(); }
      if (!reducedMotion) requestAnimationFrame(animateHome);
    }

    animateHome();
  }

})();
