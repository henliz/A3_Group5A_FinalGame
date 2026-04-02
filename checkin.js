// checkin.js — Stardew Valley–style check-in scene
// Renders the actual inn world at a fixed camera over the lobby desk/phone area.
// Helen stands behind the desk (world space). Little Red walks in from the left.

const HELEN_FRAME_W = 1000;
const HELEN_FRAME_H = 1000;

// Helen spritesheet layout (4000×2000, 4 cols × 2 rows, 1000×1000 each)
// Row 0: dead, right, left, up  |  Row 1: down
const HELEN_DIR = {
  dead:  { sx: 0,    sy: 0    },
  right: { sx: 1000, sy: 0    },
  left:  { sx: 2000, sy: 0    },
  up:    { sx: 3000, sy: 0    },
  down:  { sx: 0,    sy: 1000 },
};

const checkinScript = [
  { speaker: "helen",  text: "Oh! You must be the one who called ahead — Little Red, was it?" },
  { speaker: "player", text: "That's right. Sorry it's so late." },
  { speaker: "helen",  text: "Not at all, dear. Room seven is all yours — top of the stairs, first on the left." },
  { speaker: "player", text: "Thank you. It's been a long road." },
  { speaker: "helen",  text: "Well, you're here now. Are those… cookies in your bag?" },
  { speaker: "player", text: "Gran's recipe. She called them 'spoons for the soul' — said the more you have, the more you can give." },
  { speaker: "helen",  text: "Ha. She sounds like a wise woman. Sleep well, Little Red." },
  { speaker: "player", text: "I didn't know then that by morning, this quiet little inn would feel like somewhere else entirely." },
];

let ciPhase = "walk"; // "walk" | "talk" | "fadeout"
let ciDialogueIndex = 0;
let ciFrame = 0;
let ciAnimTimer = 0;
let ciFadeAlpha = 0;
let ciTWText = "";
let ciTWIndex = 0;
let ciTWDone = false;
let ciTWTimer = 0;
let helenSheet = null;

// World-space positions (computed once TF1_T is available)
let ciPlayerWX = 0;
let ciPlayerWY = 0;
let ciTargetWX = 0;
let ciTargetWY = 0;
let ciCamX = 0;
let ciCamY = 0;

function checkinPreload() {
  helenSheet = loadImage("assets/Helen_spritesheet.png");
}

function checkinSetup() {
  ciPhase = "walk";
  ciDialogueIndex = 0;
  ciFrame = 0;
  ciAnimTimer = 0;
  ciFadeAlpha = 0;
  ciTWText = "";
  ciTWIndex = 0;
  ciTWDone = true;
  ciTWTimer = 0;

  const T = window.TF1_T ?? 102.4;

  // Camera fixed on the lobby desk/phone area (phone is at tileX 3.2, tileY 13.2)
  const focusWX = 3.5 * T;
  const focusWY = 13.3 * T;
  ciCamX = focusWX - width  / (2 * CAM_ZOOM);
  ciCamY = focusWY - height / (2 * CAM_ZOOM);

  // Player walks to just in front of the desk
  ciTargetWX = 2.6 * T;
  ciTargetWY = 13.6 * T;

  // Start off the left edge of the screen
  ciPlayerWX = ciCamX - 80;
  ciPlayerWY = ciTargetWY;
}

function _ciStartTW(text) {
  ciTWText = text;
  ciTWIndex = 0;
  ciTWDone = false;
  ciTWTimer = 0;
}

