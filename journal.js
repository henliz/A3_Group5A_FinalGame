class Journal {
  constructor() {
    this.isOpen = false;
    this.openPage = 0;
    this.totalPages = 5;

    this.pages = [
      { title: "FDL", baseImage: fdlPg, textEntries: [], imageEntries: [], hasNew: false },
      {
        title: "Innkeeper",
        baseImage: innkeeperPg,
        textEntries: [],
        imageEntries: [],
        hasNew: false,
      },
      { title: "Doctor", baseImage: doctorPg, textEntries: [], imageEntries: [], hasNew: false },
      { title: "RM", baseImage: rmPg, textEntries: [], imageEntries: [], hasNew: false },
      {
        title: "Evidence",
        baseImage: evidencePg,
        textEntries: [],
        imageEntries: [],
        hasNew: false,
      },
    ];

    this.hasUnread = false;
    this.lightboxEntry = null; // {assetKey, label} when a thumbnail is clicked
  }

  toggle() {
    this.isOpen = !this.isOpen;
    if (this.isOpen) {
      this.pages[this.openPage].hasNew = false;
      this._recalcUnread();
    }
  }

  nextPage() {
    if (this.openPage < this.totalPages - 1) {
      this.openPage++;
      this.pages[this.openPage].hasNew = false;
      this._recalcUnread();
      if (typeof pageFlipSound !== "undefined") {
        pageFlipSound.setVolume(0.3);
        pageFlipSound.play();
      }
    }
  }

  prevPage() {
    if (this.openPage > 0) {
      this.openPage--;
      this.pages[this.openPage].hasNew = false;
      this._recalcUnread();
      if (typeof pageFlipSound !== "undefined") {
        pageFlipSound.setVolume(0.3);
        pageFlipSound.play();
      }
    }
  }

  addImageEntry(pageIndex, assetKey, label, previewKey) {
    this.pages[pageIndex].imageEntries.push({ assetKey, previewKey: previewKey || assetKey, label: label || "" });
    this.pages[pageIndex].hasNew = true;
    this._recalcUnread();
  }

  addTextEntry(pageIndex, text) {
    this.pages[pageIndex].textEntries.push(text);
    this.pages[pageIndex].hasNew = true;
    this._recalcUnread();

    // journal new entry sound
    if (typeof journalNotifySound !== "undefined") {
      journalNotifySound.setVolume(0.25);
      journalNotifySound.play();
    }
  }

  _recalcUnread() {
    this.hasUnread = this.pages.some((p) => p.hasNew);
  }

  display() {
    if (!this.isOpen) return;
    textFont(journalFont);

    let page = this.pages[this.openPage];
    image(page.baseImage, width * 0.29, height * 0.15, 650, 650);

    // Draw collected item thumbnails (greyscale) with labels on the left half of the evidence page
    if (page.title === "Evidence" && page.imageEntries && page.imageEntries.length > 0) {
      const thumbW = 80;
      const thumbH = 60;
      const labelH = 18;
      const cols = 2;
      const gapX = 12;
      const gapY = 14;
      const startX = width * 0.29 + 70;
      const startY = height * 0.15 + 130;

      for (let i = 0; i < page.imageEntries.length; i++) {
        const entry = page.imageEntries[i];
        const img = clutterImages[entry.previewKey];
        if (!img) continue;
        const col = i % cols;
        const row = Math.floor(i / cols);
        const x = startX + col * (thumbW + gapX);
        const y = startY + row * (thumbH + labelH + gapY);

        const hovering = mouseX > x && mouseX < x + thumbW &&
                         mouseY > y && mouseY < y + thumbH;

        if (hovering) {
          drawingContext.shadowColor = "rgba(255, 215, 60, 0.85)";
          drawingContext.shadowBlur = 20;
        }
        drawingContext.filter = "grayscale(1)";
        image(img, x, y, thumbW, thumbH);
        if (hovering) {
          drawingContext.shadowColor = "rgba(255, 215, 60, 0.5)";
          drawingContext.shadowBlur = 40;
          image(img, x, y, thumbW, thumbH);
        }
        drawingContext.filter = "none";
        drawingContext.shadowColor = "transparent";
        drawingContext.shadowBlur = 0;
        image(img, x, y, thumbW, thumbH);
        drawingContext.filter = "none";

        // label underneath
        fill(hovering ? color(180, 150, 40) : color(40, 20, 10));
        textSize(11);
        textAlign(CENTER, TOP);
        textFont(journalFont);
        textStyle(ITALIC);
        text(entry.label, x + thumbW / 2, y + thumbH + 4);
        textStyle(NORMAL);
        textFont(jersey10Font);
      }
    }

    if (page.textEntries.length > 0) {
      let entryX = width * 0.29 + 350;
      let entryY = 250;
      let entryW = 650 / 2 - 90;

      fill(40, 20, 10);
      textSize(14);
      textAlign(LEFT, TOP);
      textStyle(ITALIC);

      for (let i = 0; i < page.textEntries.length; i++) {
        text("• " + page.textEntries[i], entryX, entryY + i * 75, entryW, 200);
      }
      textStyle(NORMAL);
      textFont(jersey10Font); // reset at the end
    }
    textFont(jersey10Font);

    this.drawArrows();

    // Lightbox overlay — drawn on top of everything when a thumbnail is clicked
    if (this.lightboxEntry) {
      const lbImg = clutterImages[this.lightboxEntry.assetKey];
      if (lbImg) {
        // Dim background
        fill(0, 0, 0, 200);
        noStroke();
        rect(0, 0, width, height);

        // Fit image on screen with padding
        const padX = 80;
        const padY = 60;
        const maxW = width - padX * 2;
        const maxH = height - padY * 2;
        const aspect = lbImg.width / lbImg.height;
        let lbW = maxW;
        let lbH = lbW / aspect;
        if (lbH > maxH) { lbH = maxH; lbW = lbH * aspect; }
        const lbX = (width - lbW) / 2;
        const lbY = (height - lbH) / 2;
        image(lbImg, lbX, lbY, lbW, lbH);

        // X button — top-right corner of image
        const xBtnSize = 36;
        const xBtnX = lbX + lbW - xBtnSize / 2;
        const xBtnY = lbY - xBtnSize / 2;
        const hoveringX = mouseX > xBtnX - xBtnSize / 2 && mouseX < xBtnX + xBtnSize / 2 &&
                          mouseY > xBtnY - xBtnSize / 2 && mouseY < xBtnY + xBtnSize / 2;
        fill(hoveringX ? 220 : 180);
        ellipse(xBtnX, xBtnY, xBtnSize, xBtnSize);
        fill(30);
        textSize(18);
        textAlign(CENTER, CENTER);
        textFont(jersey10Font);
        text("×", xBtnX, xBtnY);
      }
    }
  }

  drawArrows() {
    noStroke();

    fill(this.openPage > 0 ? color(160, 120, 80) : color(100, 100, 100, 60));
    rect(width * 0.28, height / 2, 30, 30, 4);
    fill(this.openPage > 0 ? 255 : 190);
    textSize(18);
    textAlign(CENTER, CENTER);
    text("‹", width * 0.29, height / 2 + 15);

    fill(
      this.openPage < this.totalPages - 1
        ? color(160, 120, 80)
        : color(100, 100, 100, 60),
    );
    rect(width * 0.28 + 650, height / 2, 30, 30, 4);
    fill(this.openPage < this.totalPages - 1 ? 255 : 150);
    text("›", width * 0.29 + 650, height / 2 + 15);
  }

  handleClick(mx, my) {
    if (!this.isOpen) return;

    // If lightbox is open, check for X button click
    if (this.lightboxEntry) {
      const lbImg = clutterImages[this.lightboxEntry.assetKey];
      if (lbImg) {
        const padX = 80, padY = 60;
        const maxW = width - padX * 2, maxH = height - padY * 2;
        const aspect = lbImg.width / lbImg.height;
        let lbW = maxW, lbH = lbW / aspect;
        if (lbH > maxH) { lbH = maxH; lbW = lbH * aspect; }
        const lbX = (width - lbW) / 2, lbY = (height - lbH) / 2;
        const xBtnSize = 36;
        const xBtnX = lbX + lbW - xBtnSize / 2;
        const xBtnY = lbY - xBtnSize / 2;
        if (mx > xBtnX - xBtnSize / 2 && mx < xBtnX + xBtnSize / 2 &&
            my > xBtnY - xBtnSize / 2 && my < xBtnY + xBtnSize / 2) {
          this.lightboxEntry = null;
        }
      }
      return; // block journal navigation while lightbox is open
    }

    // Check thumbnail clicks on evidence page
    const page = this.pages[this.openPage];
    if (page.title === "Evidence" && page.imageEntries && page.imageEntries.length > 0) {
      const thumbW = 80, thumbH = 60, labelH = 18, cols = 2, gapX = 12, gapY = 14;
      const startX = width * 0.29 + 70;
      const startY = height * 0.15 + 130;
      for (let i = 0; i < page.imageEntries.length; i++) {
        const col = i % cols, row = Math.floor(i / cols);
        const x = startX + col * (thumbW + gapX);
        const y = startY + row * (thumbH + labelH + gapY);
        if (mx > x && mx < x + thumbW && my > y && my < y + thumbH) {
          this.lightboxEntry = page.imageEntries[i];
          return;
        }
      }
    }

    // Page navigation arrows
    if (
      mx > width * 0.28 &&
      mx < width * 0.28 + 30 &&
      my > height / 2 &&
      my < height / 2 + 30
    )
      this.prevPage();
    if (
      mx > width * 0.28 + 650 &&
      mx < width * 0.28 + 650 + 30 &&
      my > height / 2 &&
      my < height / 2 + 30
    )
      this.nextPage();
  }
}
