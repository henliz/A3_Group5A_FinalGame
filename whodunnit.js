// whodunnit.js — Day 3 finale cutscene
// Phases: cop_walk → talk → gather → chatter → accuse → fadeout

// ─── Cop spritesheet config ──────────────────────────────────────────────────
// 144×193 = 3 cols × 4 rows → 48×48 per frame (same layout as Krisia/NPC system)
// Row order: DOWN=0, LEFT=1, RIGHT=2, UP=3  |  Idle col = 1
const COP_FRAME_W  = 48;
const COP_FRAME_H  = 48;
const COP_ROW_DOWN = 0;
const COP_ROW_LEFT = 1;

// World-tile positions for the finale assembly
const WD_COP_TX = 7.8;  const WD_COP_TY = 13.4;
const WD_LR_TX  = 6.5;  const WD_LR_TY  = 12.6;
const WD_IK_TX  = 4.9;  const WD_IK_TY  = 13.0;
const WD_DC_TX  = 5.7;  const WD_DC_TY  = 13.9;
const WD_RM_TX  = 8.6;  const WD_RM_TY  = 14.2;

let copSheet   = null;
let wdEndingPhase = ""; // "good_ending" or "bad_ending" — saved during fadeout

// ─── Evidence flag helper ────────────────────────────────────────────────────
function _evidenceFound(assetName) {
  if (typeof roomLayout === "undefined") return false;
  const item = roomLayout.find(i => i.asset === assetName);
  return item ? !!item.examined : false;
}

// ─── Build dialogue options based on what was actually found ─────────────────
function _buildCopOptions() {
  const opts = [];

  // ── Medicinal book: wolfsbane + Helen's journal page (doctor evidence) ──
  if (_evidenceFound("medicinalbook")) {
    opts.push({
      id: "wh_book",
      playerLine: "The medical book. Wolfsbane — personal notes, not clinical. And Helen's own handwriting was inside it.",
      cost: 0,
      exchange: [
        { speaker: "npc",    text: "The victim's handwriting, in a suspect's book about a plant that can sedate and kill.", emotion: "idle" },
        { speaker: "player", text: "Helen was watching her. Following her outside at night. She figured something out and wrote it down.", emotion: "determined" },
        { speaker: "npc",    text: "And now she's dead and that torn page is the only thing she left behind.", emotion: "idle" },
        { speaker: "player", text: "The doctor told me she was 'capable of defending herself.' She said it like she'd already had reason to prove it.", emotion: "determined" },
        { speaker: "npc",    text: "That's a thread. I'll get everyone into the same room — let's see who flinches when I say wolfsbane out loud.", emotion: "idle" },
      ],
      npcResponse: null,
      monologue: "Say the name. You found what Helen found. Now finish what she started.",
    });
  }

  // ── Necklace: Jerome gave it, asked for it back, Helen refused and died ──
  if (_evidenceFound("necklace")) {
    opts.push({
      id: "wh_necklace",
      playerLine: "The necklace. Someone gave it to Helen, then asked for it back the night she died. She refused and stormed off.",
      cost: 0,
      exchange: [
        { speaker: "npc",    text: "A gift turned into a threat. Where did she go after she left him?", emotion: "idle" },
        { speaker: "player", text: "That's what I couldn't pin down. But I know who was the last to see her — and I know who else was out that same night.", emotion: "nervous" },
        { speaker: "npc",    text: "Two different people. One with motive, one with method.", emotion: "idle" },
        { speaker: "player", text: "Wolfsbane doesn't come from gambling debts.", emotion: "determined" },
        { speaker: "npc",    text: "No. It doesn't. Let's get everyone in the same room.", emotion: "idle" },
      ],
      npcResponse: null,
      monologue: "The necklace started it. I just have to trust where the thread ends.",
    });
  }

  // ── Certificate / newsclipping: charity fraud, Innkeeper motive ──
  if (_evidenceFound("certificate") || _evidenceFound("newsclipping")) {
    opts.push({
      id: "wh_charity",
      playerLine: "The charity donation. The certificate seal was printed, not stamped. Mrs. Gustall gave me the wrong city when I asked.",
      cost: 0,
      exchange: [
        { speaker: "npc",    text: "A hundred thousand dollars to an organisation she can't locate. And Helen was filing her documents.", emotion: "idle" },
        { speaker: "player", text: "Helen would have found it. And then she died.", emotion: "nervous" },
        { speaker: "npc",    text: "Financial motive. But the wound, Little Red — the precision of it. The wolfsbane.", emotion: "idle" },
        { speaker: "player", text: "That's not how you silence a bookkeeper. I know. Something else happened here.", emotion: "nervous" },
        { speaker: "npc",    text: "Then we look for the someone else. Bring everyone in — one room, one chance.", emotion: "idle" },
      ],
      npcResponse: null,
      monologue: "I followed the money and almost stopped there. There's something else. I have to trust that too.",
    });
  }

  // ── Crumpled note: Jerome's photo, his wife ──
  if (_evidenceFound("crumplenote")) {
    opts.push({
      id: "wh_photo",
      playerLine: "A crumpled photo — Jerome and a woman. He told me he was only passing through for one night.",
      cost: 0,
      exchange: [
        { speaker: "npc",    text: "Three nights later and still here. That's not a stopover.", emotion: "idle" },
        { speaker: "player", text: "Helen knew about his wife. About the gambling fine. She had 'suspicions' about him. That's the word he used.", emotion: "nervous" },
        { speaker: "npc",    text: "A man with secrets and a woman who found them. That's motive.", emotion: "idle" },
        { speaker: "player", text: "But someone else had means. And opportunity. And Helen was watching them too.", emotion: "determined" },
        { speaker: "npc",    text: "Let's get everyone into the same room and see what shows.", emotion: "idle" },
      ],
      npcResponse: null,
      monologue: "Jerome's story has gaps. But so does someone else's. I need to say both names in my head before I say one out loud.",
    });
  }

  // ── Fallback — always available ──
  opts.push({
    id: "wh_gut",
    playerLine: "(Say what you know, even if you can't say it cleanly yet.)",
    cost: 0,
    exchange: [
      { speaker: "player", text: "Everything kept coming back to one person. The knowledge. The access. The fact that Helen was watching them.", emotion: "nervous" },
      { speaker: "npc",    text: "Then say it plain when the time comes. I'll get everyone downstairs.", emotion: "idle" },
      { speaker: "player", text: "All of them?", emotion: "nervous" },
      { speaker: "npc",    text: "All of them. A guilty person in a room full of witnesses always shows something.", emotion: "idle" },
    ],
    npcResponse: null,
    monologue: "I know what I know. I just have to be willing to say it.",
  });

  return opts;
}