function checkinDraw() {
  const T = window.TF1_T ?? 102.4;

  // ── World render (actual inn) ─────────────────────────────
  push();
  scale(CAM_ZOOM);
  translate(-ciCamX, -ciCamY);

  tf1Draw(0, 0);
  clutterDraw(0, 0); // draws the phone on the desk naturally

  // Helen behind the desk (facing down, world space)
  if (helenSheet) {
    const drawSize = 72;
    const d = HELEN_DIR.down;
    const hX = 3.5 * T - drawSize / 2;
    const hY = 12.85 * T - drawSize / 2;
    image(helenSheet, hX, hY, drawSize, drawSize,
          d.sx, d.sy, HELEN_FRAME_W, HELEN_FRAME_H);
  }

  // Little Red walking/standing
  const playerDir = ciPhase === "walk" ? DIR.right : DIR.up;
  const animCol  = ciPhase === "walk" ? [0, 1, 2, 1][ciFrame] : 0;
  const sx = animCol * FRAME_W;
  const sy = playerDir * FRAME_H;
  const dw = FRAME_W * CHAR_SCALE;
  const dh = FRAME_H * CHAR_SCALE;
  imageMode(CENTER);
  image(charSheet, ciPlayerWX, ciPlayerWY, dw, dh, sx, sy, FRAME_W, FRAME_H);
  imageMode(CORNER);

  pop();

  // ── Walk logic ───────────────────────────────────────────
  if (ciPhase === "walk") {
    if (ciPlayerWX < ciTargetWX) {
      ciPlayerWX += 3 / CAM_ZOOM; // world-space speed
      ciAnimTimer++;
      if (ciAnimTimer >= ANIM_SPEED) {
        ciAnimTimer = 0;
        ciFrame = (ciFrame + 1) % 4;
      }
    } else {
      ciPlayerWX = ciTargetWX;
      ciPhase = "talk";
      ciFrame = 0;
      _ciStartTW(checkinScript[0].text);
    }
  } else if (ciPhase === "talk") {
    if (!ciTWDone) {
      ciTWTimer++;
      if (ciTWTimer >= TYPEWRITER_SPEED) {
        ciTWTimer = 0;
        ciTWIndex = min(ciTWIndex + 1, ciTWText.length);
        if (ciTWIndex >= ciTWText.length) ciTWDone = true;
      }
    }
  } else if (ciPhase === "fadeout") {
    ciFadeAlpha = min(ciFadeAlpha + 4, 255);
    if (ciFadeAlpha >= 255) {
      currentScene = "PROLOGUE";
      prologueVideo.play();
      prologueVideo.elt.onended = () => {
        currentScene = "GAME";
        prologueVideo.hide();
      };
    }
  }

  // ── Dialogue box (screen space) ──────────────────────────
  if (ciPhase === "talk") {
    const entry   = checkinScript[ciDialogueIndex];
    const isPlayer = entry.speaker === "player";

    const boxW = 1857 / 3;
    const boxH = 681 / 3;
    const boxX = width * 0.12;
    const boxY = height - boxH - 20;

    image(isPlayer ? uiMonologueBox : uiMainBox, boxX, boxY, boxW, boxH);

    // Portrait
    const pW = 300, pH = 420;
    const pY = boxY - pH * 0.9;
    if (!isPlayer && helenSheet) {
      const d = HELEN_DIR.down;
      image(helenSheet, boxX + 20, pY, pW, pH,
            d.sx, d.sy, HELEN_FRAME_W, HELEN_FRAME_H);
    } else if (isPlayer && portraits && portraits.littleRed) {
      image(portraits.littleRed.idle, boxX + boxW - pW - 20, pY, pW, pH);
    }

    // Name tag
    const name = isPlayer ? "Little Red" : "Helen";
    textFont(jersey10Font);
    textSize(38);
    const tagW = textWidth(name) + 60;
    const tagH = 70;
    const tagY = boxY - tagH;
    const tagX = isPlayer ? boxX + boxW - tagW - 20 : boxX + 20;
    fill(168, 86, 21);
    noStroke();
    rect(tagX, tagY, tagW, tagH, 4);
    fill(255);
    textAlign(CENTER, CENTER);
    text(name, tagX + tagW / 2, tagY + tagH / 2.5);

    // Dialogue text
    const revealed = ciTWText.substring(0, ciTWIndex);
    fill(255);
    textSize(30);
    textAlign(LEFT, TOP);
    if (isPlayer) textStyle(ITALIC);
    text(revealed, boxX + 50, boxY + 40, boxW - 75, boxH - 80);
    textStyle(NORMAL);

    // Continue hint
    if (ciTWDone) {
      fill(255, 255, 255, 200);
      textSize(18);
      textAlign(RIGHT, BOTTOM);
      text("Press ENTER to continue", boxX + boxW - 60, boxY + boxH - 25);
    }
  }

  // ── Fade overlay ─────────────────────────────────────────
  if (ciFadeAlpha > 0) {
    noStroke();
    fill(0, 0, 0, ciFadeAlpha);
    rect(0, 0, width, height);
  }
}

function checkinAdvance() {
  if (ciPhase !== "talk") return;
  if (!ciTWDone) {
    ciTWIndex = ciTWText.length;
    ciTWDone = true;
    return;
  }
  ciDialogueIndex++;
  if (ciDialogueIndex >= checkinScript.length) {
    ciPhase = "fadeout";
    return;
  }
  _ciStartTW(checkinScript[ciDialogueIndex].text);
}

window.checkinPreload  = checkinPreload;
window.checkinSetup    = checkinSetup;
window.checkinDraw     = checkinDraw;
window.checkinAdvance  = checkinAdvance;
