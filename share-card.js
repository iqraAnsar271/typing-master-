/**
 * share-card.js
 * Generates an image result card on an HTML5 canvas for social media sharing.
 */

(function () {
  function getProfile() {
    try {
      const stored = localStorage.getItem('typingUserProfile');
      if (stored) return JSON.parse(stored);
    } catch (e) {}
    return { name: 'Player 1', avatar: '🕵️‍♂️' };
  }

  function renderResultCard(stats) {
    const canvas = document.createElement('canvas');
    canvas.width = 1200;
    canvas.height = 630;
    const ctx = canvas.getContext('2d');

    const profile = getProfile();
    const wpm = stats.wpm || 0;
    const accuracy = stats.accuracy || 100;
    const mode = (stats.mode || 'Practice').toUpperCase();
    const quote = stats.quote || 'Elementarily typed with precision and speed.';

    // Background - Dark Gradient
    const bgGradient = ctx.createLinearGradient(0, 0, 1200, 630);
    bgGradient.addColorStop(0, '#0a0d14');
    bgGradient.addColorStop(0.5, '#121826');
    bgGradient.addColorStop(1, '#05070a');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, 1200, 630);

    // Decorative Glow Accents
    const glow1 = ctx.createRadialGradient(200, 150, 0, 200, 150, 400);
    glow1.addColorStop(0, 'rgba(255, 184, 0, 0.15)');
    glow1.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = glow1;
    ctx.fillRect(0, 0, 1200, 630);

    const glow2 = ctx.createRadialGradient(1000, 450, 0, 1000, 450, 400);
    glow2.addColorStop(0, 'rgba(0, 210, 255, 0.12)');
    glow2.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = glow2;
    ctx.fillRect(0, 0, 1200, 630);

    // Card Border / Frame
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.lineWidth = 4;
    ctx.strokeRect(30, 30, 1140, 570);

    // Inner Glass Card
    ctx.fillStyle = 'rgba(20, 26, 40, 0.7)';
    ctx.beginPath();
    ctx.roundRect(60, 60, 1080, 510, 24);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 184, 0, 0.3)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Top Header: Branding
    ctx.fillStyle = '#ffb800';
    ctx.font = 'bold 28px "Outfit", system-ui, sans-serif';
    ctx.fillText('🔍 TYPE LIKE SHERLOCK', 100, 125);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.font = '500 20px system-ui, sans-serif';
    ctx.fillText(`MODE: ${mode}`, 920, 125);

    // Divider Line
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(100, 155);
    ctx.lineTo(1100, 155);
    ctx.stroke();

    // Player Avatar & Name Section
    ctx.font = '60px sans-serif';
    ctx.fillText(profile.avatar || '🕵️‍♂️', 100, 235);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 36px "Outfit", system-ui, sans-serif';
    ctx.fillText(profile.name || 'Player 1', 180, 225);

    ctx.fillStyle = '#00d2ff';
    ctx.font = '18px system-ui, sans-serif';
    ctx.fillText('MASTER TYPIST', 180, 252);

    // Main Stats Block - WPM
    ctx.fillStyle = '#ffb800';
    ctx.font = 'bold 110px "Outfit", system-ui, sans-serif';
    ctx.fillText(String(wpm), 100, 380);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.font = 'bold 24px system-ui, sans-serif';
    ctx.fillText('WORDS PER MINUTE', 100, 420);

    // Main Stats Block - Accuracy
    ctx.fillStyle = '#00e676';
    ctx.font = 'bold 110px "Outfit", system-ui, sans-serif';
    ctx.fillText(`${accuracy}%`, 500, 380);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.font = 'bold 24px system-ui, sans-serif';
    ctx.fillText('ACCURACY RATE', 500, 420);

    // Quote Box Footer
    ctx.fillStyle = 'rgba(10, 15, 25, 0.6)';
    ctx.beginPath();
    ctx.roundRect(100, 460loop ? 460 : 460, 1000, 80, 12);
    ctx.fill();

    ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.font = 'italic 20px Georgia, serif';
    const truncatedQuote = quote.length > 85 ? quote.slice(0, 85) + '…' : quote;
    ctx.fillText(`"${truncatedQuote}"`, 130, 508);

    return canvas;
  }

  function showShareModal(stats) {
    let modal = document.getElementById('share-card-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'share-card-modal';
      modal.className = 'modal-overlay';
      document.body.appendChild(modal);
    }

    modal.innerHTML = `
      <div class="modal-card share-card-content">
        <div class="modal-header">
          <h3>📸 Share Result Card</h3>
          <button type="button" class="modal-close-btn" id="share-modal-close">✕</button>
        </div>
        <div class="share-card-preview-container" id="share-card-preview"></div>
        <div class="share-modal-actions">
          <button type="button" class="hero-cta" id="share-download-btn">⬇️ Download Image</button>
          <button type="button" class="hero-cta secondary" id="share-copy-btn">📋 Copy Image</button>
        </div>
      </div>
    `;

    modal.classList.add('active');

    const previewContainer = document.getElementById('share-card-preview');
    const canvas = renderResultCard(stats);
    previewContainer.appendChild(canvas);

    document.getElementById('share-modal-close').onclick = () => {
      modal.classList.remove('active');
    };

    document.getElementById('share-download-btn').onclick = () => {
      const link = document.createElement('a');
      link.download = `type-like-sherlock-${stats.wpm || 0}wpm.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    };

    document.getElementById('share-copy-btn').onclick = async () => {
      try {
        canvas.toBlob(async (blob) => {
          if (blob && navigator.clipboard && navigator.clipboard.write) {
            await navigator.clipboard.write([
              new ClipboardItem({ 'image/png': blob })
            ]);
            alert('Image copied to clipboard!');
          } else {
            alert('Clipboard copy not supported by your browser. Use Download instead!');
          }
        });
      } catch (err) {
        alert('Could not copy image automatically. Use Download PNG!');
      }
    };
  }

  window.ShareCard = {
    render: renderResultCard,
    showModal: showShareModal
  };
})();
