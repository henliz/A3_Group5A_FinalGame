let dialoguePhase = "closed";
let activeNPC = null;
let selectedOption = 0; // which button is highlighted (0, 1, 2)
let spoonsRemaining = 7; // spoon budget for the day
let chosenOption = null; // stores the option the player picked
let pendingResponseQueue = []; // holds npcResponse2, 3, 4 in order

// CHANGE: added two variables to track monologue pages.
// monologuePages is an array of text chunks that fit inside the dialogue box.
// monologuePageIndex tracks which chunk we're currently showing.
let monologuePages = [];
let monologuePageIndex = 0;

const tooTiredLine = "Gosh… I couldn't bring myself to ask them that."; // dialogue for when you don't have enough spoons to choose a dialogue option

// Exposed dialogue box bounds so sketch.js can hit-test clicks/hover
let dialogueBoxBounds = null;

// Typewriter effect state
let typewriterTarget = "";
let typewriterIndex = 0;
let typewriterDone = true;
let typewriterFrame = 0;
const TYPEWRITER_SPEED = 2; // frames per character (~30 chars/sec at 60fps)

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

function openDialogue(npc) {
  activeNPC = npc;

  // reset to first visible option, not just index 0
  let visible = getVisibleOptionIndices();
  selectedOption = visible.length > 0 ? visible[0] : 0;

  if (spoonsRemaining === 0) {
    dialoguePhase = "hesitation"; // too tired to talk to anyone
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
  // CHANGE: clear monologue pages on close so they don't bleed into the next conversation
  monologuePages = [];
  monologuePageIndex = 0;
  // clear any active item examination
  if (typeof activeExamineItem !== "undefined") activeExamineItem = null;
}

function drawDialogue() {
  if (dialoguePhase === "closed") {
    dialogueBoxBounds = null;
    return;
  }
  tickTypewriter();

  let boxW = 1857 / 3; // control width only
  let boxH = 681 / 3; // height follows aspect ratio
  let boxX = width * 0.12; // left-aligned with small margin
  let boxY = height - boxH - 20; // pinned to bottom with padding

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
  // CHANGE: use startMonologue() instead of manually setting phase + typewriter,
  // so the exit monologue also gets auto-paged if it's long
  startMonologue(exitText);
}

// CHANGE: new helper function that handles starting a monologue.
// It splits the full text into pages that fit the box (whole words only),
// sets the phase to "monologue", and starts the typewriter on page 1.
// Call this anywhere you previously wrote:
//   dialoguePhase = "monologue"; startTypewriter(someText);
function startMonologue(text) {
  monologuePages = splitMonologueIntoPages(text);
  monologuePageIndex = 0;
  dialoguePhase = "monologue";
  startTypewriter(monologuePages[0]);
}

//helper functions for drawDialogue
function drawDialogueBox(boxX, boxY, boxW, boxH) {
  if (dialoguePhase === "monologue" || dialoguePhase === "hesitation") {
    image(uiMonologueBox, boxX, boxY, boxW, boxH);
  } else {
    image(uiMainBox, boxX, boxY, boxW, boxH);
  }
}

function drawPortrait(boxX, boxY, boxW) {
  let pW = 300;
  let pH = 420;
  let pY = boxY - pH * 0.9; // floats above the box

  if (dialoguePhase === "monologue" || dialoguePhase === "hesitation") {
    // Little Red on the RIGHT during monologue
    let pX = boxX + boxW - pW - 20;
    if (portraits.littleRed) {
      image(portraits.littleRed.idle, pX, pY, pW, pH);
    } else {
      // placeholder if image not loaded
      fill(200, 150, 150);
      noStroke();
      rect(pX, pY, pW, pH, 8);
      fill(80);
      textSize(12);
      textAlign(CENTER, CENTER);
      text("Little Red", pX + pW / 2, pY + pH / 2);
    }
  } else {
    // NPC portrait on the LEFT
    let pX = boxX + 20;
    let portraitImg = getActivePortrait();
    if (portraitImg) {
      image(portraitImg, pX, pY, pW, pH);
    } else {
      // placeholder if portrait not ready yet
      fill(150, 150, 200);
      noStroke();
      rect(pX, pY, pW, pH, 8);
      fill(80);
      textSize(12);
      textAlign(CENTER, CENTER);
      text(activeNPC.dialogue.name || "NPC", pX + pW / 2, pY + pH / 2);
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

  if (dialoguePhase === "monologue" || dialoguePhase === "hesitation") {
    // Little Red name tag on the RIGHT
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
    // NPC name tag on the LEFT
    textSize(38); // set size first so textWidth measures correctly
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

// CHANGE: helper that measures how tall a wrapped block of text would be
// at a given width and font size. Used by splitMonologueIntoPages() to know
// when a page is full. Words are never split — it only breaks at spaces.
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

// CHANGE: splits a full monologue string into an array of page strings,
// each of which fits inside the dialogue box without overflowing.
// Words are kept whole — no word is ever cut in half.
// Short monologues that fit in one page just return a single-element array
// and behave exactly as before.
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

function drawDialogueText(boxX, boxY, boxW, boxH) {
  // text starts after the portrait width so it doesn't overlap
  let textX = boxX + 50;
  let textW = boxW - 75;
  let revealed = typewriterTarget.substring(0, typewriterIndex);

  if (dialoguePhase === "hesitation") {
    fill(255);
    textStyle(ITALIC);
    textSize(30);
    textAlign(LEFT, TOP);
    text(revealed, textX, boxY + 40, textW, boxH - 80);
    textStyle(NORMAL);
    return;
  }

  // CHANGE: monologue rendering is now clean — no page-building here.
  // Pages are built once in startMonologue() before this ever runs,
  // so we just render whatever the typewriter is currently showing.
  if (dialoguePhase === "monologue" && chosenOption) {
    fill(255);
    textStyle(ITALIC);
    textSize(30);
    textAlign(LEFT, TOP);
    text(revealed, textX, boxY + 40, textW, boxH - 80);
    textStyle(NORMAL);
    return;
  }

  fill(255);
  textSize(30);
  textAlign(LEFT, TOP);

  if (dialoguePhase === "opening" || dialoguePhase === "choosing") {
    text(revealed, textX, boxY + 40, textW, boxH - 80);
  }
  if (dialoguePhase === "repeat" || dialoguePhase === "repeat-choosing") {
    text(revealed, textX, boxY + 40, textW, boxH - 80);
  }
  if (dialoguePhase === "response" && chosenOption) {
    text(revealed, textX, boxY + 40, textW, boxH - 80);
  }
  if (
    (dialoguePhase === "response" || dialoguePhase === "response2") &&
    chosenOption
  ) {
    text(revealed, textX, boxY + 40, textW, boxH - 80);
  }
}

function drawEnterHint(boxX, boxY, boxW, boxH) {
  // don't show during choosing — player knows to use W/S/Enter
  if (dialoguePhase === "choosing" || dialoguePhase === "repeat-choosing")
    return;
  // don't show until text has fully revealed
  if (!typewriterDone) return;

  const hintX = boxX + boxW - 60;
  const hintY = boxY + boxH - 25;

  // brighten on hover
  const hinting =
    dialogueBoxBounds &&
    mouseX > dialogueBoxBounds.x &&
    mouseX < dialogueBoxBounds.x + dialogueBoxBounds.w &&
    mouseY > dialogueBoxBounds.y &&
    mouseY < dialogueBoxBounds.y + dialogueBoxBounds.h;

  fill(255, 255, 255, hinting ? 255 : 200);
  textSize(18);
  textAlign(RIGHT, BOTTOM);
  text("Press 'E' to continue", hintX, hintY);
}

function isMouseOver(x, y, w, h) {
  //detects when the mouse is over a dialogue option box
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

    // draw button image
    if (!canAfford) {
      image(uiBtnDisabled, btnX, btnY, btnW, btnH);
    } else if (i === selectedOption) {
      image(uiBtnHover, btnX, btnY, btnW, btnH);
    } else {
      image(uiBtnRegular, btnX, btnY, btnW, btnH + 18);
    }

    // text colour
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

    // cookie cost badge on right
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

function confirmChoice() {
  let option = activeNPC.dialogue.options[selectedOption];

  // can't afford → show tooTired monologue
  if (spoonsRemaining < option.cost) {
    chosenOption = {
      monologue: tooTiredLine,
      cost: -1, // special value so it doesn't trigger exit
      npcResponse: null,
    };
    // CHANGE: use startMonologue() so the too-tired line is also auto-paged
    startMonologue(tooTiredLine);
    return;
  }

  spoonsRemaining -= option.cost;
  chosenOption = option;

  // cookie consume sound
  if (typeof CookieSound !== "undefined") {
    CookieSound.setVolume(0.25);
    CookieSound.play();
  }

  // low cookie notification
  if (spoonsRemaining <= 2 && !lowCookieNotifTriggered) {
    lowCookieNotifVisible = true;
    lowCookieNotifTriggered = true;
    lowCookieNotifTimer = LOW_COOKIE_NOTIF_DURATION;
  }

  // reset highlight to first visible option for next time buttons appear
  let visible = getVisibleOptionIndices();
  // filter out the option just chosen since it'll be gone next round
  visible = visible.filter(
    (i) => activeNPC.dialogue.options[i].id !== option.id,
  );
  selectedOption = visible.length > 0 ? visible[0] : 0;

  // mark this option as used
  activeNPC.usedOptions.push(option.id);

  // add notebook entry if this option has one
  if (option.notebookEntry && activeNPC.journalPageIndex !== undefined) {
    journal.addTextEntry(activeNPC.journalPageIndex, option.notebookEntry);
  }

  // build the queue from any extra response parts
  pendingResponseQueue = [];
  if (option.npcResponse2) pendingResponseQueue.push(option.npcResponse2);
  if (option.npcResponse3) pendingResponseQueue.push(option.npcResponse3);
  if (option.npcResponse4) pendingResponseQueue.push(option.npcResponse4);

  dialoguePhase = "response";
  startTypewriter(option.npcResponse);
}

function bedtime() {
  if (spoonsRemaining === 0 && dialoguePhase === "closed") {
    fill("black");
    rect(0, 0, width, height);

    fill("white");
    textSize(13);
    text(
      "With no more spoons left to give, little Red went off to bed. A restless slumber waiting just ahead.",
      width / 2,
      height / 2,
    );

    textSize(20);
    text("DAY 1 OVER", width / 2, height / 2 + 40);
    //so cookie low notification can be reset for the next day
    lowCookieNotifTriggered = false;
    lowCookieNotifVisible = false;
  }
}

function getVisibleOptionIndices() {
  if (!activeNPC) return [];
  let visible = [];
  let options = activeNPC.dialogue.options;

  for (let i = 0; i < options.length; i++) {
    let option = options[i];
    if (activeNPC.usedOptions.includes(option.id)) {
      continue;
    }
    visible.push(i);
  }
  return visible;
}

window.openDialogue = openDialogue;
window.closeDialogue = closeDialogue;
window.drawDialogue = drawDialogue;
window.dialoguePhase = dialoguePhase;
window.bedtime = bedtime;
window.startTypewriter = startTypewriter;
window.skipTypewriter = skipTypewriter;
window.handleExit = handleExit;
// CHANGE: export startMonologue so sketch.js can call it when transitioning
// from a response phase into the monologue phase
window.startMonologue = startMonologue;
