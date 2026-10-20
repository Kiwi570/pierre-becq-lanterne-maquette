/* Lumiere de bougie sur la boiserie laquee, eclats de vitrail ; loupe d'expert sur le bureau.
   Uniquement sur les fonds : jamais applique sur une piece. */
import { Renderer, Program, Mesh, Triangle, Texture } from '../vendor/ogl.mjs';

const vertex = /* glsl */ `
attribute vec2 uv; attribute vec2 position; varying vec2 vUv;
void main(){ vUv = uv; gl_Position = vec4(position, 0., 1.); }`;

const COMMUN = /* glsl */ `
precision highp float;
varying vec2 vUv;
uniform vec2 uRes; uniform vec2 uTexRes;
vec2 couvre(vec2 uv, vec2 tr){ float ra=uRes.x/uRes.y, ta=tr.x/tr.y; vec2 s = ra>ta ? vec2(1., ta/ra) : vec2(ra/ta, 1.); return (uv-.5)*s+.5; }
float hash(vec2 p){ p = fract(p*vec2(123.34, 456.21)); p += dot(p, p+45.32); return fract(p.x*p.y); }
`;

const fragLanterne = COMMUN + /* glsl */ `
uniform sampler2D tTex; uniform sampler2D tVit; uniform vec2 uVitRes;
uniform vec2 uLum; uniform float uFlamme; uniform float uRevele; uniform float uVitrail; uniform float uDecal; uniform float uTeinte; uniform vec3 uCouleur; uniform float uTemps;
float lum(vec2 uv){ return dot(texture2D(tTex, uv).rgb, vec3(.299,.587,.114)); }
void main(){
  vec2 uv = couvre(vUv, uTexRes);
  vec2 e = vec2(1.6/uRes.x, 1.6/uRes.y);
  float hx = lum(uv+vec2(e.x,0.)) - lum(uv-vec2(e.x,0.));
  float hy = lum(uv+vec2(0.,e.y)) - lum(uv-vec2(0.,e.y));
  vec3 n = normalize(vec3(-hx*5.5, -hy*5.5, 1.));
  vec3 alb = texture2D(tTex, uv).rgb;
  alb = mix(alb, alb*uCouleur*2.4, uTeinte);
  vec2 frag = vUv*uRes;
  vec3 lp = vec3(uLum, max(uRes.x,uRes.y)*.1);
  vec3 L = normalize(lp - vec3(frag, 0.));
  float diff = max(dot(n, L), 0.);
  float d = length(uLum - frag)/max(uRes.x, uRes.y);
  float att = 1./(1. + d*d*14.);
  vec3 H = normalize(L + vec3(0.,0.,1.));
  float spec = pow(max(dot(n,H),0.), 30.);
  float dore = smoothstep(.04, .16, alb.r - alb.b) * smoothstep(.08, .3, lum(uv));
  vec3 chaud = vec3(1., .74, .44);
  float fl = uFlamme * (.92 + .08*sin(uTemps*13.) * sin(uTemps*7.3));
  vec3 col = alb*(.16 + diff*att*2.6*chaud*fl) + spec*att*chaud*(.12 + dore*2.4)*fl;
  // poussiere doree dans le halo
  float pou = step(.99975, hash(floor(frag/2.) + floor(uTemps*1.5))) * att * att * 2.2;
  col += pou*vec3(1.,.85,.6);
  // eclats de vitrail : on garde les rayons, en miroir pour couvrir la largeur
  vec2 vu = couvre(vUv, uVitRes); vu.x = abs(fract((vu.x + uDecal)*.5)*2. - 1.);
  vec3 vit = texture2D(tVit, vu).rgb;
  col += vit*vit*1.6*uVitrail*(.5 + alb*2.);
  col *= smoothstep(1.45, .25, length((vUv-.5)*vec2(1.25, 1.)));
  col *= uRevele;
  gl_FragColor = vec4(col, 1.);
}`;

