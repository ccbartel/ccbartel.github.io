import * as THREE2 from "three";
import RAPIER from "/lib/rapier/0.14.0/rapier.es.js";

import * as THREE from "three";
// Crazy Parking (web) - GERADO por src/crazy-parking/prebuild.py a partir de main.js, sim.js e glb_mini.js (nao editar aqui).
// ---- trava de dominio (lista embutida pelo build.py; no publicado fica ofuscada) ----
const __HOSTS = /*@@ALLOWED_HOSTS@@*/["localhost","127.0.0.1"];
const __OFFICIAL = /*@@OFFICIAL_URL@@*/"";
function __hostOk(){ const h = String(location.hostname || "").toLowerCase().replace(/\.$/, ""); for (let i = 0; i < __HOSTS.length; i++) if (__HOSTS[i] === h) return true; return false; }
function __T(k,d){ try { const I=window.CL_I18N; return I?I.t(k):d; } catch(e){ return d; } }
if (!__hostOk()) {
  const st = document.getElementById("stage"); if (st) st.style.display = "none";
  const d = document.createElement("div"); d.setAttribute("role", "alert");
  d.style.cssText = "position:fixed;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px;padding:24px;text-align:center;background:#1b2a3a;color:#fff;font:600 18px/1.4 system-ui,sans-serif;z-index:99";
  d.textContent = __T("blk", "This game is only available on our website: ") + (__OFFICIAL || "");
  document.body.appendChild(d);
  throw new Error("dominio nao permitido");
}
// main.js


