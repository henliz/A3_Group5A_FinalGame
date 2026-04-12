let dialoguePhase = "closed";
let activeNPC = null;
let selectedOption = 0;
let spoonsRemaining = 7;
let chosenOption = null;
let pendingResponseQueue = [];

let monologuePages = [];
let monologuePageIndex = 0;

const tooTiredLine = "Gosh… I couldn't bring myself to ask them that.";

let dialogueBoxBounds = null;

// Typewriter effect state
let typewriterTarget = "";
let typewriterIndex = 0;
let typewriterDone = true;
let typewriterFrame = 0;
const TYPEWRITER_SPEED = 2;

// ─── Exchange state ───────────────────────────────────────────
// exchangeLines: full array of exchange entries for the chosen option
// exchangeLineIndex: which entry we are currently on
// exchangeChunkIndex: which text chunk within that entry (text, text2, text3…)
let exchangeLines = [];
let exchangeLineIndex = 0;
let exchangeChunkIndex = 0;

//portraits changes
let littleRedEmotion = "idle";

// ─── Typewriter helpers ───────────────────────────────────────
function startTypewriter(text) {
  typewriterTarget = text || "";
  typewriterIndex = 0;
  typewriterFrame = 0;
  typewriterDone = typewriterTarget.length === 0;
}

function skipTypewriter() {
  typewriterIndex = typewriterTarget.length;
  typewriterDone = true;
}

function tickTypewriter() {
  if (typewriterDone) return;
  typewriterFrame++;
  if (typewriterFrame >= TYPEWRITER_SPEED) {
    typewriterFrame = 0;
    typewriterIndex++;
    if (typewriterIndex >= typewriterTarget.length) {
      typewriterIndex = typewriterTarget.length;
      typewriterDone = true;
    }
  }
}

// ─── Exchange helpers ─────────────────────────────────────────

// Returns all defined text chunks for a single exchange entry in order
function getExchangeChunks(entry) {
  let chunks = [];
  if (entry.text) chunks.push(entry.text);
  if (entry.text2) chunks.push(entry.text2);
  if (entry.text3) chunks.push(entry.text3);
  if (entry.text4) chunks.push(entry.text4);
  return chunks;
}

// True if the current exchange line is spoken by Little Red
function exchangePlayerSpeaking() {
  if (!exchangeLines || exchangeLines.length === 0) return false;
  return exchangeLines[exchangeLineIndex].speaker === "player";
}

// Applies emotion from the current exchange entry to the right portrait
function applyExchangeEmotion() {
  if (!exchangeLines || exchangeLines.length === 0) return;
  let entry = exchangeLines[exchangeLineIndex];
  if (!entry) return;
  if (entry.speaker === "npc" && activeNPC) {
    activeNPC.currentEmotion = entry.emotion || "idle";
  }
  if (entry.speaker === "player") {
    littleRedEmotion = entry.emotion || "idle";
  }
  // Fire Helen journal entry if this exchange line has one
  if (entry.helenEntry && typeof journal !== "undefined") {
    journal.addHelenEntry(entry.helenEntry.section, entry.helenEntry.text);
  }
}

// Called from confirmChoice() when option.exchange exists.
// Sets up exchange state and starts the first line.
function startExchange(lines) {
  exchangeLines = lines;
  exchangeLineIndex = 0;
  exchangeChunkIndex = 0;
  dialoguePhase = "exchange";
  applyExchangeEmotion();
  let chunks = getExchangeChunks(lines[0]);
  startTypewriter(chunks[0] || "");
}

