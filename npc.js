//npc.js
//NPC base class + A* pathfinding for intelligent wandering

// ── A* PATHFINDING ────────────────────────────────────────────────────────────
// Works on the TF1_SOLID grid (0 = walkable, 1 = solid).
// Returns array of {col, row} tiles from start to goal (inclusive),
// or [] if no path found.

function aStar(sc, sr, gc, gr) {
  if (typeof TF1_SOLID === "undefined" || typeof TF1_W === "undefined") return [];
  if (gc < 0 || gr < 0 || gc >= TF1_W || gr >= TF1_H) return [];
  if (TF1_SOLID[gr]?.[gc] === 1) return [];
  if (sc === gc && sr === gr) return [{ col: sc, row: sr }];

  const key = (c, r) => r * TF1_W + c;
  const h   = (c, r) => Math.abs(c - gc) + Math.abs(r - gr);

  const startNode = { c: sc, r: sr, g: 0, f: h(sc, sr), parent: null };
  const open      = [startNode];
  const closed    = new Set();
  const gScore    = new Map([[key(sc, sr), 0]]);

  const DIRS = [[0, 1], [0, -1], [1, 0], [-1, 0]];

  while (open.length > 0) {
    // find lowest-f node (15×15 grid — linear scan is fine)
    let bi = 0;
    for (let i = 1; i < open.length; i++) {
      if (open[i].f < open[bi].f) bi = i;
    }
    const cur = open.splice(bi, 1)[0];
    const ck  = key(cur.c, cur.r);
    closed.add(ck);

    if (cur.c === gc && cur.r === gr) {
      const path = [];
      let node = cur;
      while (node) { path.unshift({ col: node.c, row: node.r }); node = node.parent; }
      return path;
    }

    for (const [dc, dr] of DIRS) {
      const nc = cur.c + dc, nr = cur.r + dr;
      if (nc < 0 || nr < 0 || nc >= TF1_W || nr >= TF1_H) continue;
      if (TF1_SOLID[nr]?.[nc] === 1) continue;
      const nk = key(nc, nr);
      if (closed.has(nk)) continue;

      const ng = (gScore.get(ck) ?? Infinity) + 1;
      if (ng < (gScore.get(nk) ?? Infinity)) {
        gScore.set(nk, ng);
        const nNode = { c: nc, r: nr, g: ng, f: ng + h(nc, nr), parent: cur };
        const ei = open.findIndex(n => n.c === nc && n.r === nr);
        if (ei >= 0) open.splice(ei, 1);
        open.push(nNode);
      }
    }
  }

  return [];
}
window.aStar = aStar;

// ── NPC CLASS ─────────────────────────────────────────────────────────────────

class NPC {
  constructor(x, y, dialogue) {
    this.x = x;
    this.y = y;
    this.dialogue = dialogue;
    this.firstVisit = true;
    this.interactRadius = 80;
    this.usedOptions = [];

    // ── A* wander ──────────────────────────────────────────────────────────
    // Set wanderBounds = { c0, r0, c1, r1 } (tile coords) to enable wandering.
    this.wanderBounds = null;
    this.patrolSpeed  = 1.2;   // px per frame
    this.idleDuration = 120;   // base frames to wait at each destination

    this._path      = [];
    this._pathStep  = 0;
    this._idleTimer = 0;

    // Stuck detection — if barely moved in 90 frames, abandon path
    this._stuckTimer  = 0;
    this._stuckLastX  = x;
    this._stuckLastY  = y;

    // ── legacy waypoint patrol (kept for compatibility) ─────────────────────
    this.waypoints     = null;
    this.waypointIndex = 0;

    // ── sprite / animation ─────────────────────────────────────────────────
    // spriteRowMap: optional {dirValue: rowIndex} override.
    // If null, row = this.dir (standard RPG Maker DOWN/LEFT/RIGHT/UP order).
    // Set per-NPC when the spritesheet uses a different row order.
    this.spriteRowMap = null;

    this.moving    = false;
    this.dir       = 0;
    this.frame     = 0;
    this.animTimer = 0;
  }

  // ── Pick a random walkable, furniture-free tile and A*-path there ──────────
  _pickNewDestination() {
    if (!this.wanderBounds || typeof TF1_SOLID === "undefined") return;
    const { c0, r0, c1, r1 } = this.wanderBounds;

    let destC = -1, destR = -1;

    for (let tries = 0; tries < 80; tries++) {
      const tc = Math.floor(c0 + Math.random() * (c1 - c0 + 1));
      const tr = Math.floor(r0 + Math.random() * (r1 - r0 + 1));

      // Out of bounds or wall tile → skip
      if (tc < 0 || tr < 0 || tc >= TF1_W || tr >= TF1_H) continue;
      if (TF1_SOLID[tr]?.[tc] === 1) continue;

      // Check if the tile centre is blocked by furniture
      const tx = (tc + 0.5) * TF1_T;
      const ty = (tr + 0.5) * TF1_T;
      if (typeof checkCollision === "function" && checkCollision(tx, ty, 14)) continue;

      destC = tc;
      destR = tr;
      break;
    }

    if (destC === -1) {
      // Couldn't find a clear destination — wait and retry
      this._idleTimer = 60;
      return;
    }

    const sc = Math.floor(this.x / TF1_T);
    const sr = Math.floor(this.y / TF1_T);

    if (sc === destC && sr === destR) {
      this._idleTimer = this.idleDuration;
      return;
    }

    const path = aStar(sc, sr, destC, destR);
    if (path.length > 1) {
      this._path     = path.slice(1); // skip the tile we're already on
      this._pathStep = 0;
      // Reset stuck detection for the new journey
      this._stuckTimer = 0;
      this._stuckLastX = this.x;
      this._stuckLastY = this.y;
    } else {
      this._idleTimer = 60;
    }
  }

