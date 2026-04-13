let charSheet;
let player;
let activeExamineItem = null;

let spoonImg;
let innkeeperImg;
let nunImg;
let runawayManImg;

let camX = 0;
let camY = 0;

const TILE = 32;

const FRAME_W = 32;
const FRAME_H = 32;
const ANIM_SPEED = 7;
const CHAR_SCALE = 1.7;
const NPC_CHAR_SCALE = 1.3;
const CAM_ZOOM = 2.3; // world-space zoom (increased from 1.4 for closer zoom)

const DIR = { down: 0, left: 1, right: 2, up: 3 };

const P_SPEED = 4.5;
const P_RADIUS = 10;

let journal;
let judgement;
let setting;
let gear;

let doctorPg;
let rmPg;
let innkeeperPg;
let fdlPg;
let evidencePg;
let cookiejar;
let emptyjar;

let portraits = {}; // for dialogue portraits

//dialogue ui
let uiMainBox, uiMonologueBox;
let uiBtnRegular, uiBtnHover, uiBtnDisabled;

//cookies are low reminder
let lowCookieNotifImg;
let lowCookieNotifVisible = false;
let lowCookieNotifTriggered = false;
let lowCookieNotifTimer = 0;
const LOW_COOKIE_NOTIF_DURATION = 300; // ~5 seconds at 60fps

let dayEndTriggered = false;
let dayTransitionLocked = false; // blocks all input during day-end transition
let confirmEndDayOpen = false; // whether the "end day?" modal is showing
let outOfCookiesModalOpen = false;
let hasShownOutOfCookiesModal = false;
let outOfCookiesPending = false; // fires modal after dialogue closes

let sleepHintActive = false;
let refillHintActive = false;

let currentScene = "HOME";
let npcPromptBounds = null; // set each frame by drawPrompt()

let currentDay = 1;
const TOTAL_DAYS = 3;
let endScreenAlpha = 255;
let endFadeTimeout = null;
let endFadeInterval = null;
let endDayTimer = 0;
const END_DAY_HOLD = 180; // frames fully black (3 sec)
const END_DAY_FADE = 60; // frames to fade out (1 sec)
const END_DAY_TOTAL = END_DAY_HOLD + END_DAY_FADE;
let _checkinCheatBuf = "";

let journalicon;
let leftarrow;
let rightarrow;

let jersey10Font;
let mainFont;
let mainFontItalic;
let journalFont;

let primaryTextC;
let monologueTextC;
let dialogueHoverButtonTextC;
let dialogueDisabledButtonTextC;
let journalTextC;

let prologue1Video;
let prologueVideo; // prologue2 — plays after checkin
let gustallVideo;
let jeromeVideo;
let krisiaVideo;

// Audio settings
let backgroundMusic;
let musicStarted = false;
let pageFlipSound;
let journalNotifySound;
let CookieSound;

function preload() {
  tf1Preload();
  clutterPreload();
  checkinPreload();
  charSheet = loadImage("redridinghood.png"); //reference [20]
  loadHomeAssets();
  spoonImg = loadImage("assets/cookies.png"); //reference [4]
  innkeeperImg = loadImage("assets/innkeeper_sprite.png"); //reference [5]
  nunImg = loadImage("assets/Krisia_spritesheet.png");
  runawayManImg = loadImage("assets/Jerome_spritesheet.png");

  // journal pages
  doctorPg = loadImage("assets/journal/Krisia_journal.png");
  rmPg = loadImage("assets/journal/Jerome_journal.png");
  innkeeperPg = loadImage("assets/journal/Mrs.Gustall_journal.png");
  fdlPg = loadImage("assets/journal/Helen_journal.png");
  evidencePg = loadImage("assets/journal/Evidence_journal.png");
  leftarrow = loadImage("assets/left_arrow.png");
  rightarrow = loadImage("assets/right_arrow.png");

  gear = loadImage("assets/gear.png"); // reference [14]
  cookiejar = loadImage("assets/cookiejar.png");
  emptyjar = loadImage("assets/EmptyJar.png");

  // character portraits
  portraits = {
    innkeeper: {
      idle: loadImage("assets/portraits/IK_Idle.png"),
      angry: loadImage("assets/portraits/IK_angry.png"),
      nervous: loadImage("assets/portraits/IK_Nervous.png"),
      sus: loadImage("assets/portraits/IK_Sus.png"),
      happy: loadImage("assets/portraits/IK_happy.png"),
    },
    littleRed: {
      idle: loadImage("assets/portraits/LR_Idle.png"),
      nervous: loadImage("assets/portraits/LR_Nervous.png"),
      happy: loadImage("assets/portraits/LR_Happy.png"),
      determined: loadImage("assets/portraits/LR_Determined.png"),
    },
    doctor: {
      idle: loadImage("assets/portraits/Doctor_idle.png"),
      nervous: loadImage("assets/portraits/Doctor_nervous.png"),
      happy: loadImage("assets/portraits/Doctor_happy.png"),
      sus: loadImage("assets/portraits/Doctor_sus.png"),
      angry: loadImage("assets/portraits/Doctor_angry.png"),
    },
    runawayMan: {
      idle: loadImage("assets/portraits/RM_idle.png"),
      nervous: loadImage("assets/portraits/RM_nervous.png"),
      happy: loadImage("assets/portraits/RM_happy.png"),
      sus: loadImage("assets/portraits/RM_sus.png"),
      angry: loadImage("assets/portraits/RM_angry.png"),
    },
    helen: {
      idle: loadImage("assets/portraits/helen.png"),
    },
  };
  journalicon = loadImage("assets/bookicon.png"); // reference [22]
  // ui dialogue elements
  uiMainBox = loadImage("assets/ui elements/Main Dialogue Box.png");
  uiMonologueBox = loadImage("assets/ui elements/Inner Monologue Box.png");
  uiBtnRegular = loadImage("assets/ui elements/Dialogue choice regular.png");
  uiBtnHover = loadImage("assets/ui elements/Dialogue choice hover.png");
  uiBtnDisabled = loadImage("assets/ui elements/Dialogue choice disabled.png");

  jersey10Font = loadFont("assets/Jersey10-Regular.ttf"); // reference [7]
  mainFont = loadFont("assets/LisuBosa-Regular.ttf"); // reference [9]
  mainFontItalic = loadFont("assets/LisuBosa-Italic.ttf"); // reference [9]

  journalFont = loadFont("assets/Margarine-Regular.ttf");

  lowCookieNotifImg = loadImage(
    "assets/ui elements/Cookie Low Reminder Box.png",
  );

  prologue1Video = createVideo("assets/prologue1.mp4");
  prologue1Video.hide();
  prologue1Video.elt.onerror = () => { if (currentScene === "PROLOGUE1") { currentScene = "CHECKIN"; checkinSetup(); } };

  prologueVideo = createVideo("assets/prologue2.mp4"); //reference [4], [5]
  prologueVideo.hide();
  // auto-skip to game if the video can't load or play (codec/browser issue)
  prologueVideo.elt.onerror = () => {
    currentScene = "GAME";
  };
  prologueVideo.elt.onstalled = () => {
    setTimeout(() => {
      if (currentScene === "PROLOGUE") currentScene = "GAME";
    }, 3000);
  };
  gustallVideo = createVideo("assets/gustall.mp4");
  gustallVideo.hide();
  gustallVideo.elt.onerror = () => { if (wdPhase === "gustall_video") { judgePhase = "bad_ending"; wdPhase = "video_done"; } };

  jeromeVideo = createVideo("assets/jerome.mp4");
  jeromeVideo.hide();
  jeromeVideo.elt.onerror = () => { if (wdPhase === "jerome_video") { judgePhase = "bad_ending"; wdPhase = "video_done"; } };

  krisiaVideo = createVideo("assets/krisia.mp4");
  krisiaVideo.hide();
  krisiaVideo.elt.onerror = () => { if (wdPhase === "krisia_video") { judgePhase = "good_ending"; wdPhase = "video_done"; } };
  backgroundMusic = loadSound("assets/audio/bgm.mp3"); //reference [1]
  pageFlipSound = loadSound("assets/audio/pageturning.mp3"); //reference [1]
  CookieSound = loadSound("assets/audio/eatcookie.mp3"); //reference [1]
  journalNotifySound = loadSound("assets/audio/infocollect.mp3"); //reference [1]
}

