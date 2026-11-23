/* Efectos de temporada (nieve, corazones...). Las FECHAS se cambian en el bloque SEASONS. */
(function () {
  // ===== 1) CONFIGURACIÓN =====
  // null = automático por fecha | 'navidad' | 'sanvalentin' | 'halloween' | 'off' (apagar todo)
  const FORCE_SEASON = null;

  // ¿CÓMO CAMBIAR LAS FECHAS?  Edita "desde" y "hasta" de cada temporada:
  //   'MM-DD'       -> se repite TODOS los años        (ej. '12-01' = 1 de diciembre)
  //   'AAAA-MM-DD'  -> solo ese año exacto             (ej. '2027-05-09')
  // Si "hasta" cae antes que "desde" (ej. '12-01' a '01-06') el rango cruza el cambio de año.
  // Ambas fechas se incluyen: el efecto está activo el día "desde" y el día "hasta".
  // activa: false  -> apaga esa temporada sin borrarla.
  const SEASONS = {
    navidad: {
      label: 'Nieve', icon: '❄️', activa: true,  desde: '19-11', hasta: '06-01',
      type: 'dot', colors: ['#ffffff', '#e0f2fe', '#f5f3ff'], colorsLight: ['#7ab8f5', '#9cc9f7', '#6aa7e8', '#b8d6fa'],
      count: 90, size: [1.5, 4.5], speed: [0.5, 1.4], sway: 0.5
    },
    sanvalentin: {
      label: 'Corazones', icon: '💜', activa: true, desde: '07-02', hasta: '15-02',
      type: 'glyph', glyphs: ['❤️', '💜', '💖', '💗'],
      count: 32, size: [14, 28], speed: [0.6, 1.4], sway: 0.8
    },
    halloween: {
      label: 'Halloween', icon: '🎃', activa: true, desde: '10-24', hasta: '11-01',
      type: 'glyph', glyphs: ['🎃', '🦇', '👻'],
      count: 24, size: [16, 30], speed: [0.6, 1.3], sway: 0.7
    }
    // Ejemplo para agregar otra:
    // dia_madre: { label: 'Flores', icon: '🌸', activa: true, desde: '2027-05-08', hasta: '2027-05-09', type: 'glyph',
    //              glyphs: ['🌸', '🌷', '💐'], count: 28, size: [14, 26], speed: [0.5, 1.2], sway: 0.8 },
  };

  // ===== 2) ¿QUÉ TEMPORADA ESTÁ ACTIVA HOY? =====
 function parseDate(str) {   // 'DD-MM' o 'DD-MM-AAAA'
  const p = String(str).trim().split('-').map(Number);
  return { d: p[0], m: p[1], y: p.length === 3 ? p[2] : null };
}
  function inRange(now, desde, hasta) {
    const a = parseDate(desde), b = parseDate(hasta);
    if (a.y && b.y) { // fechas con año: solo cuenta ese año
      const t = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
      return t >= new Date(a.y, a.m - 1, a.d).getTime() && t <= new Date(b.y, b.m - 1, b.d).getTime();
    }
    const v = (now.getMonth() + 1) * 100 + now.getDate();   // fechas que se repiten cada año
    const x = a.m * 100 + a.d, y = b.m * 100 + b.d;
    return x <= y ? (v >= x && v <= y) : (v >= x || v <= y);
  }
  function pickSeason() {
    // Para probar sin esperar a la fecha: abre la página con  ?tema=navidad  (o sanvalentin, halloween, off)
    const forced = new URLSearchParams(location.search).get('tema') || FORCE_SEASON;
    if (forced === 'off') return null;
    if (forced && SEASONS[forced]) return SEASONS[forced];
    const now = new Date();
    for (const k in SEASONS) if (SEASONS[k].activa !== false && inRange(now, SEASONS[k].desde, SEASONS[k].hasta)) return SEASONS[k];
    return null;
  }

  const S = pickSeason();
  if (!S) return; // fuera de temporada: no se carga nada

  const canvas = document.getElementById('seasonal-fx');
  const btn = document.getElementById('fx-toggle');
  const ctx = canvas.getContext('2d');
  const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let W = 0, H = 0, parts = [], raf = null, enabled = true;

  try { enabled = localStorage.getItem('zyra-fx') !== 'off'; } catch (e) {}
  if (reduceMotion) enabled = false; // respeta a quien pide menos animación

  const rnd = (a, b) => a + Math.random() * (b - a);
  const pick = arr => arr[Math.floor(Math.random() * arr.length)];
  const palette = () => (document.documentElement.classList.contains('dark') || !S.colorsLight) ? S.colors : S.colorsLight;

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth; H = window.innerHeight;
    canvas.width = W * dpr; canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const n = Math.round(S.count * Math.min(1, W / 1100 + 0.35)); // menos partículas en celular
    while (parts.length < n) parts.push(make(true));
    parts.length = n;
  }
  function make(initial) {
    return {
      x: rnd(0, W), y: initial ? rnd(0, H) : rnd(-40, -10),
      s: rnd(S.size[0], S.size[1]), v: rnd(S.speed[0], S.speed[1]),
      ph: rnd(0, Math.PI * 2),
      c: S.type === 'dot' ? pick(palette()) : null,
      g: S.type === 'glyph' ? pick(S.glyphs) : null
    };
  }
  function tick(t) {
    ctx.clearRect(0, 0, W, H);
    for (const p of parts) {
      p.y += p.v * (S.type === 'dot' ? 0.6 + p.s / 5 : 1);
      p.x += Math.sin(t / 1000 + p.ph) * S.sway;
      if (p.y > H + 40) Object.assign(p, make(false));
      if (p.x < -40) p.x = W + 20; else if (p.x > W + 40) p.x = -20;
      if (S.type === 'dot') {
        ctx.globalAlpha = 0.55 + 0.4 * (p.s / S.size[1]);
        ctx.fillStyle = p.c;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.s, 0, Math.PI * 2); ctx.fill();
      } else {
        ctx.globalAlpha = 0.9;
        ctx.font = p.s + 'px serif';
        ctx.fillText(p.g, p.x, p.y);
      }
    }
    ctx.globalAlpha = 1;
    raf = requestAnimationFrame(tick);
  }
  function start() { if (!raf) raf = requestAnimationFrame(tick); }
  function stop() { if (raf) cancelAnimationFrame(raf); raf = null; ctx.clearRect(0, 0, W, H); }
  function paintButton() {
    btn.textContent = S.icon + ' ' + S.label + ': ' + (enabled ? 'activado' : 'desactivado');
    btn.setAttribute('aria-pressed', String(enabled));
  }
  function apply() { enabled ? start() : stop(); paintButton(); }

  btn.classList.remove('hidden'); btn.classList.add('inline-flex');
  btn.addEventListener('click', function () {
    enabled = !enabled;
    try { localStorage.setItem('zyra-fx', enabled ? 'on' : 'off'); } catch (e) {}
    apply();
  });
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) { if (raf) { cancelAnimationFrame(raf); raf = null; } } else if (enabled) start();
  });
  window.addEventListener('resize', resize);

  window.addEventListener('zyra-themechange', function () { parts.forEach(function (p) { if (S.type === 'dot') p.c = pick(palette()); }); });
  resize(); apply();
})();