// Called from E key / mouse when dialoguePhase === "exchange".
// Advances chunks within the current entry first, then to the next entry.
// When all entries are done, hands off cleanly to "response" phase.
function advanceExchange() {
  let entry = exchangeLines[exchangeLineIndex];
  let chunks = getExchangeChunks(entry);

  // More chunks left in this entry?
  if (exchangeChunkIndex < chunks.length - 1) {
    exchangeChunkIndex++;
    startTypewriter(chunks[exchangeChunkIndex]);
    return;
  }

  // Move to next entry
  exchangeLineIndex++;
  exchangeChunkIndex = 0;

  if (exchangeLineIndex < exchangeLines.length) {
    applyExchangeEmotion();
    let nextChunks = getExchangeChunks(exchangeLines[exchangeLineIndex]);
    startTypewriter(nextChunks[0] || "");
    return;
  }

  // All exchange lines exhausted — decide what comes next
  exchangeLines = [];
  exchangeLineIndex = 0;
  exchangeChunkIndex = 0;

  // Build pending response queue from the chosen option
  pendingResponseQueue = [];
  if (chosenOption.npcResponse2)
    pendingResponseQueue.push(chosenOption.npcResponse2);
  if (chosenOption.npcResponse3)
    pendingResponseQueue.push(chosenOption.npcResponse3);
  if (chosenOption.npcResponse4)
    pendingResponseQueue.push(chosenOption.npcResponse4);

  // Do we have ANY npc response content?
  const hasAnyNpcResponse =
    !!chosenOption.npcResponse || pendingResponseQueue.length > 0;

  if (hasAnyNpcResponse) {
    dialoguePhase = "response";

    if (chosenOption.npcResponse) {
      startTypewriter(chosenOption.npcResponse);
    } else {
      startTypewriter(pendingResponseQueue.shift());
    }
  } else {
    // No NPC response at all — go straight to monologue
    startMonologue(chosenOption.monologue);
  }
}

// ─── Open / Close ─────────────────────────────────────────────
function openDialogue(npc) {
  activeNPC = npc;

  let visible = getVisibleOptionIndices();
  selectedOption = visible.length > 0 ? visible[0] : 0;

  if (spoonsRemaining === 0) {
    dialoguePhase = "hesitation";
    startTypewriter(npc.dialogue.hesitationLine);
    return;
  }

  if (npc.firstVisit) {
    dialoguePhase = "opening";
    startTypewriter(npc.dialogue.opening);
  } else {
    dialoguePhase = "repeat";
    startTypewriter(npc.dialogue.repeatLine);
  }
}

function closeDialogue() {
  if (activeNPC) {
    activeNPC.firstVisit = false;
  }
  activeNPC = null;
  chosenOption = null;
  dialoguePhase = "closed";
  pendingResponseQueue = [];
  monologuePages = [];
  monologuePageIndex = 0;
  // reset exchange state
  exchangeLines = [];
  exchangeLineIndex = 0;
  exchangeChunkIndex = 0;
  littleRedEmotion = "idle";
  if (typeof activeExamineItem !== "undefined") activeExamineItem = null;
}

// ─── Draw dialogue ────────────────────────────────────────────
function drawDialogue() {
  if (dialoguePhase === "closed") {
    dialogueBoxBounds = null;
    return;
  }
  tickTypewriter();

  let boxW = 1857 / 3;
  let boxH = 681 / 3;
  let boxX = width * 0.12;
  let boxY = height - boxH - 20;

  dialogueBoxBounds = { x: boxX, y: boxY, w: boxW, h: boxH };

  drawPortrait(boxX, boxY, boxW);
  drawDialogueBox(boxX, boxY, boxW, boxH);
  drawNameTag(boxX, boxY, boxW);
  drawDialogueText(boxX, boxY, boxW, boxH);
  drawEnterHint(boxX, boxY, boxW, boxH);

  if (dialoguePhase === "choosing" || dialoguePhase === "repeat-choosing") {
    drawOptions();
  }
}

function handleExit() {
  let exitText =
    activeNPC.dialogue.exitMonologue || "Maybe I should talk to someone else…";
  chosenOption = {
    monologue: exitText,
    cost: -1,
    npcResponse: null,
  };
  startMonologue(exitText);
}