// ─────────────────────────────────────────────────────────────
// SPAWN HELPERS (guaranteed inside walkable area)
// ─────────────────────────────────────────────────────────────

function isCircleInOpenSpace(cx, cy, r) {
  // Use the same style of checks as movement collision
  const pts = [
    [cx, cy],
    [cx, cy + r],
    [cx, cy - r],
    [cx + r, cy],
    [cx - r, cy],
    [cx + r * 0.7, cy + r * 0.7],
    [cx - r * 0.7, cy + r * 0.7],
    [cx + r * 0.7, cy - r * 0.7],
    [cx - r * 0.7, cy - r * 0.7],
  ];
  for (const [px, py] of pts) {
    if (tf1IsSolidAtPixel(px, py)) return false;
  }
  return true;
}

function tooCloseToOthers(cx, cy, others, minDist) {
  for (const o of others) {
    const dx = cx - o.x;
    const dy = cy - o.y;
    if (dx * dx + dy * dy < minDist * minDist) return true;
  }
  return false;
}

/**
 * Find a safe spawn pixel.
 * - region: optional { x0, y0, x1, y1 } to bias search
 * - r: radius for collision
 * - avoid: array of {x,y} to keep spacing between spawns
 */
function findSpawnPoint({ r, region = null, avoid = [], minDist = 120 }) {
  const floorTopY = 0; // ✅ new tavern origin

  const worldW = TF1_W * TF1_T;
  const worldH = TF1_H * TF1_T;

  const x0 = region?.x0 ?? 0;
  const y0 = region?.y0 ?? floorTopY;
  const x1 = region?.x1 ?? worldW;
  const y1 = region?.y1 ?? floorTopY + worldH;

  // 1) random samples
  for (let i = 0; i < 600; i++) {
    const cx = random(x0 + r + 2, x1 - r - 2);
    const cy = random(y0 + r + 2, y1 - r - 2);

    if (!isCircleInOpenSpace(cx, cy, r)) continue;
    if (tooCloseToOthers(cx, cy, avoid, minDist)) continue;

    return { x: cx, y: cy };
  }

  // 2) fallback scan
  const step = Math.max(16, Math.floor(TF1_T / 2));
  for (let cy = y0 + r + 2; cy <= y1 - r - 2; cy += step) {
    for (let cx = x0 + r + 2; cx <= x1 - r - 2; cx += step) {
      if (!isCircleInOpenSpace(cx, cy, r)) continue;
      if (tooCloseToOthers(cx, cy, avoid, minDist)) continue;
      return { x: cx, y: cy };
    }
  }

  console.warn("No valid spawn found — check mask/collision.");
  return { x: TF1_T * 2, y: TF1_T * 2 };
}

// Convenience: define some “zones” to bias spawns (adjust if you want)
function getInnZones() {
  const W = TF1_W * TF1_T;
  const H = TF1_H * TF1_T;

  return {
    main: { x0: W * 0.2, x1: W * 0.8, y0: H * 0.25, y1: H * 0.7 },
    left: { x0: W * 0.05, x1: W * 0.45, y0: H * 0.15, y1: H * 0.9 },
    right: { x0: W * 0.55, x1: W * 0.95, y0: H * 0.15, y1: H * 0.9 },
  };
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  noSmooth();
  textFont(mainFont);

  //text colours
  primaryTextC = color(168, 86, 21);
  monologueTextC = color(255);
  dialogueHoverButtonTextC = color(255);
  dialogueDisabledButtonTextC = color(168, 86, 21);
  journalTextC = color(255);

  tf1Setup();
  // once the floor/tile system exists we can place our furniture
  clutterSetup();
  lightingSetup();

  player = new Player();
  player.dir = DIR.down;

  // after tf1Setup() so TF1_W/TF1_H/TF1_T exist:
  const zones = getInnZones();
  const used = [];

  // Player spawns near the crime scene (tileX 6.5, tileY 13.4)
  player.px = 6.5 * TF1_T;
  player.py = 12.5 * TF1_T;
  used.push({ x: player.px, y: player.py });

  // NPC spawns (spread out)
  let n;

  // innkeeper in main (near player but not on top)
  n = findSpawnPoint({ r: 14, region: zones.main, avoid: used, minDist: 140 });
  innkeeper.x = n.x;
  innkeeper.y = n.y;
  used.push({ x: innkeeper.x, y: innkeeper.y });

  // doctor in left side
  n = findSpawnPoint({ r: 14, region: zones.left, avoid: used, minDist: 140 });
  doctor.x = n.x;
  doctor.y = n.y;
  used.push({ x: doctor.x, y: doctor.y });

  // runawayMan in right side
  n = findSpawnPoint({ r: 14, region: zones.right, avoid: used, minDist: 140 });
  runawayMan.x = n.x;
  runawayMan.y = n.y;
  used.push({ x: runawayMan.x, y: runawayMan.y });

  journal = new Journal();
  npcs = [innkeeper, doctor, runawayMan];
  checkinSetup(); //array of npcs we have

  // set NPC colours here, after p5.js is ready
  innkeeper.sprite = innkeeperImg;
  innkeeper.spriteFrameW = 48;
  innkeeper.spriteFrameH = 48;
  doctor.sprite = nunImg;
  doctor.spriteFrameW = 48;
  doctor.spriteFrameH = 48;
  runawayMan.colour = color(100, 220, 130); // green
  runawayMan.sprite = runawayManImg;
  runawayMan.spriteFrameW = 48;
  runawayMan.spriteFrameH = 48;

  judgePortraits = [
    portraits.innkeeper.idle,
    portraits.doctor.idle,
    portraits.runawayMan.idle,
  ];

  // Start background music
  if (backgroundMusic) {
    console.log("Music loaded, waiting for user interaction...");
  } else {
    console.error("Background music failed to load");
  }
}

