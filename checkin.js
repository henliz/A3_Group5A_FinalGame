// checkin.js — tutorial check-in scene
// World render + walk animation, then hands off to the real dialogue system.

const HELEN_FRAME_W = 1000;
const HELEN_FRAME_H = 1000;
const HELEN_DIR = {
  dead:  { sx: 0,    sy: 0    },
  right: { sx: 1000, sy: 0    },
  left:  { sx: 2000, sy: 0    },
  up:    { sx: 3000, sy: 0    },
  down:  { sx: 0,    sy: 1000 },
};

// Fake NPC object — matches the shape the real dialogue system expects.
// All options cost 0 (no spoons spent in tutorial).
const helenNPC = {
  dialogue: {
    name: "Helen",
    opening: "Oh! You must be the one who called ahead — Little Red, was it?",
    repeatLine: "Sleep well, Little Red.",
    hesitationLine: "Perhaps… another time.",
    exitMonologue: "I didn't know then that by morning, this quiet little inn would feel like somewhere else entirely.",
    options: [
      {
        id: "ci_0",
        playerLine: "That's right. Sorry it's so late.",
        cost: 0,
        npcResponse: "Not at all, dear. Room seven is all yours — top of the stairs, first on the left.",
        npcResponse2: "Are those… cookies in your bag? You look like you could use one yourself.",
        monologue: "Gran's cookies. She called them 'spoons for the soul' — said every real conversation costs a piece of yourself, and this is how you replenish. My hands won't stop. I hope I packed enough.",
      },
      {
        id: "ci_1",
        playerLine: "...yes. It's been a long journey.",
        cost: 0,
        npcResponse: "I can see that. Room seven — top of the stairs, first on the left. Get some rest.",
        npcResponse2: "Are those… cookies in your bag? You look like you could use one yourself.",
        monologue: "Gran's cookies. She called them 'spoons for the soul' — said every real conversation costs a piece of yourself, and this is how you replenish. My hands won't stop. I hope I packed enough.",
      },
      {
        id: "ci_2",
        playerLine: "(Offer a small, tired nod.)",
        cost: 0,
        npcResponse: "Not at all. Room seven — top of the stairs, first on the left.",
        npcResponse2: "Are those… cookies in your bag?",
        monologue: "Gran's cookies. She called them 'spoons for the soul' — said every real conversation costs a piece of yourself, and this is how you replenish. My hands won't stop. I hope I packed enough.",
      },
    ],
  },
  firstVisit: true,
  usedOptions: [],
  portraitKey: "helen",
  currentEmotion: "idle",
  journalPageIndex: undefined,
};

let ciPhase     = "walk"; // "walk" | "talk" | "fadeout"
let ciFrame     = 0;
let ciAnimTimer = 0;
let ciFadeAlpha = 0;
let helenSheet  = null;

let ciPlayerWX = 0;
let ciPlayerWY = 0;
let ciTargetWX = 0;
let ciTargetWY = 0;
let ciCamX     = 0;
let ciCamY     = 0;

function checkinPreload() {
  helenSheet = loadImage("assets/Helen_spritesheet.png");
}

function checkinSetup() {
  ciPhase     = "walk";
  ciFrame     = 0;
  ciAnimTimer = 0;
  ciFadeAlpha = 0;

  helenNPC.firstVisit  = true;
  helenNPC.usedOptions = [];

  const T = window.TF1_T ?? 102.4;

  const focusWX = 3.5 * T;
  const focusWY = 13.3 * T;
  ciCamX = focusWX - width  / (2 * CAM_ZOOM);
  ciCamY = focusWY - height / (2 * CAM_ZOOM);

  ciTargetWX = 4.3 * T;
  ciTargetWY = 13.6 * T;
  ciPlayerWX = ciCamX + width / CAM_ZOOM + 80;
  ciPlayerWY = ciTargetWY;
}

function checkinDraw() {
  const T = window.TF1_T ?? 102.4;

  // ── World ────────────────────────────────────────────────────
  push();
  scale(CAM_ZOOM);
  translate(-ciCamX, -ciCamY);

  tf1Draw(0, 0);
  clutterDraw(0, 0, true); // hide crime scene during tutorial

  if (helenSheet) {
    const sz = 72;
    const d  = HELEN_DIR.down;
    image(helenSheet, 3.5 * T - sz / 2, 12.85 * T - sz / 2, sz, sz,
          d.sx, d.sy, HELEN_FRAME_W, HELEN_FRAME_H);
  }

  const playerDir = ciPhase === "walk" ? DIR.left : DIR.up;
  const animCol   = ciPhase === "walk" ? [0, 1, 2, 1][ciFrame] : 0;
  imageMode(CENTER);
  image(charSheet, ciPlayerWX, ciPlayerWY,
        FRAME_W * CHAR_SCALE, FRAME_H * CHAR_SCALE,
        animCol * FRAME_W, playerDir * FRAME_H, FRAME_W, FRAME_H);
  imageMode(CORNER);

  pop();

  // ── Walk logic ───────────────────────────────────────────────
  if (ciPhase === "walk") {
    if (ciPlayerWX > ciTargetWX) {
      ciPlayerWX -= 3 / CAM_ZOOM;
      ciAnimTimer++;
      if (ciAnimTimer >= ANIM_SPEED) { ciAnimTimer = 0; ciFrame = (ciFrame + 1) % 4; }
    } else {
      ciPlayerWX = ciTargetWX;
      ciFrame    = 0;
      ciPhase    = "talk";
      openDialogue(helenNPC); // hand off to real dialogue system
    }

  // ── Talk: real dialogue system is running ────────────────────
  } else if (ciPhase === "talk") {
    if (dialoguePhase === "closed") {
      ciPhase = "fadeout"; // conversation over, fade out
    }

  // ── Fade out ─────────────────────────────────────────────────
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

  // ── Dialogue + cursor — real system, same as GAME ────────────
  drawDialogue();
  updateHoverCursor();

  // ── Fade overlay ─────────────────────────────────────────────
  if (ciFadeAlpha > 0) {
    noStroke();
    fill(0, 0, 0, ciFadeAlpha);
    rect(0, 0, width, height);
  }
}

window.checkinPreload = checkinPreload;
window.checkinSetup   = checkinSetup;
window.checkinDraw    = checkinDraw;