function startMonologue(text) {
  monologuePages = splitMonologueIntoPages(text);
  monologuePageIndex = 0;
  dialoguePhase = "monologue";
  startTypewriter(monologuePages[0]);
}

// ─── Portrait / nametag / box helpers ────────────────────────
// Single source of truth: is Little Red currently the speaker?
function isLittleRedSpeaking() {
  if (dialoguePhase === "monologue") return true;
  if (dialoguePhase === "hesitation") return true;
  if (dialoguePhase === "exchange" && exchangePlayerSpeaking()) return true;
  return false;
}

function drawPortrait(boxX, boxY, boxW) {
  let pW = 300;
  let pH = 420;
  let pY = boxY - pH; // bottom of portrait sits flush with top of dialogue box

  if (isLittleRedSpeaking()) {
    let pX = boxX + boxW - pW - 20;
    if (portraits.littleRed) {
      let lrEmotion = littleRedEmotion || "idle";
      let lrPortrait =
        portraits.littleRed[lrEmotion] || portraits.littleRed.idle;
      image(lrPortrait, pX, pY, pW, pH);
    } else {
      fill(200, 150, 150);
      noStroke();
      rect(pX, pY, pW, pH, 8);
      fill(80);
      textSize(12);
      textAlign(CENTER, CENTER);
      text("Little Red", pX + pW / 2, pY + pH / 2);
    }
  } else {
    let pX = boxX + 20;
    let portraitImg = getActivePortrait();
    if (portraitImg) {
      image(portraitImg, pX, pY, pW, pH);
    } else {
      fill(150, 150, 200);
      noStroke();
      rect(pX, pY, pW, pH, 8);
      fill(80);
      textSize(12);
      textAlign(CENTER, CENTER);
      text(
        activeNPC ? activeNPC.dialogue.name || "NPC" : "NPC",
        pX + pW / 2,
        pY + pH / 2,
      );
    }
  }
}

function getActivePortrait() {
  if (!activeNPC || !activeNPC.portraitKey) return null;
  let npcPortraits = portraits[activeNPC.portraitKey];
  if (!npcPortraits) return null;
  let emotion = activeNPC.currentEmotion || "idle";
  return npcPortraits[emotion] || npcPortraits.idle || null;
}

function drawNameTag(boxX, boxY, boxW) {
  let tagH = 70;
  let tagY = boxY - tagH;

  if (isLittleRedSpeaking()) {
    let tagW = 180;
    let tagX = boxX + boxW - tagW - 20;
    fill(168, 86, 21);
    noStroke();
    rect(tagX, tagY, tagW, tagH, 4);
    fill(255);
    textSize(38);
    textAlign(CENTER, CENTER);
    text("Little Red", tagX + tagW / 2, tagY + tagH / 2.5);
  } else if (activeNPC && activeNPC.dialogue.name) {
    textSize(38);
    let tagW = textWidth(activeNPC.dialogue.name) + 60;
    let tagX = boxX + 20;
    fill(168, 86, 21);
    noStroke();
    rect(tagX, tagY, tagW, tagH, 4);
    fill(255);
    textAlign(CENTER, CENTER);
    text(activeNPC.dialogue.name, tagX + tagW / 2, tagY + tagH / 2.5);
  }
}

function drawDialogueBox(boxX, boxY, boxW, boxH) {
  const useMonologueBox =
    dialoguePhase === "monologue" || dialoguePhase === "hesitation";

  if (useMonologueBox) {
    image(uiMonologueBox, boxX, boxY, boxW, boxH);
  } else {
    image(uiMainBox, boxX, boxY, boxW, boxH);
  }
}