// ─── Gather chatter ───────────────────────────────────────────────────────────
const GATHER_CHATTER = [
  { speaker: "npc",    text: "Everyone. Downstairs. Now.", emotion: "idle" },
  { speaker: "player", text: "(Footsteps on the stairs. Mrs. Gustall first, arms crossed. The doctor — slow, deliberate. Jerome last, hands in his pockets.)", emotion: "nervous" },
  { speaker: "npc",    text: "Thank you. Nobody leaves this room until we're done.", emotion: "idle" },
  { speaker: "player", text: "(Mrs. Gustall starts to say something. Stops. The doctor doesn't move. Jerome's eyes go straight to the door — old habit.)", emotion: "nervous" },
  { speaker: "npc",    text: "Helen didn't slip and fall. She was sedated with wolfsbane and her throat was cut by someone who knew exactly what they were doing.", emotion: "idle" },
  { speaker: "player", text: "(The word wolfsbane lands differently on each of them. I watch for the one who already knew it.)", emotion: "determined" },
  { speaker: "npc",    text: "Little Red has been in this building for three days. She has something to say. I suggest everyone listen.", emotion: "idle" },
];

// ─── State ────────────────────────────────────────────────────────────────────
let wdPhase        = "cop_walk";
let wdFadeAlpha    = 255;
let wdCamX         = 0;
let wdCamY         = 0;

let wdCopWX        = 0;
let wdCopWY        = 0;
let wdCopTargetWX  = 0;
let wdCopFrame     = 0;
let wdCopAnimTimer = 0;

let wdGatherTimer  = 0;
const WD_GATHER_HOLD = 80;

function whodunnitPreload() {
  copSheet = loadImage("assets/portraits/cop.png");
}

