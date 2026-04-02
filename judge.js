let judgePhase = "closed";
let judgePortraits = [];
let judgeSelectedPortrait = -1;
let judgeConfirmed = false;
function judgeIsActive() {
  return judgePhase !== "closed";
}

function judgeKeyPressed(k) {
  if (
    judgePhase === "closed" &&
    dialoguePhase === "closed" &&
    !journal.isOpen &&
    currentDay === 3 &&
    judgement === true
  ) {
    judgePhase = "confirm";
    judgeSelectedPortrait = -1;
    return true;
  }
  return false;
}

function drawJudgement() {
  if (judgePhase === "closed") return;

  if (judgePhase === "confirm") {
    _drawConfirmPopup();
    return;
  }

  if (judgePhase === "select") {
    _drawSelectPopup();
    return;
  }

  if (judgePhase === "good_ending" || judgePhase === "bad_ending") {
    _drawEndingScreen();
    return;
  }
}

function _drawConfirmPopup() {
  // Dim the world behind
  fill(0, 0, 0, 160);
  noStroke();
  rect(0, 0, width, height);

  const popW = 420;
  const popH = 200;
  const popX = width / 2 - popW / 2;
  const popY = height / 2 - popH / 2;

  // Panel
  fill(30, 24, 26);
  stroke(168, 86, 21);
  strokeWeight(2);
  rect(popX, popY, popW, popH, 10);
  noStroke();

  // Title text
  fill(255, 210, 50);
  textFont(jersey10Font);
  textAlign(CENTER, CENTER);
  textSize(22);
  text("Are you ready to identify the killer?", popX + popW / 2, popY + 60);

  // YES button
  const btnW = 110;
  const btnH = 40;
  const yesX = popX + popW / 2 - btnW - 20;
  const noX = popX + popW / 2 + 20;
  const btnY = popY + popH - 68;

  const hoverYes = _isOver(yesX, btnY, btnW, btnH);
  const hoverNo = _isOver(noX, btnY, btnW, btnH);

  drawBtn("Yes", yesX, btnY, btnW, btnH, hoverYes, false);
  drawBtn("No", noX, btnY, btnW, btnH, hoverNo, false);

  // Handle clicks
  if (mouseIsPressed) {
    if (hoverYes) {
      judgePhase = "select";
      mouseIsPressed = false; // consume
    } else if (hoverNo) {
      judgePhase = "closed";
      mouseIsPressed = false;
    }
  }
}

const _PORTRAIT_NAMES = ["Innkeeper", "Doctor", "Jerome"];

function _drawSelectPopup() {
  fill(0, 0, 0, 160);
  noStroke();
  rect(0, 0, width, height);

  const popW = 620;
  const popH = 350;
  const popX = width / 2 - popW / 2;
  const popY = height / 2 - popH / 2;

  // Panel
  fill(30, 24, 26);
  stroke(168, 86, 21);
  strokeWeight(2);
  rect(popX, popY, popW, popH, 10);
  noStroke();

  // ✕ close button
  const xSize = 28;
  const xPad = 12;
  const xBtnX = popX + popW - xSize - xPad;
  const xBtnY = popY + xPad;
  const hoverX = _isOver(xBtnX, xBtnY, xSize, xSize);
  fill(hoverX ? color(220, 80, 80) : color(160, 60, 60));
  rect(xBtnX, xBtnY, xSize, xSize, 6);
  fill(255);
  textAlign(CENTER, CENTER);
  textSize(18);
  text("x", xBtnX + xSize / 2, xBtnY + xSize / 2 + 1);

  // Heading
  fill(255, 210, 50);
  textFont(jersey10Font);
  textAlign(CENTER, CENTER);
  textSize(20);
  text("Who is the killer?", popX + popW / 2, popY + 36);

  // Portraits
  const portW = 140;
  const portH = 180;
  const gap = 40;
  const totalW = 3 * portW + 2 * gap;
  const startX = popX + (popW - totalW) / 2;
  const portY = popY + 75;

  for (let i = 0; i < 3; i++) {
    const px = startX + i * (portW + gap);
    const isSelected = judgeSelectedPortrait === i;
    const hovering = _isOver(px, portY, portW, portH);

    // Selection glow / highlight border
    if (isSelected) {
      stroke(255, 210, 50);
      strokeWeight(3);
    } else if (hovering) {
      stroke(200, 160, 40);
      strokeWeight(2);
    } else {
      stroke(100, 80, 50);
      strokeWeight(1);
    }

    // Placeholder portrait rectangle
    fill(60, 45, 30);
    rect(px, portY, portW, portH, 6);
    noStroke();
    // Draw portrait image
    if (judgePortraits[i]) {
      image(judgePortraits[i], px, portY, portW, portH);
    }
  }

  // Confirm button
  const btnW = 160;
  const btnH = 30;
  const btnX = popX + popW / 2 - btnW / 2;
  const btnY = popY + popH - 64;
  const disabled = judgeSelectedPortrait === -1;
  const hoverConfirm = !disabled && _isOver(btnX, btnY, btnW, btnH);

  drawBtn("Confirm choice", btnX, btnY, btnW, btnH, hoverConfirm, disabled);

  if (mouseIsPressed) {
    // ✕ button
    if (hoverX) {
      judgePhase = "closed";
      judgeSelectedPortrait = -1;
      mouseIsPressed = false;
      return;
    }

    // Portrait selection
    for (let i = 0; i < 3; i++) {
      const px = startX + i * (portW + gap);
      if (_isOver(px, portY, portW, portH)) {
        judgeSelectedPortrait = i;
        mouseIsPressed = false;
        return;
      }
    }

    // Confirm
    if (hoverConfirm) {
      judgePhase = judgeSelectedPortrait === 1 ? "good_ending" : "bad_ending";
      mouseIsPressed = false;
    }
  }
}

function _drawEndingScreen() {
  background(0);

  const isGood = judgePhase === "good_ending";

  fill(isGood ? color(255, 210, 50) : color(200, 60, 60));
  textFont(jersey10Font);
  textAlign(CENTER, CENTER);
  textSize(52);
  text(isGood ? "Good Ending" : "Bad Ending", width / 2, height / 2 - 20);

  // any key returns to game
  if (keyIsPressed || mouseIsPressed) {
    judgePhase = "closed";
    judgeSelectedPortrait = -1;
    currentScene = "GAME";
  }
}

function _isOver(x, y, w, h) {
  return mouseX > x && mouseX < x + w && mouseY > y && mouseY < y + h;
}

function drawBtn(label, x, y, w, h, hovering, disabled) {
  if (disabled) {
    fill(50, 40, 30);
    stroke(80, 60, 40);
  } else if (hovering) {
    fill(200, 150, 40);
    stroke(255, 210, 80);
  } else {
    fill(120, 85, 25);
    stroke(168, 86, 21);
  }
  strokeWeight(1.5);
  rect(x, y, w, h, 7);
  noStroke();

  fill(disabled ? color(100, 80, 50) : color(255));
  textAlign(CENTER, CENTER);
  textSize(16);
  text(label, x + w / 2, y + h / 2);
}
