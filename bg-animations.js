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

  if (PAGE.includes('competition')) {
    // ════════════════════════════════════════════════════════════════════
    // COMPETITION — Deep Space Nebula & Twinkling Starfield
    // Soft, organic glowing nebula clouds with gentle color shifts,
    // layered twinkling stars, and mouse-reactive light bloom.
    // ════════════════════════════════════════════════════════════════════

    let time = 0;

    // ── Twinkling Stars ──
    const stars = [];
    const STAR_COUNT = Math.min(180, Math.floor(width * height / 6000));

    for (let i = 0; i < STAR_COUNT; i++) {
      stars.push({
        x: rand(0, width),
        y: rand(0, height),
        radius: rand(0.4, 1.6),
        baseAlpha: rand(0.15, 0.7),
        twinkleSpeed: rand(0.008, 0.04),
        phase: rand(0, Math.PI * 2),
        hue: randInt(0, 1) === 0 ? rand(190, 240) : rand(30, 55) // blue-ish or warm
      });
    }

    // ── Nebula Clouds (large soft radial blobs) ──
    const clouds = [];
    const CLOUD_COUNT = 6;
    const nebulaColors = [
      { h: 280, s: 70, l: 40 },  // deep purple
      { h: 210, s: 60, l: 35 },  // ocean blue
      { h: 340, s: 55, l: 35 },  // rose
      { h: 175, s: 50, l: 30 },  // teal
      { h: 250, s: 65, l: 30 },  // indigo
      { h: 15,  s: 60, l: 35 },  // warm ember
    ];

    for (let i = 0; i < CLOUD_COUNT; i++) {
      const c = nebulaColors[i % nebulaColors.length];
      clouds.push({
        x: rand(width * 0.1, width * 0.9),
        y: rand(height * 0.15, height * 0.85),
        radius: rand(180, 380),
        baseAlpha: rand(0.025, 0.055),
        driftX: rand(-0.08, 0.08),
        driftY: rand(-0.05, 0.05),
        breathSpeed: rand(0.003, 0.008),
        breathPhase: rand(0, Math.PI * 2),
        hsl: c
      });
    }

    // ── Shooting stars (rare, dramatic) ──
    const shootingStars = [];

    class ShootingStar {
      constructor() { this.reset(); this.alive = false; }
      reset() {
        this.x = rand(-100, width * 0.6);
        this.y = rand(-50, height * 0.3);
        this.angle = rand(0.3, 0.8); // mostly diagonal down-right
        this.speed = rand(8, 16);
        this.length = rand(60, 140);
        this.life = 0;
        this.maxLife = rand(40, 80);
        this.alive = true;
      }
      update() {
        if (!this.alive) return;
        this.x += Math.cos(this.angle) * this.speed;
        this.y += Math.sin(this.angle) * this.speed;
        this.life++;
        if (this.life > this.maxLife || this.x > width + 100 || this.y > height + 100) {
          this.alive = false;
        }
      }
      draw() {
        if (!this.alive) return;
        const progress = this.life / this.maxLife;
        const fadeAlpha = progress < 0.3 ? progress / 0.3 : 1 - ((progress - 0.3) / 0.7);
        const alpha = Math.max(0, fadeAlpha * 0.7);
        const tailX = this.x - Math.cos(this.angle) * this.length;
        const tailY = this.y - Math.sin(this.angle) * this.length;

        const grad = ctx.createLinearGradient(tailX, tailY, this.x, this.y);
        grad.addColorStop(0, `rgba(255, 255, 255, 0)`);
        grad.addColorStop(0.6, `rgba(200, 220, 255, ${alpha * 0.3})`);
        grad.addColorStop(1, `rgba(255, 255, 255, ${alpha})`);

        ctx.beginPath();
        ctx.moveTo(tailX, tailY);
        ctx.lineTo(this.x, this.y);
        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.5;
        ctx.lineCap = 'round';
        ctx.stroke();

        // tiny bright head
        ctx.beginPath();
        ctx.arc(this.x, this.y, 1.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
        ctx.fill();
      }
    }

    for (let i = 0; i < 3; i++) shootingStars.push(new ShootingStar());

    function animateCompetition() {
      time += 1;
      updateMouse();
      ctx.clearRect(0, 0, width, height);

      // 1. Nebula clouds — soft radial gradients that breathe
      for (const cloud of clouds) {
        cloud.x += cloud.driftX;
        cloud.y += cloud.driftY;
        cloud.breathPhase += cloud.breathSpeed;

        // Wrap around gently
        if (cloud.x < -cloud.radius) cloud.x = width + cloud.radius * 0.5;
        if (cloud.x > width + cloud.radius) cloud.x = -cloud.radius * 0.5;
        if (cloud.y < -cloud.radius) cloud.y = height + cloud.radius * 0.5;
        if (cloud.y > height + cloud.radius) cloud.y = -cloud.radius * 0.5;

        const breathScale = 0.85 + 0.15 * Math.sin(cloud.breathPhase);
        const r = cloud.radius * breathScale;
        const a = cloud.baseAlpha * (0.7 + 0.3 * Math.sin(cloud.breathPhase * 0.7));
        const { h, s, l } = cloud.hsl;

        const grad = ctx.createRadialGradient(cloud.x, cloud.y, 0, cloud.x, cloud.y, r);
        grad.addColorStop(0, `hsla(${h}, ${s}%, ${l + 15}%, ${a})`);
        grad.addColorStop(0.4, `hsla(${h}, ${s}%, ${l}%, ${a * 0.6})`);
        grad.addColorStop(1, `hsla(${h}, ${s}%, ${l - 10}%, 0)`);

        ctx.fillStyle = grad;
        ctx.fillRect(cloud.x - r, cloud.y - r, r * 2, r * 2);
      }

      // 2. Mouse-reactive light bloom
      if (mouse.active) {
        const bloomGrad = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 200);
        bloomGrad.addColorStop(0, 'rgba(180, 160, 255, 0.04)');
        bloomGrad.addColorStop(0.5, 'rgba(140, 120, 220, 0.015)');
        bloomGrad.addColorStop(1, 'rgba(100, 80, 180, 0)');
        ctx.fillStyle = bloomGrad;
        ctx.fillRect(mouse.x - 200, mouse.y - 200, 400, 400);
      }

      // 3. Twinkling stars
      for (const star of stars) {
        star.phase += star.twinkleSpeed;
        const twinkle = 0.4 + 0.6 * Math.abs(Math.sin(star.phase));
        const a = star.baseAlpha * twinkle;

        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${star.hue}, 30%, 90%, ${a})`;
        ctx.fill();

        // Subtle cross-flare on brighter stars
        if (star.radius > 1.0 && twinkle > 0.8) {
          const flareLen = star.radius * 4;
          const flareAlpha = a * 0.3;
          ctx.strokeStyle = `hsla(${star.hue}, 20%, 95%, ${flareAlpha})`;
          ctx.lineWidth = 0.5;
          ctx.beginPath();
          ctx.moveTo(star.x - flareLen, star.y);
          ctx.lineTo(star.x + flareLen, star.y);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(star.x, star.y - flareLen);
          ctx.lineTo(star.x, star.y + flareLen);
          ctx.stroke();
        }
      }

      // 4. Occasional shooting stars
      for (const ss of shootingStars) {
        if (!ss.alive && Math.random() < 0.003) {
          ss.reset();
        }
        ss.update();
        ss.draw();
      }

      if (!reducedMotion) requestAnimationFrame(animateCompetition);
    }

    animateCompetition();
  }
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