function draw() {
  background(22, 18, 20);

  if (currentScene === "GAME" && !musicStarted && backgroundMusic) {
    backgroundMusic.loop();
    backgroundMusic.setVolume(0.17);
    musicStarted = true;
  }

  if (currentScene === "HOME") {
    drawHomePage();
    return;
  } else if (currentScene === "CHECKIN") {
    checkinDraw();
    return;
  } else if (currentScene === "WHODUNNIT") {
    whodunnitDraw();
    return;
  } else if (currentScene === "PROLOGUE1") {
    background(0);
    image(prologue1Video, 0, 0, width, height);
    return;
  } else if (currentScene === "PROLOGUE") {
    background(0);
    image(prologueVideo, 0, 0, width, height);
    return;
  } else if (currentScene === "END") {
    endDayTimer++;
    if (endDayTimer <= END_DAY_HOLD) {
      endScreenAlpha = 255;
    } else {
      endScreenAlpha = map(endDayTimer, END_DAY_HOLD, END_DAY_TOTAL, 255, 0);
    }
    if (endDayTimer >= END_DAY_TOTAL) {
      endScreenAlpha = 0;
      currentScene = "GAME";
      dayTransitionLocked = false;
    }
    drawEndPage();
    return;
  } else if (currentScene === "CREDITS") {
    resetMatrix();
    drawCreditsPage();
    return;
  }

  // Everything below only runs for GAME scene
  if (!journal.isOpen) {
    updatePlayer();
    camX = lerp(camX, player.px - width / (2 * CAM_ZOOM), 0.14);
    camY = lerp(camY, player.py - height / (2 * CAM_ZOOM), 0.14);
  }

  push();
  scale(CAM_ZOOM);
  translate(-camX, -camY);
  tf1Draw(0, 0);
  clutterDraw(0, 0);
  cookieJarDraw();
  drawPlayer();
  for (let npc of npcs) {
    npc.update();
    npc.draw();
  }
  pop();

  drawLighting();
  drawDialogue();
  drawExamineImage();
  drawSpoonCounter();
  drawPrompt();
  drawJournalIcon();
  drawDayCounter();
  settings();
  journal.display();
  drawJudgement();
  drawLowCookieNotif();
  drawGuidanceNotif();
  drawConfirmEndDay();
  drawOutOfCookiesModal();
  updateHoverCursor();
}

function updatePlayer() {
  if (dialoguePhase !== "closed") return; // freezes movement during dialogue
  let vx = 0,
    vy = 0;

  if (keyIsDown(65) || keyIsDown(LEFT_ARROW)) {
    vx -= 1;
    player.dir = DIR.left;
  } // A or Left Arrow
  if (keyIsDown(68) || keyIsDown(RIGHT_ARROW)) {
    vx += 1;
    player.dir = DIR.right;
  } // D or Right Arrow
  if (keyIsDown(87) || keyIsDown(UP_ARROW)) {
    vy -= 1;
    player.dir = DIR.up;
  } // W or Up Arrow
  if (keyIsDown(83) || keyIsDown(DOWN_ARROW)) {
    vy += 1;
    player.dir = DIR.down;
  } // S or Down Arrow

  player.moving = vx !== 0 || vy !== 0;

  if (player.moving) {
    const len = Math.sqrt(vx * vx + vy * vy);
    vx /= len;
    vy /= len;

    const nx = player.px + vx * P_SPEED;
    const ny = player.py + vy * P_SPEED;

    if (!circleHitsSolid(nx, player.py, P_RADIUS)) player.px = nx;
    if (!circleHitsSolid(player.px, ny, P_RADIUS)) player.py = ny;
  }

  if (player.moving) {
    player.animTimer++;
    if (player.animTimer >= ANIM_SPEED) {
      player.animTimer = 0;
      player.frame = (player.frame + 1) % 4;
    }
  } else {
    player.frame = 0;
    player.animTimer = 0;
  }
}

function circleHitsSolid(cx, cy, r) {
  const pts = [
    [cx, cy + r],
    [cx, cy - r],
    [cx + r, cy],
    [cx - r, cy],
  ];
  for (const [px, py] of pts) {
    if (tf1IsSolidAtPixel(px, py)) return true;
  }

  if (playerHitsNPC(cx, cy, r)) return true;
  if (checkCollision(cx, cy, r)) return true;

  return false;
}

function drawPlayer() {
  const animCol = [0, 1, 2, 1][player.frame];
  const sx = animCol * FRAME_W;
  const sy = player.dir * FRAME_H;

  const dw = FRAME_W * CHAR_SCALE;
  const dh = FRAME_H * CHAR_SCALE;

  imageMode(CENTER);
  image(charSheet, player.px, player.py - 8, dw, dh, sx, sy, FRAME_W, FRAME_H);
  imageMode(CORNER);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  lightingResized();
}

function drawSpoonCounter() {
  const spoonSize = 70;
  const gap = 0.5;
  const startX = 20;
  const startY = 10;

  //background
  const totalW = 7 * spoonSize + 6 * gap;
  noStroke();
  fill(255, 255, 255, 80); // adjust alpha (0–255) to taste
  rect(startX - 8, startY - 8, totalW + 16, spoonSize + 16, 12);

  // How many spoons will the hovered option cost?
  let previewCost = 0;
  if (
    (dialoguePhase === "choosing" || dialoguePhase === "repeat-choosing") &&
    selectedOption !== -1 &&
    activeNPC
  ) {
    const opt = activeNPC.dialogue.options[selectedOption];
    if (opt) previewCost = opt.cost;
  }

  for (let i = 0; i < 7; i++) {
    const x = startX + i * (spoonSize + gap);
    // spoons in the range [spoonsRemaining - previewCost, spoonsRemaining) will be spent
    const willBeSpent =
      previewCost > 0 &&
      i >= spoonsRemaining - previewCost &&
      i < spoonsRemaining;

    if (willBeSpent) {
      // all cost spoons bob together, slowly
      const bobY = sin(frameCount * 0.05) * 5;
      // pass 1: tight red outline
      drawingContext.shadowColor = "rgba(220, 35, 35, 1)";
      drawingContext.shadowBlur = 3;
      image(spoonImg, x, startY + bobY, spoonSize, spoonSize);
      // pass 2: wider red glow outlining the outline
      drawingContext.shadowBlur = 16;
      image(spoonImg, x, startY + bobY, spoonSize, spoonSize);
      // pass 3: clean cookie on top
      drawingContext.shadowColor = "transparent";
      drawingContext.shadowBlur = 0;
      image(spoonImg, x, startY + bobY, spoonSize, spoonSize);
    } else if (i < spoonsRemaining) {
      tint(255);
      image(spoonImg, x, startY, spoonSize, spoonSize);
    } else {
      tint(255, 255, 255, 80);
      image(spoonImg, x, startY, spoonSize, spoonSize);
    }
  }

  noTint();
}