const fragLoupe = COMMUN + /* glsl */ `
uniform sampler2D tTex; uniform vec2 uLum; uniform float uRayon; uniform float uForce; uniform float uRevele;
void main(){
  vec2 frag = vUv*uRes;
  vec2 dv = frag - uLum;
  float r = length(dv)/uRayon;
  vec2 uv = vUv;
  float dedans = 1. - smoothstep(.96, 1., r);
  if (r < 1.) { float k = 1. - uForce*(1. - r*r); uv = (uLum + dv*k)/uRes; }
  vec2 t = couvre(uv, uTexRes);
  vec3 col = texture2D(tTex, t + vec2(.0016,0.)*dedans*r).rgb * vec3(1.,0.,0.) + texture2D(tTex, t).rgb*vec3(0.,1.,0.) + texture2D(tTex, t - vec2(.0016,0.)*dedans*r).rgb*vec3(0.,0.,1.);
  float lum = mix(.5, 1.25, dedans);
  col *= lum;
  float bord = smoothstep(.9, .97, r) * (1. - smoothstep(1., 1.06, r));
  col = mix(col, vec3(.78,.6,.3), bord*.9);
  col *= smoothstep(1.4, .2, length((vUv-.5)*vec2(1.2, 1.)));
  gl_FragColor = vec4(col*uRevele, 1.);
}`;

function charger(src) {
  return new Promise((ok) => { const i = new Image(); i.onload = () => ok(i); i.onerror = () => ok(null); i.src = src; });
}

function base(conteneur) {
  const canvas = document.createElement('canvas');
  canvas.className = 'gl';
  canvas.setAttribute('aria-hidden', 'true');
  conteneur.prepend(canvas);
  let renderer;
  try { renderer = new Renderer({ canvas, dpr: Math.min(1.5, devicePixelRatio || 1), alpha: false, antialias: false }); } catch (e) { canvas.remove(); return null; }
  return { canvas, renderer, gl: renderer.gl };
}

export function fondLanterne(conteneur, { image, imageMobile, vitrail = 'assets/img/ambiance/g-vitrail-rayons-16x9-1200.webp', force = 1, teinte = 0, couleur = [0.5, 0.5, 0.5], vitrailForce = 0.0 } = {}) {
  const gsap = window.gsap;
  const b = base(conteneur); if (!b) return null;
  const { canvas, renderer, gl } = b;
  const tex = new Texture(gl, { generateMipmaps: false });
  const texV = new Texture(gl, { generateMipmaps: false });
  const program = new Program(gl, {
    vertex, fragment: fragLanterne,
    uniforms: {
      tTex: { value: tex }, tVit: { value: texV }, uRes: { value: [1, 1] }, uTexRes: { value: [1168, 784] }, uVitRes: { value: [1168, 784] },
      uLum: { value: [0, 0] }, uFlamme: { value: force }, uRevele: { value: 0 }, uVitrail: { value: vitrailForce }, uDecal: { value: 0 },
      uTeinte: { value: teinte }, uCouleur: { value: couleur }, uTemps: { value: 0 },
    },
  });
  const mesh = new Mesh(gl, { geometry: new Triangle(gl), program });
  let w = 1; let h = 1;
  const taille = () => { const r = conteneur.getBoundingClientRect(); w = Math.max(1, r.width); h = Math.max(1, r.height); renderer.setSize(w, h); program.uniforms.uRes.value = [w * renderer.dpr, h * renderer.dpr]; };
  taille();
  const ro = new ResizeObserver(taille); ro.observe(conteneur);
  const cible = { x: w * 0.66, y: h * 0.45 }; const lum = { x: w * 0.5, y: h * 0.6 };
  let souris = false;
  const bouge = (e) => { const r = conteneur.getBoundingClientRect(); cible.x = e.clientX - r.left; cible.y = e.clientY - r.top; souris = true; };
  addEventListener('pointermove', bouge, { passive: true });
  let visible = true;
  const io = new IntersectionObserver(([en]) => { visible = en.isIntersecting; }, { rootMargin: '60px' });
  io.observe(conteneur);
  const src = innerWidth < innerHeight && imageMobile ? imageMobile : image;
  Promise.all([charger(src), charger(vitrail)]).then(([a, v]) => {
    if (a) { tex.image = a; program.uniforms.uTexRes.value = [a.naturalWidth, a.naturalHeight]; }
    if (v) { texV.image = v; program.uniforms.uVitRes.value = [v.naturalWidth, v.naturalHeight]; }
    gsap.to(program.uniforms.uRevele, { value: 1, duration: 2, ease: 'power2.out' });
  });
  conteneur.classList.add('avec-gl');
  const t0 = performance.now();
  const boucle = () => {
    if (!visible) return;
    const t = (performance.now() - t0) / 1000;
    if (!souris || matchMedia('(pointer: coarse)').matches) { cible.x = w * (0.55 + Math.sin(t * 0.21) * 0.3); cible.y = h * (0.42 + Math.cos(t * 0.16) * 0.22); }
    lum.x += (cible.x - lum.x) * 0.07; lum.y += (cible.y - lum.y) * 0.07;
    program.uniforms.uLum.value = [lum.x * renderer.dpr, (h - lum.y) * renderer.dpr];
    program.uniforms.uTemps.value = t;
    renderer.render({ scene: mesh });
  };
  gsap.ticker.add(boucle);
  return {
    canvas, program,
    teinter(hex, f = 0.3) {
      const c = hex.match(/\w\w/g).map((x) => parseInt(x, 16) / 255);
      gsap.to(program.uniforms.uCouleur.value, { 0: c[0], 1: c[1], 2: c[2], duration: 1.2 });
      gsap.to(program.uniforms.uTeinte, { value: f, duration: 1.2 });
    },
    detruire() { gsap.ticker.remove(boucle); ro.disconnect(); io.disconnect(); removeEventListener('pointermove', bouge); gl.getExtension('WEBGL_lose_context')?.loseContext(); canvas.remove(); },
  };
}

