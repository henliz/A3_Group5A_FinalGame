class Journal {
  constructor() {
    this.isOpen = false;
    this.openPage = 0;
    this.totalPages = 5;

    this.pages = [
      {
        title: "FDL",
        baseImage: fdlPg,
        textEntries: [],
        imageEntries: [],
        hasNew: false,
      },
      {
        title: "Innkeeper",
        baseImage: innkeeperPg,
        textEntries: [],
        imageEntries: [],
        hasNew: false,
      },
      {
        title: "Doctor",
        baseImage: doctorPg,
        textEntries: [],
        imageEntries: [],
        hasNew: false,
      },
      {
        title: "RM",
        baseImage: rmPg,
        textEntries: [],
        imageEntries: [],
        hasNew: false,
      },
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
    this.pages[pageIndex].imageEntries.push({
      assetKey,
      previewKey: previewKey || assetKey,
      label: label || "",
    });
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

    // Semi-transparent backdrop
    noStroke();
    fill(0, 0, 0, 200);
    rect(0, 0, width, height);

    let page = this.pages[this.openPage];
    image(page.baseImage, width * 0.29, height * 0.15, 650, 650);

    // Draw collected item thumbnails (greyscale) with labels on the left half of the evidence page
    if (
      page.title === "Evidence" &&
      page.imageEntries &&
      page.imageEntries.length > 0
    ) {
      const thumbW = 80;
      const thumbH = 60;
      const labelH = 18;
      const cols = 2;
      const gapX = 12;
      const gapY = 14;
      const startX = width * 0.29 + 70;
      const startY = height * 0.15 + 150;

      for (let i = 0; i < page.imageEntries.length; i++) {
        const entry = page.imageEntries[i];
        const img = clutterImages[entry.previewKey];
        if (!img) continue;
        const col = i % cols;
        const row = Math.floor(i / cols);
        const x = startX + col * (thumbW + gapX);
        const y = startY + row * (thumbH + labelH + gapY);

        const hovering =
          mouseX > x &&
          mouseX < x + thumbW &&
          mouseY > y &&
          mouseY < y + thumbH;

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
        textFont(journalFont);
      }
    }

    if (page.textEntries.length > 0) {
      let entryX = width * 0.29 + 350;
      let entryY = 250;
      let entryW = 650 / 2 - 80;

      fill(40, 20, 10);
      textSize(12);
      textAlign(LEFT, TOP);
      textStyle(ITALIC);

      for (let i = 0; i < page.textEntries.length; i++) {
        text("• " + page.textEntries[i], entryX, entryY + i * 75, entryW, 200);
      }
      textStyle(NORMAL);
      textFont(mainFont); // reset at the end
    }

    // ─── Helen structured entries (FDL page only) ────────────
    if (page.title === "FDL") {
      if (!page.helenEntries) {
        page.helenEntries = { left: [], jerome: [], doctor: [], innkeeper: [] };
      }
      const he = page.helenEntries;

      // Always-present left side facts (baked in from day 1)
      const alwaysLeft = [
        "Time of death: ~12am",
        "Cause of death: blood loss due to deep gashes and bites to the neck",
      ];

      const jX = width * 0.29; // left edge of journal image
      const jY = height * 0.15; // top edge of journal image
      const leftX = jX + 60; // left page text column
      const rightX = jX + 345; // right page text column
      const entryW = 240; // max text wrap width

      textFont(journalFont);
      textSize(11);
      fill(40, 20, 10);
      textAlign(LEFT, TOP);

      // ── Left page ──────────────────────────────────────────
      let leftY = jY + 340; // below the portrait area
      textStyle(ITALIC);
      for (const entry of alwaysLeft) {
        text("• " + entry, leftX, leftY, entryW, 60);
        leftY += measureWrappedHeight("• " + entry, entryW, 11) + 5;
      }
      for (const entry of he.left) {
        text("• " + entry, leftX, leftY, entryW, 60);
        leftY += measureWrappedHeight("• " + entry, entryW, 11) + 5;
      }

      // ── Right page ─────────────────────────────────────────
      const rightSections = [
        { key: "jerome", label: "Sir Jerome" },
        { key: "doctor", label: "Dr. Krisia" },
        { key: "innkeeper", label: "Mrs. Gustall" },
      ];

      let rightY = jY + 135; // start near top of right page
      for (const sec of rightSections) {
        const entries = he[sec.key];
        if (!entries || entries.length === 0) continue;

        // Section label
        textSize(14);
        textStyle(NORMAL);
        textAlign(CENTER, TOP);
        fill(100, 50, 10);
        text(sec.label + ":", rightX, rightY, entryW, 20);
        rightY += 16;

        // Entries
        textSize(12);
        textStyle(ITALIC);
        textAlign(LEFT, TOP);
        fill(40, 20, 10);
        for (const entry of entries) {
          text("• " + entry, rightX, rightY, entryW, 80);
          rightY += measureWrappedHeight("• " + entry, entryW, 12) - 10;
        }
        rightY += 10; // gap between sections
      }
      textSize(12);
      textStyle(NORMAL);
      textFont(mainFont);
    }

    // Close button
    const btnX = width * 0.29 + 630;
    const btnY = height * 0.15 + 60;
    drawCloseButton(btnX, btnY);
    this.drawArrows();

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
        if (lbH > maxH) {
          lbH = maxH;
          lbW = lbH * aspect;
        }
        const lbX = (width - lbW) / 2;
        const lbY = (height - lbH) / 2;
        image(lbImg, lbX, lbY, lbW, lbH);

        // X button — top-right corner of image
        const xBtnSize = 36;
        const xBtnX = lbX + lbW - xBtnSize / 2;
        const xBtnY = lbY - xBtnSize / 2;
        const hoveringX =
          mouseX > xBtnX - xBtnSize / 2 &&
          mouseX < xBtnX + xBtnSize / 2 &&
          mouseY > xBtnY - xBtnSize / 2 &&
          mouseY < xBtnY + xBtnSize / 2;
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
    const btnSize = 44;
    const leftX = width * 0.29 - 50;
    const rightX = width * 0.29 + 650 + 20;
    const btnY = height / 2 - btnSize / 2;

    // Left arrow
    if (this.openPage > 0) {
      tint(255, 255);
    } else {
      tint(255, 60);
    }
    image(leftarrow, leftX, btnY, btnSize, btnSize);

    // Right arrow
    if (this.openPage < this.totalPages - 1) {
      tint(255, 255);
    } else {
      tint(255, 60);
    }
    image(rightarrow, rightX, btnY, btnSize, btnSize);

    noTint();
  }

  handleClick(mx, my) {
    if (!this.isOpen) return;

    // Close button
    const btnX2 = width * 0.29 + 630;
    const btnY2 = height * 0.15 + 60;
    const btnSize2 = 36;
    if (
      mx > btnX2 - btnSize2 / 2 &&
      mx < btnX2 + btnSize2 / 2 &&
      my > btnY2 - btnSize2 / 2 &&
      my < btnY2 + btnSize2 / 2
    ) {
      this.isOpen = false;
      return;
    }

    // If lightbox is open, check for X button click
    if (this.lightboxEntry) {
      const lbImg = clutterImages[this.lightboxEntry.assetKey];
      if (lbImg) {
        const padX = 80,
          padY = 60;
        const maxW = width - padX * 2,
          maxH = height - padY * 2;
        const aspect = lbImg.width / lbImg.height;
        let lbW = maxW,
          lbH = lbW / aspect;
        if (lbH > maxH) {
          lbH = maxH;
          lbW = lbH * aspect;
        }
        const lbX = (width - lbW) / 2,
          lbY = (height - lbH) / 2;
        const xBtnSize = 36;
        const xBtnX = lbX + lbW - xBtnSize / 2;
        const xBtnY = lbY - xBtnSize / 2;
        if (
          mx > xBtnX - xBtnSize / 2 &&
          mx < xBtnX + xBtnSize / 2 &&
          my > xBtnY - xBtnSize / 2 &&
          my < xBtnY + xBtnSize / 2
        ) {
          this.lightboxEntry = null;
        }
      }
      return; // block journal navigation while lightbox is open
    }

    // Check thumbnail clicks on evidence page
    const page = this.pages[this.openPage];
    if (
      page.title === "Evidence" &&
      page.imageEntries &&
      page.imageEntries.length > 0
    ) {
      const thumbW = 80,
        thumbH = 60,
        labelH = 18,
        cols = 2,
        gapX = 12,
        gapY = 14;
      const startX = width * 0.29 + 70;
      const startY = height * 0.15 + 130;
      for (let i = 0; i < page.imageEntries.length; i++) {
        const col = i % cols,
          row = Math.floor(i / cols);
        const x = startX + col * (thumbW + gapX);
        const y = startY + row * (thumbH + labelH + gapY);
        if (mx > x && mx < x + thumbW && my > y && my < y + thumbH) {
          this.lightboxEntry = page.imageEntries[i];
          return;
        }
      }
    }

    const btnSize = 44;
    const leftX = width * 0.29 - 50;
    const rightX = width * 0.29 + 650 + 20;
    const btnY = height / 2 - btnSize / 2;

    // Page navigation arrows

    if (mx > leftX && mx < leftX + btnSize && my > btnY && my < btnY + btnSize)
      this.prevPage();
    if (
      mx > rightX &&
      mx < rightX + btnSize &&
      my > btnY &&
      my < btnY + btnSize
    )
      this.nextPage();
  }

  // ─── Helen entry helper ───────────────────────────────────
  // section: "left" | "jerome" | "doctor" | "innkeeper"
  // Deduplicates automatically — safe to call multiple times.
  addHelenEntry(section, text) {
    const sectionMap = {
      left: { pageIndex: 0, slot: "left" },
      jerome: { pageIndex: 0, slot: "jerome" },
      doctor: { pageIndex: 0, slot: "doctor" },
      innkeeper: { pageIndex: 0, slot: "innkeeper" },
    };
    const target = sectionMap[section];
    if (!target) return;

    const page = this.pages[target.pageIndex];

    // Store helen entries in a separate structured object
    if (!page.helenEntries) {
      page.helenEntries = { left: [], jerome: [], doctor: [], innkeeper: [] };
    }

    const bucket = page.helenEntries[target.slot];
    if (bucket.includes(text)) return; // dedup — already added

    bucket.push(text);
    page.hasNew = true;
    this._recalcUnread();

    if (typeof journalNotifySound !== "undefined") {
      journalNotifySound.setVolume(0.25);
      journalNotifySound.play();
    }
  }
}