// sim.js
var CAR = { hw: 1, hh: 0.42, hl: 2.2, mass: 1200, comY: -0.18 };
var WHEELS = [
  // x, z (locais), dianteira?
  [-0.85, 1.35, true],
  [0.85, 1.35, true],
  [-0.85, -1.35, false],
  [0.85, -1.35, false]
];
var ROLL = 0.35;
var GRAV = [0, -9.81, 0];
var NFRIC = 1200 * 9.81 / 4 * 1.6;
var TRIP = { minDv: 4, rollDv: 4.5, gain: 0.1, base: 1.5, maxW: 3, hop: 0, push: 0 };
var ASSIST = { kp: 40, kd: 11, max: 22, time: 3.5, airKp: 45, airKd: 13 };
var SUSP = { y: -0.2, rest: 0.5, len: 0.75, k: 26e3, c: 4200 };
var H = Math.PI / 2;
var deg = Math.PI / 180;
var LEVELS_RAW = [
  {
    // vaga perpendicular ao lado: gira 270° e entra de RÉ entre os carros da fileira
    name: "lot",
    camBias: 0.6,
    camSide: 7.5,
    camFar: 1.2,
    speed: 10,
    yaw: -H,
    spin: 270,
    curve: 70,
    curveRate: 3,
    start: [3, 14],
    ground: "lot",
    target: [11.6, 44],
    targetYaw: -H,
    parked: [
      { x: 11.6, z: 39.2, yaw: H, color: 15909424 },
      { x: 11.6, z: 48.8, yaw: H, color: 4177738 },
      { x: 11.6, z: 53, yaw: H, color: 14237760 },
      { x: 11.6, z: 35, yaw: H, color: 9323693 },
      { x: -5, z: 40, yaw: -H, color: 9807270 },
      { x: -5, z: 48, yaw: -H, color: 15105570 }
    ],
    cones: [],
    cam: "chase"
  },
  {
    // posto (CP15): vem na direção da câmera e para de lado junto à ilha das bombas
    // baliza de 180° na bomba: gira de costas e escorrega de lado para a esquerda, parando colado na ilha
    name: "gas",
    speed: 10,
    yaw: 0,
    spin: -360,
    curve: -35,
    start: [-2, 14],
    ground: "lot",
    // volta inteira (360°) e para de lado, de frente, colado na ilha
    target: [-7.4, 48.5],
    targetYaw: 0,
    falloff: 6,
    statics: [
      { hx: 1.1, hy: 0.15, hz: 4.5, x: -9.8, y: 0.15, z: 48.5, kind: "island", fr: 1 },
      { hx: 0.35, hy: 0.95, hz: 0.45, x: -9.8, y: 1.25, z: 46.5, kind: "pump" },
      { hx: 0.35, hy: 0.95, hz: 0.45, x: -9.8, y: 1.25, z: 50.5, kind: "pump" },
      { hx: 0.2, hy: 2.2, hz: 0.2, x: -9.8, y: 2.2, z: 44.2, kind: "post" },
      { hx: 0.2, hy: 2.2, hz: 0.2, x: -9.8, y: 2.2, z: 52.8, kind: "post" }
    ],
    parked: [],
    cones: [],
    cam: "ahead"
  },
  {
    name: "bridge",
    speed: 17,
    yaw: -H,
    start: [0, 0],
    ground: "bridge",
    deck: { x0: -6, x1: 6, z0: -20, z1: 62 },
    water: -25,
    target: [0, 58.6],
    targetYaw: -H,
    parked: [{ x: -4.2, z: 58.6, yaw: 0, color: 4881369 }, { x: 4.2, z: 58.6, yaw: 0, color: 14715436 }],
    cones: [],
    cam: "frame",
    frameZ: 40
  },
  {
    name: "container",
    speed: 16,
    yaw: H,
    start: [0, 0],
    ground: "lot",
    container: { x: 0, z: 55, hx: 3.2, hy: 1.3, hz: 1.25 },
    curb: { x: 0, z: 49.25, hx: 3.4, hy: 0.15, hz: 0.25 },
    target: [0, 49 - 5 - 1.05],
    targetYaw: H,
    falloff: 5,
    parked: [],
    cones: [[-5, 36], [5, 36]],
    cam: "chase"
  },
  {
    // caminhão-cegonha: sobe a rampa e freia RETO em cima da carreta (passou = cai na frente)
    name: "truck",
    speed: 13,
    yaw: 0,
    start: [0, 0],
    ground: "lot",
    target: [0, 49],
    targetY: 1.6,
    targetYaw: 0,
    falloff: 6,
    statics: [
      { hx: 1.9, hy: 0.12, hz: 4.08, x: 0, y: 0.8 - 0.12, z: 34, rx: -Math.atan2(1.6, 8), kind: "ramp" },
      { hx: 1.9, hy: 0.15, hz: 9, x: 0, y: 1.6 - 0.15, z: 47, kind: "trailer" },
      { hx: 1.9, hy: 0.6, hz: 9, x: 0, y: 0.7, z: 47, kind: "trailerBase" }
    ],
    parked: [],
    cones: [[-4, 24], [4, 24]],
    cam: "chase"
  },
  {
    // navio (CP47): pula da ponte quebrada, cai no convés e desliza para a vaga; balsa secreta depois do navio
    name: "ship",
    speed: 17,
    yaw: H,
    start: [0, 0],
    ground: "none",
    water: -9,
    target: [0, 80],
    targetY: -4,
    targetYaw: H,
    falloff: 7,
    statics: [
      { hx: 6, hy: 0.5, hz: 30, x: 0, y: -0.5, z: 20, kind: "deck" },
      { hx: 0.25, hy: 0.45, hz: 30, x: -6.25, y: 0.45, z: 20, kind: "rail" },
      { hx: 0.25, hy: 0.45, hz: 30, x: 6.25, y: 0.45, z: 20, kind: "rail" },
      { hx: 8, hy: 0.4, hz: 16, x: 0, y: -4.4, z: 72, kind: "shipdeck" },
      { hx: 8, hy: 2.3, hz: 16, x: 0, y: -7.1, z: 72, kind: "hull" },
      { hx: 2.6, hy: 0.3, hz: 2.6, x: 0, y: -8.6, z: 94, kind: "raft" }
    ],
    secret: { x: 0, z: 94, hx: 2.8, hz: 2.8, yMin: -9, yMax: -5, score: 99999999 },
    parked: [{ x: -5.5, z: 80, yaw: H, color: 3100872, y: -3.3 }, { x: 5.5, z: 80, yaw: H, color: 15909424, y: -3.3 }],
    cones: [],
    cam: "frame",
    frameZ: 44
  },
  {
    // gelo: o carro desliza muito mais — tocar bem antes
    name: "ice",
    speed: 11,
    yaw: Math.PI,
    spin: 540,
    curve: 20,
    start: [-2, -6],
    ground: "lot",
    mu: 0.22,
    grip: 0.6,
    marks: "neve",
    camBias: 0.6,
    camSide: 6,
    camFar: 1.2,
    // gelo: 1 volta e meia e escorrega de ré para a baliza
    target: [8.4, 51.6],
    targetYaw: Math.PI,
    falloff: 7,
    parked: [{ x: 8.4, z: 40.4, yaw: 0, color: 9323693 }, { x: 8.4, z: 60.3, yaw: 0, color: 15105570 }, { x: 8.4, z: 33.9, yaw: 0, color: 4177738 }],
    cones: [[-6, 20], [-6, 30], [-6, 40]],
    cam: "chase"
  },
  {
    // entre dois caminhões: a vaga fecha a cada tentativa; encostar dá nota menor (não zera)
    name: "squeeze",
    speed: 10,
    yaw: -H,
    spin: -450,
    curve: 70,
    curveRate: 3,
    start: [3, 14],
    ground: "lot",
    // 1 volta e 1/4 e entra de RÉ entre dois caminhões; a vaga fecha a cada tentativa
    target: [13.3, 44.2],
    targetYaw: -H,
    falloff: 6,
    touchDv: 1.2,
    touchFactor: 0.7,
    statics: (a) => {
      const gap = Math.max(5.6, 8.6 - 0.5 * a), off = gap / 2 + 1.3;
      return [{ hx: 4.5, hy: 1.6, hz: 1.3, x: 14.4, y: 1.6, z: 44.2 - off, kind: "truckbox" }, { hx: 4.5, hy: 1.6, hz: 1.3, x: 14.4, y: 1.6, z: 44.2 + off, kind: "truckbox" }];
    },
    parked: [{ x: -4, z: 44, yaw: -H, color: 9807270 }],
    cones: [],
    cam: "chase"
  },
  {
    // plataforma estreita no alto: entrar de lado e parar sem cair do outro lado
    name: "tower",
    speed: 10,
    yaw: -H,
    spin: 270,
    curve: -70,
    curveRate: 3,
    start: [-1, 14],
    ground: "none",
    water: -30,
    // plataforma ao lado, no alto: gira 270° e entra de frente; errou o tempo = cai
    target: [-9.7, 44.6],
    targetYaw: -H,
    falloff: 4,
    statics: [
      { hx: 3, hy: 0.5, hz: 40, x: 0, y: -0.5, z: 20, kind: "deck" },
      { hx: 5, hy: 0.5, hz: 3.4, x: -8, y: -0.5, z: 44.6, kind: "deck" },
      { hx: 1.2, hy: 15, hz: 1.2, x: -9, y: -15.5, z: 44.6, kind: "pillar" }
    ],
    parked: [],
    cones: [],
    cam: "frame",
    frameZ: 34
  },
  {
    // rampa de salto: toca ANTES da rampa -> sobe derrapando, pula girando no ar e cai no alvo (cedo = pulo curto, tarde = longo)
    name: "jump",
    speed: 21,
    airSpin: true,
    driftMu: 0.35,
    yaw: H,
    start: [0, -10],
    ground: "lot",
    target: [-0.81, 74.57],
    targetYaw: H,
    falloff: 7,
    statics: [
      // rampa com entrada suave (3 trechos)
      { hx: 2.6, hy: 0.15, hz: 1.811, x: 0, y: 0.049, z: 27.75, rx: -0.1138, kind: "ramp" },
      { hx: 2.6, hy: 0.15, hz: 1.9, x: 0, y: 0.841, z: 31.25, rx: -0.3303, kind: "ramp" },
      { hx: 2.6, hy: 0.15, hz: 1.75, x: 0, y: 2.23, z: 34.5, rx: -0.49, kind: "ramp" },
      { hx: 5.5, hy: 1.5, hz: 1.3, x: 0, y: 1.5, z: 42, kind: "bus" },
      { hx: 5.5, hy: 1.5, hz: 1.3, x: 0, y: 1.5, z: 46, kind: "bus" },
      { hx: 5.5, hy: 1.5, hz: 1.3, x: 0, y: 1.5, z: 50, kind: "bus" }
    ],
    parked: [{ x: -5.5, z: 75, yaw: H, color: 15909424 }, { x: 5.5, z: 75, yaw: H, color: 4177738 }],
    secret: { x: 0, z: 50.2, hx: 2.6, hz: 1, yMin: 3, yMax: 4.5, score: 99999999 },
    // Lendária: parar em cima do último ônibus
    cones: [[-4, 20], [4, 20]],
    cam: "chase"
  },
  {
    // ponte levadiça: a pista sobe; cedo = para na rampa, tarde = voa para o canal
    name: "drawbridge",
    speed: 13,
    yaw: Math.PI,
    spin: 180,
    start: [0, 0],
    ground: "none",
    water: -6,
    target: [0, 48.5],
    targetY: 3,
    targetYaw: Math.PI,
    falloff: 5,
    targetOn: 0,
    targetRel: [0, 2.5],
    statics: [{ hx: 4, hy: 0.5, hz: 30, x: 0, y: -0.5, z: 10, kind: "deck" }, { hx: 4, hy: 0.5, hz: 20, x: 0, y: -0.5, z: 80, kind: "deck" }],
    movers: [{ hx: 4, hy: 0.25, hz: 6, kind: "leaf", fr: 1, motion: (t) => {
      const a = -Math.min(0.42, Math.max(0, (t - 0.8) * 0.13));
      return { x: 0, y: -0.25 * Math.cos(a) + 6 * Math.sin(-a), z: 40 + 6 * Math.cos(a) + 0.25 * Math.sin(-a), rx: a };
    } }],
    parked: [],
    cones: [],
    cam: "frame",
    frameZ: 28
  },
  {
    // piscina: vaga na beira; passou = cai na água; boia de unicórnio secreta = Lendária
    name: "pool",
    speed: 15,
    yaw: H,
    start: [0, 0],
    ground: "none",
    water: -0.5,
    waterBox: { x: 0, z: 58, hx: 6, hz: 6 },
    fallY: -0.45,
    target: [0, 46],
    targetYaw: H,
    falloff: 6,
    statics: [
      { hx: 6, hy: 0.5, hz: 36, x: 0, y: -0.5, z: 16, kind: "deck" },
      { hx: 6, hy: 0.5, hz: 10, x: 0, y: -0.5, z: 74, kind: "deck" },
      { hx: 20, hy: 0.5, hz: 50, x: -26, y: -0.5, z: 30, kind: "grass" },
      { hx: 20, hy: 0.5, hz: 50, x: 26, y: -0.5, z: 30, kind: "grass" },
      { hx: 6, hy: 0.5, hz: 6, x: 0, y: -2.8, z: 58, kind: "poolfloor" },
      { hx: 1.7, hy: 0.22, hz: 1.7, x: 0, y: -0.42, z: 58.6, kind: "float" }
    ],
    secret: { x: 0, z: 58.6, hx: 1.8, hz: 1.8, yMin: -0.6, yMax: 1.2, score: 99999999 },
    parked: [{ x: -5.2, z: 46, yaw: H, color: 15909424 }],
    cones: [],
    cam: "chase"
  },
  {
    // dominó: carros em pé enfileirados; bater no primeiro derruba a fila; nota = onde cai o último
    name: "domino",
    speed: 15,
    yaw: H,
    start: [0, 0],
    ground: "lot",
    noCrash: true,
    target: [0, 46.9],
    targetYaw: H,
    falloff: 5,
    chainProp: 5,
    props: [0, 1, 2, 3, 4, 5].map((i) => ({ hx: 1, hy: 2.2, hz: 0.42, x: 0, y: 2.2, z: 48 + i * 3.6, kind: "standcar", color: [15158332, 15965202, 15844367, 3066993, 3447003, 10181046][i] })),
    parked: [],
    cones: [[-5, 30], [5, 30]],
    cam: "frame",
    frameZ: 36
  },
  {
    // loop: tocar no alto do loop solta o carro, ele gira no ar e cai na vaga
    name: "loop",
    speed: 22,
    yaw: H,
    start: [0, -10],
    ground: "lot",
    loop: { R: 6, zc: 50, shift: 16, releaseV: 6 },
    airRight: true,
    target: [4.78, 47.76],
    targetYaw: H,
    falloff: 6,
    // fora da pista de entrada (x=0): só chega aqui soltando do alto do loop
    statics: [
      { hx: 1.7, hy: 0.2, hz: 0.708, x: 0.8, y: 0.103, z: 51.916, rx: -0.3142, kind: "loop", fr: 0.9 },
      { hx: 1.7, hy: 0.2, hz: 0.708, x: 1.333, y: 0.631, z: 53.1, rx: -0.5236, kind: "loop", fr: 0.9 },
      { hx: 1.7, hy: 0.2, hz: 0.708, x: 1.867, y: 1.393, z: 54.149, rx: -0.733, kind: "loop", fr: 0.9 },
      { hx: 1.7, hy: 0.2, hz: 0.708, x: 2.4, y: 2.356, z: 55.016, rx: -0.9425, kind: "loop", fr: 0.9 },
      { hx: 1.7, hy: 0.2, hz: 0.708, x: 2.933, y: 3.478, z: 55.664, rx: -1.1519, kind: "loop", fr: 0.9 },
      { hx: 1.7, hy: 0.2, hz: 0.708, x: 3.467, y: 4.711, z: 56.065, rx: -1.3614, kind: "loop", fr: 0.9 },
      { hx: 1.7, hy: 0.2, hz: 0.708, x: 4, y: 6, z: 56.2, rx: -1.5708, kind: "loop", fr: 0.9 },
      { hx: 1.7, hy: 0.2, hz: 0.708, x: 4.533, y: 7.289, z: 56.065, rx: -1.7802, kind: "loop", fr: 0.9 },
      { hx: 1.7, hy: 0.2, hz: 0.708, x: 5.067, y: 8.522, z: 55.664, rx: -1.9897, kind: "loop", fr: 0.9 },
      { hx: 1.7, hy: 0.2, hz: 0.708, x: 5.6, y: 9.644, z: 55.016, rx: -2.1991, kind: "loop", fr: 0.9 },
      { hx: 1.7, hy: 0.2, hz: 0.708, x: 6.133, y: 10.607, z: 54.149, rx: -2.4086, kind: "loop", fr: 0.9 },
      { hx: 1.7, hy: 0.2, hz: 0.708, x: 6.667, y: 11.369, z: 53.1, rx: -2.618, kind: "loop", fr: 0.9 },
      { hx: 1.7, hy: 0.2, hz: 0.708, x: 7.2, y: 11.897, z: 51.916, rx: -2.8274, kind: "loop", fr: 0.9 },
      { hx: 1.7, hy: 0.2, hz: 0.708, x: 7.733, y: 12.166, z: 50.648, rx: -3.0369, kind: "loop", fr: 0.9 },
      { hx: 1.7, hy: 0.2, hz: 0.708, x: 8.267, y: 12.166, z: 49.352, rx: -3.2463, kind: "loop", fr: 0.9 },
      { hx: 1.7, hy: 0.2, hz: 0.708, x: 8.8, y: 11.897, z: 48.084, rx: -3.4558, kind: "loop", fr: 0.9 },
      { hx: 1.7, hy: 0.2, hz: 0.708, x: 9.333, y: 11.369, z: 46.9, rx: -3.6652, kind: "loop", fr: 0.9 },
      { hx: 1.7, hy: 0.2, hz: 0.708, x: 9.867, y: 10.607, z: 45.851, rx: -3.8746, kind: "loop", fr: 0.9 },
      { hx: 1.7, hy: 0.2, hz: 0.708, x: 10.4, y: 9.644, z: 44.984, rx: -4.0841, kind: "loop", fr: 0.9 },
      { hx: 1.7, hy: 0.2, hz: 0.708, x: 10.933, y: 8.522, z: 44.336, rx: -4.2935, kind: "loop", fr: 0.9 },
      { hx: 1.7, hy: 0.2, hz: 0.708, x: 11.467, y: 7.289, z: 43.935, rx: -4.5029, kind: "loop", fr: 0.9 },
      { hx: 1.7, hy: 0.2, hz: 0.708, x: 12, y: 6, z: 43.8, rx: -4.7124, kind: "loop", fr: 0.9 },
      { hx: 1.7, hy: 0.2, hz: 0.708, x: 12.533, y: 4.711, z: 43.935, rx: -4.9218, kind: "loop", fr: 0.9 },
      { hx: 1.7, hy: 0.2, hz: 0.708, x: 13.067, y: 3.478, z: 44.336, rx: -5.1313, kind: "loop", fr: 0.9 },
      { hx: 1.7, hy: 0.2, hz: 0.708, x: 13.6, y: 2.356, z: 44.984, rx: -5.3407, kind: "loop", fr: 0.9 },
      { hx: 1.7, hy: 0.2, hz: 0.708, x: 14.133, y: 1.393, z: 45.851, rx: -5.5501, kind: "loop", fr: 0.9 },
      { hx: 1.7, hy: 0.2, hz: 0.708, x: 14.667, y: 0.631, z: 46.9, rx: -5.7596, kind: "loop", fr: 0.9 },
      { hx: 1.7, hy: 0.2, hz: 0.708, x: 15.2, y: 0.103, z: 48.084, rx: -5.969, kind: "loop", fr: 0.9 }
    ],
    parked: [],
    cones: [[-4, 20], [4, 20]],
    cam: "frame",
    frameZ: 30
  },
  {
    // trampolim: cai do barranco no trampolim, quica e para em cima do prédio
    name: "trampoline",
    speed: 17,
    yaw: H,
    start: [0, -10],
    startY: 5.2,
    ground: "lot",
    airSpin: true,
    driftMu: 0.35,
    bounce: 0.95,
    bounceMin: 11,
    target: [0, 66],
    targetY: 5,
    targetYaw: H,
    falloff: 7,
    statics: [
      { hx: 5, hy: 2.25, hz: 21, x: 0, y: 2.25, z: 9, kind: "cliff" },
      { hx: 5, hy: 0.15, hz: 6, x: 0, y: 1, z: 40, kind: "bouncy", fr: 0.8 },
      // em pernas (1 m): a lona tem espaço para afundar sem atravessar o chão
      { hx: 6, hy: 2.5, hz: 10, x: 0, y: 2.5, z: 66, kind: "building" }
    ],
    parked: [],
    cones: [],
    cam: "frame",
    frameZ: 26
  },
  {
    // trem: parar antes dos trilhos; passou do ponto na hora errada = o trem leva o carro
    name: "train",
    speed: 15,
    yaw: H,
    start: [0, 0],
    ground: "lot",
    target: [0, 48.4],
    targetYaw: H,
    falloff: 6,
    statics: [{ hx: 30, hy: 0.06, hz: 1.6, x: 0, y: -0.05, z: 52, kind: "tracks", fr: 0.9 }],
    // trilho rente ao chão: passou do alvo = fica em cima do trilho
    movers: [{ hx: 22, hy: 1.8, hz: 1.6, kind: "train", kill: true, fr: 0.6, motion: (t) => ({ x: -75 + 30 * Math.max(0, t - 1.8), y: 1.95, z: 52 }) }],
    parked: [{ x: -5.5, z: 48.4, yaw: H, color: 3066993 }],
    cones: [],
    cam: "chase"
  },
  {
    // telhado: sobe a rampa até o telhado; a descida escorrega (telha) — tocar cedo, perto do topo
    name: "roof",
    speed: 13,
    yaw: H,
    start: [0, 0],
    ground: "lot",
    mu: 0.45,
    target: [0, 44],
    targetY: 2,
    targetYaw: H,
    falloff: 6,
    statics: [
      { hx: 4, hy: 0.15, hz: 2.06, x: 0, y: 0.049, z: 20, rx: -0.0997, kind: "ramp" },
      { hx: 4, hy: 0.15, hz: 2.138, x: 0, y: 0.843, z: 24, rx: -0.2915, kind: "ramp" },
      { hx: 4, hy: 0.15, hz: 2.264, x: 0, y: 2.384, z: 28, rx: -0.4434, kind: "ramp" },
      { hx: 4, hy: 0.15, hz: 3, x: 0, y: 3.35, z: 33, kind: "roofTop" },
      { hx: 4, hy: 0.15, hz: 8.1, x: 0, y: 2.05 - 0.15, z: 44, rx: Math.atan2(2.7, 16), kind: "roofTile", fr: 0.45 }
    ],
    parked: [],
    cones: [],
    cam: "frame",
    frameZ: 26
  },
  {
    // elevador: a plataforma sobe e desce no poço; derrapar para dentro quando ela estiver no nível
    name: "lift",
    speed: 14,
    yaw: H,
    start: [0, 0],
    ground: "none",
    fallY: -3,
    target: [0, 44],
    targetYaw: H,
    falloff: 5,
    targetOn: 0,
    targetRel: [0, 0],
    statics: [
      { hx: 6, hy: 0.5, hz: 20, x: 0, y: -0.5, z: 20, kind: "deck" },
      { hx: 6, hy: 0.5, hz: 25, x: 0, y: -0.5, z: 73, kind: "deck" },
      { hx: 6, hy: 0.5, hz: 4, x: 0, y: -12.5, z: 44, kind: "pitfloor" }
    ],
    movers: [{ hx: 5.6, hy: 0.3, hz: 3.8, kind: "lift", fr: 1, motion: (t) => {
      const y = t < 2.7 ? -9 : t < 3.3 ? -9 + (t - 2.7) / 0.6 * 9 : t < 7.5 ? 0 : t < 8.1 ? -(t - 7.5) / 0.6 * 9 : -9;
      return { x: 0, y: y - 0.3, z: 44 };
    } }],
    parked: [],
    cones: [],
    cam: "chase"
  },
  {
    // ponte de cordas: as tábuas afundam embaixo do carro e balançam; a vaga fica no meio
    name: "rope",
    speed: 14,
    yaw: H,
    start: [0, 0],
    ground: "none",
    water: -12,
    target: [0, 50],
    targetYaw: H,
    falloff: 6,
    targetOn: 9,
    targetRel: [0, 0],
    statics: [{ hx: 5, hy: 0.5, hz: 25, x: 0, y: -0.5, z: 5, kind: "deck" }, { hx: 5, hy: 0.5, hz: 15, x: 0, y: -0.5, z: 85, kind: "deck" }],
    movers: Array.from({ length: 20 }, (_, i) => {
      const zc = 31 + i * 2;
      const yAt = (z, t, cp) => {
        const u = (z - 30) / 40;
        let y = -0.7 * Math.sin(Math.PI * u);
        if (cp && cp.z > 27 && cp.z < 73) y -= 0.45 * Math.exp(-(((z - cp.z) / 8) ** 2)) * Math.sin(Math.PI * Math.min(1, Math.max(0, (cp.z - 27) / 46)));
        return y + 0.12 * Math.sin(t * 2.1 + u * 3) * Math.sin(Math.PI * u);
      };
      return { hx: 2.7, hy: 0.12, hz: 1.08, kind: "plank", fr: 1, motion: (t, cp) => {
        const y = yAt(zc, t, cp), y1 = yAt(zc + 0.5, t, cp), y0 = yAt(zc - 0.5, t, cp);
        return { x: 0.15 * Math.sin(t * 1.3) * Math.sin(Math.PI * (zc - 30) / 40), y: y - 0.12, z: zc, rx: -Math.atan2(y1 - y0, 1) };
      } };
    }),
    parked: [],
    cones: [],
    cam: "chase"
  },
  {
    // vento: rajadas empurram o carro durante o deslize; a biruta mostra a direção
    name: "wind",
    speed: 10,
    yaw: H,
    spin: -270,
    curve: -70,
    curveRate: 3,
    start: [-3, 14],
    ground: "lot",
    // gira 270° para o outro lado e entra de RÉ, com rajadas
    wind: (t) => [2.6 * Math.sin(t * 0.9 + 0.6) + 1 * Math.sin(t * 2.3), 1.2 * Math.sin(t * 0.7 + 2)],
    target: [-11.9, 43.3],
    targetYaw: H,
    falloff: 6,
    parked: [{ x: -11.9, z: 38.5, yaw: H, color: 9807270 }, { x: -11.9, z: 48.1, yaw: H, color: 15105570 }, { x: -11.9, z: 52.3, yaw: H, color: 9323693 }, { x: 5, z: 44, yaw: -H, color: 15909424 }],
    cones: [],
    cam: "chase"
  },
  {
    // salto no contêiner: toca antes da rampa, pula girando e tem que parar EM CIMA do contêiner (caiu no chão = 0)
    name: "double",
    speed: 21,
    yaw: Math.PI,
    start: [0, -10],
    ground: "lot",
    airSpin: true,
    driftMu: 0.3,
    target: [-1.2, 71],
    targetY: 2.6,
    targetYaw: Math.PI,
    falloff: 7,
    onTop: 2,
    airTapLate: true,
    statics: [
      { hx: 2.6, hy: 0.15, hz: 1.563, x: 0, y: 0.049, z: 23.5, rx: -0.1326, kind: "ramp" },
      { hx: 2.6, hy: 0.15, hz: 1.648, x: 0, y: 0.79, z: 26.5, rx: -0.3514, kind: "ramp" },
      { hx: 2.6, hy: 0.15, hz: 1.727, x: 0, y: 2.082, z: 29.5, rx: -0.4636, kind: "ramp" },
      { hx: 1.28, hy: 1.3, hz: 6.1, x: -2.6, y: 1.3, z: 60, kind: "container", fr: 0.8 },
      { hx: 1.28, hy: 1.3, hz: 6.1, x: 0, y: 1.3, z: 60, kind: "container2", fr: 0.8 },
      { hx: 1.28, hy: 1.3, hz: 6.1, x: 2.6, y: 1.3, z: 60, kind: "container3", fr: 0.8 },
      { hx: 1.28, hy: 1.3, hz: 6.1, x: -2.6, y: 1.3, z: 72.3, kind: "container2", fr: 0.8 },
      { hx: 1.28, hy: 1.3, hz: 6.1, x: 0, y: 1.3, z: 72.3, kind: "container3", fr: 0.8 },
      { hx: 1.28, hy: 1.3, hz: 6.1, x: 2.6, y: 1.3, z: 72.3, kind: "container", fr: 0.8 }
    ],
    parked: [],
    cones: [],
    cam: "chase"
  }
];
var ORDER = ["lot", "gas", "bridge", "double", "drawbridge", "ice", "jump", "container", "train", "trampoline", "loop", "ship"];
var IDEAL = { lot: 2.5, bridge: 2.117, gas: 2.483, container: 1.417, ship: 4.25, jump: 1.367, ice: 2.567, drawbridge: 3.383, train: 2.05, loop: 3.567, trampoline: 1.183, double: 1.233 };
var TAPZONE = { double: [0, 0, 15.7], jump: [0, 0, 18.8], trampoline: [0, 4.5, 9.9] };
var LEVELS = ORDER.map((n) => LEVELS_RAW.find((l) => l.name === n)).map((L, i) => ({ id: i + 1, statics: [], falloff: 7, tapIdeal: IDEAL[L.name], tapZone: TAPZONE[L.name], ...L }));
var qrot = (q, v) => {
  const { x, y, z, w } = q, vx = v[0], vy = v[1], vz = v[2];
  const ix = w * vx + y * vz - z * vy, iy = w * vy + z * vx - x * vz, iz = w * vz + x * vy - y * vx, iw = -x * vx - y * vy - z * vz;
  return [ix * w + iw * -x + iy * -z - iz * -y, iy * w + iw * -y + iz * -x - ix * -z, iz * w + iw * -z + ix * -y - iy * -x];
};
var dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
var cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
var add = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
var mul = (a, s) => [a[0] * s, a[1] * s, a[2] * s];
var yawQ = (yaw) => ({ x: 0, y: Math.sin(yaw / 2), z: 0, w: Math.cos(yaw / 2) });
var rotY = (v, a) => {
  const c = Math.cos(a), s = Math.sin(a);
  return [v[0] * c + v[2] * s, v[1], -v[0] * s + v[2] * c];
};
var wrap = (a) => {
  while (a > Math.PI) a -= 2 * Math.PI;
  while (a < -Math.PI) a += 2 * Math.PI;
  return a;
};
var clamp = (v, a, b) => v < a ? a : v > b ? b : v;
var qmul = (a, b) => ({
  w: a.w * b.w - a.x * b.x - a.y * b.y - a.z * b.z,
  x: a.w * b.x + a.x * b.w + a.y * b.z - a.z * b.y,
  y: a.w * b.y - a.x * b.z + a.y * b.w + a.z * b.x,
  z: a.w * b.z + a.x * b.y - a.y * b.x + a.z * b.w
});
var qxz = (rx = 0, rz = 0, ry = 0) => qmul(qmul({ x: 0, y: Math.sin(ry / 2), z: 0, w: Math.cos(ry / 2) }, { x: 0, y: 0, z: Math.sin(rz / 2), w: Math.cos(rz / 2) }), { x: Math.sin(rx / 2), y: 0, z: 0, w: Math.cos(rx / 2) });
function scoreFor(d, falloff = 7) {
  if (d < 0.3) return 1e3;
  return Math.max(0, Math.round(1e3 * (1 - d / falloff)));
}
function createSim(R, level) {
  const world = new R.World({ x: 0, y: -9.81, z: 0 });
  world.timestep = 1 / 60;
  const statics = [];
  const rampCols = /* @__PURE__ */ new Set();
  let onRamp = false, rampEntry = null;
  const bouncyCols = /* @__PURE__ */ new Set(), loopCols = /* @__PURE__ */ new Set();
  let onBouncy = false, onLoop = false;
  const addStatic = (hx, hy, hz, x, y, z, kind, fr = 0.9, rx = 0, rz = 0, ry = 0) => {
    const q = qxz(rx, rz, ry);
    const b = world.createRigidBody(R.RigidBodyDesc.fixed().setTranslation(x, y, z).setRotation(q));
    const col = world.createCollider(R.ColliderDesc.cuboid(hx, hy, hz).setFriction(fr), b);
    if (kind === "ramp" || kind === "loop") rampCols.add(col.handle);
    if (kind === "bouncy") bouncyCols.add(col.handle);
    if (kind === "loop") loopCols.add(col.handle);
    statics.push({ hx, hy, hz, x, y, z, kind, rx, q });
  };
  if (level.ground === "lot") addStatic(420, 0.5, 420, 0, -0.5, 80, "ground");
  if (level.ground === "bridge") {
    const d = level.deck, hx = (d.x1 - d.x0) / 2, hz = (d.z1 - d.z0) / 2;
    addStatic(hx, 0.5, hz, (d.x0 + d.x1) / 2, -0.5, (d.z0 + d.z1) / 2, "deck");
    addStatic(0.25, 0.45, hz, d.x0 - 0.25, 0.45, (d.z0 + d.z1) / 2, "rail");
    addStatic(0.25, 0.45, hz, d.x1 + 0.25, 0.45, (d.z0 + d.z1) / 2, "rail");
  }
  if (level.container) {
    const c = level.container;
    addStatic(c.hx, c.hy, c.hz, c.x, c.hy, c.z, "container", 0.6);
  }
  if (level.curb) {
    const c = level.curb;
    addStatic(c.hx, c.hy, c.hz, c.x, c.hy, c.z, "curb", 1);
  }
  const attempt = level.attempt || 0;
  const extra = typeof level.statics === "function" ? level.statics(attempt) : level.statics;
  for (const c of extra) addStatic(c.hx, c.hy, c.hz, c.x, c.y, c.z, c.kind, c.fr ?? 0.9, c.rx || 0, c.rz || 0, c.ry || 0);
  const movers = (level.movers || []).map((m) => {
    const s0 = m.motion(0);
    const b = world.createRigidBody(R.RigidBodyDesc.kinematicPositionBased().setTranslation(s0.x, s0.y, s0.z).setRotation({ x: Math.sin((s0.rx || 0) / 2), y: 0, z: 0, w: Math.cos((s0.rx || 0) / 2) }));
    const mc = world.createCollider(R.ColliderDesc.cuboid(m.hx, m.hy, m.hz).setFriction(m.fr ?? 0.9), b);
    if (m.kind === "plank") rampCols.add(mc.handle);
    return { ...m, body: b };
  });
  const moveMovers = (t) => {
    const cp = car.translation();
    for (const m of movers) {
      const s1 = m.motion(t, cp);
      m.body.setNextKinematicTranslation({ x: s1.x, y: s1.y, z: s1.z });
      m.body.setNextKinematicRotation({ x: Math.sin((s1.rx || 0) / 2), y: 0, z: 0, w: Math.cos((s1.rx || 0) / 2) });
    }
  };
  const targetPos = () => {
    if (level.targetOn === void 0) return [level.target[0], level.targetY || 0, level.target[1]];
    const b = movers[level.targetOn].body, t = b.translation(), r = level.targetRel || [0, 0];
    const o = qrot(b.rotation(), [r[0], movers[level.targetOn].hy, r[1]]);
    return [t.x + o[0], t.y + o[1], t.z + o[2]];
  };
  const groundVel = (hit, cp) => {
    const gb = hit.collider.parent();
    if (!gb || gb.isFixed()) return [0, 0, 0];
    const t = gb.translation(), lv = gb.linvel(), av = gb.angvel();
    return add([lv.x, lv.y, lv.z], cross([av.x, av.y, av.z], [cp[0] - t.x, cp[1] - t.y, cp[2] - t.z]));
  };
  const mkCar = (x, z, yaw, mass, y = 0.72, bodyFr = 0.5) => {
    const b = world.createRigidBody(R.RigidBodyDesc.dynamic().setTranslation(x, y, z).setRotation(yawQ(yaw)).setLinearDamping(0.02).setAngularDamping(0.2).setCanSleep(false).setCcdEnabled(true));
    const m = mass, I = [m / 12 * (0.84 ** 2 + 4.4 ** 2), m / 12 * (2 ** 2 + 4.4 ** 2), m / 12 * (2 ** 2 + 0.84 ** 2)];
    world.createCollider(R.ColliderDesc.cuboid(CAR.hw, CAR.hh, CAR.hl).setFriction(bodyFr).setRestitution(0.1).setMassProperties(m, { x: 0, y: CAR.comY, z: 0 }, { x: I[0], y: I[1], z: I[2] }, { x: 0, y: 0, z: 0, w: 1 }), b);
    for (const [wx, wz] of WHEELS) world.createCollider(R.ColliderDesc.ball(0.17).setTranslation(wx * 1.05, -0.36, wz).setFriction(bodyFr === 0.5 ? 1.2 : bodyFr).setDensity(1e-4), b);
    return b;
  };
  const car = mkCar(level.start[0], level.start[1], 0, CAR.mass, level.startY ?? 0.72, level.airSpin ? 0.05 : 0.5);
  const props = (level.props || []).map((o) => {
    const b = world.createRigidBody(R.RigidBodyDesc.dynamic().setTranslation(o.x, o.y, o.z).setRotation(qxz(o.rx || 0, o.rz || 0, o.ry || 0)).setCanSleep(false).setLinearDamping(0.05).setAngularDamping(0.1));
    world.createCollider(R.ColliderDesc.cuboid(o.hx, o.hy, o.hz).setFriction(o.fr ?? 0.6).setRestitution(0.05).setDensity(o.density ?? 150), b);
    return { ...o, body: b };
  });
  car.setLinvel({ x: 0, y: 0, z: level.speed }, true);
  const parked = level.parked.map((p) => ({ ...p, body: mkCar(p.x, p.z, p.yaw, CAR.mass, p.y ?? 0.72) }));
  const st = {
    t: 0,
    tapped: false,
    tapT: -1,
    lockAll: false,
    done: false,
    still: 0,
    fell: false,
    score: 0,
    dist: 0,
    flew: false,
    landed: false,
    hits: 0,
    touched: false,
    attempt,
    crashed: false,
    tripped: false,
    lastHit: null,
    wheels: WHEELS.map(() => ({ comp: 0, steer: 0, grounded: false, spin: 0 }))
  };
  function wheelForces(body, isPlayer) {
    const p = body.translation(), q = body.rotation(), lv = body.linvel(), av = body.angvel();
    const P = [p.x, p.y, p.z], V = [lv.x, lv.y, lv.z], W = [av.x, av.y, av.z];
    const up = qrot(q, [0, 1, 0]), fwd = qrot(q, [0, 0, 1]);
    const com = add(P, mul(up, CAR.comY));
    const yaw = Math.atan2(fwd[0], fwd[2]);
    let steer = 0, grounded = 0;
    let e = wrap(level.yaw - yaw);
    if (isPlayer && level.spin !== void 0) {
      if (st.yawP === void 0) {
        st.yawP = yaw;
        st.yawU = yaw;
      }
      st.yawU += wrap(yaw - st.yawP);
      st.yawP = yaw;
      if (st.spinStart !== void 0) {
        if (st.spinT === void 0) st.spinT = st.yawU + level.spin * deg;
        e = st.spinT - st.yawU;
      }
    }
    if (isPlayer && st.tapped) steer = clamp(e * 0.8, -0.55, 0.55);
    for (let i = 0; i < 4; i++) {
      const [wx, wz, front] = WHEELS[i];
      const o = add(P, qrot(q, [wx, SUSP.y, wz]));
      const hit = world.castRay(
        new R.Ray({ x: o[0], y: o[1], z: o[2] }, { x: -up[0], y: -up[1], z: -up[2] }),
        SUSP.len,
        true,
        void 0,
        void 0,
        void 0,
        body
      );
      const ws = isPlayer ? st.wheels[i] : null;
      if (!hit || up[1] < 0.82) {
        if (ws) {
          ws.grounded = false;
          ws.comp = 0;
        }
        continue;
      }
      const d = hit.timeOfImpact;
      const cp = add(o, mul(up, -d));
      const ap = add(o, mul(up, -d * ROLL));
      const gv = groundVel(hit, cp);
      const vp = add(add(V, cross(W, add(o, mul(com, -1)))), mul(gv, -1));
      const vu = dot(vp, up);
      const N = clamp(SUSP.k * (SUSP.rest - d) - SUSP.c * vu, 0, 12e3);
      const Nf = Math.min(N, NFRIC);
      grounded++;
      if (isPlayer && rampCols.has(hit.collider.handle)) onRamp = true;
      if (isPlayer && bouncyCols.has(hit.collider.handle)) onBouncy = true;
      if (isPlayer && loopCols.has(hit.collider.handle)) onLoop = true;
      const a = front ? steer : 0;
      const wf = qrot(q, rotY([0, 0, 1], a)), wr = cross(up, wf);
      const vf = dot(vp, wf), vs = dot(vp, wr);
      let Ff = 0, Fs = 0;
      const locked = isPlayer ? st.tapped || st.done : true;
      if (locked) {
        const mu = isPlayer ? level.airSpin && !st.landed ? level.driftMu : level.mu ?? 0.62 : 0.85, sp2 = Math.hypot(vf, vs);
        if (sp2 > 0.5) {
          Ff = -vf * mu * Nf / sp2;
          Fs = -vs * mu * Nf / sp2;
        } else {
          const mw = CAR.mass / 4, dt = world.timestep;
          Ff = -mw * (vf / dt + dot(GRAV, wf));
          Fs = -mw * (vs / dt + dot(GRAV, wr));
          const m = Math.hypot(Ff, Fs), lim = mu * Nf;
          if (m > lim) {
            Ff *= lim / m;
            Fs *= lim / m;
          }
        }
      } else {
        const mu = level.grip ?? 1.05;
        Fs = -Nf * clamp(vs * 2.5, -mu, mu);
        if (isPlayer && !st.tapped && !st.crashed && !front) Ff = clamp((level.speed - dot(add(V, mul(gv, -1)), fwd)) * CAR.mass * 1.5 / 2, -mu * Nf, mu * Nf);
        else Ff = -Math.sign(vf) * 0.015 * Nf;
        const m = Math.hypot(Ff, Fs), lim = mu * Nf;
        if (m > lim) {
          Ff *= lim / m;
          Fs *= lim / m;
        }
      }
      const F = add(add(mul(up, N), mul(wf, Ff)), mul(wr, Fs));
      body.addForceAtPoint({ x: F[0], y: F[1], z: F[2] }, { x: ap[0], y: ap[1], z: ap[2] }, true);
      if (ws) {
        ws.cp = cp;
        ws.grounded = true;
        ws.comp = SUSP.rest - d;
        ws.steer = a;
        ws.spin += (locked ? 0 : vf) / 60 / 0.36;
      }
    }
    if (isPlayer) {
      st.yaw = yaw;
      if (grounded === 0 && st.t > 0.3) st.flew = true;
      else if (st.flew && grounded >= 3) st.landed = true;
      const inAir = grounded < 2;
      if (level.airRight && st.tapped && grounded === 0) {
        const qt = yawQ(level.yaw), qc = body.rotation(), qe = qmul(qt, { x: -qc.x, y: -qc.y, z: -qc.z, w: qc.w });
        const sgn = qe.w < 0 ? -1 : 1, ang = 2 * Math.acos(Math.min(1, Math.abs(qe.w))), sn = Math.sqrt(Math.max(1e-9, 1 - qe.w * qe.w));
        const k = Math.min(7, ang * 3.2) / (sn || 1);
        body.setAngvel({ x: qe.x * sgn * k, y: qe.y * sgn * k, z: qe.z * sgn * k }, true);
      }
      if (level.airSpin && grounded === 0) {
        const av2 = body.angvel(), q2 = body.rotation(), up2 = qrot(q2, [0, 1, 0]);
        const lev = cross(up2, [0, 1, 0]);
        body.setAngvel({ x: av2.x * 0.85 + lev[0] * 3 * world.timestep * 60 * 0.05, y: av2.y, z: av2.z * 0.85 + lev[2] * 3 * world.timestep * 60 * 0.05 }, true);
      }
      if (st.tapped && st.spinStart === void 0 && (grounded >= 2 || level.loop)) st.spinStart = st.t;
      if (st.spinStart !== void 0 && (!inAir || level.airSpin) && st.t - st.spinStart < ASSIST.time) {
        const Iy = CAR.mass / 12 * (4 + 19.36);
        const kp = inAir ? ASSIST.airKp : ASSIST.kp, kd = inAir ? ASSIST.airKd : ASSIST.kd;
        const tq = clamp(Iy * (kp * e - kd * dot(W, up)), -Iy * ASSIST.max, Iy * ASSIST.max);
        body.addTorque({ x: up[0] * tq, y: up[1] * tq, z: up[2] * tq }, true);
      }
    }
  }
  let lastV = null;
  function step() {
    const v0 = car.linvel();
    const vb = [v0.x, v0.y, v0.z];
    car.resetForces(true);
    car.resetTorques(true);
    for (const p2 of parked) {
      p2.body.resetForces(true);
      p2.body.resetTorques(true);
    }
    moveMovers(st.t + world.timestep);
    onRamp = false;
    onBouncy = false;
    onLoop = false;
    if (level.wind) {
      const w2 = level.wind(st.t);
      car.addForce({ x: w2[0] * CAR.mass, y: 0, z: w2[1] * CAR.mass }, true);
      st.windNow = w2;
    }
    wheelForces(car, true);
    if (level.curve && st.spinStart !== void 0 && !st.crashed) {
      const g = st.wheels.filter((w2) => w2.grounded).length, v = car.linvel(), sp3 = Math.hypot(v.x, v.z);
      const left = Math.abs(level.curve) * deg - (st.curved || 0);
      if (g >= 2 && sp3 > 1.5 && left > 0) {
        const rate = Math.min(level.curveRate ?? 1.6, left / world.timestep), sg = Math.sign(level.curve), f = CAR.mass * sp3 * rate;
        car.addForce({ x: sg * v.z / sp3 * f, y: 0, z: -sg * v.x / sp3 * f }, true);
        st.curved = (st.curved || 0) + rate * world.timestep;
      }
    }
    for (const p2 of parked) wheelForces(p2.body, false);
    world.step();
    if (onBouncy) {
      const v = car.linvel();
      if (v.y < -1.5) st.bounces = (st.bounces || 0) + 1;
      if (v.y < -1.5) car.setLinvel({ x: v.x, y: Math.max(-v.y * (level.bounce ?? 0.9), level.bounceMin ?? 0), z: v.z }, true);
    }
    if (level.loop) {
      const Lp = level.loop, rr = Lp.R - 1;
      if (st.loopA === void 0 && !st.tapped) {
        const p0 = car.translation();
        if (p0.z >= Lp.zc && p0.y < 1.6) {
          const v02 = car.linvel();
          st.loopA = 0;
          st.loopV = Math.hypot(v02.x, v02.y, v02.z);
          st.loopY0 = 0.59;
        }
      }
      if (st.loopA !== void 0 && st.loopA !== null) {
        if (st.tapped || st.loopA >= 2 * Math.PI) {
          if (st.tapped && st.loopA < 2 * Math.PI) st.loopReleased = true;
          st.noHitUntil = st.t + 0.2;
          const a = Math.min(st.loopA, 2 * Math.PI), v = st.loopA >= 2 * Math.PI ? st.loopV : Math.min(st.loopV, Lp.releaseV ?? 6);
          car.setLinvel({ x: a >= 2 * Math.PI ? 0 : 0, y: Math.sin(a) * v, z: Math.cos(a) * v }, true);
          if (a >= 2 * Math.PI) {
            car.setRotation(yawQ(0), true);
            car.setAngvel({ x: 0, y: 0, z: 0 }, true);
          } else car.setAngvel({ x: -v / rr, y: 0, z: 0 }, true);
          st.loopA = null;
          st.loopDone = true;
        } else {
          st.loopA += st.loopV / rr * world.timestep;
          const a = st.loopA;
          const y = Lp.R - rr * Math.cos(a), z = Lp.zc + rr * Math.sin(a), x = Lp.shift * a / (2 * Math.PI);
          st.loopV = Math.sqrt(Math.max(4, st.loopV ** 2 - 2 * 9.81 * (y - (st.loopYp ?? st.loopY0))));
          st.loopYp = y;
          car.setTranslation({ x, y, z }, true);
          car.setRotation({ x: Math.sin(-a / 2), y: 0, z: 0, w: Math.cos(-a / 2) }, true);
          car.setLinvel({ x: Lp.shift / (2 * Math.PI * Lp.R) * st.loopV, y: Math.sin(a) * st.loopV, z: Math.cos(a) * st.loopV }, true);
          car.setAngvel({ x: -st.loopV / rr, y: 0, z: 0 }, true);
        }
      }
    }
    if (onLoop && level.loop) {
      const v = car.linvel(), sp3 = Math.hypot(v.x, v.y, v.z);
      car.setLinvel({ x: level.loop.shift / (2 * Math.PI * level.loop.R) * sp3, y: v.y, z: v.z }, true);
    }
    {
      const v = car.linvel(), y = car.translation().y, v2 = v.x * v.x + v.y * v.y + v.z * v.z;
      if (onRamp && !(st.tapped && !level.airSpin)) {
        if (!rampEntry) rampEntry = { v2, y };
        const want = rampEntry.v2 - 2 * 9.81 * (y - rampEntry.y) - (st.tapped ? 2 * 9.81 * (level.driftMu ?? 0.1) * 0.6 : 0);
        if (want > 1 && v2 < want * 0.97) {
          const k = Math.sqrt(want * 0.97 / v2);
          car.setLinvel({ x: v.x * k, y: v.y * k, z: v.z * k }, true);
        }
      } else if (rampEntry && st.wheels.every((w2) => !w2.grounded)) rampEntry = null;
    }
    st.t += world.timestep;
    const p = car.translation(), lv = car.linvel(), av = car.angvel();
    const dvx = lv.x - vb[0], dvz = lv.z - vb[2], spB = Math.hypot(vb[0], vb[2]);
    const loss = spB - Math.hypot(lv.x, lv.z);
    const dv = loss > TRIP.minDv * 0.6 ? Math.hypot(dvx, dvz) : 0;
    if (st.tapped && dv > (level.touchDv ?? 99) && spB > 0.5) st.touched = true;
    if (dv > TRIP.minDv && spB > 2 && vb[1] > -2.5 && !(st.noHitUntil && st.t < st.noHitUntil)) {
      st.hits++;
      st.lastHit = { t: st.t, dv, x: p.x, y: p.y, z: p.z };
      if (!st.tapped && !level.noCrash) st.crashed = true;
      else if (!st.tripped && dv > TRIP.rollDv) {
        st.tripped = true;
        const q = car.rotation(), up = qrot(q, [0, 1, 0]);
        const dir = [vb[0] / spB, 0, vb[2] / spB], ax = cross(up, dir), al = Math.hypot(...ax) || 1;
        const I = CAR.mass / 12 * (4 + 0.84 ** 2) + CAR.mass * 1.1 * 1.1, w2 = Math.min(TRIP.maxW, (dv - TRIP.rollDv) * TRIP.gain + TRIP.base);
        const imp = I * w2 / al;
        car.applyTorqueImpulse({ x: ax[0] * imp, y: ax[1] * imp, z: ax[2] * imp }, true);
        car.applyImpulse({ x: 0, y: CAR.mass * TRIP.hop, z: 0 }, true);
      }
    }
    for (const m of movers) if (m.kill && !st.killed) {
      const mp = m.body.translation(), mv = m.body.linvel();
      if (Math.abs(p.x - mp.x) < m.hx + 1.6 && Math.abs(p.z - mp.z) < m.hz + 1.15 && p.y < mp.y + m.hy + 0.5) {
        st.killed = true;
        st.hits++;
        st.lastHit = { t: st.t, dv: 20, x: p.x, y: p.y, z: p.z };
        car.setLinvel({ x: mv.x * 0.9, y: 7, z: mv.z * 0.9 + (p.z < mp.z ? -3 : 3) }, true);
        car.setAngvel({ x: 2.5, y: 4, z: -6 }, true);
      }
    }
    if (st.done) return;
    const sp2 = Math.hypot(lv.x, lv.y, lv.z), w = Math.hypot(av.x, av.y, av.z);
    const tp = targetPos();
    st.target = tp;
    st.dist = Math.hypot(p.x - tp[0], p.z - tp[2]);
    if (p.y < (level.fallY ?? (level.water !== void 0 ? level.water + 0.3 : -6))) {
      st.fell = true;
      finish();
      return;
    }
    let rv = sp2;
    if (level.targetOn !== void 0) {
      const mv = movers[level.targetOn].body.linvel();
      rv = Math.hypot(lv.x - mv.x, lv.y - mv.y, lv.z - mv.z);
    }
    let propsMoving = false;
    if (level.chainProp !== void 0) for (const o of props) {
      const v = o.body.linvel(), a = o.body.angvel();
      if (Math.hypot(v.x, v.y, v.z) > 0.2 || Math.hypot(a.x, a.y, a.z) > 0.3) propsMoving = true;
    }
    if (st.tapped && rv < 0.25 && w < 0.3 && !propsMoving) st.still += world.timestep;
    else st.still = 0;
    if (st.still > 0.5 || st.t > 14 || !st.tapped && st.t > 8 || st.crashed && st.t - st.lastHit.t > 1.5) finish();
  }
  function finish() {
    st.done = true;
    st.score = st.fell || !st.tapped || st.crashed || st.killed ? 0 : scoreFor(st.dist, level.falloff);
    if (level.chainProp !== void 0) {
      const q = props[level.chainProp].body.rotation();
      st.chainDone = qrot(q, [0, 1, 0])[1] < 0.6;
      if (!st.chainDone) st.score = 0;
    }
    if (level.loop && !st.loopReleased) st.score = 0;
    if (level.airTapLate && st.tapAir) st.score = 0;
    if (level.onTop !== void 0 && car.translation().y < level.onTop) st.score = 0;
    if (st.touched && level.touchFactor) st.score = Math.round(st.score * level.touchFactor);
    const z = level.secret, p = car.translation();
    if (z && st.tapped && !st.fell && Math.abs(p.x - z.x) < z.hx && Math.abs(p.z - z.z) < z.hz && p.y > z.yMin && p.y < z.yMax) {
      st.legend = true;
      st.score = z.score;
    }
  }
  function tap() {
    if (!st.tapped && !st.done && !st.crashed) {
      st.tapped = true;
      st.tapT = st.t;
      st.tapAir = st.wheels.every((w) => !w.grounded);
    }
  }
  return { world, car, parked, statics, movers, props, level, st, step, tap, targetPos };
}

