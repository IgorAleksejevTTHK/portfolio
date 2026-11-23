/* buckl3 // UI: language, safe mode, boot sequence, typewriter, scramble, content rendering */
(function () {
  'use strict';

  var B3 = window.B3, A = window.B3A;
  var root = document.documentElement;
  var $ =function (s, el) { return (el || document).querySelector(s); };
  var $$ = function (s, el) { return Array.prototype.slice.call((el || document).querySelectorAll(s)); };

  function store(k, v) { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) { return null; } }
  function sstore(k, v) { try { if (v === undefined) return sessionStorage.getItem(k); sessionStorage.setItem(k, v); } catch (e) { return null; } }
  function motionOK() { return !root.classList.contains('safe'); }

  var lang = root.lang === 'en' ? 'en' : 'et';
  function T(k) { return (B3.STRINGS[lang] || {})[k]; }

  /* ---------- Content rendering ---------- */
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  function renderProjects() {
    var html = B3.PROJECTS.map(function (p, i) {
      var c = p[lang];
      var n = String(i + 1).padStart ? String(i + 1).padStart(2, '0') : ('0' + (i + 1)).slice(-2);
      var link = p.url === null
        ? '<span class="card__locked">' + esc(T('card.private')) + '</span>'
        : '<a class="card__link" href="' + esc(B3.GH + p.id) + '" target="_blank" rel="noopener">' + esc(T('card.open')) + '</a>';
      return '<li class="card reveal' + (p.featured ? ' card--featured' : '') + '">' +
        '<div class="card__head"><span class="card__id">[' + n + '] ~/' + esc(p.id) + '</span>' +
        '<span class="status status--' + p.status + '">' + esc(T('status.' + p.status)) + '</span></div>' +
        '<h3 class="card__title">' + esc(p.title) + '</h3>' +
        '<p class="card__desc">' + esc(c.d) + '</p>' +
        '<ul class="chips" aria-label="stack">' + p.stack.map(function (s) { return '<li>' + esc(s) + '</li>'; }).join('') + '</ul>' +
        '<details><summary>' + esc(T('card.details')) + '</summary><ul>' +
        c.x.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul></details>' +
        '<div class="card__foot">' + link + '</div></li>';
    }).join('');
    $('#cards').innerHTML = html;
  }

  function renderBars() {
    var max = Math.max.apply(null, B3.LANGS.map(function (l) { return l[1]; }));
    var W = window.innerWidth < 420 ? 12 : 20;
    $('#bars').innerHTML = B3.LANGS.map(function (l) {
      var full = Math.round(l[1] / max * W);
      return '<li><span>' + esc(l[0]) + '</span>' +
        '<span class="bar" aria-hidden="true" data-full="' + full + '" data-w="' + W + '">[' + '#'.repeat(full) + '<i>' + '.'.repeat(W - full) + '</i>]</span>' +
        '<span class="n">' + l[1] + '<span class="sr"> ' + esc(T('repos')) + '</span></span></li>';
    }).join('');
    $$('#bars .sr').forEach(function (s) { s.style.cssText = 'position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)'; });
  }

  function animateBars() {
    if (!motionOK()) return;
    $$('#bars .bar').forEach(function (b, i) {
      var full = +b.dataset.full, W = +b.dataset.w, k = 0;
      var id = setInterval(function () {
        k++;
        b.innerHTML = '[' + '#'.repeat(Math.min(k, full)) + '<i>' + '.'.repeat(W - Math.min(k, full)) + '</i>]';
        if (k >= full) clearInterval(id);
      }, 40 + i * 6);
    });
  }

  /* ---------- Language ---------- */
  function applyLang(l) {
    lang = l; root.lang = l; store('b3.lang', l);
    $$('[data-i18n]').forEach(function (el) { var v = T(el.dataset.i18n); if (typeof v === 'string') el.textContent = v; });
    $$('.lang button').forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.lang === l)); });
    $('#mask').setAttribute('aria-label', T('aria.mask'));
    $('#cat').setAttribute('aria-label', T('aria.cat'));
    renderProjects(); renderBars(); observeReveal();
    typer.restart();
    if (catEng && catEng.state.mode === 'halftone') catEng.setMode('halftone');
  }
  $$('.lang button').forEach(function (b) { b.addEventListener('click', function () { applyLang(b.dataset.lang); }); });

  /* ---------- Typewriter ---------- */
  var typer = (function () {
    var el = $('#typed'), timer = 0, wi = 0;
    function words() { return T('typed') || [T('hero.role')]; }
    function run() {
      clearTimeout(timer);
      var list = words();
      if (!motionOK()) { el.textContent = list[0]; return; }
      var w = list[wi % list.length], i = 0, dir = 1;
      (function step() {
        el.textContent = w.slice(0, i);
        if (dir > 0 && i === w.length) { dir = -1; timer = setTimeout(step, 2200); return; }
        if (dir < 0 && i === 0) { wi++; w = list[wi % list.length]; dir = 1; timer = setTimeout(step, 350); return; }
        i += dir;
        timer = setTimeout(step, dir > 0 ? 55 : 25);
      })();
    }
    return { restart: function () { wi = 0; run(); } };
  })();

  /* ---------- Scramble / decrypt ---------- */
  var GLYPHS = '!<>-_\\/[]{}=+*^?#01';
  function scramble(el) {
    if (!motionOK() || el._busy) return;
    var final = el.dataset.final || (el.dataset.final = el.textContent);
    el._busy = true;
    var frame = 0, total = 18;
    (function tick() {
      var out = '';
      for (var i = 0; i < final.length; i++) {
        if (final[i] === ' ' || i < (frame / total) * final.length) out += esc(final[i]);
        else out += '<span class="scr">' + esc(GLYPHS[Math.floor(Math.random() * GLYPHS.length)]) + '</span>';
      }
      el.innerHTML = out;
      if (++frame <= total) requestAnimationFrame(function () { setTimeout(tick, 28); });
      else { el.textContent = final; el._busy = false; }
    })();
  }
  $$('[data-scramble]').forEach(function (el) {
    el.parentElement.addEventListener('mouseenter', function () { scramble(el); });
  });

  /* ---------- Reveal on scroll ---------- */
  var io = 'IntersectionObserver' in window ? new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      e.target.classList.add('is-in');
      var s = e.target.querySelector && e.target.querySelector('[data-scramble]');
      if (s) scramble(s);
      if (e.target.id === 'stack') animateBars();
      io.unobserve(e.target);
    });
  }, { threshold: 0.12 }) : null;
  function observeReveal() {
    if (!io) { $$('.reveal').forEach(function (el) { el.classList.add('is-in'); }); return; }
    $$('.reveal:not(.is-in)').forEach(function (el) { io.observe(el); });
  }
  $$('.section').forEach(function (s) { if (io) io.observe(s); });

  /* ---------- Safe mode ---------- */
  var safeBtn = $('#safeToggle');
  function setSafe(on) {
    root.classList.toggle('safe', on);
    safeBtn.setAttribute('aria-pressed', String(on));
    store('b3.safe', on ? '1' : '0');
    A.setMotion(motionOK());
    typer.restart();
    if (!motionOK()) $$('.reveal').forEach(function (el) { el.classList.add('is-in'); });
  }
  safeBtn.addEventListener('click', function () { setSafe(!root.classList.contains('safe')); });
  safeBtn.setAttribute('aria-pressed', String(root.classList.contains('safe')));

  /* ---------- Boot sequence (once per session) ---------- */
  function boot(done) {
    var el = $('#boot');
    if (!motionOK() || sstore('b3.booted')) { done(); return; }
    sstore('b3.booted', '1');
    el.hidden = false;
    document.body.style.overflow = 'hidden';
    var log = $('#bootLog');
    var lines = [
      ['BUCKL3 BIOS v0.3  (c) 2026', 'hi'],
      ['MEM CHECK ............ 640K ', 'OK'],
      ['MOV AX, 0x0B0C', ''],
      ['MOV BX, 0x0000', ''],
      ['LOAD mask.sys ........ ', 'OK'],
      ['LOAD projects.db ..... ' + B3.PROJECTS.length + ' entries', ''],
      ['DECRYPT whoami ....... ', 'OK'],
      ['MOV AL, "PROCESS COMPLETE"', 'hi'],
      ['>>> _', '']
    ];
    var li = 0, ci = 0, finished = false, html = '';
    function finish() {
      if (finished) return; finished = true;
      el.classList.add('is-out');
      setTimeout(function () { el.hidden = true; document.body.style.overflow = ''; }, 460);
      window.removeEventListener('keydown', finish);
      done();
    }
    (function type() {
      if (finished) return;
      if (li >= lines.length) { setTimeout(finish, 380); return; }
      var txt = lines[li][0], tag = lines[li][1];
      ci += 3;
      var shown = esc(txt.slice(0, ci));
      log.innerHTML = html + (tag === 'hi' ? '<span class="hi">' + shown + '</span>' : shown);
      if (ci >= txt.length) {
        html += (tag === 'hi' ? '<span class="hi">' + esc(txt) + '</span>' : esc(txt)) + (tag === 'OK' ? '<span class="ok">OK</span>' : '') + '\n';
        log.innerHTML = html;
        li++; ci = 0;
        setTimeout(type, 70);
      } else setTimeout(type, 14);
    })();
    $('#bootSkip').addEventListener('click', finish);
    el.addEventListener('click', finish);
    window.addEventListener('keydown', finish);
    $('#bootSkip').focus({ preventScroll: true });
  }

  /* ---------- Init ---------- */
  var catEng = null;
  function initCanvases() {
    A.setMotion(motionOK());
    A.rain($('#rain'));
    A.banner($('#banner'), 'BUCKL3');
    A.mask($('#mask'));
    A.tunnel($('#tunnel'));
    A.wave($('#wave'));
    A.noise($('#noise'));
    catEng = A.cat($('#cat'), 'assets/img/cat.jpg', function () { return T('cat.halftone'); });
    $$('[data-catmode]').forEach(function (b) {
      b.addEventListener('click', function () {
        $$('[data-catmode]').forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
        catEng.setMode(b.dataset.catmode);
      });
    });
    if (document.fonts && document.fonts.ready) {
      Promise.all([
        document.fonts.load('400 12px "JetBrains Mono"'),
        document.fonts.load('700 40px "Chakra Petch"')
      ]).then(function () { A.redrawAll(); }, function () {});
    }
  }

  $$('.whoami, .stack, .contact__log').forEach(function (el) { el.classList.add('reveal'); });
  applyLang(lang);
  boot(function () {});
  initCanvases();
})();
