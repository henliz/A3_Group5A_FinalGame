const COOKIE_JAR = {
  x: 1200,
  y: 525,
  w: 20,
  h: 25,

  interactRadius: 80,
  usedToday: false,
};

function cookieJarResetDay() {
  COOKIE_JAR.usedToday = false;
}

function isPlayerNearCookieJar(player) {
  const cx = COOKIE_JAR.x + COOKIE_JAR.w / 2;
  const cy = COOKIE_JAR.y + COOKIE_JAR.h / 2;
  return dist(player.px, player.py, cx, cy) < COOKIE_JAR.interactRadius;
}

function cookieJarDraw() {
  const { x, y, w, h, usedToday } = COOKIE_JAR;

  noStroke();
  fill(usedToday ? color(80, 80, 80) : color(160, 160, 160));
  rect(x, y, w, h, 4);

  if (!usedToday) {
    fill(200, 140, 80);
    ellipse(x + w / 2, y + h / 2, 18, 18);
    fill(120, 70, 30);
    ellipse(x + w / 2 - 3, y + h / 2 - 3, 4, 4);
    ellipse(x + w / 2 + 4, y + h / 2, 4, 4);
    ellipse(x + w / 2 - 1, y + h / 2 + 4, 4, 4);
  }

  if (!usedToday) {
    drawingContext.shadowColor = "rgba(255, 200, 80, 0.6)";
    drawingContext.shadowBlur = 18;
    rect(x, y, w, h, 4);
    drawingContext.shadowColor = "transparent";
    drawingContext.shadowBlur = 0;
  }
}

function cookieJarDrawPrompt(player, camX, camY, CAM_ZOOM) {
  if (!isPlayerNearCookieJar(player)) return;

  const cx = COOKIE_JAR.x + COOKIE_JAR.w / 2;
  const cy = COOKIE_JAR.y;
  const screenX = (cx - camX) * CAM_ZOOM;
  const screenY = (cy - camY) * CAM_ZOOM;

  const msg = COOKIE_JAR.usedToday
    ? "Already used today"
    : "Press SPACE to refill cookies";

  textSize(13);
  const msgW = textWidth(msg) + 20;
  const msgH = 24;
  const msgX = screenX - msgW / 2;
  const msgY = screenY - 30;

  fill(0, 0, 0, 180);
  noStroke();
  rect(msgX, msgY, msgW, msgH, 12);
  fill(COOKIE_JAR.usedToday ? color(160, 160, 160) : 255);
  textAlign(CENTER, CENTER);
  textSize(13);
  text(msg, screenX, msgY + msgH / 2);
}

function cookieJarInteract() {
  if (!COOKIE_JAR.usedToday) {
    spoonsRemaining = 7; // refill to max
    COOKIE_JAR.usedToday = true;

    if (typeof CookieSound !== "undefined") {
      CookieSound.setVolume(0.4);
      CookieSound.play();
    }
    return true;
  }
  return false;
}