// glb_mini.js

var COMP = { 5120: Int8Array, 5121: Uint8Array, 5122: Int16Array, 5123: Uint16Array, 5125: Uint32Array, 5126: Float32Array };
var NC = { SCALAR: 1, VEC2: 2, VEC3: 3, VEC4: 4 };
var BUFS = {};
function prefetchGLB(urls) {
  for (const u of urls) BUFS[u] ??= fetch(u).then((r) => r.arrayBuffer());
}
async function loadGLB(url, matFor) {
  const buf = await (BUFS[url] ??= fetch(url).then((r) => r.arrayBuffer())), dv = new DataView(buf);
  let off = 12, json = null, bin = null;
  while (off < buf.byteLength) {
    const len = dv.getUint32(off, true), type = dv.getUint32(off + 4, true);
    if (type === 1313821514) json = JSON.parse(new TextDecoder().decode(new Uint8Array(buf, off + 8, len)));
    else if (type === 5130562) bin = buf.slice(off + 8, off + 8 + len);
    off += 8 + len;
  }
  const acc2 = (i) => {
    const a = json.accessors[i], bv = json.bufferViews[a.bufferView], T2 = COMP[a.componentType], n = NC[a.type];
    const start = (bv.byteOffset || 0) + (a.byteOffset || 0);
    if (bv.byteStride && bv.byteStride !== n * T2.BYTES_PER_ELEMENT) {
      const out = new T2(a.count * n), src = new DataView(bin);
      for (let k = 0; k < a.count; k++) for (let c = 0; c < n; c++) out[k * n + c] = T2 === Float32Array ? src.getFloat32(start + k * bv.byteStride + c * 4, true) : src["get" + T2.name.replace("Array", "")](start + k * bv.byteStride + c * T2.BYTES_PER_ELEMENT, true);
      return new THREE.BufferAttribute(out, n);
    }
    return new THREE.BufferAttribute(new T2(bin, start, a.count * n), n);
  };
  const texCache = {}, matCache = {};
  const texOf = async (ti) => texCache[ti] ??= (async () => {
    const im = json.images[json.textures[ti].source], bv = json.bufferViews[im.bufferView];
    const bmp = await createImageBitmap(new Blob([new Uint8Array(bin, bv.byteOffset || 0, bv.byteLength)], { type: im.mimeType }), { imageOrientation: "none" });
    const t = new THREE.Texture(bmp);
    t.flipY = false;
    t.colorSpace = THREE.SRGBColorSpace;
    t.needsUpdate = true;
    return t;
  })();
  for (let i = 0; i < (json.materials || []).length; i++) {
    const md = json.materials[i], pb = md.pbrMetallicRoughness || {};
    const m = new THREE.MeshStandardMaterial({ color: new THREE.Color().fromArray((pb.baseColorFactor || [1, 1, 1, 1]).slice(0, 3)), roughness: pb.roughnessFactor ?? 1, metalness: pb.metallicFactor ?? 1 });
    const tx = pb.baseColorTexture && json.textures[pb.baseColorTexture.index], im = tx && json.images[tx.source];
    if (im && im.bufferView !== void 0) m.map = await texOf(pb.baseColorTexture.index);
    m.name = md.name;
    matCache[i] = m;
  }
  const meshCache = {};
  const mkMesh = (mi) => {
    const g = new THREE.Group();
    for (const p of json.meshes[mi].primitives) {
      const geo = new THREE.BufferGeometry();
      geo.setAttribute("position", acc2(p.attributes.POSITION));
      if (p.attributes.NORMAL !== void 0) geo.setAttribute("normal", acc2(p.attributes.NORMAL));
      else geo.computeVertexNormals();
      if (p.attributes.TEXCOORD_0 !== void 0) geo.setAttribute("uv", acc2(p.attributes.TEXCOORD_0));
      if (p.indices !== void 0) geo.setIndex(acc2(p.indices));
      const mname = p.material !== void 0 ? json.materials[p.material].name : "";
      const m = new THREE.Mesh(geo, matFor && matFor(mname) || matCache[p.material] || new THREE.MeshStandardMaterial());
      m.castShadow = true;
      m.receiveShadow = true;
      g.add(m);
    }
    return g;
  };
  const mkNode = (ni) => {
    const n = json.nodes[ni], o = n.mesh !== void 0 ? mkMesh(n.mesh) : new THREE.Group();
    o.name = n.name || "";
    if (n.translation) o.position.fromArray(n.translation);
    if (n.rotation) o.quaternion.fromArray(n.rotation);
    if (n.scale) o.scale.fromArray(n.scale);
    if (n.matrix) new THREE.Matrix4().fromArray(n.matrix).decompose(o.position, o.quaternion, o.scale);
    for (const c of n.children || []) o.add(mkNode(c));
    return o;
  };
  const root = new THREE.Group();
  for (const ni of json.scenes[json.scene || 0].nodes) root.add(mkNode(ni));
  return root;
}