function drawPrompt() {
  if (dialoguePhase !== "closed") {
    npcPromptBounds = null;
    return; // hide during dialogue
  }

  npcPromptBounds = null;
  for (let npc of npcs) {
    if (npc.isPlayerNearby(player)) {
      // convert NPC world position to screen position (account for zoom)
      let screenX = (npc.x - camX) * CAM_ZOOM;
      let screenY = (npc.y - camY) * CAM_ZOOM;

      // draw a small dark pill-shaped box above the NPC
      let msg = "Press SPACE to talk";
      textSize(13);
      let msgW = textWidth(msg) + 20;
      let msgH = 24;
      let msgX = screenX - msgW / 2;
      let msgY = screenY - 90;

      npcPromptBounds = { x: msgX, y: msgY, w: msgW, h: msgH, npc };

      const hoveringPrompt =
        mouseX > msgX &&
        mouseX < msgX + msgW &&
        mouseY > msgY &&
        mouseY < msgY + msgH;

      fill(hoveringPrompt ? 40 : 0, 0, 0, 180);
      noStroke();
      rect(msgX, msgY, msgW, msgH, 12);

      fill(255);
      textAlign(CENTER, CENTER);
      textSize(13);
      textFont(mainFont);
      text(msg, screenX, msgY + msgH / 2);

      break; // only show prompt for one NPC at a time
    }
  }

  // Check for door1 interaction
  if (isPlayerNearDoor1(player)) {
    // convert door world position to screen position
    let doorPos = getPropPosition(door1Layout);
    if (doorPos) {
      let screenX = (doorPos.actualX - camX) * CAM_ZOOM;
      let screenY = (doorPos.actualY - camY) * CAM_ZOOM;
      // draw a small dark pill-shaped box above the door
      let msg = "Press SPACE to go to bed";
      textSize(16);
      let msgW = textWidth(msg) + 20;
      let msgH = 24;
      let msgX = screenX - msgW / 4;
      let msgY = screenY - 50;
      fill(255); // semi-transparent dark background
      noStroke();
      rect(msgX, msgY, msgW, msgH, 12); // 12 = rounded corners
      fill(0);
      textAlign(CENTER, CENTER);
      textSize(16);
      textFont(mainFont);
      text(msg, screenX + msgW / 4, msgY + msgH / 2);
    }
  }

  // Check for interactable evidence objects
  const nearItem = getInteractableNearPlayer(player);
  if (nearItem) {
    const pos = getPropPosition(nearItem);
    if (pos) {
      const screenX = (pos.actualX + pos.dw / 2 - camX) * CAM_ZOOM;
      const screenY = (pos.actualY - camY) * CAM_ZOOM;
      let msg = "Press SPACE to examine";
      textSize(13);
      let msgW = textWidth(msg) + 20;
      let msgH = 24;
      let msgX = screenX - msgW / 2;
      let msgY = screenY - 20;
      fill(0, 0, 0, 180);
      noStroke();
      rect(msgX, msgY, msgW, msgH, 12);
      fill(255);
      textAlign(CENTER, CENTER);
      textSize(13);
      textFont(mainFont);
      text(msg, screenX, msgY + msgH / 2);
    }
  }
  cookieJarDrawPrompt(player, camX, camY, CAM_ZOOM);
}

//journal icon
function drawJournalIcon() {
  const padX = 10;
  const padY = 8;
  const leftEdge = width - 240;
  const topEdge = 12 - padY;
  const rightEdge = width - 30 + 60 + padX;
  noStroke();
  fill(255, 255, 255, 80);
  rect(leftEdge - 20, topEdge, rightEdge - leftEdge - 30, 86, 12);

  const iw = 60;
  const ih = 60;
  const ix = width - iw - 100;
  const iy = 15;

  const hoveringJournal =
    mouseX > ix && mouseX < ix + iw && mouseY > iy && mouseY < iy + ih;
  const bobY =
    journal.hasUnread || hoveringJournal ? sin(frameCount * 0.06) * 3 : 0;

  // journal image: always a slight black outline, then gold glow when unread
  drawingContext.shadowColor = "rgba(0, 0, 0, 0.85)";
  drawingContext.shadowBlur = 4;
  image(journalicon, ix, iy + bobY, iw, ih);
  if (journal.hasUnread) {
    drawingContext.shadowColor = "rgba(255, 195, 40, 0.9)";
    drawingContext.shadowBlur = 20;
    image(journalicon, ix, iy + bobY, iw, ih);
  }
  drawingContext.shadowColor = "transparent";
  drawingContext.shadowBlur = 0;
  image(journalicon, ix, iy + bobY, iw, ih);

  // 'J' — gold with gold tight outline then gold glow
  textAlign(CENTER, CENTER);
  textSize(38);
  drawingContext.shadowColor = "rgba(255, 195, 40, 1)";
  drawingContext.shadowBlur = 3;
  fill(255, 210, 50);
  textFont(jersey10Font);
  text("J", ix + iw / 2, iy + ih / 2 + bobY);
  drawingContext.shadowBlur = 12;
  text("J", ix + iw / 2, iy + ih / 2 + bobY);
  drawingContext.shadowColor = "transparent";
  drawingContext.shadowBlur = 0;
  text("J", ix + iw / 2, iy + ih / 2 + bobY);

  // unread dot
  if (journal.hasUnread) {
    noStroke();
    fill(210, 50, 50);
    ellipse(ix + 8, iy + 8 + bobY, 14, 14);
  }
}

//settings pop up
function settings() {
  const iw = 50;
  const ih = 50;
  const ix = width - iw - 30;
  const iy = 20;
  image(gear, ix, iy, iw, ih);

  if (setting === true) {
    noStroke();
    fill(0, 0, 0, 200);
    rect(0, 0, width, height);

    if (instructions) {
      const imgW = min(900, width * 0.9);
      const imgH = imgW * (instructions.height / instructions.width);
      const imgX = (width - imgW) / 2;
      const imgY = (height - imgH) / 2;
      imageMode(CORNER);
      image(instructions, imgX, imgY, imgW, imgH);

      // Close button top-right of the instructions image
      drawCloseButton(imgX + imgW + 18, imgY - 18);
    }
  }
}

function handleSettingsClick(mx, my) {
  const iw = 60,
    ih = 60;
  const ix = width - iw - 30,
    iy = 12;

  if (mx > ix && mx < ix + iw && my > iy && my < iy + ih) {
    setting = !setting;
    return;
  }
  if (setting && instructions) {
    const imgW = min(900, width * 0.9);
    const imgH = imgW * (instructions.height / instructions.width);
    const imgX = (width - imgW) / 2;
    const imgY = (height - imgH) / 2;
    const btnX = imgX + imgW + 18;
    const btnY = imgY - 18;
    const size = 36;
    if (
      mx > btnX - size / 2 &&
      mx < btnX + size / 2 &&
      my > btnY - size / 2 &&
      my < btnY + size / 2
    ) {
      setting = false;
    }
  }
}

function drawExamineImage() {
  if (
    !activeExamineItem ||
    !activeExamineItem.closeupAsset ||
    dialoguePhase !== "monologue"
  )
    return;
  const img = clutterImages[activeExamineItem.closeupAsset];
  if (!img) return;

  // Right half of screen, leaving room for the dialogue box at the bottom
  const areaX = width * 0.03;
  const areaY = height * 0.18;
  const areaW = width * 0.42;
  const areaH = height * 0.5;

  // Fit image within the area while preserving aspect ratio
  const aspect = img.width / img.height;
  let drawW = areaW;
  let drawH = drawW / aspect;
  if (drawH > areaH) {
    drawH = areaH;
    drawW = drawH * aspect;
  }

  const drawX = areaX + (areaW - drawW) / 2;
  const drawY = areaY + (areaH - drawH) / 2;

  image(img, drawX, drawY, drawW, drawH);
}

function handlePhoneClick(mx, my) {
  if (currentDay !== 3 || dialoguePhase !== "closed" || journal.isOpen) return;

  const phoneItem = roomLayout.find((f) => f.asset === "phone");
  if (!phoneItem) return;
  const pos = getPropPosition(phoneItem);
  if (!pos) return;

  // Only allow click when player is within interact radius
  const phoneCenterX = pos.actualX + pos.dw / 2;
  const phoneCenterY = pos.actualY + pos.dh / 2;
  if (
    dist(player.px, player.py, phoneCenterX, phoneCenterY) >
    (phoneItem.interactRadius || 80)
  )
    return;

  const wx = mx / CAM_ZOOM + camX;
  const wy = my / CAM_ZOOM + camY;
  if (
    wx > pos.actualX &&
    wx < pos.actualX + pos.dw &&
    wy > pos.actualY &&
    wy < pos.actualY + pos.dh
  ) {
    judgePhase = "confirm";
    judgeSelectedPortrait = -1;
  }
}

