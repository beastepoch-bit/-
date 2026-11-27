// THE FILM: "Мяу-тренд". Seven shots (Shots.film); every frame is a pure function of t.
// Captions are comic-style lines at the top; every cut is on a bar line from score.js.
(function () {
  const U = globalThis.U, G = globalThis.G, Ch = globalThis.Ch, Shots = globalThis.Shots, S = globalThis.SCORE, Studio = globalThis.Studio;
  const { clamp, lerp, ease } = U;
  const { T, ev, BEAT, clock } = S;
  const W = G.W, H = G.H, SAFE = G.SAFE;
  const INK = '#2B2233';

  // ---------- the cast (original characters) ----------
  const CAST = {
    liya: { outfit: 'hoodie', shirt: '#F4C542', bottoms: 'skirt', shorts: '#4E5D94', skin: '#F2CDB0', hair: '#B5462E', hairStyle: 'long', freckles: true, shoes: '#FFFFFF', build: 'slim', sleeves: 'long' },
    ars: { outfit: 'shirt', shirt: '#6FBF9A', bottoms: 'pants', pants: '#3B3F58', skin: '#E9BE9C', hair: '#E6C36A', hairStyle: 'quiff', shoes: '#2A2A2A', build: 'regular', sleeves: 'long' },
  };
  globalThis.CAST = CAST;

  // ---------- helpers ----------
  const beatBob = (t, amp = 10) => Math.abs(Math.sin(Math.PI * clock.beatPos(t))) * amp;
  const HEAD = -404; // head centre above the feet (stand, s = 1)
  function catEars(ctx, x, y, s, wig = 0) {
    for (const sd of [-1, 1]) {
      ctx.save(); ctx.translate(x + sd * 52 * s, y - 62 * s); ctx.rotate(sd * (0.28 + wig));
      G.poly(ctx, [[-30 * s, 14 * s], [0, -58 * s], [30 * s, 14 * s]], { fill: '#2B2233', lw: 4, seed: 90 + sd, step: 12 });
      G.poly(ctx, [[-16 * s, 6 * s], [0, -34 * s], [16 * s, 6 * s]], { fill: '#F7A1C0', lw: 0, seed: 92 + sd, step: 10 });
      ctx.restore();
    }
    G.line(ctx, [[x - 64 * s, y - 52 * s], [x, y - 74 * s], [x + 64 * s, y - 52 * s]], { color: '#2B2233', lw: 9 * s, seed: 95 });
  }
  function tears(ctx, x, y, s, t) { // two streams falling from the eyes
    for (const sd of [-1, 1]) for (let k = 0; k < 4; k++) {
      const u = ((t * 2.2 + k / 4) % 1);
      G.ellipse(ctx, x + sd * (34 + u * 70) * s, y + (10 + u * 120 + u * u * 80) * s, 11 * s, 15 * s, { fill: '#8FD3F4', lw: 2.5, seed: 200 + k + sd * 10 });
    }
  }
  function sparkle(ctx, x, y, r, rot = 0, col = '#FFFFFF') {
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.fillStyle = col;
    ctx.beginPath(); for (let i = 0; i < 8; i++) { const a = (i * Math.PI) / 4, rr = i % 2 ? r * 0.25 : r; ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); } ctx.closePath(); ctx.fill(); ctx.restore();
  }
  function heart(ctx, x, y, s, col = '#FF5C93', rot = 0) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
    ctx.beginPath(); ctx.moveTo(0, 30); ctx.bezierCurveTo(-60, -10, -30, -60, 0, -28); ctx.bezierCurveTo(30, -60, 60, -10, 0, 30); ctx.closePath();
    ctx.fillStyle = col; ctx.fill(); ctx.lineWidth = 4 / s; ctx.strokeStyle = INK; ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,0.6)'; ctx.beginPath(); ctx.ellipse(-18, -22, 8, 5, -0.6, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }
  function gloom(ctx, x, y, s) { for (let k = 0; k < 6; k++) G.line(ctx, [[x - 60 * s + k * 24 * s, y], [x - 60 * s + k * 24 * s, y + 90 * s]], { color: '#5B5470', lw: 6, seed: 300 + k }); }
  function speedLines(ctx, cx, cy, t, col = 'rgba(43,34,51,0.18)') {
    for (let i = 0; i < 40; i++) {
      const a = (i / 40) * Math.PI * 2 + G.rnd(i, 3) * 0.1, r0 = 520 + G.rnd(i, 1) * 160 + Math.sin(t * 30 + i) * 20;
      ctx.strokeStyle = col; ctx.lineWidth = 6 + G.rnd(i, 2) * 8; ctx.beginPath();
      ctx.moveTo(cx + Math.cos(a) * r0, cy + Math.sin(a) * r0); ctx.lineTo(cx + Math.cos(a) * 1600, cy + Math.sin(a) * 1600); ctx.stroke();
    }
  }
  function paperBg(ctx, col) { ctx.fillStyle = col; ctx.fillRect(-200, -200, W + 400, H + 400); }

  // the dialogue caption at the top, like the panel text of a comic
  function caption(ctx, t) {
    const L = S.lines.filter((l) => t >= l.t && t < l.end).pop();
    if (!L) return;
    const a = t - L.t, pop = ease.outBack(clamp(a / 0.22), 2.2);
    const rows = L.text.split('\n');
    const shout = /!!!/.test(L.text);
    let size = 68;
    const y0 = SAFE.y + 70;
    ctx.save(); ctx.translate(W / 2 - 40, y0 + 60); ctx.scale(pop, pop);
    if (shout) ctx.translate(Math.sin(t * 60) * 4, Math.cos(t * 47) * 3);
    let tw = Math.max(...rows.map((r) => G.measure(ctx, r, size, 'Caveat', 700)));
    if (tw > SAFE.w - 160) { size = size * (SAFE.w - 160) / tw; tw = SAFE.w - 160; }
    const wmax = tw + 90;
    const h = 70 + rows.length * size * 1.05;
    G.rrect(ctx, -wmax / 2, -60, wmax, h, 26, { fill: 'rgba(255,255,255,0.92)', lw: 4, seed: 5 });
    G.rrect(ctx, -wmax / 2 + 24, -86, L.who === 'Она' ? 120 : 100, 48, 14, { fill: L.who === 'Она' ? '#FF8FB4' : '#7FCBA6', lw: 3.5, seed: 6 });
    G.text(ctx, L.who + ':', -wmax / 2 + 38, -50, { size: 38, fam: 'Caveat', weight: 700, color: INK });
    rows.forEach((r, i) => G.text(ctx, r, 0, 10 + i * size * 1.05, { size, fam: 'Caveat', weight: 700, align: 'center', color: shout ? '#D6336C' : INK }));
    ctx.restore();
  }

  // ---------- the shots ----------
  // 1. she asks
  function ask(ctx, t) {
    paperBg(ctx, '#FFF6EC');
    G.ellipse(ctx, 540, 1480, 520, 60, { fill: '#F6E3D1', lw: 0, seed: 1 });
    Ch.person(ctx, { x: 320, y: 1500, s: 1.55, pose: 'stand', style: CAST.ars, look: 0.7, lookY: 0.4, eyes: 'normal', mouth: 'flat', brows: 'neutral', blink: (t % 3.1) < 0.12 ? 1 : 0, seed: 400 });
    const bob = beatBob(t, 14);
    Ch.person(ctx, { x: 770, y: 1500 - bob, s: 1.3, pose: 'stand', style: CAST.liya, gesture: 'dua', look: -0.8, lookY: -0.5, eyes: 'wide', brows: 'worried', mouth: 'o', blush: 1, seed: 500 });
    // little hearts rising from her
    for (let i = 0; i < 4; i++) { const u = ((t * 0.5 + i / 4) % 1); heart(ctx, 900 + Math.sin(u * 6 + i) * 30, 860 - u * 300, 0.5 * (1 - u * 0.5), '#FF8FB4', Math.sin(u * 5) * 0.2); }
  }
  // 2. he refuses
  function refuse(ctx, t) {
    const a = t - ev.refuse;
    paperBg(ctx, '#8EE3EF');
    G.rays(ctx, 540, 1050, { n: 30, r0: 200, r1: 1800, color: 'rgba(255,255,255,0.55)', lw: 22, seed: 7, spin: a * 0.2 });
    Ch.person(ctx, { x: 320, y: 1480, s: 1.15, sx: -1, pose: 'stand', style: CAST.ars, crossArms: true, eyes: 'closed', mouth: 'flat', brows: 'determined', headRot: -0.08, seed: 400 });
    const shake = a < 0.3 ? Math.sin(a * 80) * 10 : 0;
    Ch.person(ctx, { x: 770 + shake, y: 1480, s: 1.0, pose: 'stand', style: CAST.liya, handL: [-60, -390], handR: [60, -390], eyes: 'wide', mouth: 'o', brows: 'worried', sweat: 1, seed: 500 });
    gloom(ctx, 770, 1480 - 560, 1);
    G.decor(() => { ctx.save(); ctx.translate(250, 840); ctx.rotate(-0.1); G.text(ctx, 'ХМФ!', 0, 0, { size: 90, fam: 'Inter', weight: 800, color: '#FFFFFF', stroke: INK, strokeW: 10, align: 'center' }); ctx.restore(); });
  }
  // 3. she begs on her knees (the dramatic one)
  function beg(ctx, t) {
    paperBg(ctx, '#FFFFFF');
    speedLines(ctx, 540, 1080, t);
    const sh = Math.sin(t * 38) * 6;
    const s = 1.9;
    Ch.person(ctx, { x: 540 + sh, y: 1360, s, pose: 'floor', style: CAST.liya, gesture: 'dua', eyes: 'closed', mouth: 'open', brows: 'worried', blush: 1, seed: 500, shadow: false });
    tears(ctx, 540 + sh, 1360 + (-322 + 172 - 82 + 4) * s, s, t);
    // sweat/emotion marks
    for (const sd of [-1, 1]) G.line(ctx, [[540 + sd * 250, 700], [540 + sd * 300, 640]], { color: '#D6336C', lw: 10, seed: 600 + sd });
  }
  // 4. close-up: the puppy eyes, then he gives in
  function plead(ctx, t) {
    const g = ctx.createRadialGradient(540, 1000, 50, 540, 1000, 1100); g.addColorStop(0, '#FFE3EE'); g.addColorStop(1, '#F7B6CF');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    for (let i = 0; i < 18; i++) sparkle(ctx, 80 + G.rnd(i, 1) * 920, 300 + G.rnd(i, 2) * 1300, 14 + 12 * Math.abs(Math.sin(t * 3 + i)), t + i);
    const s = 3.0, fy = 1080 - HEAD * s;
    Ch.person(ctx, { x: 540, y: fy, s, pose: 'stand', style: CAST.liya, eyes: 'wide', lookY: -0.6, mouth: 'o', brows: 'worried', blush: 1, seed: 500, shadow: false });
    // the shine in her eyes
    for (const sd of [-1, 1]) { sparkle(ctx, 540 + sd * 30 * s + 14, fy + (HEAD - 2) * s - 14, 18 + 6 * Math.sin(t * 9), 0.3); }
    // the held breath: the light dims just before the reveal
    const d = clamp((t - ev.breath) / 0.08);
    if (d > 0) { ctx.fillStyle = `rgba(20,10,30,${0.75 * d})`; ctx.fillRect(0, 0, W, H); }
  }
  // 5. МЯУ
  function meow(ctx, t) {
    const a = t - ev.meow, a2 = t - ev.meow2;
    paperBg(ctx, '#FFD6E5');
    G.rays(ctx, 540, 1000, { n: 26, r0: 160, r1: 1800, color: 'rgba(255,255,255,0.7)', lw: 30, seed: 9, spin: a * 0.15 });
    const s = 1.75, x = 540, y = 1560;
    const bump = 1 + 0.06 * U.pulse(t, ev.meow2, 6);
    ctx.save(); ctx.translate(x, y); ctx.scale(bump, bump); ctx.translate(-x, -y);
    const hc = y + HEAD * s;
    Ch.person(ctx, { x, y, s, pose: 'stand', style: CAST.ars, handL: [-58, HEAD + 38], handR: [58, HEAD + 38], eyes: a2 > 0 ? 'closed' : 'normal', look: -0.5, mouth: 'wavy', brows: 'worried', blush: 1, sweat: 0.8, seed: 400, shadow: false });
    catEars(ctx, x, hc, s, 0.06 * Math.sin(t * 14));
    // paw beans on the fists
    for (const sd of [-1, 1]) for (let k = 0; k < 3; k++) G.ellipse(ctx, x + sd * 58 * s + (k - 1) * 13, y + (HEAD + 22) * s, 6, 6, { fill: '#F7A1C0', lw: 0, seed: 700 + k });
    ctx.restore();
    // the stamp
    const pop = ease.outBack(clamp(a / 0.2), 3), pop2 = ease.outBack(clamp(a2 / 0.2), 3);
    G.decor(() => {
      ctx.save(); ctx.translate(250, 760); ctx.rotate(-0.16); ctx.scale(pop, pop);
      G.text(ctx, 'мяу~', 0, 0, { size: 130, fam: 'Inter', weight: 800, color: '#FF5C93', stroke: '#FFFFFF', strokeW: 14, align: 'center' });
      ctx.restore();
      if (a2 > 0) { ctx.save(); ctx.translate(840, 900); ctx.rotate(0.14); ctx.scale(pop2, pop2); G.text(ctx, 'мяу!', 0, 0, { size: 110, fam: 'Inter', weight: 800, color: '#FF5C93', stroke: '#FFFFFF', strokeW: 14, align: 'center' }); ctx.restore(); }
    });
  }
  // 6. she melts: a heart pops on every note, then she faints into them
  function melt(ctx, t) {
    const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#FFC2DA'); g.addColorStop(1, '#FF8FB4');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    for (let i = 0; i < 26; i++) sparkle(ctx, G.rnd(i, 4) * W, (G.rnd(i, 5) * H - t * 60 * (0.5 + G.rnd(i, 6))) % H + (G.rnd(i, 5) * H - t * 60 < 0 ? H : 0), 10 + 10 * Math.abs(Math.sin(t * 4 + i)), t);
    // the heart pile at the bottom grows with every note
    const popped = S.melt.filter((n) => n.t <= t);
    popped.forEach((n, i) => {
      const k = clamp((t - n.t) / 0.25), sc = ease.outBack(k, 3);
      const hx = 120 + G.rnd(i, 7) * 840, hy = 1250 + G.rnd(i, 8) * 280 - (t - n.t) * 30;
      heart(ctx, hx, hy, (0.9 + G.rnd(i, 9) * 0.8) * sc, i % 3 ? '#FF5C93' : '#FF2E74', (G.rnd(i, 10) - 0.5) * 0.6);
    });
    // Liya: floating with joy, then falling back
    const f = ease.inCubic(clamp((t - ev.faint + 0.22) / 0.22));
    const fl = (1 - f) * (Math.sin(t * 4) * 18 + 40);
    const s = 1.45;
    Ch.person(ctx, { x: 540 + f * 60, y: 1420 - fl + f * 40, s, rot: -1.25 * f, pose: 'stand', style: CAST.liya,
      handL: f > 0.5 ? undefined : [-62, HEAD + 40], handR: f > 0.5 ? undefined : [62, HEAD + 40],
      eyes: f > 0.5 ? 'closed' : 'happy', mouth: f > 0.5 ? 'smile' : 'grin', brows: 'up', blush: 1, seed: 500, shadow: false });
    // her soul, a little heart, floating away after the faint
    if (t > ev.faint) { const u = t - ev.faint; ctx.save(); ctx.globalAlpha = clamp(1 - u * 0.5); heart(ctx, 420 + Math.sin(u * 5) * 30, 1000 - u * 260, 0.9, '#FFFFFF'); ctx.restore(); }
    // a pop of words over each note of bar 7
    const wordsAt = [[ev.melt, 'АААА'], [T(7, 2), 'МИЛОТА'], [T(8), 'Я ТАЮ']];
    G.decor(() => wordsAt.forEach(([w0, w], i) => {
      if (t < w0 || t > ev.faint) return;
      const p = ease.outBack(clamp((t - w0) / 0.2), 3);
      ctx.save(); ctx.translate([260, 820, 330][i], [700, 780, 920][i]); ctx.rotate([-0.2, 0.15, -0.08][i]); ctx.scale(p, p);
      G.text(ctx, w, 0, 0, { size: 84, fam: 'Inter', weight: 800, color: '#FFFFFF', stroke: '#D6336C', strokeW: 10, align: 'center' });
      ctx.restore();
    }));
  }
  // 7. the punchline: she filmed everything
  function phone(ctx, t) {
    paperBg(ctx, '#FFF6EC');
    G.ellipse(ctx, 540, 1480, 520, 60, { fill: '#F6E3D1', lw: 0, seed: 1 });
    const s = 1.45, ax = 300, hc = 1500 + HEAD * s;
    Ch.person(ctx, { x: ax, y: 1500, s, pose: 'stand', style: CAST.ars, gesture: t < ev.stories ? 'facepalm' : null, crossArms: t >= ev.stories, look: 0.6, eyes: t >= ev.stories ? 'wide' : 'closed', mouth: t >= ev.stories ? 'o' : 'wavy', brows: 'worried', blush: 1, sweat: t >= ev.stories ? 1 : 0.4, seed: 400 });
    catEars(ctx, ax, hc, s, 0);
    Ch.person(ctx, { x: 800, y: 1500 - beatBob(t, 8), s: 1.25, pose: 'stand', style: CAST.liya, gesture: 'phone', look: -0.4, eyes: 'happy', mouth: 'smirk', brows: 'up', blush: 0.6, seed: 500 });
    // the stories card pops up
    const k = t >= ev.stories ? ease.outBack(clamp((t - ev.stories) / 0.12 + 0.5), 2) : 0;
    if (k > 0) {
      ctx.save(); ctx.translate(560, 620); ctx.rotate(0.05); ctx.scale(k * 0.72, k * 0.72);
      G.rrect(ctx, -170, -250, 340, 500, 34, { fill: '#2B2233', lw: 5, seed: 30 });
      const gg = ctx.createLinearGradient(0, -230, 0, 230); gg.addColorStop(0, '#FFD6E5'); gg.addColorStop(1, '#FF8FB4');
      ctx.fillStyle = gg; ctx.beginPath(); ctx.roundRect(-150, -230, 300, 460, 22); ctx.fill();
      for (let i = 0; i < 3; i++) { ctx.fillStyle = 'rgba(255,255,255,0.9)'; ctx.fillRect(-130 + i * 88, -212, 80, 6); }
      // tiny Ars with ears inside the story
      Ch.person(ctx, { x: 0, y: 210, s: 0.5, pose: 'stand', style: CAST.ars, handL: [-58, HEAD + 38], handR: [58, HEAD + 38], eyes: 'closed', mouth: 'wavy', blush: 1, seed: 400, shadow: false });
      catEars(ctx, 0, 210 + HEAD * 0.5, 0.5, 0);
      G.text(ctx, 'мяу~', 0, -120, { size: 54, fam: 'Inter', weight: 800, color: '#FF5C93', stroke: '#FFFFFF', strokeW: 8, align: 'center' });
      const likes = Math.floor(clamp((t - ev.stories) / 1.5) * 999);
      heart(ctx, -80, 150, 0.45, '#FF2E74'); G.text(ctx, String(likes), -50, 162, { size: 36, fam: 'Inter', weight: 800, color: '#FFFFFF', stroke: INK, strokeW: 6 });
      ctx.restore();
    }
  }

  const film = Shots.film([
    { at: 0, draw: ask, cam: Shots.push(1.0, 1.06) },
    { at: ev.refuse, draw: refuse, in: 'cut', cam: Shots.shake(16, ev.refuse, 6) },
    { at: ev.beg, draw: beg, in: 'cut', cam: Shots.combine(Shots.shake(10, ev.beg, 3), Shots.push(1, 1.08)) },
    { at: ev.plead, draw: plead, in: 'cut', cam: Shots.push(1, 1.1) },
    { at: ev.meow, draw: meow, in: 'flash', cam: Shots.shake(14, ev.meow, 6) },
    { at: ev.melt, draw: melt, in: 'cut', cam: Shots.combine(Shots.push(1, 1.05), Shots.shake(12, ev.faint, 6)) },
    { at: ev.phone, draw: phone, in: 'cut', cam: Shots.push(1, 1.04) },
  ]);

  Studio.film({
    post: { vignette: 0.18, grain: 0.03, paper: 0.25 },
    fadeOut: 0.8,
    draw(ctx, t) {
      film(ctx, t);
      for (const ft of [ev.faint, ev.stories]) { const fl = t >= ft ? Math.max(0, 1 - (t - ft) / 0.15) : 0; if (fl > 0) { ctx.fillStyle = `rgba(255,255,255,${0.85 * fl})`; ctx.fillRect(0, 0, W, H); } }
      caption(ctx, t);
    },
  });
})();
