const SCENE = {
  HOME: "HOME",
  GAME: "GAME",
  END: "END",
};

let homeBgImg;
let logoImg;
let instructions;
let homeMouseX = 0;
let homeMouseY = 0;

function loadHomeAssets() {
  homeBgImg = loadImage("assets/homepic.png");
  logoImg = loadImage("through_the_woods_logo.png");
  instructions = loadImage("assets/interact_info.png");
}

function drawHomePage() {
  homeMouseX = lerp(homeMouseX, mouseX, 0.06);
  homeMouseY = lerp(homeMouseY, mouseY, 0.06);

  const offsetX = (homeMouseX - width / 2) / width;
  const offsetY = (homeMouseY - height / 2) / height;
  const bgShiftX = offsetX * -28;
  const bgShiftY = offsetY * -18;
  const logoShiftX = offsetX * 10;
  const logoShiftY = offsetY * 8;

  const oversize = 60;
  image(
    homeBgImg,
    -oversize / 2 + bgShiftX,
    -oversize / 2 + bgShiftY,
    width + oversize,
    height + oversize,
  );

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
    const logoW = min(width * 0.72, 880);
    const logoH = logoW * (logoImg.height / logoImg.width);
    imageMode(CENTER);
    image(
      logoImg,
      width / 2 + logoShiftX,
      height * 0.28 + logoShiftY,
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
  background(0);
  // fade out the whole screen by drawing a black overlay on top
  if (endScreenAlpha < 255) {
    noStroke();
    fill(0, endScreenAlpha);
    rect(0, 0, width, height);
  }
  fill(255, endScreenAlpha === 0 ? 0 : 255);
  textAlign(CENTER, CENTER);
  textSize(24);

  if (currentDay < TOTAL_DAYS) {
    text(
      "Day " +
        (currentDay - 1) +
        " is over.\n" +
        (TOTAL_DAYS - currentDay) +
        " day(s) until the sheriff arrives.",
      width / 2,
      height / 2 - 20,
    );
  } else {
    text(
      "Day " +
        (currentDay - 1) +
        " is over.\nThe sheriff arrives tomorrow. Time to make your verdict.",
      width / 2,
      height / 2 - 20,
    );
  }
}