function drawDayCounter() {
  textAlign(RIGHT, TOP);
  textSize(24);
  drawingContext.shadowColor = "rgba(0, 0, 0, 0.95)";
  drawingContext.shadowBlur = 4;
  fill(255, 210, 50);
  textFont(mainFont);
  text(`Day ${currentDay}/${TOTAL_DAYS}`, width - 170, 35);
  drawingContext.shadowColor = "transparent";
  drawingContext.shadowBlur = 0;
}

function drawOutOfCookiesModal() {
  if (!outOfCookiesModalOpen) return;

  // Dim backdrop
  noStroke();
  fill(0, 0, 0, 160);
  rect(0, 0, width, height);

  // Panel — identical style to confirmEndDay
  const panelW = 520;
  const panelH = 300;
  const panelX = width / 2 - panelW / 2;
  const panelY = height / 2 - panelH / 2;

  stroke(56, 29, 16);
  strokeWeight(4);
  fill(107, 59, 34);
  rect(panelX, panelY, panelW, panelH, 20);
  noStroke();

  // X close button
  const xSize = 36;
  const xX = panelX + panelW - xSize / 2 - 10;
  const xY = panelY + xSize / 2 + 10;
  const hoveringX = dist(mouseX, mouseY, xX, xY) < xSize / 2;
  fill(hoveringX ? color(90, 40, 35) : color(106, 46, 43));
  stroke(56, 29, 16);
  strokeWeight(2);
  ellipse(xX, xY, xSize, xSize);
  noStroke();
  fill(255);
  textFont(jersey10Font);
  textSize(22);
  textAlign(CENTER, CENTER);
  text("×", xX, xY - 2);

  // Message
  fill(255);
  textFont(mainFont);
  textSize(38);
  textAlign(CENTER, CENTER);
  text(
    "You've ran out of cookies!\nWhat would you like to do?",
    width / 2,
    panelY + 110,
  );

  // Buttons
  const btnW = 200;
  const btnH = 45;
  const refillBtnX = width / 2 - btnW - 20;
  const sleepBtnX = width / 2 + 20;
  const btnY = panelY + panelH - btnH - 40;

  const hoveringRefill =
    mouseX > refillBtnX &&
    mouseX < refillBtnX + btnW &&
    mouseY > btnY &&
    mouseY < btnY + btnH;
  const hoveringSleep =
    mouseX > sleepBtnX &&
    mouseX < sleepBtnX + btnW &&
    mouseY > btnY &&
    mouseY < btnY + btnH;

  // Refill button
  fill(hoveringRefill ? color(250, 219, 177) : color(240, 193, 130));
  rect(refillBtnX, btnY, btnW, btnH, 30);
  fill(56, 29, 16);
  textFont(mainFont);
  textSize(22);
  textAlign(CENTER, CENTER);
  text("Refill Cookies", refillBtnX + btnW / 2, btnY + btnH / 2 - 3);

  // Sleep button
  fill(hoveringSleep ? color(250, 219, 177) : color(240, 193, 130));
  rect(sleepBtnX, btnY, btnW, btnH, 30);
  fill(56, 29, 16);
  textFont(mainFont);
  text("Go to bed", sleepBtnX + btnW / 2, btnY + btnH / 2 - 3);
}

function handleOutOfCookiesClick(mx, my) {
  if (!outOfCookiesModalOpen) return false;

  const panelW = 520;
  const panelH = 300;
  const panelX = width / 2 - panelW / 2;
  const panelY = height / 2 - panelH / 2;

  // X button
  const xSize = 36;
  const xX = panelX + panelW - xSize / 2 - 10;
  const xY = panelY + xSize / 2 + 10;
  if (dist(mx, my, xX, xY) < xSize / 2) {
    outOfCookiesModalOpen = false;
    return true;
  }

  const btnW = 200;
  const btnH = 55;
  const refillBtnX = width / 2 - btnW - 20;
  const sleepBtnX = width / 2 + 20;
  const btnY = panelY + panelH - btnH - 30;

  // Refill chosen
  if (
    mx > refillBtnX &&
    mx < refillBtnX + btnW &&
    my > btnY &&
    my < btnY + btnH
  ) {
    outOfCookiesModalOpen = false;
    refillHintActive = true;
    sleepHintActive = false;
    return true;
  }

  // Sleep chosen
  if (
    mx > sleepBtnX &&
    mx < sleepBtnX + btnW &&
    my > btnY &&
    my < btnY + btnH
  ) {
    outOfCookiesModalOpen = false;
    sleepHintActive = true;
    refillHintActive = false;
    return true;
  }

  return true; // consume all clicks while modal open
}

function drawGuidanceNotif() {
  const showing = sleepHintActive || refillHintActive;
  if (!showing) return;

  const msg = sleepHintActive
    ? "To go to bed, walk to the bedroom door at the top and press SPACE."
    : "Go to the cookie jar in the tavern in the middle to refill your energy.";

  let nW = 420;
  let nH = 82;
  let nX = width - nW - 20;
  let nY = 120; // below the low-cookie notif slot

  // Background — same brown as low cookie notif
  noStroke();
  fill(107, 59, 34);
  rect(nX, nY, nW, nH, 20);

  // Message text
  fill(255);
  textSize(16);
  textAlign(LEFT, CENTER);
  textFont(mainFont);
  text(msg, nX + 16, nY, nW - 40, nH);

  // X button
  let xSize = 26;
  let xX = nX + nW - xSize - 8;
  let xY = nY + 8;

  const hoveringX =
    mouseX > xX && mouseX < xX + xSize && mouseY > xY && mouseY < xY + xSize;

  fill(255, 255, 255, hoveringX ? 255 : 160);
  textSize(18);
  textFont(jersey10Font);
  textAlign(CENTER, CENTER);
  textFont(jersey10Font);
  text("X", xX + xSize / 2, xY + xSize / 2);
  textFont(mainFont);
}

function drawConfirmEndDay() {
  if (!confirmEndDayOpen) return;

  // Dim backdrop
  noStroke();
  fill(0, 0, 0, 160);
  rect(0, 0, width, height);

  // Panel
  const panelW = 520;
  const panelH = 280;
  const panelX = width / 2 - panelW / 2;
  const panelY = height / 2 - panelH / 2;
  const corner = 20;
  stroke(56, 29, 16);
  strokeWeight(4);
  fill(107, 59, 34);
  rect(panelX, panelY, panelW, panelH, corner);
  noStroke();
  // X close button (top right)
  const xSize = 36;
  const xX = panelX + panelW - xSize / 2 - 10;
  const xY = panelY + xSize / 2 + 10;
  const hoveringX = dist(mouseX, mouseY, xX, xY) < xSize / 2;
  fill(hoveringX ? color(90, 40, 35) : color(106, 46, 43));
  stroke(56, 29, 16);
  strokeWeight(2);
  ellipse(xX, xY, xSize, xSize);
  noStroke();
  fill(255);
  textFont(jersey10Font);
  textSize(22);
  textAlign(CENTER, CENTER);
  text("×", xX, xY - 2);

  // Question text
  fill(255);
  textFont(mainFont);
  textSize(42);
  textAlign(CENTER, CENTER);
  text("Would you like to \nend the day?", width / 2, panelY + 100);

  // Yes button
  const btnW = 180;
  const btnH = 45;
  const yesBtnX = width / 2 - btnW - 20;
  const noBtnX = width / 2 + 20;
  const btnY = panelY + panelH - btnH - 40;

  const hoveringYes =
    mouseX > yesBtnX &&
    mouseX < yesBtnX + btnW &&
    mouseY > btnY &&
    mouseY < btnY + btnH;
  const hoveringNo =
    mouseX > noBtnX &&
    mouseX < noBtnX + btnW &&
    mouseY > btnY &&
    mouseY < btnY + btnH;

  // Yes
  fill(hoveringYes ? color(250, 219, 177) : color(240, 193, 130));
  rect(yesBtnX, btnY, btnW, btnH, 30);
  fill(56, 29, 16);
  textSize(26);
  textAlign(CENTER, CENTER);
  textFont(mainFont);
  text("Yes", yesBtnX + btnW / 2, btnY + btnH / 2 - 5);

  // No
  fill(hoveringNo ? color(250, 219, 177) : color(240, 193, 130));
  rect(noBtnX, btnY, btnW, btnH, 30);
  fill(56, 29, 16);
  textFont(mainFont);
  text("No", noBtnX + btnW / 2, btnY + btnH / 2 - 5);
}

