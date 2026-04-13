// lighting.js
// Darkness-mask lighting: fill canvas dark, punch transparent holes for each
// light source using destination-out, draw over the world.
// The world shows through the holes — colour tints are very subtle.
//
// Supports GAME, CHECKIN, and WHODUNNIT scenes.

// ─── How much darkness to erase at each gradient stop ────────────────────────
// [gradientPosition, erasureAlpha]  (0 = keep dark, 1 = fully reveal world)
const HOLES = {
  candle:     [[0, 1.00], [0.18, 0.92], [0.48, 0.52], [0.78, 0.10], [1, 0]],
  moon:       [[0, 0.75], [0.32, 0.52], [0.62, 0.18], [0.85, 0.04], [1, 0]],
  fire:       [[0, 1.00], [0.12, 0.96], [0.40, 0.65], [0.72, 0.18], [1, 0]],
  lantern:    [[0, 0.85], [0.28, 0.65], [0.58, 0.28], [0.82, 0.06], [1, 0]],
  chandelier: [[0, 0.96], [0.20, 0.82], [0.48, 0.46], [0.76, 0.10], [1, 0]],
};

// ─── Colour tints — very subtle, just a warmth hint in the lit area ───────────
// [r, g, b, alpha]  drawn at 40% of light radius — max alpha ~0.10
const TINTS = {
  candle:     [255, 148,  28, 0.09],
  moon:       [105, 140, 255, 0.07],
  fire:       [255,  80,   5, 0.13],
  lantern:    [175, 205, 155, 0.06],
  chandelier: [255, 232, 175, 0.08],
};

// ─── GAME lights ──────────────────────────────────────────────────────────────
// Floor plan reference (TF1_FLOOR_MASK):
//   Top-left  bedroom : cols 2-4,  rows 0-1
//   Top-right bedroom : cols 9-11, rows 0-1
//   Left wing  room 1 : cols 1-3,  rows 3-5
//   Right wing  office: cols 9-11, rows 3-5
//   Upper corridor    : cols 5-7,  rows 2-3
//   Centre corridor   : cols 5-7,  rows 6-7
//   Bar area          : cols 5-10, rows 8-9
//   Lower corridor    : cols 5-7,  rows 10-11
//   Lobby             : cols 2-10, rows 12-14
const GAME_LIGHTS = [
  // Top-left bedroom — bedside candle + moonlight window
  { x:  3.4, y:  0.55, r: 175, type: 'candle',     seed:  0.11, amp: 0.16 },
  { x:  4.6, y: -0.10, r: 135, type: 'moon',        seed:  7.30, amp: 0.02 },
  // Top-right bedroom — bedside candle + moonlight window
  { x: 10.2, y:  0.55, r: 175, type: 'candle',     seed:  1.34, amp: 0.16 },
  { x: 11.3, y: -0.10, r: 135, type: 'moon',        seed:  8.11, amp: 0.02 },
  // Upper corridor — wall lantern
  { x:  6.2, y:  2.50, r: 215, type: 'lantern',    seed:  2.57, amp: 0.09 },
  // Left wing room 1 — bedside candle + chair-side candle
  { x:  2.0, y:  4.00, r: 240, type: 'candle',     seed:  3.21, amp: 0.14 },
  { x:  3.4, y:  5.10, r: 155, type: 'candle',     seed: 11.44, amp: 0.18 },
  // Main-hall centre — chandelier
  { x:  6.2, y:  3.85, r: 340, type: 'chandelier', seed:  4.45, amp: 0.07 },
  // Right wing office — desk lamp + bookshelf sconce + painting light
  { x: 10.8, y:  4.85, r: 235, type: 'candle',     seed:  5.68, amp: 0.15 },
  { x: 10.5, y:  3.15, r: 155, type: 'candle',     seed:  6.02, amp: 0.19 },
  { x:  8.5, y:  2.95, r: 125, type: 'candle',     seed: 12.17, amp: 0.17 },
  // Centre corridor — wall lantern
  { x:  6.2, y:  6.60, r: 200, type: 'lantern',    seed:  7.14, amp: 0.10 },
  // Bar — open flame, wall lantern, table candle
  { x:  9.2, y:  8.05, r: 215, type: 'fire',       seed:  8.37, amp: 0.30 },
  { x:  5.8, y:  8.30, r: 200, type: 'lantern',    seed:  0.83, amp: 0.08 },
  { x:  7.8, y:  8.75, r: 265, type: 'candle',     seed:  9.60, amp: 0.17 },
  // Lower corridor — wall lantern
  { x:  6.2, y: 10.60, r: 200, type: 'lantern',    seed:  1.96, amp: 0.10 },
  // Lobby — bookshelf sconce, moon window L, desk lamp, moon window R,
  //         seating candle, crime-scene candle
  { x:  2.5, y: 11.40, r: 140, type: 'candle',     seed: 13.52, amp: 0.16 },
  { x:  4.0, y: 10.85, r: 155, type: 'moon',        seed:  5.71, amp: 0.02 },
  { x:  3.8, y: 13.25, r: 235, type: 'candle',     seed:  3.09, amp: 0.20 },
  { x:  9.5, y: 10.85, r: 155, type: 'moon',        seed:  6.44, amp: 0.02 },
  { x:  9.4, y: 12.85, r: 210, type: 'candle',     seed:  4.22, amp: 0.16 },
  { x:  6.5, y: 13.52, r: 120, type: 'candle',     seed:  9.15, amp: 0.24 },
];