export function fondLoupe(conteneur, { image, imageMobile } = {}) {
  const gsap = window.gsap;
  const b = base(conteneur); if (!b) return null;
  const { canvas, renderer, gl } = b;
  const tex = new Texture(gl, { generateMipmaps: false });
  const program = new Program(gl, {
    vertex, fragment: fragLoupe,
    uniforms: { tTex: { value: tex }, uRes: { value: [1, 1] }, uTexRes: { value: [1168, 784] }, uLum: { value: [0, 0] }, uRayon: { value: 160 }, uForce: { value: 0.42 }, uRevele: { value: 0 } },
  });
  const mesh = new Mesh(gl, { geometry: new Triangle(gl), program });
  let w = 1; let h = 1;
  const taille = () => {
    const r = conteneur.getBoundingClientRect(); w = Math.max(1, r.width); h = Math.max(1, r.height); renderer.setSize(w, h);
    program.uniforms.uRes.value = [w * renderer.dpr, h * renderer.dpr]; program.uniforms.uRayon.value = Math.min(190, Math.max(110, w * 0.11)) * renderer.dpr;
  };
  taille();
  const ro = new ResizeObserver(taille); ro.observe(conteneur);
  const cible = { x: w * 0.72, y: h * 0.5 }; const lum = { x: w * 0.7, y: h * 0.5 };
  let souris = false;
  const bouge = (e) => { const r = conteneur.getBoundingClientRect(); cible.x = e.clientX - r.left; cible.y = e.clientY - r.top; souris = true; };
  addEventListener('pointermove', bouge, { passive: true });
  let visible = true;
  const io = new IntersectionObserver(([en]) => { visible = en.isIntersecting; }, { rootMargin: '60px' });
  io.observe(conteneur);
  charger(innerWidth < innerHeight && imageMobile ? imageMobile : image).then((a) => {
    if (a) { tex.image = a; program.uniforms.uTexRes.value = [a.naturalWidth, a.naturalHeight]; }
    gsap.to(program.uniforms.uRevele, { value: 1, duration: 1.8, ease: 'power2.out' });
  });
  conteneur.classList.add('avec-gl');
  const t0 = performance.now();
  const boucle = () => {
    if (!visible) return;
    const t = (performance.now() - t0) / 1000;
    if (!souris || matchMedia('(pointer: coarse)').matches) { cible.x = w * (0.62 + Math.sin(t * 0.3) * 0.22); cible.y = h * (0.5 + Math.cos(t * 0.23) * 0.22); }
    lum.x += (cible.x - lum.x) * 0.09; lum.y += (cible.y - lum.y) * 0.09;
    program.uniforms.uLum.value = [lum.x * renderer.dpr, (h - lum.y) * renderer.dpr];
    renderer.render({ scene: mesh });
  };
  gsap.ticker.add(boucle);
  return { canvas, detruire() { gsap.ticker.remove(boucle); ro.disconnect(); io.disconnect(); removeEventListener('pointermove', bouge); gl.getExtension('WEBGL_lose_context')?.loseContext(); canvas.remove(); } };
}