function handleConfirmEndDayClick(mx, my) {
  if (!confirmEndDayOpen) return false;

  const panelW = 520;
  const panelH = 280;
  const panelX = width / 2 - panelW / 2;
  const panelY = height / 2 - panelH / 2;

  // X button
  const xSize = 36;
  const xX = panelX + panelW - xSize / 2 - 10;
  const xY = panelY + xSize / 2 + 10;
  if (dist(mx, my, xX, xY) < xSize / 2) {
    confirmEndDayOpen = false;
    return true;
  }

  // Yes / No buttons
  const btnW = 180;
  const btnH = 55;
  const yesBtnX = width / 2 - btnW - 20;
  const noBtnX = width / 2 + 20;
  const btnY = panelY + panelH - btnH - 30;

  if (mx > yesBtnX && mx < yesBtnX + btnW && my > btnY && my < btnY + btnH) {
    confirmEndDayOpen = false;
    advanceDay();
    return true;
  }

  if (mx > noBtnX && mx < noBtnX + btnW && my > btnY && my < btnY + btnH) {
    confirmEndDayOpen = false;
    return true;
  }

  return true; // click consumed — don't let anything behind the modal fire
}

function advanceDay() {
  dayTransitionLocked = true; // lock all input immediately
  currentDay++;

  // swap each NPC's dialogue to the new day
  for (let npc of npcs) {
    if (npc.dialogueByDay && npc.dialogueByDay[currentDay]) {
      npc.dialogue = npc.dialogueByDay[currentDay];
    }
    npc.usedOptions = [];
    npc.firstVisit = true;
  }

  // reset spoons
  spoonsRemaining = 7;
  lowCookieNotifTriggered = false;
  lowCookieNotifVisible = false;
  dayEndTriggered = false;
  cookieJarResetDay();
  // reset out-of-cookies modal state for new day
  hasShownOutOfCookiesModal = false;
  outOfCookiesModalOpen = false;
  outOfCookiesPending = false;
  sleepHintActive = false;
  refillHintActive = false;

  // close any open dialogue
  closeDialogue();

  // show end screen — timing and fade handled in draw()
  endScreenAlpha = 255;
  endDayTimer = 0;
  currentScene = "END";
}

function isMouseOverNPC(npc) {
  const wx = mouseX / CAM_ZOOM + camX;
  const wy = mouseY / CAM_ZOOM + camY;
  const hw = ((npc.spriteFrameW || 48) * NPC_CHAR_SCALE) / 2;
  const hh = ((npc.spriteFrameH || 48) * NPC_CHAR_SCALE) / 2;
  return (
    wx > npc.x - hw &&
    wx < npc.x + hw &&
    wy > npc.y - 8 - hh &&
    wy < npc.y - 8 + hh
  );
}

function drawLowCookieNotif() {
  if (!lowCookieNotifVisible) return;

  // count down timer
  lowCookieNotifTimer--;
  if (lowCookieNotifTimer <= 0) {
    lowCookieNotifVisible = false;
    return;
  }

  let nW = 420;
  let nH = 82;
  let nX = width - nW - 20;
  let nY = 120; // below journal icon

  // fade out in last 60 frames
  let alpha =
    lowCookieNotifTimer < 60 ? map(lowCookieNotifTimer, 0, 60, 0, 255) : 255;

  fill(107, 59, 34, alpha);
  rect(nX, nY, nW, nH, 20);

  // message text
  fill(255, 255, 255, alpha);
  textSize(16);
  textAlign(LEFT, CENTER);
  textFont(mainFont);
  text("Be careful, your energy is running low", nX + 16, nY + nH / 2 - 8);

  // progress bar along the bottom
  let barW = nW - 32;
  let barH = 6;
  let barX = nX + 16;
  let barY = nY + nH - 19;
  let progress = lowCookieNotifTimer / LOW_COOKIE_NOTIF_DURATION;

  fill(255, 255, 255, alpha * 0.3);
  noStroke();
  rect(barX, barY, barW, barH, 3);

  fill(255, 200, 50, alpha);
  rect(barX, barY, barW * progress, barH, 3);

  // X button
  let xSize = 26;
  let xX = nX + nW - xSize - 8;
  let xY = nY + 8;

  const hoveringX =
    mouseX > xX && mouseX < xX + xSize && mouseY > xY && mouseY < xY + xSize;

  fill(255, 255, 255, hoveringX ? alpha : alpha * 0.6);
  textSize(18);
  textAlign(CENTER, CENTER);
  textFont(jersey10Font);
  text("X", xX + xSize / 2, xY + xSize / 2);
  textFont(mainFont);
}

function updateHoverCursor() {
  let hovering = false;

  // Home screen "Press ENTER to start"
  if (currentScene === "HOME") {
    const ty = height * 0.5 - 20;
    if (mouseY > ty - 16 && mouseY < ty + 16) hovering = true;
  }

  // NPC talk prompt pill
  if (npcPromptBounds) {
    const b = npcPromptBounds;
    if (
      mouseX > b.x &&
      mouseX < b.x + b.w &&
      mouseY > b.y &&
      mouseY < b.y + b.h
    )
      hovering = true;
  }

  // Dialogue box (advance / typewriter-skip click target)
  if (
    dialogueBoxBounds &&
    dialoguePhase !== "choosing" &&
    dialoguePhase !== "repeat-choosing"
  ) {
    const b = dialogueBoxBounds;
    if (
      mouseX > b.x &&
      mouseX < b.x + b.w &&
      mouseY > b.y &&
      mouseY < b.y + b.h
    )
      hovering = true;
  }

  if (dialoguePhase === "choosing" || dialoguePhase === "repeat-choosing") {
    selectedOption = -1;
    const btnW = 450;
    const btnH = 90;
    const btnX = width * 0.63 - 40;
    const startY = height * 0.12 + 15;
    const gap = btnH + 30;

    const visibleIndices = getVisibleOptionIndices();
    for (let i = 0; i < visibleIndices.length; i++) {
      const btnY = startY + i * gap;
      if (
        mouseX > btnX &&
        mouseX < btnX + btnW &&
        mouseY > btnY &&
        mouseY < btnY + btnH
      ) {
        hovering = true;
        selectedOption = visibleIndices[i];
        break;
      }
    }
  }

  // NPC sprites (world-space hit test)
  if (dialoguePhase === "closed" && currentScene === "GAME") {
    for (const npc of npcs) {
      if (isMouseOverNPC(npc)) {
        hovering = true;
        break;
      }
    }
  }

  const clickCursor = "url('assets/cursor-click.png') 4 4, auto";
  const defaultCursor = "url('assets/cursor-default.png') 4 4, auto";
  const next = hovering || mouseIsPressed ? clickCursor : defaultCursor;
  if (next !== updateHoverCursor._last) {
    document.body.style.cursor = next;
    updateHoverCursor._last = next;
  }
}