// main.js
var PRE_GLB = ["assets/city/Car_13.glb", "assets/city/Car_06.glb", "assets/city/Car_16.glb", "assets/city/Car_19.glb", "assets/city/Van.glb", "assets/city/Futuristic_Car_1.glb", "assets/city/palm.glb", "assets/city/bush.glb", "assets/city/bush3.glb", "assets/city/lamp.glb", "assets/city/trash.glb", "assets/city/trash2.glb", "assets/city/busstop.glb", "assets/city/sign.glb", "assets/city/billboard.glb", "assets/city/tlight.glb", "assets/city/fountain.glb", "assets/city/spot.glb", "assets/city/posto.glb", "assets/city/cont20.glb", "assets/city/cont40.glb", "assets/city/bus.glb", "assets/city/train.glb", "assets/city/ship.glb", "assets/city/trampolim.glb", "assets/city/predio_alvo.glb", "assets/city/predio_barranco.glb", "assets/kenney/building-a.glb", "assets/kenney/building-b.glb", "assets/kenney/building-c.glb", "assets/kenney/building-d.glb", "assets/kenney/building-e.glb", "assets/kenney/building-f.glb", "assets/kenney/building-g.glb", "assets/kenney/building-h.glb", "assets/kenney/building-i.glb", "assets/kenney/building-k.glb", "assets/kenney/building-l.glb", "assets/kenney/building-m.glb", "assets/kenney/building-skyscraper-a.glb", "assets/kenney/building-skyscraper-b.glb", "assets/kenney/building-skyscraper-c.glb", "assets/kenney/building-skyscraper-e.glb"];
var nLoaded = 0;
var loadGLB2 = (...a) => loadGLB(...a).then((r) => {
  nLoaded++;
  const f = document.querySelector("#loader .fill"), pc = document.querySelector("#loader .pct"), k = Math.min(99, Math.round(100 * nLoaded / (PRE_GLB.length + 9)));
  if (f) f.style.width = k + "%";
  if (pc) pc.textContent = k + "%";
  return r;
});
await RAPIER.init();
var Q = new URLSearchParams(location.search);
var LOCAL = /^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname);
var DEBUG = Q.has("debug") && LOCAL;
var SITE = !!document.getElementById("menu");
var GAME = "crazy-parking";
var T = (k, f) => window.CL_I18N ? window.CL_I18N.t(k, f) : k;
var LSP = DEBUG ? "dbg_" : "";
var LSG = { get(k) {
  try {
    return JSON.parse(localStorage.getItem(LSP + k));
  } catch (e) {
    return null;
  }
}, set(k, v) {
  try {
    localStorage.setItem(LSP + k, JSON.stringify(v));
  } catch (e) {
  }
} };
var SND = { on: SITE && LSG.get("cp_snd") !== 0, ac: null, out: null, k: 1 };
var SFILE = ["pneu", "carimpact", "bigimpact", "record", "mission", "click", "engine", "batida", "agua", "boing", "trem", "motor"];
var SBUF = {};
var SLAST = {};
function sndLoad() {
  for (const n of SFILE) {
    if (n in SBUF) continue;
    SBUF[n] = null;
    fetch("assets/snd/" + n + ".mp3").then((r) => {
      if (!r.ok) throw n;
      return r.arrayBuffer();
    }).then((b) => new Promise((ok, no) => SND.ac.decodeAudioData(b, ok, no))).then((d) => {
      SBUF[n] = d;
    }).catch(() => {
      delete SBUF[n];
    });
  }
}
function sndInit() {
  if (SND.ac || !SND.on) return;
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return;
  try {
    SND.ac = new AC();
    const comp = SND.ac.createDynamicsCompressor();
    SND.out = SND.ac.createGain();
    SND.out.gain.value = 0.9;
    SND.out.connect(comp);
    comp.connect(SND.ac.destination);
    sndLoad();
  } catch (e) {
    SND.ac = null;
  }
}
function sndReady() {
  if (!SND.on) return false;
  sndInit();
  if (!SND.ac) return false;
  if (SND.ac.state === "suspended") SND.ac.resume().catch(() => {
  });
  return true;
}
function smp(n, db, o) {
  o = o || {};
  const buf = SBUF[n];
  if (!buf) return;
  const a = SND.ac, t0 = a.currentTime + (o.d || 0), src = a.createBufferSource(), g = a.createGain();
  let r = Math.pow(2, (o.st || 0) / 12), vdb = 0;
  if (o.v) {
    let x;
    do {
      x = Math.round((Math.random() * 2 - 1) * 5);
    } while (x === SLAST[n]);
    SLAST[n] = x;
    r *= 1 + x / 100;
    vdb = (Math.random() * 2 - 1) * 1.5;
  }
  src.buffer = buf;
  src.playbackRate.value = r;
  const gv = Math.pow(10, (db + vdb) / 20) * (SND.k || 1);
  g.gain.setValueAtTime(gv, t0);
  if (o.dur) {
    g.gain.setValueAtTime(gv, t0 + o.dur * 0.6);
    g.gain.exponentialRampToValueAtTime(1e-4, t0 + o.dur);
  }
  src.connect(g);
  g.connect(SND.out);
  src.start(t0);
  if (o.dur) src.stop(t0 + o.dur + 0.02);
}
var SFX = {
  screech() {
    if (sndReady()) smp("pneu", 0, { v: 1, dur: 1.6 });
  },
  crash() {
    if (sndReady()) smp(SBUF.batida ? "batida" : "carimpact", 0, { v: 1 });
  },
  splash() {
    if (sndReady()) {
      if (SBUF.agua) smp("agua", 0);
      else smp("bigimpact", 0, { st: -3 });
    }
  },
  boing() {
    if (sndReady()) smp("boing", 0, { v: 1 });
  },
  train() {
    if (sndReady()) smp("trem", 0);
  },
  perfect() {
    if (sndReady()) smp("record", 0);
  },
  good() {
    if (sndReady()) smp("mission", 0);
  },
  tick() {
    if (sndReady()) smp("click", 0, { v: 1 });
  },
  start() {
    sndReady();
  }
};
var SGAIN = { boing: 0.55, train: 0.6, screech: 0.29, crash: 0.8, splash: 0.7, perfect: 0.48, good: 0.52, tick: 0.47, start: 0.51 };
for (const n in SFX) {
  const f = SFX[n];
  SFX[n] = function(...a) {
    SND.k = SGAIN[n] || 1;
    try {
      f.apply(this, a);
    } finally {
      SND.k = 1;
    }
  };
}
var ENG = { src: null, g: null, buf: null, t: 0 };
function loopBuf(b) {
  const sr = b.sampleRate, cut = Math.floor(0.12 * sr), n = Math.floor(0.45 * sr), src = b.getChannelData(0), x = src.subarray(cut, src.length - cut), L = x.length - n;
  const o = SND.ac.createBuffer(1, L, sr), d = o.getChannelData(0);
  d.set(x.subarray(n));
  for (let i = 0; i < n; i++) {
    const w = i / n;
    d[L - n + i] = x[n + L - n + i] * Math.sqrt(1 - w) + x[i] * Math.sqrt(w);
  }
  return o;
}
function engineTick(on, spd) {
  if (!SND.on || !SND.ac) return;
  const now = SND.ac.currentTime;
  if (now - ENG.t < 0.04) return;
  ENG.t = now;
  const buf = SBUF.motor ? ENG.loop ??= loopBuf(SBUF.motor) : SBUF.engine;
  if (!buf) return;
  if (ENG.buf !== buf) {
    try {
      if (ENG.src) ENG.src.stop();
    } catch (e) {
    }
    ENG.src = null;
  }
  if (!ENG.src) {
    if (!ENG.g) {
      ENG.g = SND.ac.createGain();
      ENG.g.gain.value = 0;
      ENG.g.connect(SND.out);
    }
    const src = SND.ac.createBufferSource();
    src.buffer = buf;
    src.loop = true;
    if (SBUF.motor) {
    } else {
      src.loopStart = buf.duration * 0.3;
      src.loopEnd = buf.duration * 0.8;
    }
    src.connect(ENG.g);
    src.start();
    ENG.src = src;
    ENG.buf = buf;
  }
  ENG.g.gain.setTargetAtTime(on ? 1.1 * (0.75 + 0.25 * Math.min(1, spd / 20)) : 0, now, on ? 0.08 : 0.15);
  ENG.src.playbackRate.setTargetAtTime(0.8 + 0.6 * Math.min(1, spd / 22), now, 0.12);
}
var $ = (id) => document.getElementById(id);
if (DEBUG) $("dbg").style.display = "block";
var canvas = $("c");
var renderer = new THREE2.WebGLRenderer({ canvas, antialias: true, stencil: true, powerPreference: "high-performance" });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE2.PCFShadowMap;
var scene = new THREE2.Scene();
var camera = new THREE2.PerspectiveCamera(60, 9 / 16, 1, 400);
var hemi = new THREE2.HemisphereLight(14675967, 4868672, 1.6);
scene.add(hemi);
var sun = new THREE2.DirectionalLight(16777215, 2.2);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
sun.shadow.bias = -5e-4;
sun.shadow.normalBias = 0.04;
Object.assign(sun.shadow.camera, { left: -45, right: 45, top: 45, bottom: -45, near: 1, far: 120 });
var SUN_OFF = new THREE2.Vector3(8, 20, 4);
scene.add(sun, sun.target);
function resize() {
  const r = $("stage").getBoundingClientRect();
  renderer.setSize(r.width, r.height, false);
  const asp = r.width / r.height;
  camera.aspect = asp;
  camera.fov = asp < 9 / 16 ? 2 * Math.atan(Math.tan(30 * Math.PI / 180) * (9 / 16) / asp) * 180 / Math.PI : 60;
  camera.updateProjectionMatrix();
}
addEventListener("resize", resize);
var M = (c, o = {}) => new THREE2.MeshStandardMaterial({ color: c, roughness: 0.8, ...o });
var boxGeo = new THREE2.BoxGeometry(1, 1, 1);
var wheelGeo = new THREE2.CylinderGeometry(0.36, 0.36, 0.28, 16).rotateZ(Math.PI / 2);
var wheelMat = M(1776411);
var CONE = {
  base: new THREE2.BoxGeometry(0.62, 0.06, 0.62).translate(0, 0.03, 0),
  body: new THREE2.CylinderGeometry(0.05, 0.25, 0.7, 14).translate(0, 0.41, 0),
  band: new THREE2.CylinderGeometry(0.135, 0.17, 0.12, 14).translate(0, 0.5, 0),
  mo: M(16738816, { roughness: 0.55 }),
  mw: M(15921906, { roughness: 0.5 })
};
function makeCone() {
  const g = new THREE2.Group();
  for (const [geo, mt] of [[CONE.base, CONE.mo], [CONE.body, CONE.mo], [CONE.band, CONE.mw]]) {
    const m = new THREE2.Mesh(geo, mt);
    m.castShadow = true;
    g.add(m);
  }
  return g;
}
var ESTILO = Q.get("estilo") || (SITE ? "city" : "");
var ART = { cars: {}, props: {} };
async function loadArt() {
  if (ESTILO === "tiny") return loadTiny();
  if (ESTILO === "real") return loadReal();
  if (ESTILO !== "city" && ESTILO !== "toon") return;
  renderer.toneMapping = THREE2.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  prefetchGLB(PRE_GLB);
  const atlas = await new THREE2.TextureLoader().loadAsync("assets/city/atlas.png");
  atlas.colorSpace = THREE2.SRGBColorSpace;
  atlas.flipY = false;
  atlas.magFilter = THREE2.NearestFilter;
  atlas.generateMipmaps = false;
  atlas.minFilter = THREE2.LinearFilter;
  const mats = {
    base: new THREE2.MeshStandardMaterial({ map: atlas, roughness: 0.85 }),
    gloss: new THREE2.MeshStandardMaterial({ map: atlas, roughness: 0.32, metalness: 0.25 }),
    glass: new THREE2.MeshStandardMaterial({ color: 1912644, roughness: 0.08, metalness: 0.4 }),
    light: new THREE2.MeshBasicMaterial({ map: atlas })
  };
  if (ESTILO === "toon") {
    const grad = new THREE2.DataTexture(new Uint8Array([90, 170, 255]), 3, 1, THREE2.RedFormat);
    grad.needsUpdate = true;
    grad.minFilter = grad.magFilter = THREE2.NearestFilter;
    mats.base = new THREE2.MeshToonMaterial({ map: atlas, gradientMap: grad });
    mats.gloss = mats.base;
    mats.glass = new THREE2.MeshToonMaterial({ color: 2837099, gradientMap: grad });
    renderer.toneMapping = THREE2.NoToneMapping;
  }
  ART.outline = ESTILO === "toon" ? new THREE2.MeshBasicMaterial({ color: 1710626, side: THREE2.BackSide }) : null;
  {
    const bt = await new THREE2.TextureLoader().loadAsync("assets/city/banners.jpg");
    bt.colorSpace = THREE2.SRGBColorSpace;
    bt.flipY = false;
    mats.banner = new THREE2.MeshStandardMaterial({ map: bt, roughness: 0.6 });
  }
  const matFor = (n) => /Billboard/.test(n) ? mats.banner : /Glass/.test(n) ? mats.glass : /Glossy|Car_Color|Metal/.test(n) ? mats.gloss : /lights|Emissive/.test(n) ? mats.light : mats.base;
  const bake = (root) => {
    root.updateMatrixWorld(true);
    const out = [];
    root.traverse((o) => {
      if (o.isMesh) out.push({ g: bakeGeo(o), m: o.material, name: o.parent.name || o.name });
    });
    return out;
  };
  const S = 1.05;
  const RODAS = await (await fetch("assets/city/rodas.json")).json();
  for (const n of ["Car_13", "Car_06", "Car_16", "Car_19", "Van", "Futuristic_Car_1"]) {
    const parts = bake(await loadGLB2("assets/city/" + n + ".glb", matFor));
    const bodyP = parts.filter((p) => !/Wheel/.test(p.name));
    for (const p of bodyP) {
      p.g.scale(S, S, S);
      p.g.translate(0, -0.6, 0);
    }
    const order = ["Front_Left", "Front_Right", "Rear_Left", "Rear_Right"];
    const wheels = order.map((k) => {
      const p = parts.find((q) => q.name.endsWith(k));
      p.g.computeBoundingBox();
      const c = new THREE2.Vector3();
      p.g.boundingBox.getCenter(c);
      p.g.translate(-c.x, -c.y, -c.z);
      p.g.scale(S, S, S);
      const hub = RODAS[n][n + "_Wheel_" + k];
      return { g: p.g, m: p.m, hub: new THREE2.Vector3(hub[0] * S, 0, hub[2] * S), r: (p.g.boundingBox.max.y - p.g.boundingBox.min.y) / 2 * S };
    });
    const ord = [[-1, 1], [1, 1], [-1, -1], [1, -1]].map(([sx, sz]) => wheels.find((w) => Math.sign(w.hub.x) === sx && Math.sign(w.hub.z) === sz));
    ART.cars[n] = { body: bodyP, wheels: ord };
  }
  for (const n of ["palm", "bush", "bush3", "lamp", "trash", "trash2", "busstop", "sign", "billboard", "tlight", "fountain", "spot"]) {
    const parts = bake(await loadGLB2("assets/city/" + n + ".glb", matFor));
    ART.props[n] = parts;
  }
  {
    const kt = await Promise.all(["colormap", "variation-a", "variation-b"].map((n) => new THREE2.TextureLoader().loadAsync("assets/kenney/" + n + ".png").then((t) => {
      t.colorSpace = THREE2.SRGBColorSpace;
      t.flipY = false;
      t.magFilter = THREE2.NearestFilter;
      return t;
    })));
    const km = kt.map((t) => new THREE2.MeshStandardMaterial({ map: t, roughness: 0.7 }));
    ART.kenney = [];
    for (const n of ["a", "b", "c", "d", "e", "f", "g", "h", "i", "k", "l", "m", "skyscraper-a", "skyscraper-b", "skyscraper-c", "skyscraper-e"])
      for (let v = 0; v < (n.startsWith("sky") ? 1 : 2); v++) {
        const id = "k_" + n + v;
        ART.props[id] = bake(await loadGLB2("assets/kenney/building-" + n + ".glb", () => km[(v + n.length) % 3]));
        ART.kenney.push(id);
      }
  }
  for (const n of ["posto", "cont20", "cont40", "bus", "train", "ship", "trampolim", "predio_alvo", "predio_barranco"]) {
    const parts = bake(await loadGLB2("assets/city/" + n + ".glb", null));
    ART.props[n] = parts;
  }
}
var TINY_CARS = {
  player: ["sports_type_a", "sports_type_a_color_1", "wheel_sports"],
  parked: [
    ["sedan", "sedan_color_2", "wheel_classic"],
    ["pickup", "pickup_color_1", "wheel_off_road"],
    ["muscle_type_a", "muscle_type_a_color_3", "wheel_classic"],
    ["taxi_sedan", "taxi_sedan", "wheel_classic"],
    ["cop_sedan", "cop_sedan", "wheel_classic"],
    ["muscle_type_c", "muscle_type_c_color_2", "wheel_off_road"],
    ["sports_type_b", "sports_type_b_color_3", "wheel_sports"]
  ]
};
var REAL_CARS = { player: "Car_2", parked: ["Car_3", "Car_5", "Taxi_1", "Police_1"] };
var REAL_TINT = { Car_2: 14165532, Car_3: 2776023, Car_5: 3026739, Police_1: 15921906 };
var FLOOR = new THREE2.MeshStandardMaterial({ color: 1974050, roughness: 0.9, side: THREE2.DoubleSide });
var RUBBER = new THREE2.MeshStandardMaterial({ color: 1776413, roughness: 0.9, side: THREE2.DoubleSide });
var HUB = new THREE2.MeshStandardMaterial({ color: 2763310, roughness: 0.6, metalness: 0.4 });
async function loadReal() {
  renderer.toneMapping = THREE2.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1;
  const S = 1;
  for (const n of [REAL_CARS.player, ...REAL_CARS.parked]) {
    const root = await loadGLB2("assets/hq/" + n + ".glb", null);
    root.updateMatrixWorld(true);
    const parts = [];
    root.traverse((o) => {
      if (o.isMesh) parts.push({ g: bakeGeo(o), m: o.material, name: o.parent.name || o.name });
    });
    const wheelsP = parts.filter((p) => /Wheel/i.test(p.name)), bodyP = parts.filter((p) => !/Wheel/i.test(p.name));
    const bb = new THREE2.Box3();
    parts.forEach((p) => {
      p.g.computeBoundingBox();
      bb.union(p.g.boundingBox);
    });
    const cx = (bb.min.x + bb.max.x) / 2, cz = (bb.min.z + bb.max.z) / 2, gy = bb.min.y;
    for (const p of parts) {
      p.g.translate(-cx, -gy, -cz);
      p.g.scale(S, S, S);
      p.g.translate(0, -0.6, 0);
    }
    const groups = {};
    for (const p of wheelsP) {
      const k = p.name.replace(/_LOD\d+$/, "");
      (groups[k] ??= []).push(p);
    }
    const wheels = Object.values(groups).map((ps) => {
      const b = new THREE2.Box3();
      ps.forEach((p) => {
        p.g.computeBoundingBox();
        b.union(p.g.boundingBox);
      });
      const c = new THREE2.Vector3();
      b.getCenter(c);
      ps.forEach((p) => p.g.translate(-c.x, -c.y, -c.z));
      const rub = ps.reduce((m, p) => p.g.boundingBox.max.y - p.g.boundingBox.min.y > m.g.boundingBox.max.y - m.g.boundingBox.min.y ? p : m);
      rub.m = RUBBER;
      const r = (b.max.y - b.min.y) / 2, wd = b.max.x - b.min.x;
      const disc = new THREE2.CylinderGeometry(r * 0.86, r * 0.86, wd * 0.25, 20).rotateZ(Math.PI / 2).translate(-Math.sign(c.x) * wd * 0.2, 0, 0);
      return { parts: ps, hub: c, r, disc };
    });
    const ord = [[-1, 1], [1, 1], [-1, -1], [1, -1]].map(([sx, sz]) => wheels.find((w) => Math.sign(w.hub.x) === sx && Math.sign(w.hub.z) === sz) || wheels[0]);
    {
      const bbB = new THREE2.Box3();
      bodyP.forEach((p) => {
        p.g.computeBoundingBox();
        bbB.union(p.g.boundingBox);
      });
      const inner = Math.min(...ord.map((w) => Math.abs(w.hub.x))) - 0.16, len = (bbB.max.z - bbB.min.z) * 0.9;
      const floor = new THREE2.BoxGeometry(inner * 2, 0.06, len).translate(0, bbB.min.y + 0.06, (bbB.max.z + bbB.min.z) / 2);
      bodyP.push({ g: floor, m: FLOOR, name: "assoalho" });
    }
    if (REAL_TINT[n]) {
      for (const p of bodyP) if (p.m.name === "hq_body") {
        p.m = p.m.clone();
        p.m.color.setHex(REAL_TINT[n]);
      }
    }
    ART.cars[n] = { body: bodyP, wheelsMulti: ord };
  }
}
var TINY_W = +(Q.get("roda") || 0.8);
var TINY_DROP = +(Q.get("desce") || 0.4);
async function loadTiny() {
  renderer.toneMapping = THREE2.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;
  const texs = {}, tex = async (n) => texs[n] ??= await new THREE2.TextureLoader().loadAsync("assets/tiny/" + n + ".png").then((t) => {
    t.colorSpace = THREE2.SRGBColorSpace;
    t.flipY = false;
    t.magFilter = t.minFilter = THREE2.NearestFilter;
    t.generateMipmaps = false;
    return t;
  });
  const bakeT = async (glb, png) => {
    const m = new THREE2.MeshStandardMaterial({ map: await tex(png), roughness: 0.55, metalness: 0.05 });
    const root = await loadGLB2("assets/tiny/" + glb + ".glb", () => m);
    root.updateMatrixWorld(true);
    const out = [];
    root.traverse((o) => {
      if (o.isMesh) {
        const g = o.geometry.clone();
        g.applyMatrix4(o.matrixWorld);
        out.push({ g, m });
      }
    });
    return out;
  };
  const S = 1.15, wheelT = {};
  for (const w of ["wheel_classic", "wheel_sports", "wheel_off_road"]) {
    const [p] = await bakeT(w, w);
    p.g.computeBoundingBox();
    const c = new THREE2.Vector3();
    p.g.boundingBox.getCenter(c);
    p.g.translate(-c.x, -c.y, -c.z);
    p.g.scale(S * TINY_W, S * TINY_W, S * TINY_W);
    const gm = p.g.clone();
    gm.scale(-1, 1, 1);
    gm.index && gm.setIndex(Array.from(gm.index.array).reverse());
    wheelT[w] = { g: p.g, gm, m: p.m, r: 0.5 * S * TINY_W };
  }
  for (const [body, png, wheel] of [TINY_CARS.player, ...TINY_CARS.parked]) {
    const parts = await bakeT(body, png);
    for (const p of parts) {
      p.g.scale(S, S, S);
      p.g.translate(0, -0.6 - TINY_DROP * S, 0);
    }
    const W = wheelT[wheel];
    ART.cars[body] = { body: parts, wheels: [[-1, 1], [1, 1], [-1, -1], [1, -1]].map(([sx, sz]) => ({ g: sx > 0 ? W.g : W.gm, m: W.m, hub: new THREE2.Vector3(0.8 * S * sx, 0, 0.9 * S * sz), r: W.r })) };
  }
}
var CONT_TINT = { container: 15022389, container2: 2001125, container3: 16635957 };
function pieceFor(s) {
  if (!CITY || !ART.props.cont20) return null;
  let g = null;
  if (CONT_TINT[s.kind]) {
    const long = s.hz > s.hx;
    g = propMesh(long || s.hx > 4.5 ? "cont40" : "cont20", s.x, s.z, long ? Math.PI / 2 : 0, 1, s.y);
    const L = long ? s.hz * 2 : s.hx * 2;
    g.scale.set(L / (L > 9 ? 12.2 : 6.4), s.hy * 2 / 2.6, (long ? s.hx : s.hz) * 2 / 2.5);
    g.traverse((o) => {
      if (o.isMesh && o.material.name === "cont_tinta") {
        o.material = o.material.clone();
        o.material.color.setHex(CONT_TINT[s.kind]);
      }
    });
  } else if (s.kind === "bus") g = propMesh("bus", s.x, s.z, 0, 1, s.y);
  else if (s.kind === "island" && ART.props.posto) g = propMesh("posto", s.x, s.z, 0, 1, 0);
  else if ((s.kind === "pump" || s.kind === "post") && ART.props.posto) g = new THREE2.Group();
  else if (s.kind === "hull") g = propMesh("ship", s.x, s.z, 0, 1, s.y);
  else if (s.kind === "bouncy") {
    g = propMesh("trampolim", s.x, s.z, 0, 1, s.y);
    makeLona(g);
    if (s.y > 0.5) {
      const lm = M(3622735, { roughness: 0.5, metalness: 0.4 });
      for (const sx of [-1, 1]) for (const sz of [-1, 0, 1]) {
        const leg = new THREE2.Mesh(boxGeo, lm);
        leg.scale.set(0.25, s.y - 0.1, 0.25);
        leg.position.set(sx * 4.8, -(s.y - 0.1) / 2 - 0.1, sz * 5.6);
        leg.castShadow = true;
        g.add(leg);
      }
    }
  } else if (s.kind === "building" && s.hx === 6 && s.hz === 10) g = propMesh("predio_alvo", s.x, s.z, 0, 1, s.y);
  else if (s.kind === "cliff" && s.hz === 21) g = propMesh("predio_barranco", s.x, s.z, 0, 1, s.y);
  else if (s.kind === "shipdeck") g = new THREE2.Group();
  else if (s.kind === "loop") g = new THREE2.Group();
  return g;
}
function loopTrack(Lp) {
  const g = new THREE2.Group(), N = 90, a0 = 0.3, a1 = 2 * Math.PI - 0.3, R = Lp.R, W = 1.4, T2 = 0.3;
  const ribbon = (x0, x1, r0, r1, col) => {
    const pos = [], idx = [];
    for (let i = 0; i <= N; i++) {
      const a = a0 + (a1 - a0) * i / N, cx = Lp.shift * a / (2 * Math.PI), s = Math.sin(a), c = Math.cos(a);
      for (const [xx, rr] of [[x0, r0], [x1, r0], [x1, r1], [x0, r1]]) pos.push(cx + xx, R - rr * c, Lp.zc + rr * s);
    }
    for (let i = 0; i < N; i++) for (let k = 0; k < 4; k++) {
      const a = i * 4 + k, b = i * 4 + (k + 1) % 4, c2 = a + 4, d = b + 4;
      idx.push(a, c2, b, b, c2, d);
    }
    const geo = new THREE2.BufferGeometry();
    geo.setAttribute("position", new THREE2.Float32BufferAttribute(pos, 3));
    geo.setIndex(idx);
    geo.computeVertexNormals();
    const m = new THREE2.Mesh(geo, M(col, { side: THREE2.DoubleSide, roughness: 0.6 }));
    m.castShadow = m.receiveShadow = true;
    g.add(m);
  };
  ribbon(-W + 0.12, W - 0.12, R, R + T2, 5533306);
  for (const sx of [-1, 1]) ribbon(sx * W - 0.12, sx * W + 0.12, R - 0.35, R + T2 + 0.04, 15022389);
  for (const [a, sx] of [[0.6, -1], [0.6, 1], [5.7, -1], [5.7, 1]]) {
  }
  return g;
}
var trampFX = null;
function makeLona(g) {
  const i = ART.props.trampolim ? ART.props.trampolim.findIndex((p) => /lona/i.test(p.m.name || "")) : -1;
  if (i < 0) return;
  const old = g.children[i];
  old.visible = false;
  const geo = new THREE2.PlaneGeometry(8.6, 10.6, 26, 32).rotateX(-Math.PI / 2), mt = old.material.clone();
  mt.vertexColors = true;
  geo.setAttribute("color", new THREE2.Float32BufferAttribute(new Float32Array(geo.attributes.position.count * 3).fill(1), 3));
  const m = new THREE2.Mesh(geo, mt);
  m.position.y = 0.11;
  m.receiveShadow = true;
  g.add(m);
  trampFX = { g, geo, base: geo.attributes.position.array.slice(), t0: -1, hx: 0, hz: 0 };
}
function lonaHit() {
  if (!trampFX) return;
  const c = carMesh.position;
  trampFX.hx = c.x - trampFX.g.position.x;
  trampFX.hz = c.z - trampFX.g.position.z;
  trampFX.t0 = trampFX.tl = 0;
}
function lonaTick(dt) {
  const f = trampFX;
  if (!f || f.t0 < 0) return;
  f.tl += dt;
  const t = f.tl, pa = f.geo.attributes.position, a = pa.array, b = f.base, cc = f.geo.attributes.color, ca = cc.array;
  const A = t > 2 ? 0 : 0.85 * Math.exp(-3.2 * t) * Math.cos(15 * t), s2 = 2 * 3 * 3;
  for (let i = 0; i < a.length; i += 3) {
    const dx = b[i] - f.hx, dz = b[i + 2] - f.hz, ex = Math.max(0, 1 - Math.max(Math.abs(b[i]) / 4.3, Math.abs(b[i + 2]) / 5.3) ** 6);
    const dd = A * Math.exp(-(dx * dx + dz * dz) / s2) * ex;
    a[i + 1] = b[i + 1] - dd;
    const sh = 1 - Math.max(-0.3, Math.min(0.7, dd * 1.1));
    ca[i] = ca[i + 1] = ca[i + 2] = sh;
  }
  cc.needsUpdate = true;
  pa.needsUpdate = true;
  f.geo.computeVertexNormals();
  if (t > 2) f.t0 = -1;
}
function propMesh(n, x, z, yaw = 0, s = 1, y = 0) {
  const g = new THREE2.Group();
  for (const p of ART.props[n]) {
    const m = new THREE2.Mesh(p.g, p.m);
    m.castShadow = true;
    m.receiveShadow = true;
    g.add(m);
  }
  g.position.set(x, y, z);
  g.rotation.y = yaw;
  g.scale.setScalar(s);
  scene.add(g);
  return g;
}
window.__art = ART;
function bakeGeo(o) {
  const g = o.geometry.clone();
  g.applyMatrix4(o.matrixWorld);
  if (o.matrixWorld.determinant() < 0) {
    if (g.index) {
      const a = g.index.array;
      for (let i = 0; i < a.length; i += 3) {
        const t = a[i + 1];
        a[i + 1] = a[i + 2];
        a[i + 2] = t;
      }
      g.index.needsUpdate = true;
    } else {
      const pos = g.attributes.position;
      for (const k of Object.keys(g.attributes)) {
        const at = g.attributes[k], n = at.itemSize, arr = at.array;
        for (let i = 0; i < pos.count; i += 3) for (let c = 0; c < n; c++) {
          const t = arr[(i + 1) * n + c];
          arr[(i + 1) * n + c] = arr[(i + 2) * n + c];
          arr[(i + 2) * n + c] = t;
        }
        at.needsUpdate = true;
      }
    }
  }
  return g;
}
var PARKED_MODELS = ["Car_06", "Car_16", "Car_19", "Van", "Futuristic_Car_1"];
var fixShadow = (m) => {
  if (m && m.shadowSide !== THREE2.DoubleSide) m.shadowSide = THREE2.DoubleSide;
  return m;
};
function makeCarMesh(color, model) {
  const T2 = model && ART.cars[model];
  if (T2 && !T2.fixed) {
    T2.fixed = true;
    [...T2.body, ...T2.wheels || [], ...(T2.wheelsMulti || []).flatMap((w) => w.parts)].forEach((p) => fixShadow(p.m));
  }
  if (T2) {
    const g2 = new THREE2.Group(), chassis2 = new THREE2.Group();
    g2.add(chassis2);
    g2.chassis = chassis2;
    for (const p of T2.body) {
      const m = new THREE2.Mesh(p.g, p.m);
      m.castShadow = true;
      m.receiveShadow = true;
      chassis2.add(m);
      if (ART.outline) {
        const o = new THREE2.Mesh(p.g, ART.outline);
        o.scale.setScalar(1.035);
        o.position.y = -0.02;
        chassis2.add(o);
      }
    }
    g2.lean = { roll: 0, rollV: 0, pitch: 0, pitchV: 0, ax: 0, az: 0, pv: null };
    if (T2.wheelsMulti) g2.wheels = T2.wheelsMulti.map((w) => {
      const piv = new THREE2.Group();
      piv.position.set(w.hub.x, -0.34, w.hub.z);
      for (const p of w.parts) {
        const m = new THREE2.Mesh(p.g, p.m);
        m.position.y = w.r - 0.36;
        m.castShadow = true;
        piv.add(m);
      }
      if (w.disc) {
        const d = new THREE2.Mesh(w.disc, HUB);
        d.position.y = w.r - 0.36;
        piv.add(d);
      }
      g2.add(piv);
      return piv;
    });
    else g2.wheels = T2.wheels.map((w) => {
      const piv = new THREE2.Group();
      piv.position.set(w.hub.x, -0.34, w.hub.z);
      const m = new THREE2.Mesh(w.g, w.m);
      m.position.y = w.r - 0.36;
      m.castShadow = true;
      piv.add(m);
      g2.add(piv);
      return piv;
    });
    scene.add(g2);
    return g2;
  }
  const g = new THREE2.Group();
  const body = new THREE2.Mesh(boxGeo, M(color, { roughness: 0.4, metalness: 0.2 }));
  body.scale.set(CAR.hw * 2, CAR.hh * 2 * 0.75, CAR.hl * 2);
  body.position.y = -0.1;
  body.castShadow = true;
  const cab = new THREE2.Mesh(boxGeo, M(2240570, { roughness: 0.2 }));
  cab.scale.set(1.7, 0.5, 2);
  cab.position.set(0, 0.42, -0.25);
  cab.castShadow = true;
  const nose = new THREE2.Mesh(boxGeo, M(16777215));
  nose.scale.set(1.6, 0.12, 0.05);
  nose.position.set(0, -0.05, CAR.hl + 0.01);
  const chassis = new THREE2.Group();
  chassis.add(body, cab, nose);
  g.add(chassis);
  g.chassis = chassis;
  g.lean = { roll: 0, rollV: 0, pitch: 0, pitchV: 0, ax: 0, az: 0, pv: null };
  g.wheels = [[-0.85, 1.35], [0.85, 1.35], [-0.85, -1.35], [0.85, -1.35]].map(([x, z]) => {
    const w = new THREE2.Mesh(wheelGeo, wheelMat);
    w.position.set(x * 1.06, -0.23, z);
    w.castShadow = true;
    g.add(w);
    return w;
  });
  scene.add(g);
  return g;
}
function slotLines(x, z, yaw, w, l, color = 16777215, y = 0) {
  const g = new THREE2.Group();
  const m = new THREE2.MeshBasicMaterial({ color });
  const t = 0.14;
  for (const [sx, sz, px, pz] of [[w, t, 0, l / 2], [w, t, 0, -l / 2], [t, l, w / 2, 0], [t, l, -w / 2, 0]]) {
    const s = new THREE2.Mesh(new THREE2.PlaneGeometry(sx, sz).rotateX(-Math.PI / 2), m);
    s.position.set(px, 0.012, pz);
    g.add(s);
  }
  g.position.set(x, y, z);
  g.rotation.y = yaw;
  scene.add(g);
  return g;
}
var UP = new THREE2.Vector3(0, 1, 0);
var MARK_N = 900;
var marks = new THREE2.InstancedMesh(
  new THREE2.PlaneGeometry(1, 1).rotateX(-Math.PI / 2),
  new THREE2.MeshBasicMaterial({ color: 1447446, transparent: true, opacity: 0.6, depthWrite: false, stencilWrite: true, stencilRef: 2, stencilFunc: THREE2.NotEqualStencilFunc, stencilZPass: THREE2.ReplaceStencilOp }),
  MARK_N
);
marks.count = 0;
marks.frustumCulled = false;
scene.add(marks);
var markI = 0;
var lastMark = [null, null, null, null];
var _m4 = new THREE2.Matrix4();
var _ms = new THREE2.Vector3();
var _mq = new THREE2.Quaternion();
var _mid = new THREE2.Vector3();
var MARK_W = 0.26;
function addMark(a, b) {
  const dx = b.x - a.x, dz = b.z - a.z, len = Math.hypot(dx, dz);
  if (len < 0.04 || len > 3) return;
  _mid.set((a.x + b.x) / 2, (a.y + b.y) / 2 + 0.02, (a.z + b.z) / 2);
  _mq.setFromAxisAngle(UP, Math.atan2(dx, dz));
  _ms.set(MARK_W, 1, len + 0.03);
  marks.setMatrixAt(markI % MARK_N, _m4.compose(_mid, _mq, _ms));
  markI++;
  marks.count = Math.min(markI, MARK_N);
  marks.instanceMatrix.needsUpdate = true;
}
var smokeTex = (() => {
  const c = document.createElement("canvas");
  c.width = c.height = 64;
  const g = c.getContext("2d");
  const gr = g.createRadialGradient(32, 32, 2, 32, 32, 31);
  gr.addColorStop(0, "rgba(255,255,255,.95)");
  gr.addColorStop(0.5, "rgba(255,255,255,.5)");
  gr.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = gr;
  g.fillRect(0, 0, 64, 64);
  return new THREE2.CanvasTexture(c);
})();
var puffs = [];
for (let i = 0; i < 110; i++) {
  const sp2 = new THREE2.Sprite(new THREE2.SpriteMaterial({ map: smokeTex, color: 15263976, transparent: true, depthWrite: false, opacity: 0 }));
  sp2.visible = false;
  scene.add(sp2);
  puffs.push({ sp: sp2, life: 0, max: 1, v: new THREE2.Vector3(), s0: 0.5, grow: 2.4, op: 0.5, g: 0, drag: 2.2 });
}
var puffI = 0;
function puff(p, carV, o = {}) {
  const P = puffs[puffI++ % puffs.length];
  P.sp.position.copy(p);
  P.life = 0;
  P.max = (o.life || 0.8) + Math.random() * 0.6;
  P.s0 = (o.s0 || 0.45) + Math.random() * 0.3;
  const sp2 = o.spread || 1.2;
  P.v.set(carV.x * 0.25 + (Math.random() - 0.5) * sp2, (o.up || 0.5) + Math.random() * 0.6, carV.z * 0.25 + (Math.random() - 0.5) * sp2);
  P.grow = o.grow || 2.4;
  P.op = o.op || 0.5;
  P.g = o.g || 0;
  P.drag = o.drag || 2.2;
  P.sp.material.color.set(o.color || 15263976);
  P.sp.visible = true;
}
function updPuffs(dt) {
  for (const P of puffs) {
    if (!P.sp.visible) continue;
    P.life += dt;
    const k = P.life / P.max;
    if (k >= 1) {
      P.sp.visible = false;
      continue;
    }
    P.v.y -= P.g * dt;
    P.sp.position.addScaledVector(P.v, dt);
    P.v.multiplyScalar(1 - P.drag * dt);
    const sc = P.s0 + k * P.grow;
    P.sp.scale.set(sc, sc, sc);
    P.sp.material.opacity = P.op * (1 - k) * Math.min(1, k * 8);
  }
}
function clearFx() {
  markI = 0;
  marks.count = 0;
  lastMark.fill(null);
  for (const P of puffs) P.sp.visible = false;
}
var _wp = new THREE2.Vector3();
var _iq = new THREE2.Quaternion();
var _la = new THREE2.Vector3();
var smokeAcc = 0;
function updateCarFx(dt) {
  const v = sim.car.linvel(), sp2 = Math.hypot(v.x, v.z), q = carMesh.quaternion;
  const upY = new THREE2.Vector3(0, 1, 0).applyQuaternion(q).y;
  const L = carMesh.lean, vv = new THREE2.Vector3(v.x, v.y, v.z);
  if (L.pv && dt > 0) {
    _la.copy(vv).sub(L.pv).divideScalar(dt).applyQuaternion(_iq.copy(q).invert());
    const f = 1 - Math.exp(-dt * 12);
    L.ax += (_la.x - L.ax) * f;
    L.az += (_la.z - L.az) * f;
  }
  L.pv = vv;
  const grounded = sim.st.wheels.filter((w) => w.grounded).length >= 2;
  const tr = grounded ? THREE2.MathUtils.clamp(L.ax * 0.011, -0.11, 0.11) : 0, tp = grounded ? THREE2.MathUtils.clamp(-L.az * 0.012, -0.09, 0.09) : 0;
  L.rollV += ((tr - L.roll) * 140 - L.rollV * 11) * dt;
  L.roll += L.rollV * dt;
  L.pitchV += ((tp - L.pitch) * 140 - L.pitchV * 11) * dt;
  L.pitch += L.pitchV * dt;
  carMesh.chassis.rotation.set(L.pitch, 0, L.roll);
  carMesh.chassis.position.y = -Math.abs(L.pitch) * 0.6;
  const sliding = sim.st.tapped && sp2 > 1 && upY > 0.8;
  carMesh.updateMatrixWorld();
  smokeAcc += dt;
  const doSmoke = sliding && smokeAcc > 0.045;
  if (doSmoke) smokeAcc = 0;
  carMesh.wheels.forEach((w, i) => {
    const ws = sim.st.wheels[i];
    if (!sliding || !ws.grounded) {
      lastMark[i] = null;
      return;
    }
    if (sim.level.marks === false) {
      lastMark[i] = null;
      if (doSmoke && i >= 2 && sp2 > 2.5) puff(new THREE2.Vector3(ws.cp[0], ws.cp[1] + 0.25, ws.cp[2]), v);
      return;
    }
    _wp.set(ws.cp[0], ws.cp[1], ws.cp[2]);
    if (lastMark[i]) addMark(lastMark[i], _wp);
    lastMark[i] = (lastMark[i] || new THREE2.Vector3()).copy(_wp);
    if (doSmoke && i >= 2 && sp2 > 2.5) puff(_wp.clone().add(new THREE2.Vector3(0, 0.25, 0)), v);
  });
  updPuffs(dt);
}
var SPARK_N = 120;
var sparkGeo = new THREE2.BufferGeometry();
sparkGeo.setAttribute("position", new THREE2.BufferAttribute(new Float32Array(SPARK_N * 3), 3));
var sparks = new THREE2.Points(sparkGeo, new THREE2.PointsMaterial({ map: smokeTex, color: 16756784, size: 0.42, transparent: true, blending: THREE2.AdditiveBlending, depthWrite: false, depthTest: false }));
sparks.frustumCulled = false;
sparks.renderOrder = 10;
scene.add(sparks);
var sp = Array.from({ length: SPARK_N }, () => ({ life: 0, v: new THREE2.Vector3(), p: new THREE2.Vector3(-999, -999, -999) }));
var sparkI = 0;
function burstSparks(at, dir, n) {
  for (let i = 0; i < n; i++) {
    const S = sp[sparkI++ % SPARK_N];
    S.life = 0.25 + Math.random() * 0.35;
    S.p.copy(at);
    S.v.set(dir.x * (2 + Math.random() * 5) + (Math.random() - 0.5) * 9, 3 + Math.random() * 5, dir.z * (2 + Math.random() * 5) + (Math.random() - 0.5) * 9);
  }
}
function updSparks(dt) {
  const a = sparkGeo.attributes.position.array;
  sp.forEach((S, i) => {
    if (S.life > 0) {
      S.life -= dt;
      S.v.y -= 14 * dt;
      S.p.addScaledVector(S.v, dt);
      if (S.life <= 0) S.p.set(-999, -999, -999);
    }
    a[i * 3] = S.p.x;
    a[i * 3 + 1] = S.p.y;
    a[i * 3 + 2] = S.p.z;
  });
  sparkGeo.attributes.position.needsUpdate = true;
}
var trauma = 0;
var seenHit = null;
var splashed = false;
var dustAcc = 0;
var slowT = 0;
var timeScale = 1;
function resetImpactFx() {
  trauma = 0;
  seenHit = null;
  splashed = false;
  slowT = 0;
  timeScale = 1;
  for (const S of sp) {
    S.life = 0;
    S.p.set(-999, -999, -999);
  }
}
var _hp = new THREE2.Vector3();
var _hd = new THREE2.Vector3();
function updateImpactFx(dt) {
  const st = sim.st, v = sim.car.linvel(), p = carMesh.position, sp2 = Math.hypot(v.x, v.z);
  if (st.lastHit && st.lastHit !== seenHit) {
    seenHit = st.lastHit;
    const k = Math.min(1, st.lastHit.dv / 12);
    _hd.set(v.x, 0, v.z);
    if (_hd.lengthSq() < 0.01) _hd.set(0, 0, 1);
    _hd.normalize().negate();
    _hp.set(st.lastHit.x, st.lastHit.y + 0.35, st.lastHit.z).addScaledVector(_hd, -0.9);
    burstSparks(_hp, _hd, Math.round(18 + 40 * k));
    trauma = Math.min(1, trauma + 0.35 + 0.6 * k);
    SFX.crash();
  }
  const upY = new THREE2.Vector3(0, 1, 0).applyQuaternion(carMesh.quaternion).y;
  dustAcc += dt;
  if (st.tripped && upY < 0.85 && p.y < 1.6 && p.y > -1 && dustAcc > 0.05 && (sp2 > 0.6 || Math.abs(sim.car.angvel().x) + Math.abs(sim.car.angvel().z) > 1)) {
    dustAcc = 0;
    for (let i = 0; i < 2; i++) puff(new THREE2.Vector3(p.x + (Math.random() - 0.5) * 2, 0.25, p.z + (Math.random() - 0.5) * 2), v, { color: 12166535, s0: 0.7, grow: 3, op: 0.55, up: 0.4, spread: 2.5 });
  }
  if (!splashed && sim.level.water !== void 0 && p.y < sim.level.water + 0.4) {
    splashed = true;
    trauma = Math.min(1, trauma + 0.4);
    SFX.splash();
    for (let i = 0; i < 26; i++) puff(
      new THREE2.Vector3(p.x + (Math.random() - 0.5) * 3, sim.level.water + 0.4, p.z + (Math.random() - 0.5) * 3),
      { x: 0, z: 0 },
      { color: 16777215, s0: 0.9, grow: 3.5, op: 0.85, up: 6 + Math.random() * 6, spread: 7, g: 14, drag: 0.6, life: 0.9 }
    );
  }
  if (!EDITOR && st.tapped && !st.done && !st.tripped && slowT < 0.9 && st.dist < 1.1 && sp2 < 4.5 && sp2 > 0.3) {
    slowT += dt;
    timeScale += (0.3 - timeScale) * Math.min(1, dt * 10);
  } else timeScale += (1 - timeScale) * Math.min(1, dt * 6);
  updSparks(dt);
  trauma = Math.max(0, trauma - dt * 1.6);
}
function applyShake() {
  if (trauma <= 0) return;
  const s = trauma * trauma, t = performance.now() / 1e3;
  camera.position.x += Math.sin(t * 71) * 0.35 * s;
  camera.position.y += Math.sin(t * 89 + 1) * 0.3 * s;
  camera.rotation.z += Math.sin(t * 53 + 2) * 0.03 * s;
}
var sim;
var carMesh;
var windSock = null;
var propMeshes = [];
var parkedMeshes = [];
var moverMeshes = [];
var tries = 0;
var levelObjs = [];
var li = Number(Q.get("fase") || 1) - 1;
var total = 0;
var state = "play";
var resT = 0;
var acc = 0;
var prev = /* @__PURE__ */ new Map();
var firstTap = true;
var guide = false;
var tapBand = null;
var camPos = new THREE2.Vector3();
var camLook = new THREE2.Vector3();
var KEEP = /* @__PURE__ */ new WeakSet();
function keepArt() {
  const seen = /* @__PURE__ */ new Set();
  const walk = (v, d) => {
    if (!v || typeof v !== "object" || d > 6 || seen.has(v)) return;
    seen.add(v);
    if (v.isBufferGeometry || v.isMaterial) {
      KEEP.add(v);
      return;
    }
    if (v.isTexture) return;
    for (const k in v) walk(v[k], d + 1);
  };
  walk(ART, 0);
  [boxGeo, wheelGeo, wheelMat, CONE.base, CONE.body, CONE.band, CONE.mo, CONE.mw].forEach((x) => KEEP.add(x));
}
function freeObj(o) {
  o.traverse((c) => {
    if (c.geometry && !KEEP.has(c.geometry)) c.geometry.dispose();
    const ms = Array.isArray(c.material) ? c.material : c.material ? [c.material] : [];
    for (const mt of ms) if (!KEEP.has(mt)) mt.dispose();
  });
}
function clearLevel() {
  trampFX = null;
  for (const o of levelObjs) {
    scene.remove(o);
    freeObj(o);
  }
  levelObjs = [];
  if (carMesh) {
    scene.remove(carMesh);
    freeObj(carMesh);
  }
  parkedMeshes.forEach((m) => {
    scene.remove(m);
    freeObj(m);
  });
  parkedMeshes = [];
}
var keep = (o) => {
  levelObjs.push(o);
  return o;
};
var CITY = ESTILO === "city" || ESTILO === "toon";
var CITY_COL = {
  ground: 5593182,
  deck: 6054248,
  rail: 15527921,
  container: 15022389,
  container2: 2001125,
  container3: 16635957,
  curb: 13621468,
  island: 14737632,
  pump: 15022389,
  post: 15527921,
  ramp: 7901340,
  trailer: 5533306,
  trailerBase: 3622735,
  shipdeck: 10586239,
  hull: 3622735,
  raft: 10586239,
  pillar: 11583173,
  pier: 9268835,
  truckbox: 15527921,
  bus: 16635957,
  grass: 8172354,
  loop: 15527921,
  cliff: 10586239,
  bouncy: 2001125,
  building: 11583173,
  tracks: 7162945
};
var WATER_T = { value: 0 };
var waterMats = {};
function waterMat(col) {
  if (waterMats[col]) return waterMats[col];
  const m = new THREE2.MeshStandardMaterial({ color: col, roughness: 0.18, metalness: 0.05 });
  m.onBeforeCompile = (sh) => {
    sh.uniforms.uT = WATER_T;
    sh.vertexShader = sh.vertexShader.replace("#include <common>", "#include <common>\nvarying vec3 vWP;").replace("#include <worldpos_vertex>", "#include <worldpos_vertex>\nvWP = (modelMatrix * vec4(transformed, 1.0)).xyz;");
    sh.fragmentShader = sh.fragmentShader.replace("#include <common>", "#include <common>\nvarying vec3 vWP; uniform float uT;").replace("#include <color_fragment>", `#include <color_fragment>
      vec2 q = vWP.xz * 0.64; float tt = uT * 0.55;   // ondas pequenas, velocidade moderada
      float a = sin(q.x * 1.7 + tt * 0.9 + sin(q.y * 1.3 + tt * 0.6) * 1.8);
      float b = sin(q.y * 2.1 - tt * 0.7 + sin(q.x * 1.1 - tt * 0.5) * 1.6);
      float r = abs(a + b) * 0.5;                                   // 0 nas cristas que se cruzam
      float linha = 1.0 - smoothstep(0.02, 0.08, r);               // linhas finas de reflexo
      float tom = 0.5 + 0.5 * sin(q.x * 0.08 + q.y * 0.06 + tt * 0.15);
      diffuseColor.rgb *= 0.9 + 0.12 * tom;
      diffuseColor.rgb = mix(diffuseColor.rgb, diffuseColor.rgb * 1.18 + 0.04, linha * 0.6);`);
  };
  return waterMats[col] = m;
}
function buildLevel(L) {
  clearLevel();
  {
    const neve = L.marks === "neve";
    marks.material.color.setHex(neve ? 9413557 : 1447446);
    marks.material.opacity = neve ? 0.42 : 0.6;
    MARK_W = neve ? 0.34 : 0.26;
  }
  scene.background = new THREE2.Color(CITY ? 10476799 : L.water !== void 0 ? 10474485 : 12575735);
  scene.fog = new THREE2.Fog(scene.background, 60, 180);
  for (const s of sim.statics) {
    const col = {
      ground: 7171955,
      deck: 9080209,
      rail: 14211288,
      container: 12597547,
      container2: 3108277,
      container3: 14262811,
      curb: 15262416,
      island: 14275781,
      pump: 15221036,
      post: 14540253,
      ramp: 9409690,
      trailer: 5989488,
      trailerBase: 3817286,
      shipdeck: 9071173,
      hull: 2899536,
      raft: 11565632,
      pillar: 8224901,
      pier: 10255189,
      truckbox: 14673646,
      bus: 16040461,
      grass: 5940810,
      poolfloor: 5223385,
      float: 16742344,
      loop: 13685978,
      cliff: 9268815,
      bouncy: 2003199,
      building: 11581119,
      tracks: 5917242,
      roofTop: 11883067,
      roofTile: 12607551,
      pitfloor: 3355443
    }[s.kind] ?? 10066329;
    const colF = L.name === "ice" && s.kind === "ground" ? 14085367 : CITY ? CITY_COL[s.kind] ?? col : col;
    {
      const pc = pieceFor(s);
      if (pc) {
        keep(pc);
        continue;
      }
    }
    const m = keep(new THREE2.Mesh(boxGeo, M(colF, L.name === "ice" && s.kind === "ground" ? { roughness: 0.15 } : {})));
    m.scale.set(s.hx * 2, s.hy * 2, s.hz * 2);
    m.position.set(s.x, s.y, s.z);
    if (s.q) m.quaternion.set(s.q.x, s.q.y, s.q.z, s.q.w);
    else m.rotation.x = s.rx || 0;
    m.receiveShadow = true;
    m.castShadow = s.kind !== "ground" && (s.kind !== "deck" || L.water !== void 0);
    scene.add(m);
  }
  if (L.water !== void 0) {
    const wb = L.waterBox, water = keep(new THREE2.Mesh(new THREE2.PlaneGeometry(wb ? wb.hx * 2 : 900, wb ? wb.hz * 2 : 900).rotateX(-Math.PI / 2), waterMat(wb ? 4178416 : CITY ? 2201331 : 3112888)));
    if (!wb) water.position.z = L.target[1];
    water.position.set(wb ? wb.x : 0, L.water, wb ? wb.z : water.position.z);
    water.receiveShadow = true;
    scene.add(water);
  }
  const deco = (sx, sy, sz, x, y, z, c) => {
    const d = keep(new THREE2.Mesh(boxGeo, M(c)));
    d.scale.set(sx, sy, sz);
    d.position.set(x, y, z);
    d.castShadow = true;
    scene.add(d);
    return d;
  };
  if (L.name === "pool") {
    deco(12.6, 0.3, 0.3, 0, 0, 51.85, 16777215);
    deco(12.6, 0.3, 0.3, 0, 0, 64.15, 16777215);
    const n = deco(0.7, 0.9, 0.5, 0, 0.35, 58, 16777215);
    n.rotation.x = -0.4;
  }
  if (L.name === "train") {
    deco(0.25, 2.4, 0.25, -6.5, 1.2, 49.6, 16777215);
    deco(0.25, 2.4, 0.25, 6.5, 1.2, 49.6, 16777215);
    deco(5, 0.25, 0.25, -4, 2.2, 49.6, 15158332);
    deco(5, 0.25, 0.25, 4, 2.2, 49.6, 15158332);
    for (let x = -28; x <= 28; x += 2) deco(0.3, 0.12, 3.2, x, 0.12, 52, 7032629);
  }
  if (L.name === "lift") {
    deco(0.4, 12, 8, -6.2, -6, 44, 4473924);
    deco(0.4, 12, 8, 6.2, -6, 44, 4473924);
    deco(0.3, 16, 0.3, -6.4, 2, 40, 15844367);
    deco(0.3, 16, 0.3, 6.4, 2, 40, 15844367);
    deco(0.3, 16, 0.3, -6.4, 2, 48, 15844367);
    deco(0.3, 16, 0.3, 6.4, 2, 48, 15844367);
  }
  if (L.name === "rope") {
    for (const x of [-2.9, 2.9]) {
      deco(0.12, 0.12, 40, x, 1, 50, 9132587);
      deco(0.4, 3.5, 0.4, x, 1.3, 30, 7032629);
      deco(0.4, 3.5, 0.4, x, 1.3, 70, 7032629);
    }
  }
  if (L.name === "trampoline" && !CITY) {
    deco(10, 0.4, 0.4, 0, 0.5, 34, 2236962);
    deco(10, 0.4, 0.4, 0, 0.5, 46, 2236962);
    for (let i = 0; i < 4; i++) deco(1.2, 1.2, 0.1, -3.5 + i * 2.3, 3.2, 55.95, 7317724);
  }
  if (L.name === "roof") {
    deco(7.6, 1.6, 21, 0, 0.8, 41, 15260872);
    deco(1.2, 2, 0.1, 0, 1, 30.45, 8014634);
  }
  if (L.name === "loop") deco(0.3, 0.3, 0.3, 0, -5, 0, 0);
  windSock = null;
  if (L.wind) {
    const g = keep(new THREE2.Group());
    const pole = new THREE2.Mesh(boxGeo, M(14540253));
    pole.scale.set(0.15, 5, 0.15);
    pole.position.y = 2.5;
    g.add(pole);
    const sock = new THREE2.Mesh(new THREE2.ConeGeometry(0.45, 2.4, 12).rotateZ(Math.PI / 2), M(16738816));
    sock.position.set(1.2, 4.7, 0);
    const sg = new THREE2.Group();
    sg.position.y = 0;
    sg.add(sock);
    g.add(sg);
    g.sockGroup = sg;
    g.position.set(-4.5, 0, L.target[1] + 6);
    scene.add(g);
    windSock = g;
  }
  if (L.name === "gas" && !CITY) {
    const roof = keep(new THREE2.Mesh(boxGeo, M(16053492)));
    roof.scale.set(5, 0.5, 10);
    roof.position.set(-9.8, 4.6, 48.5);
    roof.castShadow = true;
    scene.add(roof);
    const band = keep(new THREE2.Mesh(boxGeo, M(3055183)));
    band.scale.set(5.1, 0.25, 10.1);
    band.position.set(-9.8, 4.3, 48.5);
    scene.add(band);
  }
  if (L.name === "ship") {
    const cab = keep(new THREE2.Mesh(boxGeo, M(15658734)));
    cab.scale.set(2.6, 3.2, 3.2);
    cab.position.set(-6.4, -2.4, 59);
    cab.castShadow = true;
    scene.add(cab);
  }
  if (L.ground === "bridge") {
    const d = L.deck;
    for (let z = d.z0 + 10; z < d.z1 - 5; z += 22) {
      const p = keep(new THREE2.Mesh(boxGeo, M(9080209)));
      p.scale.set(3, 25, 3);
      p.position.set(0, -13, z);
      scene.add(p);
    }
    const far = keep(new THREE2.Mesh(boxGeo, M(9080209)));
    far.castShadow = far.receiveShadow = true;
    far.scale.set(12, 1, 40);
    far.position.set(0, -0.5, d.z1 + 38);
    scene.add(far);
    for (const x of [-6.25, 6.25]) {
      const r = keep(new THREE2.Mesh(boxGeo, M(CITY ? CITY_COL.rail : 14211288)));
      r.scale.set(0.5, 0.9, 40);
      r.position.set(x, 0.45, d.z1 + 38);
      r.castShadow = true;
      scene.add(r);
    }
    if (CITY && ART.props.lamp) for (let z = d.z1 + 24; z <= d.z1 + 54; z += 14) {
      keep(propMesh("lamp", -5.7, z, Math.PI / 2, 0.8));
      keep(propMesh("lamp", 5.7, z + 7, -Math.PI / 2, 0.8));
    }
    for (let z = d.z1 + 26; z <= d.z1 + 56; z += 22) for (const x of [-4.3, 4.3]) {
      const p = keep(new THREE2.Mesh(boxGeo, M(9080209)));
      p.scale.set(2.2, 25, 2.2);
      p.position.set(x, -13, z);
      scene.add(p);
    }
  } else {
    for (let i = -3; i <= 3; i++) {
      const dash = keep(new THREE2.Mesh(new THREE2.PlaneGeometry(0.2, 3).rotateX(-Math.PI / 2), new THREE2.MeshBasicMaterial({ color: 16777215 })));
      dash.position.set(3.2 * Math.sign(i || 1) * 0 + i * 0, 0.011, 6 + (i + 3) * 6);
    }
  }
  moverMeshes = sim.movers.map((mv) => {
    const g = keep(new THREE2.Group());
    const box = new THREE2.Mesh(boxGeo, M({ barge: 8342314, leaf: CITY ? CITY_COL.deck : 9080209, train: 2908042, lift: 15844367, plank: 10514492 }[mv.kind] ?? 10066329));
    box.scale.set(mv.hx * 2, mv.hy * 2, mv.hz * 2);
    box.castShadow = box.receiveShadow = true;
    if (CITY && mv.kind === "leaf") for (const x of [-mv.hx + 0.25, mv.hx - 0.25]) {
      const r = new THREE2.Mesh(boxGeo, M(CITY_COL.rail));
      r.scale.set(0.5, 0.9, mv.hz * 2);
      r.position.set(x, mv.hy + 0.45, 0);
      r.castShadow = true;
      g.add(r);
    }
    if (CITY && mv.kind === "train" && ART.props.train) {
      const t = propMesh("train", 0, 0);
      scene.remove(t);
      g.add(t);
      scene.add(g);
      return g;
    }
    g.add(box);
    if (mv.kind === "train") {
      for (let i = -3; i <= 3; i++) {
        const w = new THREE2.Mesh(boxGeo, M(13625599));
        w.scale.set(3, 1, mv.hz * 2 + 0.05);
        w.position.set(i * 6, 0.5, 0);
        g.add(w);
      }
      const band = new THREE2.Mesh(boxGeo, M(15158332));
      band.scale.set(mv.hx * 2 + 0.05, 0.3, mv.hz * 2 + 0.06);
      band.position.y = -0.7;
      g.add(band);
    }
    scene.add(g);
    return g;
  });
  propMeshes = sim.props.map((o) => {
    const m = keep(new THREE2.Mesh(boxGeo, M(o.color ?? 10066329, { roughness: 0.4, metalness: 0.2 })));
    m.scale.set(o.hx * 2, o.hy * 2, o.hz * 2);
    m.castShadow = true;
    const win = new THREE2.Mesh(boxGeo, M(2240570));
    win.scale.set(0.85, 0.25, 1.05);
    win.position.set(0, 0.1, 0);
    m.add(win);
    scene.add(m);
    return m;
  });
  const ty = L.targetY || 0;
  const slot = keep(slotLines(L.target[0], L.target[1], L.targetYaw, 2.9, 5.4, 16777215, ty + (L.targetY ? 0.06 : 0)));
  if (EDITOR) slot.visible = false;
  {
    const fill = new THREE2.Mesh(new THREE2.PlaneGeometry(2.7, 5.2).rotateX(-Math.PI / 2), new THREE2.MeshBasicMaterial({ color: 16726832, transparent: true, opacity: 0.35, depthWrite: false }));
    fill.position.y = 0.01;
    fill.userData.pulse = true;
    slot.add(fill);
  }
  if (L.targetOn !== void 0) {
    const r = L.targetRel || [0, 0];
    moverMeshes[L.targetOn].add(slot);
    slot.position.set(r[0], sim.movers[L.targetOn].hy, r[1]);
  }
  const arrow = keep(new THREE2.Mesh(new THREE2.ConeGeometry(0.6, 1.4, 4).rotateX(Math.PI), new THREE2.MeshStandardMaterial({ color: 15022389, emissive: 5900808, roughness: 0.45, flatShading: true })));
  arrow.position.set(L.target[0], ty + 2.4, L.target[1]);
  arrow.userData.spin = true;
  arrow.userData.y0 = ty + 2.4;
  scene.add(arrow);
  if (EDITOR) arrow.visible = false;
  if (L.name === "lot" || L.name === "ship") for (const p of L.parked) keep(slotLines(p.x, p.z, p.yaw, 2.9, 5.4, 16777215, ty));
  for (const [x, z] of L.cones) {
    const c = keep(makeCone());
    c.position.set(x, 0, z);
    scene.add(c);
  }
  const tinyS = ESTILO === "tiny", realS = ESTILO === "real";
  carMesh = makeCarMesh(3107839, tinyS ? TINY_CARS.player[0] : realS ? REAL_CARS.player : "Car_13");
  parkedMeshes = sim.parked.map((p, i) => makeCarMesh(p.color, tinyS ? TINY_CARS.parked[i % TINY_CARS.parked.length][0] : realS ? REAL_CARS.parked[i % REAL_CARS.parked.length] : PARKED_MODELS[i % PARKED_MODELS.length]));
  if (ESTILO === "city" || ESTILO === "toon") decorate(L, ty);
}
function decorate(L, ty) {
  skyline(L);
  if (L.loop) keep(scene.add(loopTrack(L.loop)) && scene.children[scene.children.length - 1]);
  if (L.name === "bridge") {
    const d = L.deck;
    for (let z = d.z0 + 6; z <= d.z1 - 8; z += 14) {
      keep(propMesh("lamp", -5.7, z, Math.PI / 2, 0.8));
      if (z + 7 <= d.z1 - 8) keep(propMesh("lamp", 5.7, z + 7, -Math.PI / 2, 0.8));
    }
  }
  const P = (n, x, z, r = 0, sc = 1, y = 0) => keep(propMesh(n, x, z, r, sc, y));
  const fila = (n, x, z0, z1, passo, r = 0, sc = 1) => {
    for (let z = z0; z <= z1; z += passo) P(n, x, z, r, sc);
  };
  const contTint = (g, c) => g.traverse((o) => {
    if (o.isMesh && o.material.name === "cont_tinta") {
      o.material = o.material.clone();
      o.material.color.setHex(c);
    }
  });
  const pilha = (x, z, r, cores) => cores.forEach((c, i) => contTint(P("cont20", x, z, r, 1, 1.3 + i * 2.6), c));
  if (L.name === "gas") {
    fila("palm", 9, 8, 64, 12, 0, 0.32);
    fila("bush3", 9, 14, 70, 12);
    P("trash2", -11.8, 55);
    P("tlight", 6.5, 24, -Math.PI / 2);
    fila("lamp", -22, 10, 66, 14, Math.PI / 2);
  }
  if (L.name === "container" && L.curb) {
    const cz = L.curb.z, piso = keep(new THREE2.Mesh(boxGeo, M(11583173, { roughness: 0.9 })));
    piso.scale.set(30, 0.04, 22);
    piso.position.set(0, 0.02, cz + 11.2);
    piso.receiveShadow = true;
    scene.add(piso);
    for (let x = -15; x < 15; x += 1) {
      const z = keep(new THREE2.Mesh(boxGeo, M(Math.round(x) % 2 ? 2171169 : 16635957, { roughness: 0.7 })));
      z.scale.set(1, 0.32, 0.54);
      z.position.set(x + 0.5, 0.16, cz);
      z.castShadow = z.receiveShadow = true;
      scene.add(z);
    }
    for (const x of [-6, 6]) {
      const f = keep(new THREE2.Mesh(boxGeo, M(16635957)));
      f.scale.set(0.2, 0.05, 20);
      f.position.set(x, 0.05, cz + 11);
      scene.add(f);
    }
  }
  if (L.name === "container") {
    fila("lamp", -8, 6, 46, 10, Math.PI / 2);
    fila("lamp", 8, 11, 46, 10, -Math.PI / 2);
    pilha(-9, 62, 0, [2001125, 16635957]);
    pilha(9.5, 60, Math.PI / 2, [4431943]);
    pilha(9.5, 67, Math.PI / 2, [15022389, 2001125, 16635957]);
    pilha(-10, 70, 0, [16750592]);
    P("spot", -6, 30, Math.PI / 2);
  }
  if (L.name === "jump") {
    fila("palm", -10, 0, 90, 10, 0, 0.32);
    fila("palm", 10, 5, 90, 10, 0, 0.32);
    P("billboard", -9, 30, Math.PI / 2);
    P("billboard", 9, 46, -Math.PI / 2);
    fila("bush", -10, 4, 90, 10);
  }
  if (L.name === "train") {
    const n = 160, dorm = keep(new THREE2.InstancedMesh(boxGeo, M(7162945, { roughness: 0.9 }), n)), mm = new THREE2.Matrix4();
    for (let i = 0; i < n; i++) dorm.setMatrixAt(i, mm.compose(new THREE2.Vector3(-160 + i * 2, 0.06, 52), new THREE2.Quaternion(), new THREE2.Vector3(0.35, 0.12, 3.2)));
    dorm.receiveShadow = true;
    scene.add(dorm);
    for (const z of [51.2, 52.8]) {
      const t = keep(new THREE2.Mesh(boxGeo, M(9479342, { roughness: 0.4, metalness: 0.6 })));
      t.scale.set(320, 0.14, 0.14);
      t.position.set(0, 0.19, z);
      scene.add(t);
    }
    const leito = keep(new THREE2.Mesh(boxGeo, M(9276813, { roughness: 1 })));
    leito.scale.set(320, 0.04, 4.4);
    leito.position.set(0, 0, 52);
    leito.receiveShadow = true;
    scene.add(leito);
  }
  if (L.name === "train") {
    fila("lamp", -8, 6, 42, 12, Math.PI / 2);
    fila("lamp", 8, 12, 42, 12, -Math.PI / 2);
    P("tlight", -6.8, 47, Math.PI / 2);
    P("tlight", 6.8, 47, -Math.PI / 2);
    fila("bush3", -11, 8, 44, 9);
    fila("bush3", 11, 12, 44, 9);
    P("busstop", -10.5, 30, Math.PI / 2);
  }
  if (L.name === "drawbridge") {
    const pista = M(CITY_COL.deck), mur = M(CITY_COL.rail), pil = M(9080209);
    const trecho = (z0, z1, comPilar = true) => {
      const L2 = z1 - z0, zc = (z0 + z1) / 2;
      if (comPilar) for (let z = z0 + 6; z <= z1 - 4; z += 12) {
        const p = keep(new THREE2.Mesh(boxGeo, pil));
        p.scale.set(2, -L.water, 2);
        p.position.set(0, L.water / 2 - 0.5, z);
        p.castShadow = true;
        scene.add(p);
      }
      for (const x of [-4.25, 4.25]) {
        const r = keep(new THREE2.Mesh(boxGeo, mur));
        r.scale.set(0.5, 0.9, L2);
        r.position.set(x, 0.45, zc);
        r.castShadow = r.receiveShadow = true;
        scene.add(r);
      }
    };
    for (const s of sim.statics) if (s.kind === "deck") trecho(s.z - s.hz, s.z + s.hz);
    const zmin = Math.min(...sim.statics.filter((s) => s.kind === "deck").map((s) => s.z - s.hz)), zmax = Math.max(...sim.statics.filter((s) => s.kind === "deck").map((s) => s.z + s.hz));
    for (const [a, b] of [[zmin - 110, zmin], [zmax, zmax + 140]]) {
      const d = keep(new THREE2.Mesh(boxGeo, pista));
      d.scale.set(8, 1, b - a);
      d.position.set(0, -0.5, (a + b) / 2);
      d.castShadow = d.receiveShadow = true;
      scene.add(d);
      trecho(a, b);
    }
    fila("lamp", -3.7, zmax + 4, zmax + 60, 14, Math.PI / 2, 0.8);
    fila("lamp", 3.7, zmax + 11, zmax + 60, 14, -Math.PI / 2, 0.8);
  }
  if (L.name === "drawbridge" || L.name === "ship") {
    fila("lamp", L.name === "ship" ? -5.7 : -3.7, -14, 34, 14, Math.PI / 2, 0.8);
    fila("lamp", L.name === "ship" ? 5.7 : 3.7, -7, 34, 14, -Math.PI / 2, 0.8);
  }
  if (L.name === "double") {
    fila("palm", -10, -14, 100, 11, 0, 0.32);
    fila("palm", 10, -9, 100, 11, 0, 0.32);
    pilha(-9.5, 64, 0, [15022389, 16635957]);
    pilha(9.5, 70, 0, [2001125]);
    P("billboard", 9, 18, -Math.PI / 2);
  }
  if (L.name === "loop") {
    fila("palm", -9, -8, 70, 10, 0, 0.32);
    fila("palm", 23, 0, 70, 10, 0, 0.32);
    fila("bush", -9, -3, 70, 10);
    P("fountain", 14, 30);
  }
  if (L.name === "trampoline") {
    fila("palm", -9, 34, 60, 8, 0, 0.32);
    fila("palm", 9, 34, 60, 8, 0, 0.32);
    P("fountain", -11, 46);
  }
  if (L.name === "ice") {
    const neve = M(16120316, { roughness: 0.95, flatShading: true }), geo = new THREE2.IcosahedronGeometry(1, 1);
    for (let i = 0; i < 26; i++) for (const x of [-10, 17]) {
      const z = -24 + i * 3.6, k = Math.sin(i * 12.9898 + x) * 43758.5453 % 1, r = 1.4 + Math.abs(k) * 1.2;
      const m = keep(new THREE2.Mesh(geo, neve));
      m.scale.set(r * 1.3, r * 0.55, r);
      m.position.set(x + k * 1.5, 0, z);
      m.castShadow = m.receiveShadow = true;
      scene.add(m);
    }
    for (let z = -10; z <= 70; z += 16) keep(propMesh("lamp", -8.2, z, Math.PI / 2));
  }
  if (L.name !== "lot") return;
  for (let z = 18; z <= 66; z += 10) {
    keep(propMesh("palm", 17.5, z, z, 0.32));
    keep(propMesh("bush", 17.5, z + 5));
  }
  for (let z = 20; z <= 64; z += 14) keep(propMesh("lamp", -9, z, Math.PI / 2));
  keep(propMesh("trash", -9, 27));
  keep(propMesh("busstop", -10, 52, Math.PI / 2));
}
var SHADOW_BATCH = [];
var DASH_BATCH = [];
function mergeFlat(geos) {
  let n = 0;
  for (const g of geos) n += g.attributes.position.array.length;
  const a = new Float32Array(n);
  let o = 0;
  for (const g of geos) {
    a.set(g.attributes.position.array, o);
    o += g.attributes.position.array.length;
    g.dispose();
  }
  const r = new THREE2.BufferGeometry();
  r.setAttribute("position", new THREE2.BufferAttribute(a, 3));
  return r;
}
function flushBatches() {
  if (SHADOW_BATCH.length) {
    const m = keep(new THREE2.Mesh(mergeFlat(SHADOW_BATCH.splice(0)), SHADOW_MAT));
    m.renderOrder = 1;
    m.frustumCulled = false;
    scene.add(m);
  }
  if (DASH_BATCH.length) {
    const im = keep(new THREE2.InstancedMesh(DASH_GEO, DASH_MAT, DASH_BATCH.length));
    DASH_BATCH.splice(0).forEach((mt, i) => im.setMatrixAt(i, mt));
    im.frustumCulled = false;
    scene.add(im);
  }
}
var DASH_GEO = new THREE2.PlaneGeometry(0.35, 3).rotateX(-Math.PI / 2);
var DASH_MAT = new THREE2.MeshBasicMaterial({ color: 16119285 });
var SHADOW_MAT = new THREE2.MeshBasicMaterial({
  color: 727598,
  transparent: true,
  opacity: 0.28,
  depthWrite: false,
  polygonOffset: true,
  polygonOffsetFactor: -4,
  polygonOffsetUnits: -4,
  stencilWrite: true,
  stencilRef: 1,
  stencilFunc: THREE2.NotEqualStencilFunc,
  stencilZPass: THREE2.ReplaceStencilOp
});
function bakedShadow(bb, y, blk) {
  const h = bb.max.y - bb.min.y, ox = -SUN_OFF.x / SUN_OFF.y * h, oz = -SUN_OFF.z / SUN_OFF.y * h;
  const pts2 = [];
  for (const x of [bb.min.x, bb.max.x]) for (const z of [bb.min.z, bb.max.z]) {
    pts2.push([x, z], [x + ox, z + oz]);
  }
  pts2.sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const cr = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const lo = [], up = [];
  for (const p of pts2) {
    while (lo.length >= 2 && cr(lo[lo.length - 2], lo[lo.length - 1], p) <= 0) lo.pop();
    lo.push(p);
  }
  for (let i = pts2.length - 1; i >= 0; i--) {
    const p = pts2[i];
    while (up.length >= 2 && cr(up[up.length - 2], up[up.length - 1], p) <= 0) up.pop();
    up.push(p);
  }
  const hull = lo.slice(0, -1).concat(up.slice(0, -1));
  const put = (poly, yy) => {
    if (poly.length < 3) return;
    const shape = new THREE2.Shape(poly.map(([x, z]) => new THREE2.Vector2(x, -z)));
    SHADOW_BATCH.push(new THREE2.ShapeGeometry(shape).rotateX(-Math.PI / 2).translate(0, yy, 0).toNonIndexed());
  };
  put(hull, y - 0.27 + 0.08);
  if (blk) put(clipRect(hull, blk), y + 0.13);
}
function clipRect(poly, r) {
  const edge = (pts2, inside, cut) => {
    const out = [];
    for (let i = 0; i < pts2.length; i++) {
      const a = pts2[i], b = pts2[(i + 1) % pts2.length], ia = inside(a), ib = inside(b);
      if (ia) out.push(a);
      if (ia !== ib) out.push(cut(a, b));
    }
    return out;
  };
  const lx = (a, b, x) => [x, a[1] + (b[1] - a[1]) * (x - a[0]) / (b[0] - a[0])], lz = (a, b, z) => [a[0] + (b[0] - a[0]) * (z - a[1]) / (b[1] - a[1]), z];
  let p = poly;
  p = edge(p, (q) => q[0] >= r.x0, (a, b) => lx(a, b, r.x0));
  if (p.length) p = edge(p, (q) => q[0] <= r.x1, (a, b) => lx(a, b, r.x1));
  if (p.length) p = edge(p, (q) => q[1] >= r.z0, (a, b) => lz(a, b, r.z0));
  if (p.length) p = edge(p, (q) => q[1] <= r.z1, (a, b) => lz(a, b, r.z1));
  return p;
}
var _reflexo = {};
function reflexoMat(sx) {
  if (_reflexo[sx]) return _reflexo[sx];
  const c = document.createElement("canvas");
  c.width = 64;
  c.height = 1;
  const g = c.getContext("2d"), gr = g.createLinearGradient(0, 0, 64, 0);
  const a = sx > 0 ? [0, 1] : [1, 0];
  gr.addColorStop(a[0], "rgba(120,135,150,0)");
  gr.addColorStop(a[1], "rgba(120,135,150,0.55)");
  g.fillStyle = gr;
  g.fillRect(0, 0, 64, 1);
  const t = new THREE2.CanvasTexture(c);
  t.colorSpace = THREE2.SRGBColorSpace;
  return _reflexo[sx] = new THREE2.MeshBasicMaterial({ map: t, transparent: true, depthWrite: false });
}
var AREA_LIVRE = { "lot": [3, 12, 14, 101], "bridge": [0, 0, 0, 99], "gas": [-7, -2, 14, 101], "container": [-5, 0, 0, 50], "ship": [0, 1, 0, 104], "jump": [-1, 1, -10, 168], "ice": [-2, 9, -6, 106], "drawbridge": [-2, 2, 0, 92], "train": [0, 114, 0, 74], "loop": [-7, 30, -10, 151], "trampoline": [0, 0, -10, 140], "double": [-2, 0, -10, 171] };
function skyline(L) {
  if (!ART.kenney) return;
  const water = L.water !== void 0, chaoNenhum = L.ground === "none" || water;
  let x0 = Math.min(L.start[0], L.target[0]) - 14, x1 = Math.max(L.start[0], L.target[0]) + 14, z0 = L.start[1] - 30, z1 = L.target[1] + 18;
  for (const s of sim.statics) {
    if (s.kind === "ground") continue;
    x0 = Math.min(x0, s.x - s.hx - 6);
    x1 = Math.max(x1, s.x + s.hx + 6);
    z0 = Math.min(z0, s.z - s.hz - 6);
    z1 = Math.max(z1, s.z + s.hz + 6);
  }
  for (const p of L.parked) {
    x0 = Math.min(x0, p.x - 8);
    x1 = Math.max(x1, p.x + 8);
  }
  if (L.loop) x1 = Math.max(x1, L.loop.shift + 10);
  {
    const A = AREA_LIVRE[L.name];
    if (A) {
      x0 = Math.min(x0, A[0] - 9);
      x1 = Math.max(x1, A[1] + 9);
      z0 = Math.min(z0, A[2] - 10);
      z1 = Math.max(z1, A[3] + 12);
    }
  }
  if (L.name === "gas") {
    x0 -= 10;
    z0 = Math.min(z0, 30);
  }
  if (water) {
    x0 = Math.min(x0, -40);
    x1 = Math.max(x1, 40);
  }
  const B = 36, RUA = 14, PASSO = B + RUA, asf = M(5198681, { roughness: 0.95 }), calc = M(13620184, { roughness: 0.9 }), praca = M(10275941, { roughness: 0.95 }), faixa = new THREE2.MeshBasicMaterial({ color: 16119285 }), cais = M(11583173, { roughness: 0.9 });
  const yBase = water ? L.water - 2 : -20, yTopo = water ? L.water + 2 : 0;
  if (!chaoNenhum) {
    const g = keep(new THREE2.Mesh(new THREE2.PlaneGeometry(900, 900).rotateX(-Math.PI / 2), asf));
    g.position.set(0, -0.04, L.target[1]);
    g.receiveShadow = true;
    scene.add(g);
  } else for (const sx of [-1, 1]) {
    const xa = sx < 0 ? x0 - 6 : x1 + 6, w = 400, c = keep(new THREE2.Mesh(boxGeo, cais));
    c.scale.set(w, yTopo - yBase, 900);
    c.position.set(xa + sx * w / 2, (yTopo + yBase) / 2, L.target[1]);
    c.receiveShadow = true;
    scene.add(c);
    const t = keep(new THREE2.Mesh(new THREE2.PlaneGeometry(w, 900).rotateX(-Math.PI / 2), asf));
    t.position.set(xa + sx * w / 2, yTopo + 0.01, L.target[1]);
    t.receiveShadow = true;
    scene.add(t);
    if (water) {
      const rf = keep(new THREE2.Mesh(new THREE2.PlaneGeometry(6, 900).rotateX(-Math.PI / 2), reflexoMat(sx)));
      rf.position.set(xa - sx * 3, L.water + 0.03, L.target[1]);
      rf.renderOrder = 2;
      scene.add(rf);
    }
  }
  const zc = L.target[1], cam = { x: L.start[0], z: L.start[1] - 12 };
  let n = 0, k = 0;
  const MAX = 34, cells = [];
  for (let gx = -5; gx <= 5; gx++) for (let gz = -3; gz <= 6; gz++) {
    const cx = gx * PASSO + PASSO / 2, cz = Math.round(zc / PASSO) * PASSO + gz * PASSO;
    if (cx + B / 2 > x0 && cx - B / 2 < x1 && cz + B / 2 > z0 && cz - B / 2 < z1) continue;
    if (chaoNenhum && cx + B / 2 > x0 - 6 && cx - B / 2 < x1 + 6) continue;
    if (L.name === "train" && Math.abs(cz - 52) < B / 2 + 14) continue;
    cells.push({ cx, cz, d: Math.hypot(cx - (x0 + x1) / 2, (cz - (z0 + z1) / 2) * 0.8) });
  }
  cells.sort((a, b) => a.d - b.d);
  const dash = new THREE2.PlaneGeometry(0.35, 3).rotateX(-Math.PI / 2);
  for (const c of cells.slice(0, 26)) {
    const yb = yTopo;
    const side = keep(new THREE2.Mesh(boxGeo, calc));
    side.scale.set(B, 0.25, B);
    side.position.set(c.cx, yb + 0.12, c.cz);
    side.receiveShadow = true;
    scene.add(side);
    const pr = keep(new THREE2.Mesh(boxGeo, praca));
    pr.scale.set(B - 14, 0.1, B - 14);
    pr.position.set(c.cx, yb + 0.28, c.cz);
    scene.add(pr);
    const CAL = 3.5, Q2 = B / 2 - CAL;
    for (const [sx, sz, r] of [[-1, -1, Math.PI], [1, -1, Math.PI], [-1, 1, 0], [1, 1, 0]]) {
      if (n >= MAX) break;
      const id = ART.kenney[(k++ * 7 + c.cx + c.cz) % ART.kenney.length | 0] || ART.kenney[k % ART.kenney.length];
      const g = keep(propMesh(id, 0, 0, r, 14, yb + 0.25));
      const bb = new THREE2.Box3().setFromObject(g);
      const w = bb.max.x - bb.min.x, d = bb.max.z - bb.min.z, f = Math.min(1, (Q2 - 0.5) / Math.max(w, d));
      g.scale.multiplyScalar(f);
      bb.setFromObject(g);
      const cxB = (bb.min.x + bb.max.x) / 2, czB = (bb.min.z + bb.max.z) / 2, hw = (bb.max.x - bb.min.x) / 2, hd = (bb.max.z - bb.min.z) / 2;
      g.position.x += c.cx + sx * (Q2 - hw) - cxB;
      g.position.z += c.cz + sz * (Q2 - hd) - czB;
      n++;
      g.traverse((o) => {
        o.castShadow = false;
      });
      bb.setFromObject(g);
      bakedShadow(bb, yb + 0.27, { x0: c.cx - B / 2, x1: c.cx + B / 2, z0: c.cz - B / 2, z1: c.cz + B / 2 });
    }
    for (const [dx, dz] of [[-B / 2 + 1, -B / 2 + 1], [B / 2 - 1, B / 2 - 1]]) keep(propMesh("lamp", c.cx + dx, c.cz + dz, Math.PI / 4, 1, yb + 0.25));
    for (let t = -B / 2; t < B / 2; t += 6) {
      DASH_BATCH.push(new THREE2.Matrix4().compose(new THREE2.Vector3(c.cx + t, yTopo + 0.03, c.cz - PASSO / 2), new THREE2.Quaternion().setFromAxisAngle(UP, Math.PI / 2), new THREE2.Vector3(1, 1, 1)));
      DASH_BATCH.push(new THREE2.Matrix4().makeTranslation(c.cx - PASSO / 2, yTopo + 0.03, c.cz + t));
    }
  }
  flushBatches();
}
var EDITOR = Q.has("editor");
var loadPins = () => {
  try {
    return JSON.parse(localStorage.getItem("cp_alvos") || "{}");
  } catch {
    return {};
  }
};
function withPin(L0) {
  const pin = LOCAL ? loadPins()[L0.name] : null;
  if (!pin) return L0;
  if (L0.targetOn !== void 0) return pin.rel ? { ...L0, targetRel: pin.rel } : L0;
  const dx = pin.x - L0.target[0], dz = pin.z - L0.target[1];
  return { ...L0, target: [pin.x, pin.z], targetYaw: pin.yaw, parked: L0.parked.map((p) => ({ ...p, x: p.x + dx, z: p.z + dz, yaw: pin.yaw })) };
}
var replayAt = -1;
function startLevel() {
  const L = withPin(LEVELS[li % LEVELS.length]);
  if (sim) try {
    sim.world.free();
  } catch (e) {
  }
  sim = createSim(RAPIER, { ...L, attempt: tries });
  if ($("ed")) $("ed").style.display = "none";
  prev = /* @__PURE__ */ new Map();
  buildLevel(L);
  clearFx();
  resetImpactFx();
  sndBounce = 0;
  sndTrain = false;
  if (SITE) hudTop();
  else $("lvl").textContent = L.id;
  $("res").className = "hud";
  $("res").innerHTML = "";
  guide = SITE ? (prog.best[L.name] || 0) < 400 : firstTap;
  $("hand").style.display = "none";
  tapBand = null;
  if (guide && L.tapZone) {
    const v = 20 * 0.13, z = L.tapZone;
    tapBand = keep(new THREE2.Mesh(new THREE2.PlaneGeometry(5.4, 2 * v).rotateX(-Math.PI / 2), new THREE2.MeshBasicMaterial({ color: 16764928, toneMapped: false, transparent: true, opacity: 0.75, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -4 })));
    tapBand.position.set(z[0], z[1] + 0.03, z[2]);
    tapBand.renderOrder = 3;
    scene.add(tapBand);
  }
  state = "play";
  acc = 0;
  const p = sim.car.translation();
  camY = 0;
  camPos.set(p.x, 7, p.z - 11);
  camLook.set(p.x, 0, p.z + 8);
  if (L.cam === "fixed") {
    camPos.fromArray(L.camPos);
    camLook.fromArray(L.camLook);
  }
}
function snap() {
  for (const [b, m] of [[sim.car, carMesh], ...sim.parked.map((p, i) => [p.body, parkedMeshes[i]])]) {
    const t = b.translation(), r = b.rotation();
    prev.set(b, { p: new THREE2.Vector3(t.x, t.y, t.z), q: new THREE2.Quaternion(r.x, r.y, r.z, r.w) });
  }
}
var _p = new THREE2.Vector3();
var _q = new THREE2.Quaternion();
function place(b, m, a) {
  const t = b.translation(), r = b.rotation(), pv = prev.get(b);
  _p.set(t.x, t.y, t.z);
  _q.set(r.x, r.y, r.z, r.w);
  if (pv) {
    _p.lerpVectors(pv.p, _p, a);
    _q.slerpQuaternions(pv.q, _q, a);
  }
  m.position.copy(_p);
  m.quaternion.copy(_q);
}
function onTap(e) {
  if (e.target && e.target.closest && e.target.closest("#ed,button,a,dialog,#topbar,#adbar")) return;
  if (SITE && e.target && e.target.closest && !e.target.closest("#stage")) return;
  if (e.preventDefault) e.preventDefault();
  if (state === "menu" || state === "final") return;
  if (state === "play") {
    const was = sim.st.tapped;
    sim.tap();
    if (sim.st.tapped) {
      firstTap = false;
      $("hand").style.display = "none";
      if (!was) SFX.screech();
      if (!was && SITE && sim.st.tapAir && sim.level.tapZone) {
        $("res").innerHTML = `<b class="when">${T("beforeRamp")}</b>`;
        $("res").style.fontSize = "";
        $("res").className = "hud on";
      }
    }
  } else if (state === "result" && EDITOR) return;
  else if (state === "result" && performance.now() - resT > 900) {
    if (SITE) {
      siteNext();
      return;
    }
    if (sim.st.score >= 400) {
      li++;
      tries = 0;
    } else tries++;
    startLevel();
  }
}
addEventListener("pointerdown", onTap, { passive: false });
addEventListener("keydown", (e) => {
  if (e.repeat || e.code !== "Space" && e.key !== "Enter") return;
  const a = document.activeElement;
  if (document.querySelector("dialog[open]") || a && a.closest && a.closest("input,textarea,button,a,select")) return;
  if (SITE && !$("menu").classList.contains("hide")) {
    e.preventDefault();
    $("m-play").click();
    return;
  }
  if (SITE && !$("result").classList.contains("hide")) return;
  e.preventDefault();
  onTap({ target: $("c") });
});
function showEditor() {
  const p = sim.car.translation(), st = sim.st, yawDeg = Math.round(st.yaw * 180 / Math.PI);
  const tp = st.tapped ? `toque em ${st.tapT.toFixed(2)} s (quadro ${Math.round(st.tapT * 60)})` : "sem toque";
  $("edInfo").innerHTML = `Fase ${sim.level.id} (${sim.level.name}) \xB7 ${tp}<br>parou em x ${p.x.toFixed(2)} \xB7 z ${p.z.toFixed(2)} \xB7 giro ${yawDeg}\xB0${st.fell ? " \xB7 CAIU" : ""}`;
  $("ed").style.display = "block";
}
if ($("ed")) {
  $("edPin").onclick = () => {
    const p = sim.car.translation(), pins = loadPins(), L = sim.level;
    pins[L.name] = { x: +p.x.toFixed(2), z: +p.z.toFixed(2), yaw: +sim.st.yaw.toFixed(4), tap: sim.st.tapT };
    if (L.targetOn !== void 0) {
      const b = sim.movers[L.targetOn].body, t = b.translation(), r = b.rotation();
      const loc = new THREE2.Vector3(p.x - t.x, p.y - t.y, p.z - t.z).applyQuaternion(new THREE2.Quaternion(r.x, r.y, r.z, r.w).invert());
      pins[L.name].rel = [+loc.x.toFixed(2), +loc.z.toFixed(2)];
    }
    localStorage.setItem("cp_alvos", JSON.stringify(pins));
    $("edInfo").innerHTML += "<br>\u2714 alvo gravado \u2014 abra sem ?editor para jogar com ele";
  };
  $("edRe").onclick = () => {
    const t = sim.st.tapT;
    startLevel();
    replayAt = t;
  };
  $("edPrev").onclick = () => {
    li = (li + LEVELS.length - 1) % LEVELS.length;
    startLevel();
  };
  $("edNext").onclick = () => {
    li = (li + 1) % LEVELS.length;
    startLevel();
  };
  $("edCopy").onclick = async () => {
    const txt = JSON.stringify(loadPins(), null, 1);
    try {
      await navigator.clipboard.writeText(txt);
      $("edInfo").innerHTML += "<br>\u2714 copiado";
    } catch {
      $("edInfo").innerHTML += '<br><textarea style="width:100%;height:80px">' + txt + "</textarea>";
    }
  };
  $("edClear").onclick = () => {
    const pins = loadPins();
    delete pins[sim.level.name];
    localStorage.setItem("cp_alvos", JSON.stringify(pins));
    $("edInfo").innerHTML += "<br>alvo desta fase apagado";
  };
}
function showResult() {
  state = "result";
  resT = performance.now();
  if (EDITOR) {
    showEditor();
    return;
  }
  const s = sim.st.score;
  total += s;
  if (!SITE) $("tot").textContent = total;
  const label = !SITE ? sim.st.legend ? "LEND\xC1RIA" : sim.st.fell ? "\u{1F4A6}" : !sim.st.tapped || sim.st.crashed ? "\u{1F4A5}" : s >= 1e3 ? "PERFECT" : "" : sim.st.legend ? T("legend") : sim.st.fell ? T("water") : !sim.st.tapped ? T("noTap") : sim.st.crashed ? T("crash") : s >= 1e3 ? T("perfect") : "";
  const arc = SITE && mode === "arcade";
  const when = SITE && sim.st.tapped && !sim.st.legend && s < 400 && sim.level.tapIdeal ? sim.st.tapAir && sim.level.tapZone ? "" : sim.st.tapT < sim.level.tapIdeal ? T("early") : T("late") : "";
  const note = !SITE ? "" : mode === "daily" ? goalOk(daily.g, s) ? "" : goalTxt(daily.g) : sim.st.legend ? arc ? T("legendVal") : "" : !arc && s < 400 ? T("need") : "";
  if (SITE) siteLevelEnd(s);
  const big = !SITE || arc || sim.st.legend ? String(s) : pct(s);
  $("res").innerHTML = `${big}${label ? `<small>${label}</small>` : ""}${when ? `<b class="when">${when}</b>` : ""}${note ? `<em>${note}</em>` : ""}`;
  $("res").style.fontSize = s > 99999 ? "min(6.5vh,11.5vw)" : "";
  $("res").className = "hud on" + (sim.st.legend ? " leg" : "");
  if (sim.st.legend) {
    trauma = 1;
    const cp = carMesh.position;
    for (let k = 0; k < 4; k++) burstSparks(cp, new THREE2.Vector3(Math.cos(k * 1.6), 1, Math.sin(k * 1.6)), 40);
  }
}
var prog = { best: LSG.get("cp_best") || {}, unl: Math.min(LEVELS.length - 1, +(LSG.get("cp_unl") || 0)) };
var sessionPlayed = false;
var mode = "treino";
var run = { sum: 0, p: 0, l: 0 };
var pts = (s) => s > 1e3 ? 1500 : s;
var pct = (s) => Math.round(Math.min(1e3, s) / 10) + "%";
function setHud(on) {
  for (const id of ["lvl", "tot", "mbtn"]) {
    const e = $(id);
    if (e) e.style.display = on ? "" : "none";
  }
  if (!on) {
    $("hand").style.display = "none";
    const c = $("cont");
    if (c) c.className = "hud";
  }
}
function hudTop() {
  $("lvl").innerHTML = `<small>${mode === "arcade" ? T("arcade") : T("practice")}</small><span>${li + 1}<i>/${LEVELS.length}</i></span>`;
  const b = prog.best[sim.level.name] || 0;
  if (mode === "daily") {
    $("lvl").innerHTML = `<small>${T("daily")}</small><span>${li + 1}<i>/${LEVELS.length}</i></span>`;
    $("tot").innerHTML = `<small>${T("goal")}</small>${daily.g.leg ? "\u{1F451}" : daily.g.p + "%"}`;
    return;
  }
  $("tot").innerHTML = mode === "arcade" ? `<small>${T("total")}${duelOn ? " \xB7 vs " + duel.score : ""}</small>${run.sum}` : `<small>${T("record")}</small>${b > 1e3 ? "\u{1F451}" : pct(b)}`;
}
function drawGrid() {
  const g = $("mgrid");
  g.innerHTML = "";
  LEVELS.forEach((L, i) => {
    const b = prog.best[L.name] || 0, lock = i > prog.unl, el = document.createElement("button");
    el.type = "button";
    el.className = "lv" + (lock ? " lock" : "") + (i === li && mode === "treino" ? " cur" : "");
    el.disabled = lock;
    el.innerHTML = `<b>${i + 1}</b><small>${lock ? "\u{1F512}" : b > 1e3 ? "\u{1F451}" : b >= 1e3 ? "\u2605" : b ? pct(b) : "\u2013"}</small>`;
    el.setAttribute("aria-label", T("practice") + " \xB7 " + T("lvlN", { n: String(i + 1) }) + (lock ? " \u{1F512}" : b ? " \xB7 " + pct(b) : ""));
    el.addEventListener("click", () => {
      SFX.tick();
      mode = "treino";
      li = i;
      tries = 0;
      playNow();
    });
    g.appendChild(el);
  });
}
function showMenu() {
  state = "menu";
  setHud(false);
  $("result").classList.add("hide");
  $("res").className = "hud";
  if (mode !== "treino") {
    mode = "treino";
    li = Math.min(li, prog.unl);
  }
  startLevelPreview();
  drawGrid();
  $("m-play").querySelector("b").textContent = T("arcade");
  $("m-play").querySelector("small").textContent = T("arcSub");
  $("mtreino").textContent = T("practice");
  {
    const n = dayNum(), ms = misGet();
    $("m-daily").querySelector("b").textContent = T("dailyN", { n: String(n) }) + (ms.done ? " \u2705" : "");
    $("m-daily").querySelector("small").textContent = goalTxt(goalFor(n));
  }
  $("ccard").classList.add("hide");
  const rb = +(LSG.get("cp_rank_best") || 0);
  $("best").textContent = rb ? T("arcBest") + " " + rb : "";
  $("menu").classList.remove("hide");
}
function startLevelPreview() {
  startLevel();
  state = "menu";
  $("hand").style.display = "none";
}
function playNow() {
  $("menu").classList.add("hide");
  $("result").classList.add("hide");
  setHud(true);
  if (mode === "arcade") {
    run = { sum: 0, p: 0, l: 0 };
    li = 0;
    window.CL_LAST = null;
  } else duelOn = false;
  $("ccard").classList.add("hide");
  shareLabel("share");
  if (!sessionPlayed) {
    sessionPlayed = true;
    try {
      window.BG_SOCIAL && window.BG_SOCIAL.play(GAME, "campaign");
    } catch (e) {
    }
  }
  startLevel();
  SFX.start();
}
function siteLevelEnd(s) {
  const L = sim.level, old = prog.best[L.name] || 0, last2 = li >= LEVELS.length - 1;
  if (s > old) {
    prog.best[L.name] = s;
    LSG.set("cp_best", prog.best);
  }
  if (s >= 400 && li + 1 > prog.unl && li + 1 < LEVELS.length) {
    prog.unl = li + 1;
    LSG.set("cp_unl", prog.unl);
  }
  if (mode === "arcade") {
    run.sum += pts(s);
    if (s > 1e3) run.l++;
    else if (s >= 1e3) run.p++;
    window.CL_LAST = { mode: "campaign", score: run.sum, p: run.p, l: run.l };
  }
  if (mode === "daily") {
    const ms = misGet();
    ms.tries++;
    daily.ok = goalOk(daily.g, s);
    if (daily.ok && !ms.done) {
      ms.done = true;
      ms.doneTries = ms.tries;
    }
    LSG.set("cp_mis", ms);
    daily.ms = ms;
  }
  hudTop();
  try {
    window.BG_SOCIAL && window.BG_SOCIAL.end && window.BG_SOCIAL.end(GAME, mode === "arcade" ? "campaign" : mode, pts(s), L.name);
  } catch (e) {
  }
  if (sim.st.legend || s >= 1e3) SFX.perfect();
  else if (s >= 400) SFX.good();
  const c = $("cont");
  c.textContent = mode === "daily" ? daily.ok ? T("tapEnd") : T("tapRetry") : mode === "arcade" ? last2 ? T("tapEnd") : T("tapNext") : s >= 400 ? last2 ? T("tapMenu") : T("tapNext") : T("tapRetry");
  c.className = "hud on";
}
function siteNext() {
  const s = sim.st.score, last2 = li >= LEVELS.length - 1;
  if (mode === "daily") {
    if (daily.ok) showDailyWin(s, daily.ms);
    else {
      tries++;
      startLevel();
    }
    return;
  }
  if (mode === "arcade") {
    if (last2) {
      showFinal();
      return;
    }
    li++;
    tries = 0;
    startLevel();
    return;
  }
  if (s >= 400) {
    if (last2) {
      showMenu();
      return;
    }
    li++;
    tries = 0;
  } else tries++;
  startLevel();
}
function showFinal() {
  state = "final";
  setHud(false);
  $("res").className = "hud";
  $("menu").classList.add("hide");
  $("cont").className = "hud";
  const tot = run.sum;
  $("rlabel").textContent = T("arcDone");
  $("rscore").textContent = tot;
  $("rstats").textContent = T("stats", { p: String(run.p), l: String(run.l) });
  if (duelOn) {
    const v = duel.score, w = duel.nick || T("friend"), r = Math.sign(tot - v);
    $("rlabel").textContent = r > 0 ? T("dWin") : r === 0 ? T("duelTie") : T("duelLose", { s: String(v - tot + 1) });
    $("rstats").textContent = T("dVs", { s: String(tot), n: w, v: String(v) });
  }
  const old = +(LSG.get("cp_rank_best") || 0);
  if (tot > old) LSG.set("cp_rank_best", tot);
  window.CL_LAST = { mode: "campaign", score: tot, p: run.p, l: run.l, fin: 1, link: tot > 0 ? duelLink(tot) : null };
  shareLabel(tot > 0 ? duelOn ? "dBack" : "challenge" : "share");
  if (duelOn) {
    duelOn = false;
    duel = null;
    try {
      history.replaceState(null, "", location.pathname + (Q.get("lang") ? "?lang=" + Q.get("lang") : ""));
    } catch (e) {
    }
  }
  try {
    window.BG_SOCIAL && window.BG_SOCIAL.end && window.BG_SOCIAL.end(GAME, "campaign", tot, "final");
  } catch (e) {
  }
  try {
    window.CL_RANK && window.CL_RANK.ended(window.CL_LAST);
  } catch (e) {
  }
  SFX.perfect();
  $("result").classList.remove("hide");
}
var dayNum = () => {
  const d = /* @__PURE__ */ new Date();
  return Math.floor((Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) - Date.UTC(2026, 10, 24)) / 864e5) + 1;
};
function goalFor(n) {
  let a = n * 2654435761 + 12345 >>> 0;
  const r = () => {
    a = a + 1831565813 >>> 0;
    let t = Math.imul(a ^ a >>> 15, 1 | a);
    t ^= t + Math.imul(t ^ t >>> 7, 61 | t);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
  const sec = LEVELS.map((L, i) => L.secret ? i : -1).filter((i) => i >= 0);
  if (n % 7 === 0 && sec.length) return { l: sec[Math.floor(r() * sec.length)], leg: true };
  return { l: Math.floor(r() * LEVELS.length), p: [70, 80, 80, 90, 90, 100][Math.floor(r() * 6)] };
}
var goalTxt = (g) => g.leg ? T("goalLeg", { l: String(g.l + 1) }) : g.p >= 100 ? T("goalPerf", { l: String(g.l + 1) }) : T("goalPct", { p: String(g.p), l: String(g.l + 1) });
var goalOk = (g, s) => g.leg ? s > 1e3 : Math.min(1e3, s) / 10 >= g.p;
function misGet() {
  const n = dayNum(), m = LSG.get("cp_mis");
  return m && m.d === n ? m : { d: n, tries: 0, done: false, doneTries: 0 };
}
var daily = null;
function startDaily() {
  daily = { n: dayNum(), g: goalFor(dayNum()) };
  mode = "daily";
  li = daily.g.l;
  tries = 0;
  playNow();
}
function showDailyWin(s, ms) {
  state = "final";
  setHud(false);
  $("res").className = "hud";
  $("menu").classList.add("hide");
  $("cont").className = "hud";
  $("rlabel").textContent = "\u2705 " + T("misOk");
  $("rscore").textContent = s > 1e3 ? "\u{1F451}" : pct(s);
  $("rstats").textContent = T("dailyN", { n: String(daily.n) }) + " \xB7 " + (ms.doneTries <= 1 ? T("first") : T("inTries", { n: String(ms.doneTries) }));
  window.CL_LAST = { mode: "daily", daily: daily.n, tries: ms.doneTries, score: 1 };
  shareLabel("share");
  SFX.perfect();
  $("result").classList.remove("hide");
}
var cleanNick = (v) => String(v || "").replace(/[^\p{L}\p{N} ]/gu, "").replace(/\s+/g, " ").trim().slice(0, 14);
function chk(sc, nick) {
  let a = 1540483477 >>> 0;
  const t = String(sc) + "|" + nick + "|cp";
  for (let i = 0; i < t.length; i++) a = Math.imul(a ^ t.charCodeAt(i), 2654435761) >>> 0;
  return (a % 1679616).toString(36);
}
var duel = null;
var duelOn = false;
try {
  const q = new URLSearchParams(location.search), sc = q.get("s"), h = q.get("h"), nk = cleanNick(q.get("n"));
  if (sc && /^\d{1,6}$/.test(sc) && h && chk(+sc, nk) === h) duel = { score: +sc, nick: nk };
} catch (e) {
}
function duelLink(sc) {
  let nick = "";
  try {
    nick = cleanNick(window.BG_SOCIAL && window.BG_SOCIAL.name && window.BG_SOCIAL.name());
  } catch (e) {
  }
  const q = new URLSearchParams();
  q.set("s", String(sc));
  if (nick) q.set("n", nick);
  q.set("h", chk(sc, nick));
  return location.origin + location.pathname + "?" + q.toString();
}
function shareLabel(k) {
  const e = $("share") && $("share").querySelector("[data-i18n]");
  if (e) e.textContent = T(k);
}
function duelCard() {
  const c = $("ccard");
  $("menu").classList.add("hide");
  $("cc-txt").textContent = duel.nick ? T("duelBy", { n: duel.nick, s: String(duel.score) }) : T("duelAnon", { s: String(duel.score) });
  $("cc-sub").textContent = T("duelSub", { s: String(duel.score + 1) });
  c.classList.remove("hide");
  setTimeout(() => {
    try {
      $("cc-go").focus({ preventScroll: true });
    } catch (e) {
    }
  }, 50);
}
function siteInit() {
  if (DEBUG) {
    window.BG_SOCIAL = null;
    window.CL_RANK = null;
  }
  li = prog.unl;
  total = 0;
  $("m-play").addEventListener("click", () => {
    SFX.tick();
    mode = "arcade";
    duelOn = false;
    playNow();
  });
  $("m-daily").addEventListener("click", () => {
    SFX.tick();
    startDaily();
  });
  $("cc-go").addEventListener("click", () => {
    SFX.tick();
    mode = "arcade";
    playNow();
    duelOn = true;
    hudTop();
  });
  $("cc-back").addEventListener("click", () => {
    SFX.tick();
    duel = null;
    $("ccard").classList.add("hide");
    $("menu").classList.remove("hide");
  });
  $("mbtn").addEventListener("click", () => {
    SFX.tick();
    showMenu();
  });
  $("again").addEventListener("click", () => {
    SFX.tick();
    tries = 0;
    showMenu();
  });
  for (const id of ["m-rank", "r-rank"]) $(id).addEventListener("click", () => {
    SFX.tick();
    if (window.CL_RANK) window.CL_RANK.open("campaign", 0);
  });
  const sb = $("topsnd");
  if (sb) {
    const draw = () => {
      sb.setAttribute("aria-pressed", SND.on ? "true" : "false");
      sb.classList.toggle("on", SND.on);
    };
    draw();
    sb.hidden = false;
    sb.addEventListener("click", () => {
      SND.on = !SND.on;
      LSG.set("cp_snd", SND.on ? 1 : 0);
      draw();
      if (SND.on) {
        sndInit();
        SFX.tick();
      } else if (SND.ac) SND.ac.suspend().catch(() => {
      });
    });
  }
  const unlock = () => {
    if (SND.on) {
      sndInit();
      if (SND.ac && SND.ac.state === "suspended") SND.ac.resume().catch(() => {
      });
    }
  };
  document.addEventListener("pointerdown", unlock, { capture: true });
  const ld = $("loader");
  if (ld) {
    ld.classList.add("done");
    setTimeout(() => ld.remove(), 400);
  }
  showMenu();
  if (duel) duelCard();
}
var tmpV = new THREE2.Vector3();
var camY = 0;
var _sunC = new THREE2.Vector3();
function updateCamera(dt) {
  const L = sim.level, p = camFocus();
  let wantPos, wantLook;
  const framing = L.cam === "frame" && p.z > L.frameZ;
  let domFront = null;
  if (L.chainProp !== void 0 && sim.st.tapped) for (const o of sim.props) {
    const q = o.body.rotation(), w = o.body.angvel();
    const tipped = 1 - 2 * (q.x * q.x + q.z * q.z) < 0.97 || Math.hypot(w.x, w.y, w.z) > 0.3;
    const t = o.body.translation();
    if (tipped && (!domFront || t.z > domFront.z)) domFront = t;
  }
  if (domFront) {
    const mid = new THREE2.Vector3((p.x + domFront.x) / 2, 0.5, (p.z + domFront.z) / 2), sep = Math.abs(domFront.z - p.z), far = 1 + Math.min(sep, 25) / 10;
    wantLook = mid;
    wantPos = tmpV.copy(mid).add(new THREE2.Vector3(10 * far, 8 * far, -8 * far));
  } else if (L.cam === "ahead") {
    const ty = L.targetY || 0, f = 0.5;
    wantLook = new THREE2.Vector3(p.x + (L.target[0] - p.x) * f, ty, p.z + (L.target[1] - p.z) * f);
    wantPos = tmpV.set(p.x + 3, Math.max(p.y, ty) + 9, Math.min(p.z, L.target[1] - 6) - 10);
  } else if (L.cam === "fixed") {
    wantPos = tmpV.fromArray(L.camPos);
    wantLook = new THREE2.Vector3().fromArray(L.camLook);
  } else if (framing) {
    const ty = L.targetY || 0;
    const mid = new THREE2.Vector3((p.x + L.target[0]) / 2, (Math.max(p.y - 0.6, ty - 3) + ty) / 2, (Math.min(p.z, L.target[1] + 16) + L.target[1]) / 2);
    const sep = Math.hypot(p.z - L.target[1], p.y - 0.6 - ty), far = 1 + Math.min(sep, 25) / 9;
    wantLook = mid.clone().add(new THREE2.Vector3(0, -1, 0));
    wantPos = tmpV.copy(mid).add(new THREE2.Vector3(11 * far, 8 * far, -9 * far));
  } else {
    if (!sim.st.camFall) camY += (Math.max(p.y - 0.6, L.targetY || 0) - camY) * Math.min(1, dt * 3);
    const z = Math.min(p.z, L.target[1] + 2);
    if (L.curve) {
      const cx = p.x + (L.target[0] - p.x) * (L.camBias ?? 0.3), zz = Math.min(p.z, L.target[1] - 4);
      wantPos = tmpV.set(cx - Math.sign(L.target[0]) * (L.camSide ?? 2), camY + 15, zz - 14);
      wantLook = new THREE2.Vector3(cx, camY, zz + 6);
      if (L.camFar) wantPos.sub(wantLook).multiplyScalar(L.camFar).add(wantLook);
    } else {
      wantPos = tmpV.set(p.x * 0.5, camY + 7.5, z - 12);
      wantLook = new THREE2.Vector3(p.x * 0.5, camY, z + 9);
    }
  }
  {
    const deck = L.targetY || 0, fallV = L.water !== void 0 && (sim.st.camFall || sim.car.linvel().y < -4 && sim.st.wheels.every((w) => !w.grounded) || sim.st.camSink);
    if (fallV) {
      camY = Math.max(camY, deck - 0.6);
      if (!sim.st.camFall) sim.st.camFall = camPos.clone().setY(camPos.y + 3);
      wantPos.copy(sim.st.camFall);
      wantLook = p.clone();
    }
  }
  const k = 1 - Math.exp(-dt * (framing || domFront ? 2.2 : 6));
  fitCar(wantPos, wantLook, 0.22);
  camPos.lerp(wantPos, k);
  camLook.lerp(wantLook, k);
  keepCarInView();
  if (window.__closeCam) {
    const c = carMesh.position, o = window.__closeCam;
    camPos.set(c.x + o[0], c.y + o[1], c.z + o[2]);
    camLook.copy(c);
  }
  camera.position.copy(camPos);
  camera.lookAt(camLook);
  applyShake();
  {
    const c = _sunC.copy(p).lerp(camLook, 0.45);
    sun.position.copy(c).add(SUN_OFF);
    sun.target.position.copy(c);
  }
}
var CAM_MAX = 26;
var CAM_NX = 0.4;
var tmpL = new THREE2.Vector3();
var tmpN = new THREE2.Vector3();
var look0 = new THREE2.Vector3();
var camWorst = 0;
var _foc = new THREE2.Vector3();
function camFocus() {
  _foc.copy(carMesh.position);
  const L = sim.level, chao = L.water !== void 0 ? L.water : L.fallY ?? -4;
  if (_foc.y < chao && !sim.st.camSink) sim.st.camSink = { x: _foc.x, z: _foc.z };
  if (sim.st.camSink) _foc.set(sim.st.camSink.x, chao, sim.st.camSink.z);
  return _foc;
}
function fitCar(pos, look, lim) {
  const c = camFocus(), d = pos.distanceTo(c);
  const cmax = sim.st.camFall ? 90 : CAM_MAX;
  if (d > cmax) pos.sub(c).multiplyScalar(cmax / d).add(c);
  const ok = (t) => {
    camera.position.copy(pos);
    camera.lookAt(tmpL.copy(look0).lerp(c, t));
    camera.updateMatrixWorld();
    const n = tmpN.copy(c).project(camera);
    return n.z < 1 && Math.abs(n.x) <= lim && Math.abs(n.y) <= lim;
  };
  look0.copy(look);
  if (ok(0)) return;
  let a = 0, b = 1;
  for (let i = 0; i < 14; i++) {
    const m = (a + b) / 2;
    if (ok(m)) b = m;
    else a = m;
  }
  look.copy(look0).lerp(c, b);
}
function keepCarInView() {
  fitCar(camPos, camLook, CAM_NX);
}
var DT = 1 / 60;
var last = performance.now();
var fAcc = 0;
var fN = 0;
var simMs = 0;
var fMax = 0;
var hold = false;
var sndBounce = 0;
var sndTrain = false;
function frame(now, manual) {
  if (!manual) {
    requestAnimationFrame(frame);
    if (hold) return;
  }
  const dt = Math.min(0.1, (now - last) / 1e3);
  last = now;
  WATER_T.value += manual ? 1 / 60 : dt;
  acc += dt * timeScale;
  const t0 = performance.now();
  let n = 0;
  if (state === "menu" || state === "final") acc = 0;
  while (acc >= DT && n < 5) {
    if (replayAt >= 0 && !sim.st.tapped && sim.st.t >= replayAt - 1e-6) {
      sim.tap();
      replayAt = -1;
    }
    snap();
    sim.step();
    acc -= DT;
    n++;
  }
  simMs += performance.now() - t0;
  const a = acc / DT;
  place(sim.car, carMesh, a);
  sim.props.forEach((o, i) => {
    const t = o.body.translation(), r = o.body.rotation();
    propMeshes[i].position.set(t.x, t.y, t.z);
    propMeshes[i].quaternion.set(r.x, r.y, r.z, r.w);
  });
  if (windSock && sim.st.windNow) {
    const w = sim.st.windNow;
    windSock.sockGroup.rotation.y = Math.atan2(-w[1], w[0]);
    const k = Math.min(1, Math.hypot(w[0], w[1]) / 3.5);
    windSock.sockGroup.scale.set(0.4 + 0.6 * k, 1, 1);
  }
  sim.movers.forEach((mv, i) => {
    const t = mv.body.translation(), r = mv.body.rotation();
    moverMeshes[i].position.set(t.x, t.y, t.z);
    moverMeshes[i].quaternion.set(r.x, r.y, r.z, r.w);
  });
  if (sim.level.targetOn !== void 0) {
    const tp = sim.targetPos();
    for (const o of levelObjs) if (o.userData.spin) {
      o.position.x = tp[0];
      o.position.z = tp[2];
      o.userData.y0 = tp[1] + 2.4;
    }
  }
  sim.parked.forEach((p, i) => place(p.body, parkedMeshes[i], a));
  const W = sim.st.wheels;
  carMesh.wheels.forEach((w, i) => {
    w.position.y = W[i].grounded ? -0.34 + Math.min(0.25, W[i].comp) : -0.34;
    w.rotation.y = i < 2 ? W[i].steer : 0;
  });
  scene.traverseVisible && levelObjs.forEach((o) => o.children && o.children.forEach((c) => {
    if (c.userData.pulse) c.material.opacity = 0.25 + 0.15 * Math.sin(now / 200);
  }));
  for (const o of levelObjs) if (o.userData.spin) {
    o.rotation.y += dt * 2;
    o.position.y = o.userData.y0 + Math.sin(now / 250) * 0.2;
  }
  updateCarFx(dt);
  updateImpactFx(dt);
  {
    const v = sim.car.linvel(), sp2 = Math.hypot(v.x, v.z), st = sim.st;
    engineTick(state === "play" && !st.done && !st.fell && !st.crashed && !st.killed && sp2 > 0.8, sp2);
    if (state === "play") {
      if ((st.bounces || 0) > sndBounce) {
        sndBounce = st.bounces;
        SFX.boing();
        lonaHit();
      }
      if (!sndTrain && sim.movers.some((m, i) => sim.level.movers[i].kind === "train") && st.t >= 1.6) {
        sndTrain = true;
        SFX.train();
      }
    }
  }
  if (tapBand) {
    tapBand.visible = !sim.st.tapped;
    tapBand.material.opacity = 0.45 + 0.35 * Math.abs(Math.sin(now / 180));
  }
  if (state === "play" && guide && !sim.st.tapped && sim.level.tapIdeal) {
    const d = sim.st.t - sim.level.tapIdeal;
    $("hand").style.display = d > -0.9 && d < 0.35 ? "block" : "none";
  }
  lonaTick(dt);
  updateCamera(dt);
  renderer.render(scene, camera);
  if (state === "play" && sim.st.done) showResult();
  const ft = performance.now() - now;
  fAcc += dt;
  fN++;
  fMax = Math.max(fMax, dt);
  if (DEBUG && fAcc > 0.5) {
    $("dbg").textContent = `${(fAcc / fN * 1e3).toFixed(1)} ms/quadro \xB7 pior ${(fMax * 1e3).toFixed(0)} \xB7 f\xEDsica ${(simMs / fN).toFixed(2)} ms \xB7 ${sim.st.dist.toFixed(2)} m`;
    fAcc = 0;
    fN = 0;
    simMs = 0;
    fMax = 0;
  }
}
resize();
await loadArt();
keepArt();
if (SITE) siteInit();
else startLevel();
if (DEBUG && SITE) window.__cps = { showFinal, showMenu, prog, ENG, SND, SBUF };
requestAnimationFrame(frame);
if (DEBUG || !SITE && LOCAL) {
  window.__scene = scene;
  window.__renderer = renderer;
  window.__camera = camera;
  window.__cp = {
    get tries() {
      return tries;
    },
    camWorst: (r) => {
      const v = camWorst;
      if (r) camWorst = 0;
      return v;
    },
    carNdc: () => {
      const n = carMesh.position.clone().project(camera);
      return [n.x, n.y, camPos.distanceTo(carMesh.position)];
    },
    fx: () => ({ marks: marks.count, puffs: puffs.filter((p) => p.sp.visible).length, sparks: sp.filter((S) => S.life > 0).length, trauma, timeScale, slowT, splashed }),
    hold: (v) => {
      hold = v;
    },
    get sim() {
      return sim;
    },
    get state() {
      return state;
    },
    next: () => {
      li++;
      startLevel();
    },
    go: (n) => {
      li = n - 1;
      startLevel();
    },
    // teste sem painel visível: avança N quadros de 1/60 s (toca no instante tapAt, em segundos de fase)
    run: (frames, tapAt = -1) => {
      for (let i = 0; i < frames; i++) {
        if (tapAt >= 0 && state === "play" && sim.st.t >= tapAt && !sim.st.tapped) onTap({ preventDefault() {
        } });
        frame(last + 1e3 / 60, true);
      }
      return { t: sim.st.t, state, score: sim.st.score, dist: sim.st.dist };
    }
  };
}
if (Q.has("shot") && window.__cp) {
  const st = document.createElement("style");
  st.textContent = "#stage{position:fixed!important;inset:0!important;width:100vw!important;height:100vh!important;max-width:none!important;aspect-ratio:auto!important;border-radius:0!important;margin:0!important}body>*:not(#app):not(#stage):not(#wrap):not(#ttl){display:none!important}#app,#wrap{position:fixed!important;inset:0!important;padding:0!important;display:block!important}.hud,#ed,#hand,#mbtn,#menu,#result,#loader{display:none!important}";
  document.head.appendChild(st);
  hold = true;
  resize();
  const n = LEVELS.findIndex((l) => l.name === Q.get("shot"));
  li = Math.max(0, n);
  startLevel();
  state = "play";
  window.__cp.run(+Q.get("f") || 60, Q.has("tap") ? +Q.get("tap") : -1);
  resize();
  if (Q.has("zoom")) {
    const c = carMesh.position.clone();
    c.y += 0.6;
    camera.position.lerpVectors(c, camera.position, +Q.get("zoom"));
    camera.position.y += +(Q.get("up") || 0);
    camera.lookAt(c.x + +(Q.get("lx") || 0), c.y + +(Q.get("ly") || 0), c.z);
  }
  renderer.render(scene, camera);
  if (Q.has("title")) {
    const lk = document.createElement("link");
    lk.rel = "stylesheet";
    lk.href = "https://fonts.googleapis.com/css2?family=Oswald:wght@700&display=swap";
    const lkOk = new Promise((r) => {
      lk.onload = lk.onerror = r;
    });
    document.head.appendChild(lk);
    await lkOk;
    const t = document.createElement("div");
    t.innerHTML = '<span class="l0">Crazy Parking</span><span class="l1">Crazy Parking</span><span class="l2">Crazy Parking</span>';
    const st2 = document.createElement("style");
    st2.textContent = "#ttl{position:fixed;left:0;right:0;top:" + (Q.get("ty") || "4") + "vh;display:grid;place-items:center;font:700 " + (Q.get("ts") || "15") + "vh/1 Oswald,Impact,sans-serif;text-transform:uppercase;white-space:nowrap;z-index:9}#ttl>span{grid-area:1/1;position:relative}#ttl .l0{color:#14202e;-webkit-text-stroke:.16em #14202e;filter:drop-shadow(.05em .05em 0 #000c)}#ttl .l1{color:#7a2a00;-webkit-text-stroke:.07em #7a2a00}#ttl .l2{background:linear-gradient(180deg,#ffe680 6%,#ffc93a 52%,#f08c00 94%);-webkit-background-clip:text;background-clip:text;color:transparent}";
    t.id = "ttl";
    document.head.appendChild(st2);
    document.body.appendChild(t);
    await document.fonts.load("700 40px Oswald").catch(() => {
    });
    await new Promise((r) => setTimeout(r, 300));
  }
  document.title = "PRONTO";
}