// ─── Dialogue text ────────────────────────────────────────────
function drawDialogueText(boxX, boxY, boxW, boxH) {
  let textX = boxX + 50;
  let textW = boxW - 75;
  let revealed = typewriterTarget.substring(0, typewriterIndex);

  fill(255);
  textSize(30);
  textAlign(LEFT, TOP);

  let useItalic = false;

  // Monologue / hesitation are always italic
  if (dialoguePhase === "monologue" || dialoguePhase === "hesitation") {
    useItalic = true;
  }

  // Exchange: allow per-line italic control
  if (dialoguePhase === "exchange" && exchangeLines[exchangeLineIndex]) {
    useItalic = !!exchangeLines[exchangeLineIndex].italic;
  }

  if (useItalic) textStyle(ITALIC);
  text(revealed, textX, boxY + 40, textW, boxH - 80);
  textStyle(NORMAL);
}

// ─── Enter hint ───────────────────────────────────────────────
function drawEnterHint(boxX, boxY, boxW, boxH) {
  if (dialoguePhase === "choosing" || dialoguePhase === "repeat-choosing")
    return;
  if (!typewriterDone) return;

  const hintX = boxX + boxW - 60;
  const hintY = boxY + boxH - 25;

  const hinting =
    dialogueBoxBounds &&
    mouseX > dialogueBoxBounds.x &&
    mouseX < dialogueBoxBounds.x + dialogueBoxBounds.w &&
    mouseY > dialogueBoxBounds.y &&
    mouseY < dialogueBoxBounds.y + dialogueBoxBounds.h;

  fill(255, 255, 255, hinting ? 255 : 200);
  textSize(18);
  textAlign(RIGHT, BOTTOM);
  text("Press SPACE to continue", hintX, hintY);
}

// ─── Options ──────────────────────────────────────────────────
function isMouseOver(x, y, w, h) {
  return mouseX > x && mouseX < x + w && mouseY > y && mouseY < y + h;
}

function drawOptions() {
  if (!activeNPC) return;

  let btnW = 1080 / 3;
  let btnH = 241 / 3;
  let btnX = width * 0.6;
  let startY = height * 0.4;
  let gap = btnH + 10;

  let visibleIndices = getVisibleOptionIndices();

  for (let drawnIndex = 0; drawnIndex < visibleIndices.length; drawnIndex++) {
    let i = visibleIndices[drawnIndex];
    let option = activeNPC.dialogue.options[i];
    let btnY = startY + drawnIndex * gap;
    let canAfford = spoonsRemaining >= option.cost;

    if (!canAfford) {
      image(uiBtnDisabled, btnX, btnY, btnW, btnH);
    } else if (i === selectedOption) {
      image(uiBtnHover, btnX, btnY, btnW, btnH);
    } else {
      image(uiBtnRegular, btnX, btnY, btnW, btnH + 18);
    }

    if (i === selectedOption && canAfford) {
      fill(255);
    } else if (!canAfford) {
      fill(100, 100, 100);
    } else {
      fill(30, 30, 30);
    }

    textSize(18);
    textAlign(LEFT, CENTER);
    text(option.playerLine, btnX + 13, btnY - 7, btnW - 60, btnH);

    let iconSize = 25;
    let iconX = btnX + btnW - iconSize - 8;
    let iconY = btnY + btnH / 2 - iconSize / 2;
    image(spoonImg, iconX, iconY, iconSize, iconSize);

    fill(i === selectedOption && canAfford ? 255 : 30);
    textAlign(RIGHT, CENTER);
    textSize(18);
    text(option.cost, btnX + btnW - iconSize - 12, btnY + btnH / 2);
  }
}