function resetGameState() {
  // Core progression
  currentDay = 1;
  judgePhase = "closed";
  judgeSelectedPortrait = -1;
  judgement = false;
  musicStarted = false;

  // Cookies / energy
  spoonsRemaining = 7;
  lowCookieNotifTriggered = false;
  lowCookieNotifVisible = false;
  lowCookieNotifTimer = 0;
  hasShownOutOfCookiesModal = false;
  outOfCookiesModalOpen = false;
  outOfCookiesPending = false;
  sleepHintActive = false;
  refillHintActive = false;

  // Day transition
  dayTransitionLocked = false;
  dayEndTriggered = false;
  confirmEndDayOpen = false;
  endDayTimer = 0;
  endScreenAlpha = 255;

  // Dialogue
  closeDialogue();
  activeExamineItem = null;

  // Journal — wipe all entries and unread flag
  journal = new Journal();

  // NPC state — reset dialogue back to day 1, clear used options
  for (let npc of npcs) {
    if (npc.dialogueByDay && npc.dialogueByDay[1]) {
      npc.dialogue = npc.dialogueByDay[1];
    }
    npc.usedOptions = [];
    npc.firstVisit = true;
  }

  // Evidence / clutter — clear examined flags on all interactable items
  for (let item of roomLayout) {
    if (item.examined !== undefined) item.examined = false;
  }

  // Cookie jar
  cookieJarResetDay();

  // Player position back to spawn
  player.px = 6.5 * TF1_T;
  player.py = 12.5 * TF1_T;
  player.dir = DIR.down;
  player.moving = false;
  player.frame = 0;
  player.animTimer = 0;

  // Camera snap to player (no lerp drift)
  camX = player.px - width / (2 * CAM_ZOOM);
  camY = player.py - height / (2 * CAM_ZOOM);

  // Music
  if (backgroundMusic && backgroundMusic.isPlaying()) backgroundMusic.stop();

  // Credits scroll
  creditsScrollY = 0;
}

function drawCloseButton(x, y, size = 36) {
  const hovering =
    mouseX > x - size / 2 &&
    mouseX < x + size / 2 &&
    mouseY > y - size / 2 &&
    mouseY < y + size / 2;

  // Circle background
  noStroke();
  fill(hovering ? color(180, 60, 60) : color(120, 40, 40));
  ellipse(x, y, size, size);

  // X mark
  fill(255);
  textSize(30);
  textAlign(CENTER, CENTER);
  textFont(jersey10Font);
  text("×", x, y - 4);

  return hovering;
}

function keyPressed() {
  if (dayTransitionLocked) return; // ignore all input during day transition
  if (confirmEndDayOpen) return; // modal is open — keyboard does nothing

  if (currentScene === "HOME") {
    if (keyCode === ENTER) {
      currentScene = "PROLOGUE1";
      prologue1Video.play();
      prologue1Video.elt.onended = () => { currentScene = "CHECKIN"; checkinSetup(); };
    }
    return;
  }

  if (currentScene === "PROLOGUE1" || currentScene === "PROLOGUE") {
    _checkinCheatBuf += key;
    if (_checkinCheatBuf.length > 5) _checkinCheatBuf = _checkinCheatBuf.slice(-5);
    if (_checkinCheatBuf === "12345") {
      _checkinCheatBuf = "";
      if (currentScene === "PROLOGUE1") {
        prologue1Video.stop(); prologue1Video.hide();
        currentScene = "CHECKIN"; checkinSetup();
      } else {
        prologueVideo.stop(); prologueVideo.hide();
        closeDialogue(); currentScene = "GAME";
      }
    }
    return;
  }

  if (judgePhase === "good_ending" || judgePhase === "bad_ending") {
    judgePhase = "closed";
    judgeSelectedPortrait = -1;
    creditsScrollY = 0;
    currentScene = "CREDITS";
    return;
  }

  if (currentScene === "CHECKIN") {
    _checkinCheatBuf += key;
    if (_checkinCheatBuf.length > 5)
      _checkinCheatBuf = _checkinCheatBuf.slice(-5);
    if (_checkinCheatBuf === "12345") {
      _checkinCheatBuf = "";
      closeDialogue();
      currentScene = "GAME";
      return;
    }
    if (dialoguePhase === "closed") return; // walk phase — nothing else to handle
  }

  if (currentScene === "WHODUNNIT") {
    if (wdPhase === "gustall_video" || wdPhase === "jerome_video" || wdPhase === "krisia_video") return; // no skipping
    if (dialoguePhase === "closed") return;
    // else fall through to E/Space handler for dialogue advancement
  }

  if (currentScene === "END") {
    if (key === "e" || key === "E" || key === " " || keyCode === ENTER) {
      if (endFadeTimeout) {
        clearTimeout(endFadeTimeout);
        endFadeTimeout = null;
      }
      if (endFadeInterval) {
        clearInterval(endFadeInterval);
        endFadeInterval = null;
      }
      endScreenAlpha = 0;
      currentScene = "GAME";
    }
    return;
  }

  if (currentScene === "PROLOGUE1" || currentScene === "PROLOGUE") return;

  if (isPlayerNearDoor1(player) && key === " ") {
    if (currentDay < TOTAL_DAYS) {
      confirmEndDayOpen = true; // open modal — only Yes will call advanceDay()
    }
    // day 3: G does nothing until verdict is implemented
    return;
  }

  if (key === "j" || key === "J") {
    journal.toggle();
  }

  if (journal.isOpen) {
    if (keyCode === LEFT_ARROW || key === "a" || key === "A") {
      journal.prevPage();
      return;
    }
    if (keyCode === RIGHT_ARROW || key === "d" || key === "D") {
      journal.nextPage();
      return;
    }
  }

  if (key === "E" || key === "e" || key === " ") {
    // If text is still animating, skip to full text instead of advancing
    const choosingPhase =
      dialoguePhase === "choosing" || dialoguePhase === "repeat-choosing";
    if (!typewriterDone && dialoguePhase !== "closed" && !choosingPhase) {
      skipTypewriter();
      return;
    }

    if (dialoguePhase === "closed") {
      for (let npc of npcs) {
        if (npc.isPlayerNearby(player)) {
          openDialogue(npc);
          return;
        }
      }
      if (isPlayerNearCookieJar(player)) {
        cookieJarInteract();
        return;
      }
      // Check interactable evidence objects
      const nearItem = getInteractableNearPlayer(player);
      if (nearItem) {
        if (nearItem.asset === "phone" && currentDay === 3) {
          judgePhase = "confirm";
          judgeSelectedPortrait = -1;
        } else {
          // Mark examined (phone stays interactive across days)
          if (nearItem.asset !== "phone") nearItem.examined = true;
          if (nearItem.journalEntry) {
            journal.addTextEntry(4, nearItem.journalEntry); // 4 = Evidence page
          }
          if (nearItem.helenEntry) {
            journal.addHelenEntry(
              nearItem.helenEntry.section,
              nearItem.helenEntry.text,
            );
          }
          if (nearItem.closeupAsset) {
            journal.addImageEntry(
              4,
              nearItem.closeupAsset,
              nearItem.closeupLabel,
              nearItem.asset,
            );
          }
          activeExamineItem = nearItem;
          chosenOption = { monologue: nearItem.monologue || "…" };
          startMonologue(nearItem.monologue || "…");
        }
        return;
      }
    } else if (dialoguePhase === "opening") {
      dialoguePhase = "choosing";
    } else if (
      (dialoguePhase === "choosing" || dialoguePhase === "repeat-choosing") &&
      selectedOption === -1
    ) {
      handleExit();
    } else if (dialoguePhase === "repeat") {
      if (spoonsRemaining === 0) {
        closeDialogue();
      } else {
        dialoguePhase = "repeat-choosing";
      }
    } else if (dialoguePhase === "exchange") {
      if (!typewriterDone) {
        skipTypewriter();
      } else {
        advanceExchange();
      }
    } else if (dialoguePhase === "response" || dialoguePhase === "response2") {
      if (pendingResponseQueue.length > 0) {
        dialoguePhase = "response2";
        startTypewriter(pendingResponseQueue.shift());
      } else {
        startMonologue(chosenOption.monologue);
      }
    } else if (dialoguePhase === "monologue") {
      if (monologuePageIndex < monologuePages.length - 1) {
        monologuePageIndex++;
        startTypewriter(monologuePages[monologuePageIndex]);
      } else {
        closeDialogue();
      }
    } else if (dialoguePhase === "hesitation") {
      closeDialogue();
    }
  }
  if (judgeKeyPressed(key)) {
    return;
  }

  // In keyPressed() — CREDITS enter/escape
  if (currentScene === "CREDITS") {
    if (keyCode === ENTER || keyCode === ESCAPE) {
      resetGameState();
      currentScene = "HOME";
    }
    return;
  }
}