// ─── CHECKIN lights — late-night lobby arrival, hero light on Helen ───────────
const CHECKIN_LIGHTS = [
  { x:  4.0, y: 10.85, r: 140, type: 'moon',    seed:  5.71, amp: 0.02 },
  { x:  9.5, y: 10.85, r: 140, type: 'moon',    seed:  6.44, amp: 0.02 },
  { x:  2.5, y: 11.40, r: 125, type: 'candle',  seed: 13.52, amp: 0.14 },
  { x:  3.8, y: 13.25, r: 295, type: 'candle',  seed:  3.09, amp: 0.22 },  // hero desk lamp
  { x:  9.4, y: 12.85, r: 170, type: 'candle',  seed:  4.22, amp: 0.15 },
  { x:  6.5, y: 13.52, r: 110, type: 'candle',  seed:  9.15, amp: 0.20 },
];

// ─── WHODUNNIT lights — confrontation, heavy flicker ─────────────────────────
const WHODUNNIT_LIGHTS = [
  { x:  4.0, y: 10.85, r: 100, type: 'moon',    seed:  5.71, amp: 0.02 },
  { x:  9.5, y: 10.85, r: 100, type: 'moon',    seed:  6.44, amp: 0.02 },
  { x:  3.8, y: 13.25, r: 210, type: 'candle',  seed:  3.09, amp: 0.30 },
  { x:  9.4, y: 12.85, r: 190, type: 'candle',  seed:  4.22, amp: 0.28 },
  { x:  6.5, y: 13.52, r: 160, type: 'candle',  seed:  9.15, amp: 0.38 },  // crime-scene candle
  { x:  6.5, y: 12.65, r: 125, type: 'candle',  seed:  2.71, amp: 0.22 },  // Little Red's candle
  { x:  6.2, y: 10.60, r: 145, type: 'lantern', seed:  1.96, amp: 0.09 },
];

// ─── State ────────────────────────────────────────────────────────────────────
let _flickerF      = null;
let _flickerPlayer = 1.0;
let _lightCanvas   = null;
let _lightCtx      = null;

function lightingSetup() {
  _lightCanvas        = document.createElement('canvas');
  _lightCanvas.width  = window.innerWidth;
  _lightCanvas.height = window.innerHeight;
  _lightCtx           = _lightCanvas.getContext('2d');
  const maxLen = Math.max(GAME_LIGHTS.length, CHECKIN_LIGHTS.length, WHODUNNIT_LIGHTS.length);
  _flickerF = new Float32Array(maxLen).fill(1.0);
}

