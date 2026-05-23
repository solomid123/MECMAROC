/* =========================================================
   MecMaroc — Engineering Simulation & Operations Cockpit
   ========================================================= */
(() => {
  const FRAME_COUNT = 300;
  const FRAME_PATH  = (i) => `/CAD_frames/ezgif-frame-${String(i).padStart(3, '0')}.jpg`;

  const canvas = document.getElementById('sequence');
  const track  = document.querySelector('.hero-track');
  const sticky = document.querySelector('.hero-sticky');

  const HAS_SEQUENCE = !!(canvas && track && sticky);

  const ctx = HAS_SEQUENCE ? canvas.getContext('2d', { alpha: true }) : null;
  const copy   = document.querySelector('.hero-copy');
  const story  = document.querySelector('.hero-story');
  const storyLines = []; // Populated dynamically in updateServiceContent
  const heroCta = document.querySelector('.hero-cta-panel');
  const cards  = document.querySelector('.float-cards');
  const phaseValue = document.getElementById('phaseValue');
  const phaseFill  = document.getElementById('phaseFill');

  // Active module states
  let activeService = 'cad';
  let isFaultSimulated = false;

  // Real-time Telemetry metrics for Digital Twin (MCO)
  let currentRpm = 1500;
  let currentTemp = 62.4;
  let currentVib = 2.14;
  let currentHealth = 98.2;
  let telemetryTime = 0;

  // Global Config Matrix
  const SERVICES_DATA = {
    cad: {
      eyebrow: "CONCEPTION CAO — DÉFILÉ TECHNIQUE",
      title: "La modélisation<br/><em>géométrique et cinématique</em> de haute précision.",
      lede: "Faites défiler pour voir notre workflow de modélisation CAO pas-à-pas — de l'esquisse volumique à la validation cinématique de l'assemblage.",
      filter: "none",
      scrim: 0,
      story: {
        eyebrow: "— Dossier technique",
        lines: [
          { show: 0.12, num: "01", text: "Esquisse de base et contraintes d'implantation." },
          { show: 0.18, num: "02", text: "Modélisation des surfaces gauches et cinématiques." },
          { show: 0.24, num: "03", text: "Tolérancement ISO-GPS pour la fabricabilité." },
          { show: 0.30, num: "04", text: "Validation complète de l'assemblage 3D." }
        ]
      },
      cards: [
        {
          idx: "01",
          tag: "PARAMÉTRIQUE",
          h3: "Modélisation CAO",
          p: "Modélisation paramétrique sous arbres de création stricts — assurant des modifications ultérieures instantanées sans crash géométrique.",
          footer: "Catia · SolidWorks · Creo"
        },
        {
          idx: "02",
          tag: "PRÉCISION",
          h3: "Tolérancement ISO",
          p: "Intégration systématique du tolérancement géométrique ISO-GPS (chaînes de cotes 3D) pour garantir une fabricabilité sans retouche.",
          footer: "Normes ISO 1101 · ISO 8015"
        },
        {
          idx: "03",
          tag: "ASSEMBLAGE",
          h3: "Gestion des Jeux",
          p: "Vérification dynamique des jeux, détection des interférences en mouvement et simulation cinématique des sous-ensembles complets.",
          footer: "STEP · IGES · Nomenclatures"
        }
      ],
      cta: {
        eyebrow: "— Lancer votre étude",
        h2: "Prêt à concrétiser votre<br/><em>prochain modèle CAO</em> ?",
        p: "De l'idée brute au dossier de fabrication certifié — parlons de vos géométries complexes.",
        btnPrimary: "Demander un devis →",
        btnGhost: "Parler à un ingénieur",
        btnUrl: "#contact"
      }
    },
    fea: {
      eyebrow: "CALCUL MULTI-PHYSIQUE — DIAGNOSTIC FEA",
      title: "La validation par<br/><em>simulation numérique</em> structurelle et thermique.",
      lede: "Faites défiler pour analyser les concentrations de contraintes, les modes propres de vibration et les gradients thermiques sous charge opérationnelle.",
      filter: "hue-rotate(240deg) saturate(1.8) contrast(1.1) brightness(1.15)",
      scrim: 0.2,
      story: {
        eyebrow: "— Résolution structurelle",
        lines: [
          { show: 0.12, num: "01", text: "Génération d'un maillage quadratique de second ordre." },
          { show: 0.18, num: "02", text: "Définition des chargements physiques et conditions limites." },
          { show: 0.24, num: "03", text: "Résolution non-linéaire des contacts et déformations." },
          { show: 0.30, num: "04", text: "Calcul du coefficient de sécurité et fatigue matière." }
        ]
      },
      cards: [
        {
          idx: "01",
          tag: "STATIQUE",
          h3: "Analyse Statique",
          p: "Calcul précis des contraintes équivalentes de Von Mises et des gradients de déplacement sous forces maximales.",
          footer: "Ansys · Nastran · Abaqus"
        },
        {
          idx: "02",
          tag: "VIBRATIONS",
          h3: "Analyse Modale",
          p: "Recherche des fréquences propres et des déformées associées pour écarter tout risque de résonance destructive.",
          footer: "Modes 1 à 6 · Participation de Masse"
        },
        {
          idx: "03",
          tag: "THERMIQUE",
          h3: "Transfert Thermique",
          p: "Couplage fluide-structure et gradients thermiques transitoires avec conduction, convection et rayonnement.",
          footer: "Contraintes Thermo-mécaniques"
        }
      ],
      cta: {
        eyebrow: "— Sécuriser votre produit",
        h2: "Sécurisez la tenue de vos<br/><em>systèmes critiques</em> ?",
        p: "Éliminez les risques de rupture en service et optimisez la matière grâce à nos simulations avancées.",
        btnPrimary: "Calculer un système →",
        btnGhost: "Consulter un expert",
        btnUrl: "/contact.html"
      }
    },
    mco: {
      eyebrow: "JUMEAU NUMÉRIQUE — MONITORING IOT",
      title: "Le maintien en condition<br/><em>opérationnelle</em> piloté par la donnée.",
      lede: "Faites défiler pour explorer le monitoring vibratoire et thermique du système en temps réel, couplé à nos algorithmes de prédiction d'usure.",
      filter: "sepia(0.3) hue-rotate(190deg) saturate(2.2) contrast(1.1)",
      scrim: 0.3,
      story: {
        eyebrow: "— Télémétrie opérationnelle",
        lines: [
          { show: 0.12, num: "01", text: "Collecte haute fréquence de l'accélérométrie palier." },
          { show: 0.18, num: "02", text: "Traitement du signal par transformée de Fourier (FFT)." },
          { show: 0.24, num: "03", text: "Calcul en continu du taux de dégradation vibratoire." },
          { show: 0.30, num: "04", text: "Estimation de la durée de vie résiduelle (RUL)." }
        ]
      },
      cards: [
        {
          idx: "01",
          tag: "IOT / TELEMETRY",
          h3: "Flux IoT Continu",
          p: "Ingestion directe de flux MQTT haute fréquence mesurant accélérométrie triaxiale et température de service.",
          footer: "MQTT · Apache Kafka · Capteurs HF"
        },
        {
          idx: "02",
          tag: "IA INDUS",
          h3: "Durée de Vie RUL",
          p: "Modèles d'estimation pronostique par intelligence artificielle prédisant le Remaining Useful Life avant incident.",
          footer: "RUL Prediction · Anomaly Detection"
        },
        {
          idx: "03",
          tag: "PRÉVENTIF",
          h3: "Planification GMAO",
          p: "Déclenchement automatisé des ordres d'intervention ciblés et approvisionnement des pièces de rechange.",
          footer: "Intégration CMMS · GMAO Cloud"
        }
      ],
      cta: {
        eyebrow: "— Optimiser votre disponibilité",
        h2: "Zéro panne imprévue sur<br/><em>vos lignes de production</em> ?",
        p: "Déployez un jumeau numérique prédictif et passez d'une maintenance curative à une fiabilité totale.",
        btnPrimary: "Planifier une démo →",
        btnGhost: "Étudier l'architecture",
        btnUrl: "/contact.html"
      }
    }
  };

  if (HAS_SEQUENCE) { initSequence(); }
  initReveal();

  function initSequence() {

  /* -----------------------------
     Canvas sizing (DPR-aware)
     ----------------------------- */
  const DPR = Math.min(window.devicePixelRatio || 1, 2);
  function resize() {
    const w = sticky.clientWidth, h = sticky.clientHeight;
    canvas.width  = Math.floor(w * DPR);
    canvas.height = Math.floor(h * DPR);
    canvas.style.width  = w + 'px';
    canvas.style.height = h + 'px';
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    draw(currentFrame | 0);
  }
  window.addEventListener('resize', resize);

  /* -----------------------------
     Image loading (progressive)
     ----------------------------- */
  const images = new Array(FRAME_COUNT);
  let loaded = 0;

  function loadImage(i) {
    return new Promise((res) => {
      const img = new Image();
      img.decoding = 'async';
      img.onload  = () => { images[i] = img; loaded++; res(); };
      img.onerror = () => { loaded++; res(); };
      img.src = FRAME_PATH(i + 1);
    });
  }

  // Prioritise: first frame, then every 4th to give coverage, then fill the rest.
  async function preload() {
    await loadImage(0);
    draw(0);

    const queue = [];
    for (let i = 4; i < FRAME_COUNT; i += 4) queue.push(i);
    for (let i = 1; i < FRAME_COUNT; i++) if (i % 4 !== 0) queue.push(i);

    const CONCURRENCY = 8;
    let idx = 0;
    const workers = Array.from({ length: CONCURRENCY }, async () => {
      while (idx < queue.length) {
        const n = queue[idx++];
        await loadImage(n);
      }
    });
    await Promise.all(workers);
  }

  /* -----------------------------
     Draw a frame with 'cover' fit
     ----------------------------- */
  function draw(i) {
    let img = images[i];
    if (!img) {
      for (let k = i; k >= 0; k--) { if (images[k]) { img = images[k]; break; } }
      if (!img) for (let k = i; k < FRAME_COUNT; k++) { if (images[k]) { img = images[k]; break; } }
      if (!img) return;
    }

    const cw = sticky.clientWidth, ch = sticky.clientHeight;
    ctx.clearRect(0, 0, cw, ch);

    const iw = img.naturalWidth, ih = img.naturalHeight;
    const aspect = cw / ch;
    const isPortrait = aspect < 0.85;

    const scale = isPortrait
      ? Math.min(cw / iw, ch / ih) * 1.0
      : Math.max(cw / iw, ch / ih) * 1.04;
    const w = iw * scale, h = ih * scale;
    const x = (cw - w) / 2 + parallaxX;
    const y = (ch - h) / 2 + parallaxY;

    ctx.drawImage(img, x, y, w, h);

    const isLight = document.documentElement.classList.contains('light-mode');
    if (isLight) {
      // 100% clean exit: completely bypasses all vignetting overlays and gray/white corner gradients
      // in light mode to keep the 3D grid and wireframe 100% razor-sharp with absolutely zero fogginess.
      return;
    }

    const themeColor = '10,11,13'; // Always charcoal for cinemorphic borders in dark mode
    const innerRadius = Math.min(cw,ch)*0.35;
    const outerRadius = Math.max(cw,ch)*0.8;
    const grad = ctx.createRadialGradient(cw/2, ch/2, innerRadius, cw/2, ch/2, outerRadius);
    grad.addColorStop(0, `rgba(${themeColor},0)`);
    grad.addColorStop(1, `rgba(${themeColor},0.85)`);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, cw, ch);

    const topG = ctx.createLinearGradient(0, 0, 0, ch*0.25);
    topG.addColorStop(0, `rgba(${themeColor},0.65)`);
    topG.addColorStop(1, `rgba(${themeColor},0)`);
    ctx.fillStyle = topG; ctx.fillRect(0, 0, cw, ch*0.25);

    const botG = ctx.createLinearGradient(0, ch*0.72, 0, ch);
    botG.addColorStop(0, `rgba(${themeColor},0)`);
    botG.addColorStop(1, `rgba(${themeColor},0.9)`);
    ctx.fillStyle = botG; ctx.fillRect(0, ch*0.72, cw, ch*0.28);

    const activeScrim = SERVICES_DATA[activeService]?.scrim || 0;
    const finalScrim = Math.max(scrim, activeScrim);

    if (finalScrim > 0.001) {
      const wash = 0.42 * finalScrim;
      const sg = ctx.createRadialGradient(cw/2, ch*0.55, Math.min(cw,ch)*0.25,
                                          cw/2, ch*0.55, Math.max(cw,ch)*0.75);
      sg.addColorStop(0, `rgba(${themeColor},${(wash*0.4).toFixed(3)})`);
      sg.addColorStop(1, `rgba(${themeColor},${(wash).toFixed(3)})`);
      ctx.fillStyle = sg;
      ctx.fillRect(0, 0, cw, ch);
    }
  }

  /* -----------------------------
     Scroll progress → frame (lerped)
     ----------------------------- */
  let targetFrame  = 0;
  let currentFrame = 0;
  let parallaxX = 0, parallaxY = 0;
  let tParX = 0, tParY = 0;
  let scrimTarget = 0, scrim = 0;

  function onScroll() {
    const rect = track.getBoundingClientRect();
    const vh   = window.innerHeight;
    const total = rect.height - vh;
    const scrolled = Math.min(Math.max(-rect.top, 0), total);
    const p = total > 0 ? scrolled / total : 0;

    targetFrame = p * (FRAME_COUNT - 1);

    tParX = (p - 0.5) * 30;
    tParY = (p - 0.5) * -18;

    const d = Math.max(0, 1 - Math.abs(p - 0.5) / 0.22);
    scrimTarget = Math.min(1, d);

    // Dynamic Phase labeling based on active service
    const phaseIdx = Math.round(p * (FRAME_COUNT - 1)) + 1;
    let label = 'CAO · ESQUISSE';

    if (activeService === 'cad') {
      if (p > 0.20 && p <= 0.45) label = 'SQUELETTE · FILAIRE';
      else if (p > 0.45 && p <= 0.70) label = 'VOLUMIQUE · SOLIDE';
      else if (p > 0.70 && p <= 0.85) label = 'ASSEMBLAGE · CINÉMATIQUE';
      else if (p > 0.85) label = 'DESSIN · TERMINÉ';
    } else if (activeService === 'fea') {
      label = 'FEA · MAILLAGE TÉTRA';
      if (p > 0.20 && p <= 0.45) label = 'FEA · APPLIC. VECTEURS';
      else if (p > 0.45 && p <= 0.70) label = 'FEA · CONVERG. SOLVEUR';
      else if (p > 0.70 && p <= 0.85) label = 'FEA · MODES VIBRATOIRES';
      else if (p > 0.85) label = 'FEA · RAPPORT CERTIFIÉ';
    } else if (activeService === 'mco') {
      label = 'MCO · FLUX TÉLÉMÉTRIE';
      if (p > 0.20 && p <= 0.45) label = 'MCO · ANALYSE SPECTRE FFT';
      
      if (isFaultSimulated) {
        if (p > 0.45 && p <= 0.70) label = 'MCO · DÉFAUT ROULEMENT';
        else if (p > 0.70 && p <= 0.85) label = 'MCO · DÉGRADA. ACCÉLÉRÉE';
        else if (p > 0.85) label = 'MCO · RUL 24.2% CRITIQUE';
      } else {
        if (p > 0.45 && p <= 0.70) label = 'MCO · CALCUL TAUX USURE';
        else if (p > 0.70 && p <= 0.85) label = 'MCO · PRÉDICTION DE VIE RUL';
        else if (p > 0.85) label = 'MCO · OPÉRATIONNEL ZÉRO PANNE';
      }
    }

    if (phaseValue) phaseValue.textContent = `${label} · ${String(phaseIdx).padStart(3,'0')}`;
    if (phaseFill) phaseFill.style.width = (p * 100).toFixed(1) + '%';

    // ACT 1 — Hero intro copy fade
    const copyFade = Math.max(0, 1 - p / 0.11);
    if (copy) {
      copy.style.opacity = copyFade.toFixed(3);
      copy.style.transform = `translateY(${(1 - copyFade) * -30}px)`;
    }

    // ACT 2 — Narrative story lines fade
    if (story) {
      const storyOn = p > 0.12 && p < 0.36;
      story.classList.toggle('show', storyOn);
      for (const li of storyLines) {
        const threshold = parseFloat(li.dataset.show) || 0;
        li.classList.toggle('in', storyOn && p >= threshold);
      }
    }

    // ACT 3 — Floating glass cards reveal
    if (cards) {
      const cardsOn = p > 0.40 && p < 0.68;
      cards.classList.toggle('show', cardsOn);
    }

    // ACT 4 — Final CTA reveal
    if (heroCta) {
      heroCta.classList.toggle('show', p > 0.80);
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });

  /* -----------------------------
     Switcher Content Update Engine
     ----------------------------- */
  function updateServiceContent(serviceId) {
    activeService = serviceId;
    const data = SERVICES_DATA[serviceId];
    if (!data) return;

    // Apply canvas GPU CSS filter
    canvas.style.filter = data.filter;

    // Update intro copy
    if (copy) {
      const introEyebrow = copy.querySelector('.eyebrow');
      const introH1 = copy.querySelector('h1');
      const introLede = copy.querySelector('.lede');
      if (introEyebrow) introEyebrow.textContent = data.eyebrow;
      if (introH1) introH1.innerHTML = data.title;
      if (introLede) introLede.textContent = data.lede;
    }

    // Update story lines
    if (story) {
      const storyEyebrow = story.querySelector('.eyebrow');
      if (storyEyebrow) storyEyebrow.textContent = data.story.eyebrow;

      const linesContainer = story.querySelector('.story-lines');
      if (linesContainer) {
        linesContainer.innerHTML = '';
        data.story.lines.forEach((line) => {
          const li = document.createElement('li');
          li.setAttribute('data-show', line.show);
          li.innerHTML = `<span class="sl-num">${line.num}</span><span class="sl-text">${line.text}</span>`;
          linesContainer.appendChild(li);
        });
        
        // Re-cache active story lines
        storyLines.length = 0;
        story.querySelectorAll('.story-lines li').forEach(el => storyLines.push(el));
      }
    }

    // Update floating glass cards
    if (cards) {
      cards.innerHTML = '';
      data.cards.forEach((card) => {
        const article = document.createElement('article');
        article.className = 'fcard glass glass-solid';
        article.setAttribute('data-card', card.idx === '01' ? 'cad' : (card.idx === '02' ? 'fea' : 'pm'));
        
        let extraContent = '';
        if (serviceId === 'mco') {
          if (card.idx === '01') {
            extraContent = `
              <div class="mco-telemetry-panel">
                <header class="mco-header">
                  <span class="mco-indicator pulse-blue" id="mco-pulse-light"></span>
                  <span class="mono" id="mco-feed-label">FLUX TÉLÉMÉTRIE VBR-48</span>
                </header>
                <div class="mco-metrics-grid">
                  <div class="mco-metric-item">
                    <span class="mco-label">Vitesse</span>
                    <span class="mco-val mono" id="mco-rpm-val">1500 <span class="mco-unit">tr/min</span></span>
                  </div>
                  <div class="mco-metric-item">
                    <span class="mco-label">Température</span>
                    <span class="mco-val mono" id="mco-temp-val">62.4 <span class="mco-unit">°C</span></span>
                  </div>
                  <div class="mco-metric-item">
                    <span class="mco-label">Vibrations</span>
                    <span class="mco-val mono" id="mco-vib-val">2.14 <span class="mco-unit">mm/s</span></span>
                  </div>
                </div>
                <div class="mco-graph-container">
                  <svg class="mco-svg-graph" viewBox="0 0 200 40">
                    <path class="mco-graph-bg" d="M0,20 Q25,20 50,20 T100,20 T150,20 T200,20" />
                    <path class="mco-graph-wave" id="mco-wave-path" d="M0,20 Q25,20 50,20 T100,20 T150,20 T200,20" />
                  </svg>
                </div>
              </div>
            `;
          } else if (card.idx === '02') {
            extraContent = `
              <div class="mco-health-panel">
                <div class="health-ring-container">
                  <svg class="health-circle-svg" viewBox="0 0 36 36">
                    <path class="health-circle-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                    <path class="health-circle-fill" id="mco-health-fill" stroke-dasharray="98, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                  </svg>
                  <div class="health-value-box">
                    <span class="health-percent mono" id="mco-health-percent">98.2%</span>
                    <span class="health-label">SANTÉ (RUL)</span>
                  </div>
                </div>
              </div>
            `;
          } else if (card.idx === '03') {
            extraContent = `
              <div class="btn-fault-sim-container" style="margin-top: 16px;">
                <button id="btn-fault-sim" class="btn-fault-sim" aria-pressed="false">
                  <span class="fault-icon">⚡</span> SIMULER UNE ANOMALIE
                </button>
              </div>
            `;
          }
        }

        article.innerHTML = `
          <header>
            <span class="fcard-idx">${card.idx}</span>
            <span class="fcard-tag">${card.tag}</span>
          </header>
          <h3>${card.h3}</h3>
          <p>${card.p}</p>
          ${extraContent}
          <footer class="mono">${card.footer}</footer>
        `;
        cards.appendChild(article);
      });

      // Bind dynamic fault simulation button inside MCO
      if (serviceId === 'mco') {
        bindFaultSimBtn();
      }
    }

    // Update final CTA
    if (heroCta) {
      const ctaEyebrow = heroCta.querySelector('.eyebrow');
      const ctaH2 = heroCta.querySelector('h2');
      const ctaP = heroCta.querySelector('p');
      const ctaButtons = heroCta.querySelector('.hero-cta-row');
      if (ctaEyebrow) ctaEyebrow.textContent = data.cta.eyebrow;
      if (ctaH2) ctaH2.innerHTML = data.cta.h2;
      if (ctaP) ctaP.textContent = data.cta.p;
      if (ctaButtons) {
        ctaButtons.innerHTML = `
          <a href="${data.cta.btnUrl || '#contact'}" class="btn primary">${data.cta.btnPrimary}</a>
          <a href="mailto:info@mecmaroc.com" class="btn ghost">${data.cta.btnGhost}</a>
        `;
      }
    }

    // Toggle active classes on selector buttons
    document.querySelectorAll('.switcher-btn').forEach((btn) => {
      const isActive = btn.dataset.service === serviceId;
      btn.classList.toggle('active', isActive);
      btn.setAttribute('aria-selected', isActive ? 'true' : 'false');
    });

    // Update scroll annotations instantly
    onScroll();
  }

  // Bind Selector Tab Buttons click triggers
  document.querySelectorAll('.switcher-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const serviceId = btn.dataset.service;
      if (serviceId === activeService) return;

      // Add fade out animation state
      sticky.classList.add('is-switching');

      setTimeout(() => {
        // Toggle HUD layers classes
        sticky.classList.remove('active-fea', 'active-mco');
        if (serviceId === 'fea') sticky.classList.add('active-fea');
        if (serviceId === 'mco') sticky.classList.add('active-mco');

        updateServiceContent(serviceId);

        // Clear simulation states if switching away from MCO
        if (serviceId !== 'mco' && isFaultSimulated) {
          resetFaultState();
        }

        setTimeout(() => {
          sticky.classList.remove('is-switching');
        }, 50);

      }, 300);
    });
  });

  function bindFaultSimBtn() {
    const btn = document.getElementById('btn-fault-sim');
    if (!btn) return;
    
    btn.setAttribute('aria-pressed', isFaultSimulated ? 'true' : 'false');
    if (isFaultSimulated) {
      btn.innerHTML = `<span class="fault-icon">⚡</span> RÉINITIALISER L'ANOMALIE`;
      sticky.classList.add('critical-fault-active');
    } else {
      btn.innerHTML = `<span class="fault-icon">⚡</span> SIMULER UNE ANOMALIE`;
      sticky.classList.remove('critical-fault-active');
    }

    btn.addEventListener('click', () => {
      isFaultSimulated = !isFaultSimulated;
      btn.setAttribute('aria-pressed', isFaultSimulated ? 'true' : 'false');
      
      sticky.classList.toggle('critical-fault-active', isFaultSimulated);
      
      if (isFaultSimulated) {
        btn.innerHTML = `<span class="fault-icon">⚡</span> RÉINITIALISER L'ANOMALIE`;
      } else {
        btn.innerHTML = `<span class="fault-icon">⚡</span> SIMULER UNE ANOMALIE`;
      }
      
      onScroll(); // Redraw scroll phase label instantly
    });
  }

  function resetFaultState() {
    isFaultSimulated = false;
    sticky.classList.remove('critical-fault-active');
    const btn = document.getElementById('btn-fault-sim');
    if (btn) {
      btn.setAttribute('aria-pressed', 'false');
      btn.innerHTML = `<span class="fault-icon">⚡</span> SIMULER UNE ANOMALIE`;
    }
  }

  /* -----------------------------
     Real-time IoT Telemetry Loop (Digital Twin)
     ----------------------------- */
  function drawLiveWave(time) {
    const path = document.getElementById('mco-wave-path');
    if (!path) return;
    
    // Wave parameters: high amplitude and frequency during fault states
    let amp = isFaultSimulated ? 14 : 4.5;
    let freq = isFaultSimulated ? 0.08 : 0.035;
    let speed = isFaultSimulated ? 0.28 : 0.12;
    
    let d = "M0,20";
    for (let x = 0; x <= 200; x += 10) {
      let noise = (Math.sin(x * 0.5 + time * 0.5) * (isFaultSimulated ? 2.5 : 0.4));
      let y = 20 + Math.sin(x * freq + time * speed) * amp + noise;
      d += ` L${x},${y.toFixed(2)}`;
    }
    path.setAttribute('d', d);
  }

  function telemetryTick() {
    telemetryTime += 1;

    // Normal operation vs Critical fault thresholds
    let targetRpm = isFaultSimulated 
      ? (1750 + Math.sin(telemetryTime * 0.15) * 45 + Math.random() * 20) 
      : (1496 + Math.sin(telemetryTime * 0.04) * 6 + Math.random() * 2);
      
    let targetTemp = isFaultSimulated ? 94.2 : 62.4;
    
    let targetVib = isFaultSimulated 
      ? (8.42 + Math.sin(telemetryTime * 0.18) * 0.4 + Math.random() * 0.1) 
      : (2.14 + Math.sin(telemetryTime * 0.05) * 0.06 + Math.random() * 0.02);
      
    let targetHealth = isFaultSimulated ? 24.2 : 98.2;

    // Smooth organic transitions (lerps)
    currentRpm += (targetRpm - currentRpm) * 0.12;
    currentTemp += (targetTemp - currentTemp) * (isFaultSimulated ? 0.015 : 0.08); // Temperature rises slowly
    currentVib += (targetVib - currentVib) * 0.2;
    currentHealth += (targetHealth - currentHealth) * 0.06;

    // Direct DOM text updates
    const rpmValEl = document.getElementById('mco-rpm-val');
    const tempValEl = document.getElementById('mco-temp-val');
    const vibValEl = document.getElementById('mco-vib-val');
    const healthPercentEl = document.getElementById('mco-health-percent');
    const healthFillEl = document.getElementById('mco-health-fill');

    if (rpmValEl) rpmValEl.innerHTML = `${Math.round(currentRpm)} <span class="mco-unit">tr/min</span>`;
    if (tempValEl) tempValEl.innerHTML = `${currentTemp.toFixed(1)} <span class="mco-unit">°C</span>`;
    if (vibValEl) vibValEl.innerHTML = `${currentVib.toFixed(2)} <span class="mco-unit">mm/s</span>`;
    if (healthPercentEl) healthPercentEl.textContent = `${currentHealth.toFixed(1)}%`;
    if (healthFillEl) {
      // Circle dasharray circumference is 100
      healthFillEl.setAttribute('stroke-dasharray', `${Math.round(currentHealth)}, 100`);
    }

    drawLiveWave(telemetryTime);
  }

  /* -----------------------------
     RAF loop — lerp for buttery smoothness
     ----------------------------- */
  function tick() {
    currentFrame += (targetFrame - currentFrame) * 0.12;
    parallaxX    += (tParX - parallaxX) * 0.08;
    parallaxY    += (tParY - parallaxY) * 0.08;
    scrim        += (scrimTarget - scrim) * 0.1;

    const idx = Math.max(0, Math.min(FRAME_COUNT - 1, Math.round(currentFrame)));
    draw(idx);

    // Toggle hotspots visibility for FEA layer based on exact frame range 150-190
    const hudFeaLayer = document.querySelector('.hud-fea-layer');
    if (hudFeaLayer) {
      const frameNum = idx + 1; // 1-indexed to match displayed values
      const showHotspots = (activeService === 'fea' && frameNum >= 150 && frameNum <= 190);
      hudFeaLayer.classList.toggle('show-hotspots', showHotspots);
    }

    // Trigger telemetry animation when active
    if (activeService === 'mco') {
      telemetryTick();
    }

    requestAnimationFrame(tick);
  }

  /* -----------------------------
     Boot
     ----------------------------- */
  // Pre-initialize CAD lines for story array
  story.querySelectorAll('.story-lines li').forEach(el => storyLines.push(el));
  
  resize();
  onScroll();
  requestAnimationFrame(tick);
  preload();

  } // end initSequence

  /* -----------------------------
     Reveal on scroll for sections (runs on every page)
     ----------------------------- */
  function initReveal() {
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          e.target.style.opacity = 1;
          e.target.style.transform = 'translateY(0)';
          io.unobserve(e.target);
        }
      }
    }, { threshold: 0.12 });

    document.querySelectorAll('.section, .clients, .cap, .m, .process li, .tile, .page-hero, .page-body > *')
      .forEach((el) => {
        el.style.opacity = 0;
        el.style.transform = 'translateY(24px)';
        el.style.transition = 'opacity .9s cubic-bezier(.2,.7,.2,1), transform .9s cubic-bezier(.2,.7,.2,1)';
        io.observe(el);
      });
  }
})();