function whodunnitSetup() {
  const T = window.TF1_T ?? 102.4;

  wdPhase        = "cop_walk";
  wdFadeAlpha    = 255;
  wdGatherTimer  = 0;
  wdCopFrame     = 0;
  wdCopAnimTimer = 0;
  wdEndingPhase  = "";

  // Build options from what the player actually found
  copNPC.dialogue.options = _buildCopOptions();
  copNPC.firstVisit       = true;
  copNPC.usedOptions      = [];
  copNPC.currentEmotion   = "idle";

  const focusWX = 6.5 * T;
  const focusWY = 13.4 * T;
  wdCamX = focusWX - width  / (2 * CAM_ZOOM);
  wdCamY = focusWY - height / (2 * CAM_ZOOM);

  wdCopTargetWX = WD_COP_TX * T;
  wdCopWX       = wdCamX + width / CAM_ZOOM + 120;
  wdCopWY       = WD_COP_TY * T;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function _drawCopSprite(wx, wy, col, row) {
  const dw = COP_FRAME_W * NPC_CHAR_SCALE;
  const dh = COP_FRAME_H * NPC_CHAR_SCALE;
  imageMode(CENTER);
  image(copSheet, wx, wy, dw, dh,
        col * COP_FRAME_W, row * COP_FRAME_H, COP_FRAME_W, COP_FRAME_H);
  imageMode(CORNER);
}

function _drawNPCAtPos(sheet, wx, wy) {
  if (!sheet) return;
  const fw = 48, fh = 48;
  imageMode(CENTER);
  image(sheet, wx, wy, fw * NPC_CHAR_SCALE, fh * NPC_CHAR_SCALE,
        fh, DIR.down * fh, fw, fh); // idle col = 1
  imageMode(CORNER);
}

function _drawVideoLetterboxed(vid) {
  const vw = vid.elt.videoWidth  || vid.width  || 1280;
  const vh = vid.elt.videoHeight || vid.height || 720;
  const ratio = vw / vh;
  let drawW = width;
  let drawH = width / ratio;
  if (drawH > height) {
    drawH = height;
    drawW = height * ratio;
  }
  const dx = (width  - drawW) / 2;
  const dy = (height - drawH) / 2;
  imageMode(CORNER);
  image(vid, dx, dy, drawW, drawH);
}

function _startGatherChatter() {
  activeNPC    = copNPC;
  chosenOption = { npcResponse: null, monologue: "Everyone is in the same room now. No more running. Whatever comes next happens in front of everyone." };
  startExchange(GATHER_CHATTER);
}

// ─── Draw ─────────────────────────────────────────────────────────────────────
function whodunnitDraw() {
  // Gustall cinematic — fullscreen letterboxed, no world rendering
  if (wdPhase === "gustall_video") {
    background(0);
    if (gustallVideo) {
      _drawVideoLetterboxed(gustallVideo);
    }
    return;
  }

  // Jerome cinematic — fullscreen letterboxed, no world rendering
  if (wdPhase === "jerome_video") {
    background(0);
    if (jeromeVideo) {
      _drawVideoLetterboxed(jeromeVideo);
    }
    return;
  }

  // Krisia cinematic — fullscreen letterboxed, no world rendering
  if (wdPhase === "krisia_video") {
    background(0);
    if (krisiaVideo) {
      _drawVideoLetterboxed(krisiaVideo);
    }
    return;
  }

  // After video — show ending screen via drawJudgement()
  if (wdPhase === "video_done") {
    background(0);
    drawJudgement();
    return;
  }

  const T = window.TF1_T ?? 102.4;

  // ── World ────────────────────────────────────────────────────────
  push();
  scale(CAM_ZOOM);
  translate(-wdCamX, -wdCamY);

  tf1Draw(0, 0);
  clutterDraw(0, 0);

  // Little Red
  imageMode(CENTER);
  image(charSheet, WD_LR_TX * T, WD_LR_TY * T,
    FRAME_W * CHAR_SCALE, FRAME_H * CHAR_SCALE,
    0, DIR.down * FRAME_H, FRAME_W, FRAME_H);
  imageMode(CORNER);

  // Sheriff — always visible; walking or standing
  if (copSheet) {
    if (wdPhase === "cop_walk") {
      _drawCopSprite(wdCopWX, wdCopWY, [0, 1, 2, 1][wdCopFrame], COP_ROW_LEFT);
    } else {
      _drawCopSprite(wdCopTargetWX, wdCopWY, 1, COP_ROW_DOWN);
    }
  }

  // Gathered NPCs
  if (wdPhase === "chatter" || wdPhase === "accuse" || wdPhase === "fadeout") {
    _drawNPCAtPos(innkeeperImg,  WD_IK_TX * T, WD_IK_TY * T);
    _drawNPCAtPos(nunImg,        WD_DC_TX * T, WD_DC_TY * T);
    _drawNPCAtPos(runawayManImg, WD_RM_TX * T, WD_RM_TY * T);
  }

  pop();

  drawLighting();

  // ── Phase logic ──────────────────────────────────────────────────
  if (wdPhase === "cop_walk") {
    wdFadeAlpha = max(0, wdFadeAlpha - 3);
    if (wdCopWX > wdCopTargetWX) {
      wdCopWX -= 2 / CAM_ZOOM;
      wdCopAnimTimer++;
      if (wdCopAnimTimer >= ANIM_SPEED) {
        wdCopAnimTimer = 0;
        wdCopFrame = (wdCopFrame + 1) % 4;
      }
    } else if (wdFadeAlpha <= 0) {
      wdCopWX    = wdCopTargetWX;
      wdCopFrame = 0;
      wdPhase    = "talk";
      openDialogue(copNPC);
    }

  } else if (wdPhase === "talk") {
    if (dialoguePhase === "closed") {
      wdPhase       = "gather";
      wdGatherTimer = 0;
    }

  } else if (wdPhase === "gather") {
    wdGatherTimer++;
    if (wdGatherTimer >= WD_GATHER_HOLD) {
      wdPhase = "chatter";
      _startGatherChatter();
    }

  } else if (wdPhase === "chatter") {
    if (dialoguePhase === "closed") {
      wdPhase    = "accuse";
      judgePhase = "select";
      judgeSelectedPortrait = -1;
    }

  } else if (wdPhase === "accuse") {
    // Accusation locked in — save which ending and fade to black
    if (judgePhase === "good_ending" || judgePhase === "bad_ending") {
      wdEndingPhase = judgePhase;
      judgePhase    = "closed"; // prevent sketch.js from firing yet
      wdPhase       = "fadeout";
    }

  } else if (wdPhase === "fadeout") {
    wdFadeAlpha = min(wdFadeAlpha + 5, 255);
    if (wdFadeAlpha >= 255) {
      // Gustall accused (index 0) → play cinematic first
      if (wdEndingPhase === "bad_ending" && judgeSelectedPortrait === 0) {
        wdPhase = "gustall_video";
        if (backgroundMusic && backgroundMusic.isPlaying()) backgroundMusic.stop();
        if (gustallVideo) {
          gustallVideo.play();
          gustallVideo.elt.onended = () => {
            judgePhase = "bad_ending";
            wdPhase    = "video_done";
            if (backgroundMusic) { backgroundMusic.loop(); backgroundMusic.setVolume(0.17); }
          };
        } else {
          judgePhase = "bad_ending";
          wdPhase    = "video_done";
          if (backgroundMusic) { backgroundMusic.loop(); backgroundMusic.setVolume(0.17); }
        }
      // Jerome accused (index 2) → play cinematic first
      } else if (wdEndingPhase === "bad_ending" && judgeSelectedPortrait === 2) {
        wdPhase = "jerome_video";
        if (backgroundMusic && backgroundMusic.isPlaying()) backgroundMusic.stop();
        if (jeromeVideo) {
          jeromeVideo.play();
          jeromeVideo.elt.onended = () => {
            judgePhase = "bad_ending";
            wdPhase    = "video_done";
            if (backgroundMusic) { backgroundMusic.loop(); backgroundMusic.setVolume(0.17); }
          };
        } else {
          judgePhase = "bad_ending";
          wdPhase    = "video_done";
          if (backgroundMusic) { backgroundMusic.loop(); backgroundMusic.setVolume(0.17); }
        }
      // Krisia accused (index 1) → good ending cinematic
      } else if (wdEndingPhase === "good_ending" && judgeSelectedPortrait === 1) {
        wdPhase = "krisia_video";
        if (backgroundMusic && backgroundMusic.isPlaying()) backgroundMusic.stop();
        if (krisiaVideo) {
          krisiaVideo.play();
          krisiaVideo.elt.onended = () => {
            judgePhase = "good_ending";
            wdPhase    = "video_done";
            if (backgroundMusic) { backgroundMusic.loop(); backgroundMusic.setVolume(0.17); }
          };
        } else {
          judgePhase = "good_ending";
          wdPhase    = "video_done";
          if (backgroundMusic) { backgroundMusic.loop(); backgroundMusic.setVolume(0.17); }
        }
      } else {
        judgePhase = wdEndingPhase; // hand off to sketch.js
      }
    }
  }

  // ── Gather label ──────────────────────────────────────────────────
  if (wdPhase === "gather") {
    noStroke();
    fill(220, 200, 160, 200);
    textFont(mainFontItalic);
    textAlign(CENTER, CENTER);
    textSize(18);
    text('"Everyone downstairs. Now."', width / 2, height - 60);
  }

  // ── Dialogue + cursor ─────────────────────────────────────────────
  drawDialogue();
  updateHoverCursor();

  // ── Accusation picker ─────────────────────────────────────────────
  if (wdPhase === "accuse") drawJudgement();

  // ── Fade overlay ──────────────────────────────────────────────────
  if (wdFadeAlpha > 0) {
    noStroke();
    fill(0, 0, 0, wdFadeAlpha);
    rect(0, 0, width, height);
  }
}

// copNPC declared after helpers so _buildCopOptions can reference evidence flags
const copNPC = {
  dialogue: {
    name: "Sheriff",
    opening: "Little Red. I've seen the body — wolfsbane in her blood, throat cut with surgical precision. This wasn't a robbery. You've been in this building three days. Tell me what you found.",
    repeatLine: "Say the name.",
    hesitationLine: "Take your time. But not too much of it.",
    exitMonologue: "The truth was here all along. I only had to be brave enough to say it.",
    options: [], // filled in whodunnitSetup() based on evidence found
  },
  firstVisit: true,
  usedOptions: [],
  portraitKey: "cop",
  currentEmotion: "idle",
  journalPageIndex: undefined,
};