function lightingResized() {
  if (!_lightCanvas) return;
  _lightCanvas.width  = window.innerWidth;
  _lightCanvas.height = window.innerHeight;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function _getCamPos() {
  if (currentScene === 'CHECKIN')   return { x: ciCamX,  y: ciCamY  };
  if (currentScene === 'WHODUNNIT') return { x: wdCamX,  y: wdCamY  };
  return { x: camX, y: camY };
}

function _w2s(wx, wy) {
  const cam = _getCamPos();
  return [(wx - cam.x) * CAM_ZOOM, (wy - cam.y) * CAM_ZOOM];
}

function _punchHole(ctx, sx, sy, rad, stops) {
  const g = ctx.createRadialGradient(sx, sy, 0, sx, sy, rad);
  for (const [pos, alpha] of stops) {
    g.addColorStop(pos, `rgba(0,0,0,${alpha})`);
  }
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(sx, sy, rad, 0, Math.PI * 2);
  ctx.fill();
}

// ─── Main entry — call after world render, before UI ─────────────────────────
function drawLighting() {
  const scene = currentScene;
  if (scene !== 'GAME' && scene !== 'CHECKIN' && scene !== 'WHODUNNIT') return;
  if (typeof wdPhase !== 'undefined' &&
      (wdPhase === 'gustall_video' || wdPhase === 'jerome_video' ||
       wdPhase === 'video_done')) return;

  const lights = scene === 'CHECKIN'   ? CHECKIN_LIGHTS
               : scene === 'WHODUNNIT' ? WHODUNNIT_LIGHTS
               : GAME_LIGHTS;

  const ctx = _lightCtx;
  const T   = window.TF1_T ?? 102.4;
  const t   = frameCount * 0.016;
  const W   = _lightCanvas.width;
  const H   = _lightCanvas.height;

  // ── Update flicker ───────────────────────────────────────────────────────
  for (let i = 0; i < lights.length; i++) {
    const amp  = lights[i].amp ?? 0.12;
    const freq = lights[i].type === 'fire' ? 2.2
               : lights[i].type === 'moon' ? 0.4 : 1.4;
    _flickerF[i] = (1 - amp) + noise(t * freq + lights[i].seed) * amp;
  }
  _flickerPlayer = 0.90 + noise(t * 1.6 + 9.9) * 0.10;

  // ── 1. Fill with ambient darkness ───────────────────────────────────────
  ctx.clearRect(0, 0, W, H);
  const ambA = scene === 'WHODUNNIT' ? 0.88 : scene === 'CHECKIN' ? 0.83 : 0.80;
  ctx.fillStyle = `rgba(10, 4, 26, ${ambA})`;
  ctx.fillRect(0, 0, W, H);

  // ── 2. Punch transparent holes (world shows through) ────────────────────
  ctx.globalCompositeOperation = 'destination-out';

  for (let i = 0; i < lights.length; i++) {
    const src       = lights[i];
    const [sx, sy]  = _w2s(src.x * T, src.y * T);
    const rad       = src.r * _flickerF[i] * CAM_ZOOM;
    if (sx + rad < 0 || sx - rad > W || sy + rad < 0 || sy - rad > H) continue;
    _punchHole(ctx, sx, sy, rad, HOLES[src.type] ?? HOLES.candle);
  }

  // Player torch hole
  let playerWX = -1, playerWY = -1;
  if (scene === 'GAME') {
    playerWX = player.px; playerWY = player.py;
  } else if (scene === 'CHECKIN' &&
             typeof ciPhase !== 'undefined' && ciPhase !== 'fadeout') {
    playerWX = ciPlayerWX; playerWY = ciPlayerWY;
  }
  if (playerWX >= 0) {
    const [ppx, ppy] = _w2s(playerWX, playerWY);
    _punchHole(ctx, ppx, ppy, 185 * _flickerPlayer * CAM_ZOOM, HOLES.candle);
  }

  // ── 3. Subtle colour tints in lit areas ─────────────────────────────────
  ctx.globalCompositeOperation = 'source-over';

  for (let i = 0; i < lights.length; i++) {
    const src  = lights[i];
    const tint = TINTS[src.type];
    if (!tint) continue;
    const [sx, sy]  = _w2s(src.x * T, src.y * T);
    const rad       = src.r * _flickerF[i] * CAM_ZOOM * 0.42;
    if (sx + rad < 0 || sx - rad > W || sy + rad < 0 || sy - rad > H) continue;
    const [tr, tg, tb, ta] = tint;
    const g = ctx.createRadialGradient(sx, sy, 0, sx, sy, rad);
    g.addColorStop(0, `rgba(${tr},${tg},${tb},${ta})`);
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(sx, sy, rad, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.globalCompositeOperation = 'source-over'; // reset

  // ── 4. Draw darkness mask over world (holes are transparent → world shows) ─
  drawingContext.drawImage(_lightCanvas, 0, 0);

  // ── 5. Cinematic vignette ────────────────────────────────────────────────
  const dc    = drawingContext;
  const vEdge = scene === 'WHODUNNIT' ? 0.76 : scene === 'CHECKIN' ? 0.68 : 0.60;
  const vr    = Math.max(width, height) * 0.80;
  const vg    = dc.createRadialGradient(width / 2, height / 2, vr * 0.15,
                                         width / 2, height / 2, vr);
  vg.addColorStop(0,    'rgba(0,0,0,0)');
  vg.addColorStop(0.50, 'rgba(0,0,0,0.05)');
  vg.addColorStop(1,    `rgba(0,0,0,${vEdge})`);
  dc.fillStyle = vg;
  dc.fillRect(0, 0, width, height);

  // ── 6. Faint purple atmospheric breathe ─────────────────────────────────
  noStroke();
  const pulse = 1 + noise(t * 0.20) * 5;
  fill(28, 5, 60, pulse);
  rect(0, 0, width, height);
}

window.lightingSetup   = lightingSetup;
window.lightingResized = lightingResized;
window.drawLighting    = drawLighting;
