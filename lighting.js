// lighting.js
// Atmospheric purple/blue tint — drawn in screen-space AFTER the world, BEFORE UI.
//
// PERF: static light sources are cached to an offscreen canvas.
// The buffer only rebuilds when the camera drifts more than DRIFT_THRESH screen-pixels
// OR when the flicker timer ticks. Between rebuilds we blit the cached bitmap.
// The player light is still drawn per-frame (it moves with the player).

const LIGHT_SOURCES = [
  // ── Top rooms ──────────────────────────────────────────────────────────────
  { x:  3.5 * TF1_T, y:  0.7 * TF1_T, r: 210, seed: 0.11 },
  { x: 10.5 * TF1_T, y:  0.7 * TF1_T, r: 210, seed: 1.34 },

  // ── Upper corridor ─────────────────────────────────────────────────────────
  { x:  7.0 * TF1_T, y:  2.5 * TF1_T, r: 260, seed: 2.57 },

  // ── Main hall ──────────────────────────────────────────────────────────────
  { x:  3.0 * TF1_T, y:  4.5 * TF1_T, r: 340, seed: 3.21 },
  { x:  7.0 * TF1_T, y:  4.5 * TF1_T, r: 380, seed: 4.45 },
  { x: 11.0 * TF1_T, y:  4.5 * TF1_T, r: 320, seed: 5.68 },
  { x: 12.5 * TF1_T, y:  3.8 * TF1_T, r: 230, seed: 6.02 },

  // ── Centre corridor ────────────────────────────────────────────────────────
  { x:  7.0 * TF1_T, y:  6.5 * TF1_T, r: 230, seed: 7.14 },

  // ── Tavern / bar ───────────────────────────────────────────────────────────
  { x: 11.5 * TF1_T, y:  8.5 * TF1_T, r: 370, seed: 8.37 },
  { x:  3.5 * TF1_T, y:  8.5 * TF1_T, r: 310, seed: 9.60 },
  { x:  7.0 * TF1_T, y:  8.5 * TF1_T, r: 290, seed: 0.83 },

  // ── Lower corridor ─────────────────────────────────────────────────────────
  { x:  7.0 * TF1_T, y: 10.5 * TF1_T, r: 230, seed: 1.96 },

  // ── Lobby ──────────────────────────────────────────────────────────────────
  { x:  3.5 * TF1_T, y: 13.0 * TF1_T, r: 330, seed: 3.09 },
  { x:  7.0 * TF1_T, y: 13.0 * TF1_T, r: 350, seed: 4.22 },
  { x: 10.5 * TF1_T, y: 13.0 * TF1_T, r: 310, seed: 5.45 },
];

const FLICKER_INTERVAL = 3;
const DRIFT_THRESH     = 8; // screen pixels — rebuild buffer if camera drifts past this

let _flickerTick   = 0;
const _flickerF    = new Float32Array(LIGHT_SOURCES.length).fill(1.0);
let   _flickerPlayer = 1.0;

// Offscreen canvas — holds cached static lights
let _lightCanvas  = null;
let _lightCtx     = null;
let _lightBufCamX = -9999;
let _lightBufCamY = -9999;

function lightingSetup() {
  _lightCanvas        = document.createElement('canvas');
  _lightCanvas.width  = window.innerWidth;
  _lightCanvas.height = window.innerHeight;
  _lightCtx           = _lightCanvas.getContext('2d');
}

function lightingResized() {
  if (!_lightCanvas) return;
  _lightCanvas.width  = window.innerWidth;
  _lightCanvas.height = window.innerHeight;
  _lightBufCamX = -9999; // force rebuild on next frame
}

function _w2s(wx, wy) {
  return [(wx - camX) * CAM_ZOOM, (wy - camY) * CAM_ZOOM];
}

function _screenLight(ctx, sx, sy, r) {
  const g = ctx.createRadialGradient(sx, sy, 0, sx, sy, r);
  g.addColorStop(0,    'rgba(60, 45, 80, 0.45)');
  g.addColorStop(0.35, 'rgba(40, 30, 58, 0.22)');
  g.addColorStop(0.65, 'rgba(18, 13, 30, 0.08)');
  g.addColorStop(1,    'rgba(0,  0,  0,  0)');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(sx, sy, r, 0, Math.PI * 2);
  ctx.fill();
}

function _rebuildLightBuffer() {
  const ctx = _lightCtx;
  const t   = frameCount * 0.016;

  ctx.clearRect(0, 0, _lightCanvas.width, _lightCanvas.height);

  // Refresh static flicker values
  for (let i = 0; i < LIGHT_SOURCES.length; i++) {
    _flickerF[i] = 0.82 + noise(t + LIGHT_SOURCES[i].seed) * 0.18;
  }

  // Draw each visible static light into the offscreen buffer
  for (let i = 0; i < LIGHT_SOURCES.length; i++) {
    const src    = LIGHT_SOURCES[i];
    const [sx, sy] = _w2s(src.x, src.y);
    const r      = src.r * _flickerF[i] * CAM_ZOOM;
    if (sx + r < 0 || sx - r > _lightCanvas.width ||
        sy + r < 0 || sy - r > _lightCanvas.height) continue;
    _screenLight(ctx, sx, sy, r);
  }

  _lightBufCamX = camX;
  _lightBufCamY = camY;
}

function drawLighting() {
  if (currentScene !== 'GAME') return;

  const ctx = drawingContext;
  const t   = frameCount * 0.016;

  // Rebuild cache if camera drifted too far or flicker ticked
  const driftX = Math.abs((camX - _lightBufCamX) * CAM_ZOOM);
  const driftY = Math.abs((camY - _lightBufCamY) * CAM_ZOOM);
  if (_flickerTick === 0 || driftX > DRIFT_THRESH || driftY > DRIFT_THRESH) {
    _rebuildLightBuffer();
  }
  _flickerTick    = (_flickerTick + 1) % FLICKER_INTERVAL;
  _flickerPlayer  = 0.92 + noise(t + 9.9) * 0.08;

  // 1. Dark ambient overlay (cheap rect, source-over)
  noStroke();
  fill(18, 8, 42, 140);
  rect(0, 0, width, height);

  // 2. Blit cached static lights + player light — screen compositing
  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  ctx.drawImage(_lightCanvas, 0, 0);                          // cached — no gradient creation
  const [ppx, ppy] = _w2s(player.px, player.py);
  _screenLight(ctx, ppx, ppy, 240 * _flickerPlayer * CAM_ZOOM); // player — 1 gradient/frame
  ctx.restore();

  // 3. Subtle scene-wide purple breathe
  noStroke();
  const pulse = 4 + noise(t * 0.25) * 8;
  fill(45, 15, 85, pulse);
  rect(0, 0, width, height);
}

window.lightingSetup   = lightingSetup;
window.lightingResized = lightingResized;
window.drawLighting    = drawLighting;
