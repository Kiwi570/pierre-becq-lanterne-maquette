/* Decors communs : marqueterie a cubes, caisse de transport qui s'assemble. */
import PB from './base.js';

const { gsap, calme } = PB;
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

/* ---------------- 6. marqueterie ---------------- */
export function construireMarqueteries() {
  const tons = ['#c89a5e', '#8a5a2e', '#4a2c16'];
  const P = (arr) => arr.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
  // trois placages : cubes, point de Hongrie, etoile de marqueterie
  const cubes = () => {
    const s = 13; const hx = s * Math.sqrt(3); const h = hx / 2; const out = [];
    for (let r = -1; r < 6; r++) for (let q = -1; q < 6; q++) {
      const cx = q * hx + (r % 2 ? hx / 2 : 0); const cy = r * s * 1.5;
      if (cx < -10 || cx > 130 || cy < -10 || cy > 130) continue;
      const m = (arr) => P(arr.map(([x, y]) => [cx + x, cy + y]));
      out.push([m([[0, 0], [h, -s / 2], [0, -s], [-h, -s / 2]]), 0], [m([[0, 0], [-h, -s / 2], [-h, s / 2], [0, s]]), 1], [m([[0, 0], [0, s], [h, s / 2], [h, -s / 2]]), 2]);
    }
    return out;
  };
  const hongrie = () => {
    const out = []; const w = 15; const e = 10;
    for (let y = -20; y < 140; y += e) for (let x = -15, c = 0; x < 135; x += w, c++) {
      const t = (Math.round((y + 20) / e) + c) % 2;
      out.push([P([[x, y], [x + w, y + w * 0.6], [x + w, y + w * 0.6 + e], [x, y + e]]), c % 2 ? t : 2 - t]);
    }
    return out;
  };
  const etoile = () => {
    const out = []; const c = 60; const R = 62;
    for (let i = 0; i < 16; i++) {
      const a0 = (i / 16) * Math.PI * 2; const a1 = ((i + 1) / 16) * Math.PI * 2;
      out.push([P([[c, c], [c + Math.cos(a0) * R, c + Math.sin(a0) * R], [c + Math.cos(a1) * R, c + Math.sin(a1) * R]]), i % 2]);
    }
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2 - Math.PI / 2; const d = Math.PI / 8;
      out.push([P([[c, c], [c + Math.cos(a - d) * 20, c + Math.sin(a - d) * 20], [c + Math.cos(a) * 46, c + Math.sin(a) * 46], [c + Math.cos(a + d) * 20, c + Math.sin(a + d) * 20]]), 2]);
      out.push([P([[c + Math.cos(a - d) * 20, c + Math.sin(a - d) * 20], [c + Math.cos(a) * 46, c + Math.sin(a) * 46], [c + Math.cos(a) * 32, c + Math.sin(a) * 32]]), 0]);
    }
    return out;
  };
  const motifs = [cubes(), hongrie(), etoile()];
  $$('[data-marqueteries] .placage').forEach((svg, n) => {
    svg.innerHTML = `<defs><clipPath id="cl-${n}"><circle cx="60" cy="60" r="58"/></clipPath></defs><g clip-path="url(#cl-${n})">${motifs[n % 3].map(([p, t]) => `<polygon points="${p}" fill="${tons[t]}" stroke="#2a180b" stroke-width=".6"/>`).join('')}</g><circle cx="60" cy="60" r="58" fill="none" stroke="#c9a35b" stroke-width="1.4"/>`;
    if (calme) return;
    const polys = $$('polygon', svg);
    gsap.from(polys, {
      x: () => gsap.utils.random(-90, 90), y: () => gsap.utils.random(-90, 90), rotation: () => gsap.utils.random(-120, 120), opacity: 0, transformOrigin: '50% 50%',
      duration: 1.3, ease: 'expo.out', stagger: { each: 0.008, from: 'random' }, scrollTrigger: { trigger: svg, start: 'top 94%', once: true },
    });
  });
  // au toucher, la marqueterie tourne d'un cran : les cubes basculent
  $$('[data-marqueteries] .marqueterie').forEach((m) => m.addEventListener('click', () => { m.classList.toggle('tourne'); PB.son.tic(0.3, true); }));
  if (!calme) gsap.from($$('[data-marqueteries] .marqueterie'), { y: 60, opacity: 0, duration: 1.1, ease: 'power3.out', stagger: 0.14, scrollTrigger: { trigger: '[data-marqueteries]', start: 'top 92%', once: true } });
}

/* ---------------- caisse de transport ---------------- */
export function construireCaisse(svg) {
  // la caisse s'ouvre : les planches du couvercle s'ecartent, le marquage reste
  svg.setAttribute('viewBox', '0 0 300 200'); svg.setAttribute('preserveAspectRatio', 'none');
  const n = 6; const hp = 200 / n;
  // planches en vrai bois : texture de cerisier, teinte et fil du bois propres a chaque planche
  let html = `<defs><pattern id="bois-caisse" patternUnits="userSpaceOnUse" width="300" height="300"><image href="${PB.amb('g-bois-cerisier-1x1', 700)}" width="300" height="300" preserveAspectRatio="xMidYMid slice"/></pattern><linearGradient id="relief-planche" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".18"/><stop offset=".12" stop-color="#fff" stop-opacity="0"/><stop offset=".8" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".45"/></linearGradient></defs>`;
  for (let i = 0; i < n; i++) {
    const y = (i * hp).toFixed(1); const hh = (hp + 0.6).toFixed(1);
    html += `<g class="couvercle" data-i="${i}"><rect class="planche${i % 2 ? ' claire' : ''}" x="-2" y="${y}" width="304" height="${hh}"/><rect x="-2" y="${y}" width="304" height="${hh}" fill="url(#bois-caisse)" opacity="${i % 2 ? 0.95 : 0.8}" style="mix-blend-mode:multiply"/><rect x="-2" y="${y}" width="304" height="${hh}" fill="url(#relief-planche)"/><circle class="clou" cx="10" cy="${(i * hp + hp / 2).toFixed(1)}" r="2.4"/><circle class="clou" cx="290" cy="${(i * hp + hp / 2).toFixed(1)}" r="2.4"/></g>`;
  }
  svg.innerHTML = html;
  const marque = document.createElement('div');
  marque.className = 'marquage-caisse'; marque.setAttribute('aria-hidden', 'true');
  marque.innerHTML = '<span>Pierre Becq</span><small>Metz · Fragile · Haut</small>';
  svg.parentElement.append(marque);
  if (calme) { svg.style.display = 'none'; return; }
  const couv = $$('.couvercle', svg);
  const tl = gsap.timeline({ scrollTrigger: { trigger: svg.parentElement, start: 'top 85%', once: true } });
  tl.to($$('.clou', svg), { scale: 0, opacity: 0, transformOrigin: '50% 50%', duration: 0.25, stagger: 0.04, ease: 'power2.in' })
    .to(couv, { xPercent: (i) => (i % 2 ? 110 : -110), rotation: (i) => (i % 2 ? 4 : -4), duration: 1.1, ease: 'power3.inOut', stagger: 0.08 }, 0.4)
    .from(marque, { scale: 1.8, opacity: 0, rotation: -12, duration: 0.5, ease: 'back.out(2.5)' }, 1.3)
    .add(() => { svg.style.display = 'none'; });
}
