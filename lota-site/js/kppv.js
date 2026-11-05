/* kppv.js – K plus proches voisins (port JavaScript de kppv.py) */
const FEATURES = ['frags', 'death', 'powerup', 'covdist'];
const TOUR_MAP = { Tomato: '1er Tour', Mauvais: '2ème Tour', Moyen: '3ème Tour', Bon: '4ème Tour', Unicum: 'Tour Ultime' };
const TOUR_ORDER = { Tomato: 1, Mauvais: 2, Moyen: 3, Bon: 4, Unicum: 5 };
const COLOR_MAP = { Tomato: '#e74c3c', Mauvais: '#e67e22', Moyen: '#f1c40f', Bon: '#2ecc71', Unicum: '#9b59b6' };

const BOUNDS = (() => {
  const mins = {}, maxs = {};
  FEATURES.forEach(f => {
    const v = TRAINING_DATA.map(p => p[f]);
    mins[f] = Math.min(...v); maxs[f] = Math.max(...v);
  });
  return { mins, maxs };
})();

function normalize(p) {
  const o = {};
  FEATURES.forEach(f => {
    const span = BOUNDS.maxs[f] - BOUNDS.mins[f];
    o[f] = span ? (p[f] - BOUNDS.mins[f]) / span : 0;
  });
  return o;
}
const TRAINING_NORM = TRAINING_DATA.map(p => ({ ...normalize(p), pseudo: p.pseudo, categorie: p.categorie }));

function kppv(player, k = 7) {
  const n = normalize(player);
  const dist = TRAINING_NORM.map(p => ({
    d: Math.sqrt(FEATURES.reduce((s, f) => s + (n[f] - p[f]) ** 2, 0)), p
  })).sort((a, b) => a.d - b.d).slice(0, k);
  const votes = {};
  dist.forEach(({ p }) => { votes[p.categorie] = (votes[p.categorie] || 0) + 1; });
  let best = null;
  for (const c in votes) if (best === null || votes[c] > votes[best]) best = c;
  return { categorie: best, tour: TOUR_MAP[best], votes,
           neighbours: dist.map(({ d, p }) => ({ pseudo: p.pseudo, categorie: p.categorie, distance: +d.toFixed(4) })) };
}

function classifyBatch(list, k = 7) {
  return list.map(p => {
    const r = kppv(p, k);
    return { ...p, niveau: r.categorie, tour: r.tour, order: TOUR_ORDER[r.categorie], color: COLOR_MAP[r.categorie] };
  }).sort((a, b) => a.order - b.order);
}

/* Parse CSV séparé par ; (pseudo;frags;death;powerup;covdist) */
function parseParticipants(text) {
  const lines = text.replace(/^﻿/, '').split(/\r?\n/).filter(l => l.trim());
  if (!lines.length) throw new Error('Le fichier CSV est vide.');
  const head = lines[0].split(';').map(h => h.trim().replace(/"/g, ''));
  const idx = {};
  ['pseudo', ...FEATURES].forEach(c => {
    idx[c] = head.indexOf(c);
    if (idx[c] < 0) throw new Error('Colonne manquante : ' + c);
  });
  const out = lines.slice(1).map((l, i) => {
    const c = l.split(';').map(x => x.trim().replace(/^"|"$/g, ''));
    const p = { pseudo: c[idx.pseudo] };
    FEATURES.forEach(f => {
      p[f] = parseFloat(c[idx[f]]);
      if (isNaN(p[f])) throw new Error(`Valeur invalide ligne ${i + 2} (${f})`);
    });
    return p;
  });
  if (!out.length) throw new Error('Le fichier CSV est vide.');
  return out;
}

/* Tournoi aléatoire (port de generate_tournament) */
function gauss(m, s) {
  let u = 0, v = 0;
  while (!u) u = Math.random();
  while (!v) v = Math.random();
  return m + s * Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}
function generateTournament(n = 500) {
  const params = {
    Unicum:  { frags: [35, 6], death: [7, 3],  powerup: [55, 8], covdist: [18, 3] },
    Bon:     { frags: [27, 6], death: [14, 4], powerup: [44, 9], covdist: [14, 3] },
    Moyen:   { frags: [19, 5], death: [23, 5], powerup: [33, 8], covdist: [10, 3] },
    Mauvais: { frags: [11, 4], death: [34, 6], powerup: [22, 7], covdist: [6, 2] },
    Tomato:  { frags: [5, 3],  death: [47, 7], powerup: [13, 5], covdist: [3, 2] },
  };
  const share = { Unicum: .10, Bon: .25, Moyen: .30, Mauvais: .20 };
  let cats = [];
  let used = 0;
  for (const c in share) { const m = Math.floor(n * share[c]); used += m; cats.push(...Array(m).fill(c)); }
  cats.push(...Array(n - used).fill('Tomato'));
  for (let i = cats.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [cats[i], cats[j]] = [cats[j], cats[i]]; }
  const pre = ['Dark','Iron','Storm','Ghost','Frost','Blaze','Shadow','Silver','Night','Rune','Void','Arcane','Steel','Ember','Doom','Star'];
  const suf = ['blade','fang','claw','fury','soul','ward','bane','reaper','breaker','forge','seeker','stalker','hunter','weaver','rift','storm'];
  const pick = a => a[Math.floor(Math.random() * a.length)];
  const names = new Set();
  return cats.map((c, i) => {
    let name = 'Player' + String(i + 1).padStart(3, '0');
    for (let t = 0; t < 20; t++) {
      const cand = pick(pre) + pick(suf) + (10 + Math.floor(Math.random() * 990));
      if (!names.has(cand)) { names.add(cand); name = cand; break; }
    }
    const p = params[c], r = (k, min) => Math.max(min, +gauss(p[k][0], p[k][1]).toFixed(1));
    return { pseudo: name, frags: r('frags', 1), death: r('death', 1), powerup: r('powerup', 1), covdist: r('covdist', .5) };
  });
}

function resultsToCSV(results) {
  return 'Pseudo participant;Niveau;Rang\n' + results.map(r => `${r.pseudo};${r.niveau};${r.tour}`).join('\n') + '\n';
}
function esc(s) { return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