// ─── Confirm choice ───────────────────────────────────────────
function confirmChoice() {
  let option = activeNPC.dialogue.options[selectedOption];

  if (spoonsRemaining < option.cost) {
    chosenOption = { monologue: tooTiredLine, cost: -1, npcResponse: null };
    startMonologue(tooTiredLine);
    return;
  }

  spoonsRemaining -= option.cost;
  checkLowCookieNotif(); // show warning if energy is now low
  chosenOption = option;

  if (typeof CookieSound !== "undefined") {
    CookieSound.setVolume(0.25);
    CookieSound.play();
  }

  let visible = getVisibleOptionIndices();
  visible = visible.filter(
    (i) => activeNPC.dialogue.options[i].id !== option.id,
  );
  selectedOption = visible.length > 0 ? visible[0] : 0;

  activeNPC.usedOptions.push(option.id);

  if (option.notebookEntry && activeNPC.journalPageIndex !== undefined) {
    journal.addTextEntry(activeNPC.journalPageIndex, option.notebookEntry);
  }
  // Fire Helen entry attached directly to an option (not an exchange line)
  if (option.helenEntry) {
    journal.addHelenEntry(option.helenEntry.section, option.helenEntry.text);
  }

  // If the option has an exchange, start it.
  // npcResponse + queue will be picked up automatically when exchange finishes.
  if (option.exchange && option.exchange.length > 0) {
    startExchange(option.exchange);
    return;
  }

  // No exchange — existing response flow, unchanged
  pendingResponseQueue = [];
  if (option.npcResponse2) pendingResponseQueue.push(option.npcResponse2);
  if (option.npcResponse3) pendingResponseQueue.push(option.npcResponse3);
  if (option.npcResponse4) pendingResponseQueue.push(option.npcResponse4);

  dialoguePhase = "response";
  startTypewriter(option.npcResponse);
}

// ─── Misc helpers ─────────────────────────────────────────────
// checkLowCookieNotif — only job is to show the low-energy warning.
// Safe to call after any dialogue choice. Does NOT end the day.
function checkLowCookieNotif() {
  if (spoonsRemaining <= 2 && !lowCookieNotifTriggered) {
    lowCookieNotifVisible = true;
    lowCookieNotifTriggered = true;
    lowCookieNotifTimer = LOW_COOKIE_NOTIF_DURATION;
  }
}

function getVisibleOptionIndices() {
  if (!activeNPC) return [];
  let visible = [];
  let options = activeNPC.dialogue.options;
  for (let i = 0; i < options.length; i++) {
    if (activeNPC.usedOptions.includes(options[i].id)) continue;
    visible.push(i);
  }
  return visible;
}

function measureWrappedHeight(str, maxW, size) {
  textSize(size);
  let words = str.split(" ");
  let lineW = 0;
  let lines = 1;
  let spaceW = textWidth(" ");

  for (let word of words) {
    let parts = word.split("\n");
    for (let p = 0; p < parts.length; p++) {
      let ww = textWidth(parts[p]);
      if (p > 0) {
        lines++;
        lineW = 0;
      }
      if (lineW + ww > maxW && lineW > 0) {
        lines++;
        lineW = ww + spaceW;
      } else {
        lineW += ww + spaceW;
      }
    }
  }
  let lineH = textAscent() + textDescent() + 6;
  return lines * lineH;
}

function splitMonologueIntoPages(fullText) {
  let boxW = 1857 / 3;
  let boxH = 681 / 3;
  let usableW = boxW - 75;
  let usableH = boxH - 80;
  let size = 30;

  textSize(size);
  textStyle(ITALIC);

  let words = fullText.split(" ");
  let pages = [];
  let currentPage = "";

  for (let word of words) {
    let test = currentPage === "" ? word : currentPage + " " + word;
    if (
      measureWrappedHeight(test, usableW, size) > usableH &&
      currentPage !== ""
    ) {
      pages.push(currentPage);
      currentPage = word;
    } else {
      currentPage = test;
    }
  }
  if (currentPage !== "") pages.push(currentPage);

  textStyle(NORMAL);
  return pages.length > 0 ? pages : [""];
}

// ─── Exports ──────────────────────────────────────────────────
window.openDialogue = openDialogue;
window.closeDialogue = closeDialogue;
window.drawDialogue = drawDialogue;
window.dialoguePhase = dialoguePhase;
window.checkLowCookieNotif = checkLowCookieNotif;
window.startTypewriter = startTypewriter;
window.skipTypewriter = skipTypewriter;
window.handleExit = handleExit;
window.startMonologue = startMonologue;
window.advanceExchange = advanceExchange;
