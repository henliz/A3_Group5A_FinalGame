const SCENE = {
  HOME: "HOME",
  GAME: "GAME",
  END: "END",
};

// Parallax layer images
// Group A — Layer 1 alone        (furthest, moves least)
// Group B — Layer 2 alone
// Group C — Layers 3 + 4 together (lighting/shading pair, same depth)
// Group D — Layers 5 + 6 + 7 together (lighting/shading trio, same depth, closest)
// Layer 8 — not used for parallax
let bgLayer1, bgLayer2, bgLayer3, bgLayer4, bgLayer5, bgLayer6, bgLayer7, bgLayer8;
let logoImg;
let instructions;
let homeMouseX = 0;
let homeMouseY = 0;

function loadHomeAssets() {
  bgLayer1 = loadImage("assets/BG_Layer1.png");
  bgLayer2 = loadImage("assets/BG_Layer2.png");
  bgLayer3 = loadImage("assets/BG_Layer3.png");
  bgLayer4 = loadImage("assets/BG_Layer4.png");
  bgLayer5 = loadImage("assets/BG_Layer5.png");
  bgLayer6 = loadImage("assets/BG_Layer6.png");
  bgLayer7 = loadImage("assets/BG_Layer7.png");
  bgLayer8 = loadImage("assets/BG_Layer8.png");
  logoImg = loadImage("through_the_woods_logo.png");
  instructions = loadImage("assets/interact_info.png");
}

function drawHomePage() {
  background(255);
  homeMouseX = lerp(homeMouseX, mouseX, 0.06);
  homeMouseY = lerp(homeMouseY, mouseY, 0.06);

  const offsetX = (homeMouseX - width / 2) / width;
  const offsetY = (homeMouseY - height / 2) / height;

  // ── Background layers ─────────────────────────────────────────
  if (bgLayer8) image(bgLayer8, 0, 0, width, height);
  if (bgLayer7) image(bgLayer7, 0, 0, width, height);
  if (bgLayer5) image(bgLayer5, offsetX * -4,  offsetY * -3,  width, height);
  if (bgLayer6) image(bgLayer6, offsetX * -8,  offsetY * -5,  width, height);
  if (bgLayer3) image(bgLayer3, offsetX * -14, offsetY * -9,  width, height);
  if (bgLayer4) image(bgLayer4, offsetX * -14, offsetY * -9,  width, height);
  if (bgLayer1) image(bgLayer1, offsetX * -22, offsetY * -14, width, height);
  if (bgLayer2) image(bgLayer2, offsetX * -35, offsetY * -22, width, height);

  const grad = drawingContext.createLinearGradient(0, 0, 0, height * 0.5);
  grad.addColorStop(0, "rgba(0,0,0,0.88)");
  grad.addColorStop(1, "rgba(0,0,0,0)");
  drawingContext.fillStyle = grad;
  drawingContext.fillRect(0, 0, width, height * 0.5);
  // dim overlay between bg and UI for contrast
  noStroke();
  fill(0, 0, 0, 120);
  rect(0, 0, width, height);

  if (logoImg) {
    const logoW = min(width * 0.72, 880) - 330;
    const logoH = logoW * (logoImg.height / logoImg.width);
    imageMode(CENTER);
    image(
      logoImg,
      width / 2,
      height * 0.24,
      logoW,
      logoH,
    );
    imageMode(CORNER);
  }

  // instructions image
  if (instructions) {
    const imgW = min(650, width * 0.85);
    const imgH = imgW * (instructions.height / instructions.width);
    const imgX = (width - imgW) / 2;
    const imgY = height * 0.48;

    imageMode(CORNER);
    image(instructions, imgX, imgY, imgW, imgH);

    textAlign(CENTER, CENTER);
    textSize(20);
    fill(220);
    text("Press ENTER to start", width / 2, imgY + imgH + 20);
  }
}
function drawEndPage() {
  // Black overlay that fades out
  noStroke();
  fill(0, endScreenAlpha);
  rect(0, 0, width, height);

  if (endScreenAlpha <= 0) return;

  // Main day-over text
  fill(255, endScreenAlpha);
  textAlign(CENTER, CENTER);
  textSize(90);

  if (currentDay < TOTAL_DAYS) {
    text("Day " + (currentDay - 1) + " is over.", width / 2, height / 2 - 70);
    textSize(35);
    text(
      TOTAL_DAYS - currentDay + " day(s) until the sheriff arrives.",
      width / 2,
      height / 2 + 20,
    );
    fill(255, endScreenAlpha * 0.6);
    textSize(24);
    text("Get ready for the next day", width / 2, height / 2 + 60);
  } else {
    text("Day " + (currentDay - 1) + " is over.", width / 2, height / 2 - 70);
    textSize(35);
    text(
      "The sheriff arrives tomorrow. Time to make your verdict.",
      width / 2,
      height / 2 + 20,
    );
  }

  // Progress bar
  let progress = constrain(endDayTimer / END_DAY_TOTAL, 0, 1);
  let barW = 700;
  let barH = 60;
  let barX = width / 2 - barW / 2;
  let barY = height / 2 + 150;

  // Bar background
  fill(255, 255, 255, endScreenAlpha * 0.2);
  noStroke();
  rect(barX, barY, barW, barH, 3);

  // Bar fill
  fill(255, 200, 50, endScreenAlpha);
  rect(barX, barY, barW * progress, barH, 3);
}

function drawCreditsPage() {
  background(0);

  const cx = width / 2;
  let y = height * 0.1;
  const lh = 38;

  // Title
  fill(255, 210, 50);
  textFont(mainFont);
  textAlign(CENTER, CENTER);
  textSize(52);
  text("Murder at the Moorwood Inn", cx, y);
  y += 52;

  // Subtitle
  fill(220, 200, 160);
  textFont(mainFontItalic);
  textSize(22);
  text("A Murder Mystery", cx, y);
  y += lh * 2.2;

  // Names — alphabetical by last name
  const names = [
    "Amara Damji",
    "Amanda Guan",
    "Ayomide Ibidapo",
    "Tiffany Lu",
    "Henriëtta van Niekerk",
    "Yolanda Wang",
  ];

  fill(255);
  textFont(mainFont);
  textSize(20);
  for (let name of names) {
    text(name, cx, y);
    y += lh * 1.6;
  }
  y += lh * 0.8;

  // Thank you
  fill(220, 200, 160);
  textFont(mainFontItalic);
  textSize(24);
  text("Thank you for playing.", cx, y);

  // Separator
  stroke(168, 86, 21, 120);
  strokeWeight(1);
  line(cx - 180, height - 100, cx + 180, height - 100);
  noStroke();

  // Return to Home button
  const btnW = 240;
  const btnH = 48;
  const btnX = cx - btnW / 2;
  const btnY = height - 82;
  const hovering =
    mouseX > btnX &&
    mouseX < btnX + btnW &&
    mouseY > btnY &&
    mouseY < btnY + btnH;

  fill(hovering ? color(200, 150, 40) : color(120, 85, 25));
  rect(btnX, btnY, btnW, btnH, 10);
  fill(255);
  textFont(mainFont);
  textSize(20);
  text("Return to Home", cx, btnY + btnH / 2);
}