  update() {
    // Freeze during dialogue
    if (dialoguePhase !== "closed") {
      this.moving    = false;
      this.frame     = 0;
      this.animTimer = 0;
      return;
    }

    // ── A* wander mode ─────────────────────────────────────────────────────
    if (this.wanderBounds) {
      // Waiting at destination
      if (this._idleTimer > 0) {
        this._idleTimer--;
        this.moving = false;
        return;
      }

      // Need a new destination
      if (this._pathStep >= this._path.length) {
        this._pickNewDestination();
        return;
      }

      // ── Stuck detection ─────────────────────────────────────────────────
      // Every 90 frames, check whether the NPC has actually moved.
      // If they've barely moved (< 5px total), they're stuck — abandon path.
      this._stuckTimer++;
      if (this._stuckTimer >= 90) {
        this._stuckTimer = 0;
        const moved = Math.abs(this.x - this._stuckLastX) +
                      Math.abs(this.y - this._stuckLastY);
        if (moved < 5) {
          // Stuck against furniture or another NPC — give up and re-pick
          this._path     = [];
          this._pathStep = 0;
          this._idleTimer = 30 + Math.floor(Math.random() * 60);
          this.moving = false;
          return;
        }
        this._stuckLastX = this.x;
        this._stuckLastY = this.y;
      }

      // Walk toward next tile centre
      const tile = this._path[this._pathStep];
      const tx = (tile.col + 0.5) * TF1_T;
      const ty = (tile.row + 0.5) * TF1_T;
      const dx = tx - this.x;
      const dy = ty - this.y;
      const d  = Math.sqrt(dx * dx + dy * dy);

      if (d < this.patrolSpeed + 1) {
        // Snap to tile centre and advance
        this.x = tx;
        this.y = ty;
        this._pathStep++;

        if (this._pathStep >= this._path.length) {
          this._idleTimer = this.idleDuration + Math.floor(Math.random() * this.idleDuration);
          this.moving = false;
        }
      } else {
        this.moving = true;
        this.x += (dx / d) * this.patrolSpeed;
        this.y += (dy / d) * this.patrolSpeed;

        if (Math.abs(dx) >= Math.abs(dy)) {
          this.dir = dx > 0 ? DIR.right : DIR.left;
        } else {
          this.dir = dy > 0 ? DIR.down : DIR.up;
        }

        this.animTimer++;
        if (this.animTimer >= ANIM_SPEED) {
          this.animTimer = 0;
          this.frame = (this.frame + 1) % 4;
        }
      }
      return;
    }

    // ── Legacy waypoint patrol (fallback) ───────────────────────────────────
    if (!this.waypoints) {
      this.moving = false;
      return;
    }

    const target = this.waypoints[this.waypointIndex];
    const dx = target.x - this.x;
    const dy = target.y - this.y;
    const d  = Math.sqrt(dx * dx + dy * dy);

    if (d < this.patrolSpeed + 1) {
      this.waypointIndex = (this.waypointIndex + 1) % this.waypoints.length;
      this.moving = false;
    } else {
      this.moving = true;
      const nx = this.x + (dx / d) * this.patrolSpeed;
      const ny = this.y + (dy / d) * this.patrolSpeed;
      if (!tf1IsSolidAtPixel(nx, this.y)) this.x = nx;
      if (!tf1IsSolidAtPixel(this.x, ny)) this.y = ny;

      if (Math.abs(dx) >= Math.abs(dy)) {
        this.dir = dx > 0 ? DIR.right : DIR.left;
      } else {
        this.dir = dy > 0 ? DIR.down : DIR.up;
      }

      this.animTimer++;
      if (this.animTimer >= ANIM_SPEED) {
        this.animTimer = 0;
        this.frame = (this.frame + 1) % 4;
      }
    }
  }

  isPlayerNearby(player) {
    let d = dist(player.px, player.py, this.x, this.y);
    return d < this.interactRadius;
  }

  draw() {
    if (this.sprite) {
      const fw = this.spriteFrameW || 48;
      const fh = this.spriteFrameH || 48;

      // Resolve which spritesheet row to use for the current direction.
      // spriteRowMap lets each NPC override the default RPG Maker row order
      // (standard: DOWN=0, LEFT=1, RIGHT=2, UP=3).
      const row = (this.spriteRowMap !== null && this.spriteRowMap !== undefined)
        ? (this.spriteRowMap[this.dir] ?? this.dir)
        : this.dir;

      // RPG Maker walk cycle: cols 0,1,2 → animate as 0,1,2,1
      const animCol = this.moving ? [0, 1, 2, 1][this.frame] : 1;
      const sx = animCol * fw;
      const sy = row * fh;

      imageMode(CENTER);
      image(
        this.sprite,
        this.x,
        this.y - 8,
        fw * NPC_CHAR_SCALE,
        fh * NPC_CHAR_SCALE,
        sx,
        sy,
        fw,
        fh,
      );
      imageMode(CORNER);
    } else {
      fill(this.colour);
      noStroke();
      circle(this.x, this.y, 40);
    }
  }
}

// Check collisions into NPCs so the player doesn't walk through them
function playerHitsNPC(cx, cy, r) {
  for (let npc of npcs) {
    let d = dist(cx, cy, npc.x, npc.y);
    if (d < r + 35) return true;
  }
  return false;
}

window.NPC = NPC;