function mousePressed() {
  // modals take full priority
  if (outOfCookiesModalOpen) {
    handleOutOfCookiesClick(mouseX, mouseY);
    return;
  }
  if (confirmEndDayOpen) {
    handleConfirmEndDayClick(mouseX, mouseY);
    return;
  }

  if (judgePhase === "good_ending" || judgePhase === "bad_ending") {
    judgePhase = "closed";
    judgeSelectedPortrait = -1;
    creditsScrollY = 0;
    currentScene = "CREDITS";
    return;
  }

  // dismiss guidance notif X button
  if (sleepHintActive || refillHintActive) {
    const nW = 460,
      nH = 82;
    const nX = width - nW - 20,
      nY = 210;
    const xSize = 20;
    const xX = nX + nW - xSize - 8;
    const xY = nY + 8;
    if (
      mouseX > xX &&
      mouseX < xX + xSize &&
      mouseY > xY &&
      mouseY < xY + xSize
    ) {
      sleepHintActive = false;
      refillHintActive = false;
      return;
    }
  }

  // dismiss cookie notif
  if (lowCookieNotifVisible) {
    let nW = 420;
    let nH = 82;
    let nX = width - nW - 20;
    let nY = 120;
    let xSize = 20;
    let xX = nX + nW - xSize - 8;
    let xY = nY + 8;
    if (
      mouseX > xX &&
      mouseX < xX + xSize &&
      mouseY > xY &&
      mouseY < xY + xSize
    ) {
      lowCookieNotifVisible = false;
      return;
    }
  }

  handleSettingsClick(mouseX, mouseY);
  handlePhoneClick(mouseX, mouseY);

  if (currentScene === "PROLOGUE1" || currentScene === "PROLOGUE") return;

  if (currentScene === "HOME") {
    const ty = height * 0.5 - 20;
    if (mouseY > ty - 16 && mouseY < ty + 16) {
      currentScene = "PROLOGUE1";
      prologue1Video.play();
      prologue1Video.elt.onended = () => { currentScene = "CHECKIN"; checkinSetup(); };
      return;
    }
  }

  if (currentScene === "CHECKIN") {
    // delegate clicks to the real dialogue system — same logic as GAME
    if (dialoguePhase === "closed") return;
  }

  if (currentScene === "WHODUNNIT") {
    if (wdPhase === "gustall_video" || wdPhase === "jerome_video" || wdPhase === "krisia_video") return; // no skipping
    if (dialoguePhase === "closed") return;
    // else fall through to dialogue click handling
  }
  if (
    mouseX > width - 150 &&
    mouseX < width - 90 &&
    mouseY > 12 &&
    mouseY < 72
  ) {
    journal.toggle();
    return;
  }

  if (journal.isOpen) {
    journal.handleClick(mouseX, mouseY);
    return;
  }

  // NPC talk prompt click
  if (npcPromptBounds) {
    const b = npcPromptBounds;
    if (
      mouseX > b.x &&
      mouseX < b.x + b.w &&
      mouseY > b.y &&
      mouseY < b.y + b.h
    ) {
      openDialogue(b.npc);
      return;
    }
  }

  // NPC sprite click (only when player is nearby)
  if (dialoguePhase === "closed" && currentScene === "GAME") {
    for (const npc of npcs) {
      if (isMouseOverNPC(npc) && npc.isPlayerNearby(player)) {
        openDialogue(npc);
        return;
      }
    }
  }

  // Dialogue box click — same logic as pressing Enter (skips typewriter first)
  if (
    dialogueBoxBounds &&
    dialoguePhase !== "choosing" &&
    dialoguePhase !== "repeat-choosing"
  ) {
    const b = dialogueBoxBounds;
    if (
      mouseX > b.x &&
      mouseX < b.x + b.w &&
      mouseY > b.y &&
      mouseY < b.y + b.h
    ) {
      if (!typewriterDone) {
        skipTypewriter();
        return;
      }
      // advance phase (mirror Enter key logic for non-choosing phases)
      if (dialoguePhase === "opening") {
        dialoguePhase = "choosing";
      } else if (dialoguePhase === "repeat") {
        if (spoonsRemaining === 0) closeDialogue();
        else dialoguePhase = "repeat-choosing";
      } else if (dialoguePhase === "exchange") {
        if (!typewriterDone) skipTypewriter();
        else advanceExchange();
      } else if (
        dialoguePhase === "response" ||
        dialoguePhase === "response2"
      ) {
        if (pendingResponseQueue.length > 0) {
          dialoguePhase = "response2";
          startTypewriter(pendingResponseQueue.shift());
        } else {
          startMonologue(chosenOption.monologue);
        }
      } else if (dialoguePhase === "monologue") {
        if (monologuePageIndex < monologuePages.length - 1) {
          monologuePageIndex++;
          startTypewriter(monologuePages[monologuePageIndex]);
        } else {
          closeDialogue();
        }
      } else if (dialoguePhase === "hesitation") {
        closeDialogue();
      }
      return;
    }
  }

  if (dialoguePhase === "choosing" || dialoguePhase === "repeat-choosing") {
    const btnW = 450;
    const btnH = 90;
    const btnX = width * 0.63 - 40;
    const startY = height * 0.12 + 15;
    const gap = btnH + 30;

    const visibleIndices = getVisibleOptionIndices();

    for (let i = 0; i < visibleIndices.length; i++) {
      const btnY = startY + i * gap;
      if (isMouseOver(btnX, btnY, btnW, btnH)) {
        selectedOption = visibleIndices[i];
        confirmChoice();
        return;
      }
    }
  }

  if (currentScene === "CREDITS") {
    const btnW = 240,
      btnH = 48;
    const btnX = width / 2 - btnW / 2;
    const btnY = height - 80;
    if (
      mouseX > btnX &&
      mouseX < btnX + btnW &&
      mouseY > btnY &&
      mouseY < btnY + btnH
    ) {
      resetGameState();
      currentScene = "HOME";
    }
    return;
  }
}
