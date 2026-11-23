/* buckl3 // ASCII canvas engines
   rain · banner · mask · tunnel · wave · noise · cat (ascii + halftone)
   Every engine renders on a monospace character grid, pauses when off-screen,
   and falls back to a single static frame when motion is disabled. */
(function () {
  'use strict';

  var MONO = '"JetBrains Mono", ui-monospace, Consolas, monospace';
  var DISPLAY = '"Chakra Petch", "JetBrains Mono", sans-serif';
  var DPR = Math.min(window.devicePixelRatio || 1, 2);
  var LITE = window.innerWidth < 700 || (navigator.hardwareConcurrency || 8) <= 4;

  var COL = {
    fg: [233, 233, 236], dim: [120, 126, 138], cyan: [45, 226, 230],
    magenta: [255, 42, 109], blue: [91, 132, 255], green: [61, 255, 127]
  };
  function rgba(c, a) { return 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + a + ')'; }
  function mix(a, b, t) { return [a[0] + (b[0] - a[0]) * t | 0, a[1] + (b[1] - a[1]) * t | 0, a[2] + (b[2] - a[2]) * t | 0]; }
  function clamp(x, a, b) { return x < a ? a : x > b ? b : x; }
  function hash(x, y, s) { var h = (x * 374761393 + y * 668265263 + (s | 0) * 2147483647) | 0; h = (h ^ (h >>> 13)) * 1274126177 | 0; return ((h ^ (h >>> 16)) >>> 0) / 4294967295; }
  function frac(x) { return x - Math.floor(x); }

  /* ---------- geometry helpers ---------- */
  function inPoly(x, y, p) {
    var inside = false;
    for (var i = 0, j = p.length - 1; i < p.length; j = i++) {
      var xi = p[i][0], yi = p[i][1], xj = p[j][0], yj = p[j][1];
      if (((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi)) inside = !inside;
    }
    return inside;
  }
  function segDist(px, py, ax, ay, bx, by) {
    var dx = bx - ax, dy = by - ay, l = dx * dx + dy * dy;
    var t = l ? clamp(((px - ax) * dx + (py - ay) * dy) / l, 0, 1) : 0;
    var ex = ax + t * dx - px, ey = ay + t * dy - py;
    return Math.sqrt(ex * ex + ey * ey);
  }
  function edgeDist(x, y, p) {
    var d = 9;
    for (var i = 0, j = p.length - 1; i < p.length; j = i++) d = Math.min(d, segDist(x, y, p[j][0], p[j][1], p[i][0], p[i][1]));
    return d;
  }

  /* ---------- Engine base ---------- */
  var engines = [];
  var motion = true;

  function Engine(canvas, opt) {
    this.c = canvas;
    this.ctx = canvas.getContext('2d');
    this.opt = opt;
    this.fps = opt.fps || 24;
    this.visible = false;
    this.raf = 0;
    this.last = 0;
    this.t0 = performance.now();
    this.state = {};
    var self = this;
    this.resize();
    if ('ResizeObserver' in window) {
      var pending = 0;
      new ResizeObserver(function () {
        cancelAnimationFrame(pending);
        pending = requestAnimationFrame(function () { self.resize(); if (!self.running()) self.frame(self.staticT()); });
      }).observe(opt.observe || canvas);
    } else {
      window.addEventListener('resize', function () { self.resize(); });
    }
    if ('IntersectionObserver' in window && !opt.always) {
      new IntersectionObserver(function (en) {
        self.visible = en[0].isIntersecting;
        self.sync();
      }, { rootMargin: '80px' }).observe(canvas);
    } else {
      this.visible = true;
    }
    engines.push(this);
    this.frame(this.staticT());
    this.sync();
  }
  Engine.prototype.staticT = function () { return this.opt.staticT || 2.2; };
  Engine.prototype.running = function () { return !!this.raf; };
  Engine.prototype.resize = function () {
    var r = this.c.getBoundingClientRect();
    var w = Math.max(1, r.width), h = Math.max(1, r.height);
    if (this.opt.fitHeight) h = this.opt.fitHeight.call(this, w);
    this.w = w; this.h = h;
    this.c.width = Math.round(w * DPR); this.c.height = Math.round(h * DPR);
    if (this.opt.fitHeight) this.c.style.height = h + 'px';
    this.ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    var size = this.opt.cellSize ? this.opt.cellSize.call(this, w, h) : 12;
    this.size = size;
    this.ctx.font = size + 'px ' + MONO;
    this.cw = this.ctx.measureText('M').width || size * 0.6;
    this.ch = size * (this.opt.lineH || 1.18);
    this.cols = Math.max(1, Math.floor(w / this.cw));
    this.rows = Math.max(1, Math.floor(h / this.ch));
    this.ox = (w - this.cols * this.cw) / 2;
    this.oy = (h - this.rows * this.ch) / 2;
    if (this.opt.setup) this.opt.setup.call(this);
  };
  Engine.prototype.sync = function () {
    var want = motion && this.visible && !this.opt.staticOnly;
    if (want && !this.raf) {
      var self = this;
      var loop = function (now) {
        self.raf = requestAnimationFrame(loop);
        if (now - self.last < 1000 / self.fps) return;
        self.last = now;
        self.frame((now - self.t0) / 1000);
      };
      this.raf = requestAnimationFrame(loop);
    } else if (!want && this.raf) {
      cancelAnimationFrame(this.raf); this.raf = 0;
      this.frame(this.staticT());
    }
  };
  Engine.prototype.frame = function (t) {
    this.ctx.clearRect(0, 0, this.w, this.h);
    this.ctx.font = this.size + 'px ' + MONO;
    this.ctx.textBaseline = 'top';
    this.opt.render.call(this, t);
  };
  Engine.prototype.put = function (c, r, ch, style) {
    if (style !== this._s) { this.ctx.fillStyle = style; this._s = style; }
    this.ctx.fillText(ch, this.ox + c * this.cw, this.oy + r * this.ch);
  };

  /* ================= 1. Binary rain (background) ================= */
  function rain(canvas) {
    return new Engine(canvas, {
      always: true, fps: LITE ? 12 : 20, staticT: 0,
      cellSize: function () { return LITE ? 16 : 14; },
      setup: function () {
        var s = this.state; s.drops = []; s.speed = [];
        for (var i = 0; i < this.cols; i++) { s.drops[i] = Math.random() * this.rows; s.speed[i] = 0.15 + Math.random() * 0.45; }
      },
      render: function (t) {
        var s = this.state, tail = 14;
        this._s = null;
        for (var c = 0; c < this.cols; c += (LITE ? 2 : 1)) {
          var head = (s.drops[c] + t * s.speed[c] * 12) % (this.rows + tail);
          for (var k = 0; k < tail; k++) {
            var r = Math.floor(head) - k;
            if (r < 0 || r >= this.rows) continue;
            var a = (1 - k / tail);
            var ch = hash(c, r, Math.floor(t * 2 + c)) > 0.5 ? '1' : '0';
            var col = k === 0 ? COL.fg : (hash(c, 7, 1) > 0.85 ? COL.blue : COL.dim);
            this.put(c, r, ch, rgba(col, (a * a * 0.9).toFixed(2)));
          }
        }
      }
    });
  }

  /* ================= 2. Handle banner "BUCKL3" ================= */
  function banner(canvas, text) {
    var off = document.createElement('canvas');
    var octx = off.getContext('2d', { willReadFrequently: true });
    return new Engine(canvas, {
      fps: 20, staticT: 9,
      lineH: 1.0,
      fitHeight: function (w) { var size = clamp(w / 70 / 0.6, 6, 11); return Math.round(size * 1.0 * 11); },
      cellSize: function (w) { return clamp(w / 70 / 0.6, 6, 11); },
      setup: function () {
        var cols = this.cols, rows = this.rows;
        off.width = cols; off.height = rows * 2;
        octx.clearRect(0, 0, cols, rows * 2);
        octx.fillStyle = '#fff';
        octx.textBaseline = 'middle';
        var fs = rows * 2 * 0.95;
        octx.font = '700 ' + fs + 'px ' + DISPLAY;
        var tw = octx.measureText(text).width;
        octx.save();
        octx.scale(Math.min(1, (cols - 2) / tw), 1);
        octx.fillText(text, 1, rows);
        octx.restore();
        var d = octx.getImageData(0, 0, cols, rows * 2).data, g = [];
        for (var r = 0; r < rows; r++) for (var c = 0; c < cols; c++) {
          var a = (d[((r * 2) * cols + c) * 4 + 3] + d[((r * 2 + 1) * cols + c) * 4 + 3]) / 510;
          g.push(a);
        }
        this.state.g = g;
      },
      render: function (t) {
        var g = this.state.g, cols = this.cols, rows = this.rows;
        if (!g) return;
        var reveal = motion ? clamp(t / 1.4, 0, 1) : 1;
        var gl = motion && frac(t / 3.1) > 0.93;
        var seed = Math.floor(t * 12);
        var layers = gl ? [[COL.cyan, -1, 0.7], [COL.magenta, 1, 0.7], [COL.fg, 0, 1]] : [[COL.fg, 0, 1]];
        for (var L = 0; L < layers.length; L++) {
          this._s = null;
          var lc = layers[L][0], lo = layers[L][1], la = layers[L][2];
          for (var r = 0; r < rows; r++) {
            var shift = gl && hash(r, seed, 3) > 0.7 ? Math.round((hash(r, seed, 4) - 0.5) * 8) : 0;
            for (var c = 0; c < cols; c++) {
              var a = g[r * cols + c];
              if (a < 0.12) continue;
              var ch;
              if (c / cols > reveal) ch = hash(c, r, seed) > 0.5 ? '1' : '0';
              else ch = a > 0.8 ? '█' : a > 0.5 ? '▓' : a > 0.28 ? '▒' : '░';
              if (gl && shift && hash(c, r, seed) > 0.6) ch = '░';
              this.put(c + shift + lo, r, ch, rgba(lc, la));
            }
          }
        }
      }
    });
  }

  /* ================= 3. Original glitch mask ================= */
  // Normalized space: u right, v down, roughly [-1, 1]. Designed for buckl3, not derived from any game logo.
  var OUTER = [[-0.62, -0.92], [-0.12, -0.92], [0, -0.72], [0.14, -0.92], [0.66, -0.92], [0.80, -0.40], [0.70, 0.18],
               [0.40, 0.62], [0.06, 0.96], [-0.10, 0.84], [-0.44, 0.58], [-0.72, 0.16], [-0.80, -0.42]];
  var EYE_L = [[-0.64, -0.32], [-0.12, -0.22], [-0.16, -0.08], [-0.62, -0.17]];
  var EYE_R = [[0.10, -0.36], [0.58, -0.36], [0.31, -0.02]];
  var VENTS = [[-0.17, 0.36, 0.58], [0, 0.31, 0.66], [0.17, 0.36, 0.54]];
  var CRACK = [[0, -0.72], [-0.07, -0.42], [-0.02, -0.30], [-0.28, 0.30]];

  function mask(canvas) {
    return new Engine(canvas, {
      fps: LITE ? 14 : 24, staticT: 0.6,
      lineH: 1.12,
      cellSize: function (w) { var cols = LITE ? 44 : 58; return clamp(w / cols / 0.6, 5, 12); },
      render: function (t) {
        var cols = this.cols, rows = this.rows;
        var yaw = motion ? Math.sin(t * 0.55) * 0.55 : 0.18;
        var cy = Math.cos(yaw), sy = Math.sin(yaw);
        var bob = motion ? Math.sin(t * 1.3) * 0.015 : 0;
        // scale: mask height ~ 88% of canvas
        var scale = Math.min(this.h * 0.9 / 2, this.w * 0.95 / 1.7);
        var cx0 = this.w / 2, cy0 = this.h / 2;
        var lx = -0.45 * cy + 0.7 * sy, ly = -0.55, lz = 0.7; // light rotates with the head
        var ll = Math.sqrt(lx * lx + ly * ly + lz * lz); lx /= ll; ly /= ll; lz /= ll;
        var seed = Math.floor(t * 10);
        var glitch = motion && frac(t / 2.6) > 0.92;
        var cells = [];
        for (var r = 0; r < rows; r++) {
          var py = this.oy + (r + 0.5) * this.ch;
          var v = (py - cy0) / scale + bob;
          var rowShift = glitch && hash(r, seed, 9) > 0.78 ? Math.round((hash(r, seed, 2) - 0.5) * 10) : 0;
          for (var c = 0; c < cols; c++) {
            var px = this.ox + (c + 0.5) * this.cw;
            var sx = (px - cx0) / scale;
            var z0 = Math.sqrt(Math.max(0, 1 - sx * sx * 0.5 - v * v * 0.35));
            var u = (sx - z0 * sy * 0.35) / cy;
            if (Math.abs(u) > 1.05 || Math.abs(v) > 1.05) continue;
            if (!inPoly(u, v, OUTER)) continue;
            var cc = c + rowShift;
            // eyes: glowing slits
            if (inPoly(u, v, EYE_L) || inPoly(u, v, EYE_R)) {
              var scan = motion ? frac(t * 0.8) : 0.5;
              var on = Math.abs(frac((u + 1) / 2) - scan) < 0.08;
              cells.push([cc, r, on ? '=' : '-', rgba(COL.cyan, on ? 1 : 0.55)]);
              continue;
            }
            if (u > 0.36 && u < 0.44 && v > 0.06 && v < 0.14) { cells.push([cc, r, '■', rgba(COL.magenta, 0.95)]); continue; }
            var vent = false;
            for (var k = 0; k < VENTS.length; k++) if (Math.abs(u - VENTS[k][0]) < 0.035 && v > VENTS[k][1] && v < VENTS[k][2]) vent = true;
            if (vent) continue;
            var dCrack = 9;
            for (var q = 1; q < CRACK.length; q++) dCrack = Math.min(dCrack, segDist(u, v, CRACK[q - 1][0], CRACK[q - 1][1], CRACK[q][0], CRACK[q][1]));
            if (dCrack < 0.022) { cells.push([cc, r, '/', rgba(COL.magenta, 0.9)]); continue; }
            // shading
            var e = 0.02;
            var zx = Math.sqrt(Math.max(0, 1 - (u + e) * (u + e) * 0.5 - v * v * 0.35)) - Math.sqrt(Math.max(0, 1 - (u - e) * (u - e) * 0.5 - v * v * 0.35));
            var zy = Math.sqrt(Math.max(0, 1 - u * u * 0.5 - (v + e) * (v + e) * 0.35)) - Math.sqrt(Math.max(0, 1 - u * u * 0.5 - (v - e) * (v - e) * 0.35));
            var nx = -zx / (2 * e), ny = -zy / (2 * e), nz = 1;
            var nl = Math.sqrt(nx * nx + ny * ny + 1); nx /= nl; ny /= nl; nz /= nl;
            var b = clamp(0.18 + 0.95 * Math.max(0, nx * lx + ny * ly + nz * lz), 0, 1);
            var edge = edgeDist(u, v, OUTER);
            var eyeRim = Math.min(edgeDist(u, v, EYE_L), edgeDist(u, v, EYE_R));
            var ch, col;
            if (edge < 0.04) { ch = '#'; col = rgba(COL.fg, 0.95); }
            else if (eyeRim < 0.035) { ch = '@'; col = rgba(COL.fg, 0.9); }
            else if (v > -0.55 && v < -0.49) { ch = '='; col = rgba(mix(COL.dim, COL.fg, b), 0.85); }
            else {
              var bit = hash(c, r, Math.floor(t * 1.5 + hash(c, r, 5) * 6)) > 0.5 ? '1' : '0';
              ch = b < 0.3 ? (b < 0.22 ? '.' : ':') : bit;
              col = rgba(b > 0.7 ? mix(COL.blue, COL.fg, (b - 0.7) / 0.3) : mix([30, 45, 110], COL.blue, b / 0.7), (0.35 + b * 0.65).toFixed(2));
            }
            if (glitch && rowShift && hash(c, r, seed) > 0.55) ch = '▒';
            cells.push([cc, r, ch, col]);
          }
        }
        if (glitch) {
          this._s = null;
          for (var i = 0; i < cells.length; i += 2) {
            this.put(cells[i][0] - 1, cells[i][1], cells[i][2], rgba(COL.cyan, 0.45));
            this.put(cells[i][0] + 1, cells[i][1], cells[i][2], rgba(COL.magenta, 0.45));
          }
        }
        this._s = null;
        for (var j = 0; j < cells.length; j++) this.put(cells[j][0], cells[j][1], cells[j][2], cells[j][3]);
      }
    });
  }

  /* ================= 4. Hexagon tunnel ================= */
  function tunnel(canvas) {
    var pal = [COL.cyan, COL.blue, COL.magenta];
    return new Engine(canvas, {
      fps: LITE ? 14 : 24, staticT: 1.3,
      cellSize: function () { return LITE ? 11 : 12; },
      render: function (t) {
        var cols = this.cols, rows = this.rows, m = this.h * 1.1;
        var rot = t * 0.15;
        var cr = Math.cos(rot), sr = Math.sin(rot);
        this._s = null;
        for (var r = 0; r < rows; r++) for (var c = 0; c < cols; c++) {
          var x = (this.ox + (c + 0.5) * this.cw - this.w / 2) / m;
          var y = (this.oy + (r + 0.5) * this.ch - this.h / 2) / m;
          var X = x * cr - y * sr, Y = x * sr + y * cr;
          var ax = Math.abs(X), ay = Math.abs(Y);
          var d = Math.max(ay, ax * 0.866 + ay * 0.5); // hexagon metric
          if (d < 0.035) continue;
          var depth = 0.3 / d + t * 0.9;
          var band = Math.floor(depth * 2);
          var f = frac(depth * 2);
          var fog = clamp((d - 0.04) * 2.6, 0, 1);
          if (fog < 0.06) continue;
          var pc = pal[((band % 3) + 3) % 3];
          var ch, col, a;
          if (f < 0.13) { ch = '#'; col = mix(COL.fg, pc, 0.45); a = fog; }
          else if (f < 0.26) { ch = '+'; col = pc; a = fog * 0.55; }
          else {
            var hsh = hash(c, r, band);
            if (hsh < 0.55) continue;
            ch = hsh > 0.8 ? '1' : hsh > 0.65 ? '0' : '.'; col = COL.dim; a = fog * 0.45;
          }
          this.put(c, r, ch, rgba(col, a.toFixed(2)));
        }
      }
    });
  }

  /* ================= 5. Warped stripes ================= */
  function wave(canvas) {
    return new Engine(canvas, {
      fps: LITE ? 14 : 24, staticT: 2,
      cellSize: function () { return 11; },
      render: function (t) {
        var cols = this.cols, rows = this.rows;
        var cx = cols * (0.5 + 0.3 * Math.sin(t * 0.3)), cyy = rows / 2;
        this._s = null;
        for (var r = 0; r < rows; r++) for (var c = 0; c < cols; c++) {
          var dx = (c - cx) / (cols * 0.18), dy = (r - cyy) / (rows * 0.6);
          var bump = Math.exp(-(dx * dx + dy * dy));
          var x = c + bump * 7 * Math.sin(r * 0.45 + t * 2.2);
          var s = Math.sin(x * 0.5);
          if (s < 0.15) continue;
          var ch = s > 0.75 ? '#' : s > 0.45 ? '+' : ':';
          var col = bump > 0.35 ? mix(COL.fg, bump > 0.7 ? COL.magenta : COL.cyan, bump) : COL.fg;
          this.put(c, r, ch, rgba(col, (0.25 + 0.6 * s * (0.5 + bump)).toFixed(2)));
        }
      }
    });
  }

  /* ================= 6. Block noise (footer) ================= */
  function noise(canvas) {
    return new Engine(canvas, {
      fps: 8, staticT: 0,
      cellSize: function () { return 12; },
      render: function (t) {
        var seed = Math.floor(t * 3), glyphs = ['█', '▓', '▒', '░'];
        this._s = null;
        for (var r = 0; r < this.rows; r++) for (var c = 0; c < this.cols; c++) {
          var bx = Math.floor(c / 3), by = Math.floor(r / 2);
          var h = hash(bx, by, seed + (hash(bx, by, 1) > 0.9 ? 0 : 1) * Math.floor(seed / 4));
          if (h < 0.72) continue;
          var col = h > 0.985 ? COL.magenta : h > 0.97 ? COL.cyan : COL.dim;
          this.put(c, r, glyphs[Math.floor(hash(c, r, seed) * 4)], rgba(col, 0.35));
        }
      }
    });
  }

  /* ================= 7. Cat portrait (ASCII / halftone) ================= */
  function cat(canvas, src, getLabel) {
    var img = new Image();
    var lum = null, lw = 0, lh = 0;
    var off = document.createElement('canvas');
    var octx = off.getContext('2d', { willReadFrequently: true });
    var eng;
    function sample(w, h) {
      if (!img.complete || !img.naturalWidth) return;
      off.width = w; off.height = h;
      // crop to head + bow tie so the face is readable at low resolution
      var iw = img.naturalWidth, ih = img.naturalHeight;
      octx.drawImage(img, iw * 0.14, 0, iw * 0.72, ih * 0.72, 0, 0, w, h);
      // The source photo has a light background, so we map *darkness* + edges to ink:
      // the tuxedo and facial features become dense glyphs, the background drops out.
      var d = octx.getImageData(0, 0, w, h).data, n = w * h, Y = new Float32Array(n), L = new Float32Array(n);
      for (var i = 0; i < n; i++) Y[i] = (0.2126 * d[i * 4] + 0.7152 * d[i * 4 + 1] + 0.0722 * d[i * 4 + 2]) / 255;
      var sorted = Array.prototype.slice.call(Y).sort(function (a, b) { return a - b; });
      var lo = sorted[Math.floor(n * 0.03)], hi = sorted[Math.floor(n * 0.9)], span = Math.max(0.05, hi - lo);
      for (var j = 0; j < n; j++) {
        var px = j % w, py = (j / w) | 0;
        var ink = 1 - clamp((Y[j] - lo) / span, 0, 1);
        var e = 0;
        if (px > 0 && py > 0 && px < w - 1 && py < h - 1) {
          var gx = Y[j + 1] - Y[j - 1] + (Y[j - w + 1] - Y[j - w - 1] + Y[j + w + 1] - Y[j + w - 1]) * 0.5;
          var gy = Y[j + w] - Y[j - w] + (Y[j + w - 1] - Y[j - w - 1] + Y[j + w + 1] - Y[j - w + 1]) * 0.5;
          e = Math.sqrt(gx * gx + gy * gy);
        }
        var x = px / w - 0.5, y = py / h - 0.5;
        var vig = clamp(1.3 - Math.sqrt(x * x + y * y) * 1.9, 0, 1);
        L[j] = clamp(Math.pow(ink, 1.8) * 0.6 + e * 2.2, 0, 1) * vig;
      }
      lum = L; lw = w; lh = h;
    }
    var RAMP = ' .:-=+*#%@';
    eng = new Engine(canvas, {
      fps: LITE ? 10 : 15, staticT: 3,
      lineH: 1.1,
      cellSize: function (w) { return clamp(w / 64 / 0.6, 5, 11); },
      setup: function () { this.state.mode = this.state.mode || 'ascii'; lum = null; },
      render: function (t) {
        if (this.state.mode === 'halftone') return this.opt.halftone.call(this, t);
        if (!lum || lw !== this.cols || lh !== this.rows) sample(this.cols, this.rows);
        if (!lum) return;
        var scanRow = motion ? Math.floor(frac(t / 4) * (this.rows + 10)) - 5 : -99;
        var seed = Math.floor(t * 10);
        this._s = null;
        for (var r = 0; r < this.rows; r++) {
          var near = Math.abs(r - scanRow);
          for (var c = 0; c < this.cols; c++) {
            var v = lum[r * this.cols + c];
            if (v < 0.06) continue;
            var ch = RAMP[Math.min(RAMP.length - 1, Math.floor(v * RAMP.length))];
            if (near < 2 && hash(c, r, seed) > 0.4) { this.put(c, r, hash(c, r, seed + 1) > 0.5 ? '1' : '0', rgba(COL.cyan, 0.9)); continue; }
            this.put(c, r, ch, rgba(near < 4 ? COL.fg : mix(COL.dim, COL.fg, v), (0.35 + v * 0.65).toFixed(2)));
          }
        }
      },
      halftone: function (t) {
        var ctx = this.ctx, w = this.w, h = this.h;
        ctx.fillStyle = '#071433'; ctx.fillRect(0, 0, w, h);
        var g = LITE ? 7 : 6;
        var cols = Math.floor(w / g), rows = Math.floor(h / g);
        if (!lum || lw !== cols || lh !== rows) sample(cols, rows);
        if (!lum) return;
        // floating binary
        ctx.font = '10px ' + MONO; ctx.textBaseline = 'top';
        ctx.fillStyle = rgba(COL.blue, 0.35);
        for (var b = 0; b < 70; b++) {
          var bx = hash(b, 1, 1) * w, by = frac(hash(b, 2, 1) + (motion ? t * 0.03 * (0.5 + hash(b, 3, 1)) : 0)) * h;
          ctx.fillText(hash(b, 4, Math.floor(t)) > 0.5 ? '1' : '0', bx, h - by);
        }
        var wob = motion ? Math.sin(t * 2.3) * 1.5 : 1;
        ctx.globalCompositeOperation = 'screen';
        var layers = [[COL.cyan, 0, 0], [COL.magenta, 2 + wob, 1]];
        for (var L = 0; L < layers.length; L++) {
          ctx.fillStyle = rgba(layers[L][0], L ? 0.75 : 0.95);
          ctx.beginPath();
          for (var r = 0; r < rows; r++) for (var c = 0; c < cols; c++) {
            var v = lum[r * cols + c];
            if (v < 0.08) continue;
            var rad = v * g * 0.62;
            var x = c * g + g / 2 + layers[L][1], y = r * g + g / 2 + layers[L][2];
            ctx.moveTo(x + rad, y); ctx.arc(x, y, rad, 0, 6.2832);
          }
          ctx.fill();
        }
        ctx.globalCompositeOperation = 'source-over';
        // headline with RGB split
        var label = getLabel();
        var fs = Math.max(18, Math.min(40, w / 11));
        ctx.font = '700 ' + fs + 'px ' + DISPLAY; ctx.textBaseline = 'top'; ctx.textAlign = 'center';
        var j = motion && frac(t / 1.7) > 0.85 ? (hash(Math.floor(t * 20), 1, 1) - 0.5) * 8 : 0;
        ctx.fillStyle = rgba(COL.cyan, 0.9); ctx.fillText(label, w / 2 - 2 + j, 14);
        ctx.fillStyle = rgba(COL.magenta, 0.9); ctx.fillText(label, w / 2 + 2 - j, 15);
        ctx.fillStyle = '#c9b8ff'; ctx.fillText(label, w / 2, 14);
        ctx.textAlign = 'start';
      }
    });
    img.onload = function () { lum = null; eng.frame(eng.staticT()); };
    img.src = src;
    eng.setMode = function (m) { this.state.mode = m; lum = null; this.frame(this.running() ? (performance.now() - this.t0) / 1000 : this.staticT()); };
    return eng;
  }

  window.B3A = {
    rain: rain, banner: banner, mask: mask, tunnel: tunnel, wave: wave, noise: noise, cat: cat,
    setMotion: function (on) { motion = !!on; engines.forEach(function (e) { e.sync(); if (!on) e.frame(e.staticT()); }); },
    redrawAll: function () { engines.forEach(function (e) { e.resize(); e.frame(e.running() ? (performance.now() - e.t0) / 1000 : e.staticT()); }); },
    get motion() { return motion; }
  };
})();
