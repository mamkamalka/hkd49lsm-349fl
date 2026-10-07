/* Если что-то сломалось (например, при правке data.js), показываем понятное сообщение */
(function () {
  function banner(msg) {
    if (document.getElementById("errBanner")) return;
    var d = document.createElement("div");
    d.id = "errBanner";
    d.style.cssText = "position:fixed;left:12px;right:12px;bottom:12px;z-index:99;padding:14px 16px;border-radius:14px;background:#fff;color:#8a2f3b;font:14px/1.4 sans-serif;box-shadow:0 8px 30px rgba(0,0,0,.25)";
    d.textContent = msg;
    document.body.appendChild(d);
  }
  window.addEventListener("error", function (e) {
    var file = (e.filename || "").split("/").pop();
    banner("Ошибка в файле " + (file || "?") + (e.lineno ? ", строка " + e.lineno : "") + ": " + e.message);
  });
  if (typeof SITE === "undefined") {
    banner("Не загрузился файл data.js. Он должен лежать рядом с index.html и называться ровно data.js (не data.js.txt). Если ты его правила — возможно, пропала кавычка или запятая.");
  }
})();

/* =====================================================================
   ЛОГИКА САЙТА. Здесь ничего менять не нужно —
   тексты, пароль, фото и музыка настраиваются в файле data.js
   ===================================================================== */
(function () {
  "use strict";

  const $ = (sel, root) => (root || document).querySelector(sel);
  const byId = (id) => document.getElementById(id);
  const reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const rand = (a, b) => a + Math.random() * (b - a);

  const HEART_SVG =
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>';

  /* ---------- Вспомогательные функции ---------- */
  function setText(id, text) {
    const el = byId(id);
    if (el) el.textContent = text || "";
  }
  function setParagraphs(id, list) {
    const el = byId(id);
    if (!el) return;
    el.innerHTML = "";
    (list || []).forEach((t) => {
      const p = document.createElement("p");
      p.textContent = t;
      el.appendChild(p);
    });
  }
  function show(el) { el.classList.add("show"); }
  function hide(el) { el.classList.remove("show"); }
  function normalize(s) {
    return String(s).trim().toLowerCase().replace(/ё/g, "е");
  }

  /* ---------- Заполняем тексты из data.js ---------- */
  document.title = SITE.pageTitle || document.title;

  setText("gateTitle", SITE.gate.title);
  setText("gateSub", SITE.gate.subtitle);
  byId("pwd").placeholder = SITE.gate.placeholder;
  setText("gateBtn", SITE.gate.button);
  setText("gateError", SITE.gate.error);

  setText("envHint", SITE.envelope.hint);
  setText("envCardText", SITE.envelope.cardText);
  setText("envNext", SITE.envelope.button);

  setParagraphs("photoText", SITE.photo.lines);
  setText("photoNext", SITE.photo.button);
  setText("photoCaption", SITE.photos.caption);

  setText("lettersTitle", SITE.letters.title);
  setText("lettersSub", SITE.letters.subtitle);
  setText("lettersNext", SITE.letters.button);
  setText("mClose", SITE.letters.closeButton);

  setText("reasonsIntro", SITE.reasons.intro);
  setText("reasonsNext", SITE.reasons.button);

  setText("finalTitle", SITE.finale.title);
  setParagraphs("finalBody", SITE.finale.body);
  setText("finalSign", SITE.finale.signoff);
  setText("finalBtn", SITE.finale.button);
  setText("finalMsg", SITE.finale.finalMessage);

  document.querySelectorAll("[data-heart]").forEach((el) => { el.innerHTML = HEART_SVG; });

  /* ---------- Фотографии (с запасным вариантом, если файла нет) ---------- */
  document.querySelectorAll("img[data-photo]").forEach((img) => {
    const wrap = img.closest(".photo-wrap");
    wrap.dataset.placeholder = SITE.photos.placeholder || "";
    img.addEventListener("error", () => wrap.classList.add("empty"));
    img.src = SITE.photos[img.dataset.photo];
  });

  /* ---------- Сердечки ---------- */
  const layer = byId("heartsLayer");
  const heartColors = ["var(--rose)", "var(--powder)", "var(--sage)"];

  function spawnHeart(kind, o) {
    o = o || {};
    if (reduce) return;
    const el = document.createElement("span");
    el.className = "heart " + kind;
    const size = o.size || rand(10, 22);
    const t = o.t || (kind === "burst" ? rand(1.1, 1.8) : kind === "up" ? rand(7, 11) : rand(5, 9));
    const delay = o.delay || 0;
    el.style.setProperty("--s", size + "px");
    el.style.setProperty("--c", heartColors[Math.floor(Math.random() * heartColors.length)]);
    el.style.setProperty("--t", t + "s");
    el.style.setProperty("--d", delay + "s");
    el.style.setProperty("--dx", (o.dx !== undefined ? o.dx : rand(-40, 40)) + "px");
    el.style.setProperty("--r", rand(-90, 90) + "deg");
    if (kind === "burst") {
      el.style.setProperty("--x", o.x + "px");
      el.style.setProperty("--y", o.y + "px");
      el.style.setProperty("--dy", o.dy + "px");
    } else {
      el.style.setProperty("--x", rand(2, 96) + "%");
    }
    el.innerHTML = HEART_SVG;
    layer.appendChild(el);
    const remove = () => el.remove();
    el.addEventListener("animationend", remove);
    setTimeout(remove, (t + delay) * 1000 + 800);
  }

  function burstAt(x, y, count) {
    for (let i = 0; i < count; i++) {
      const a = (Math.PI * 2 * i) / count + rand(-0.2, 0.2);
      const d = rand(60, 150);
      spawnHeart("burst", { x: x, y: y, dx: Math.cos(a) * d, dy: Math.sin(a) * d - 30, size: rand(10, 20) });
    }
  }

  let ambientTimer = null;
  function startAmbient() {
    stopAmbient();
    if (reduce) return;
    spawnHeart("up", { delay: 0.5 });
    ambientTimer = setInterval(() => spawnHeart("up", { size: rand(9, 16) }), 1700);
  }
  function stopAmbient() {
    clearInterval(ambientTimer);
    ambientTimer = null;
  }

  let rainTimer = null;
  function startRain() {
    if (reduce) return;
    for (let i = 0; i < 26; i++) spawnHeart("fall", { delay: rand(0, 3.5) });
    rainTimer = setInterval(() => {
      if (layer.childElementCount < 60) spawnHeart("fall");
    }, 450);
  }

  /* ---------- Переходы между экранами ---------- */
  let current = "gate";
  let busy = false;

  function goTo(name) {
    if (busy) return;
    busy = true;
    const from = byId("screen-" + current);
    const to = byId("screen-" + name);
    from.classList.remove("active");
    stopAmbient();
    setTimeout(function () {
      to.scrollTop = 0;
      to.classList.add("active", "shown");
      current = name;
      if (name === "photo" || name === "final") startAmbient();
      busy = false;
    }, reduce ? 0 : 600);
  }

  /* ---------- Экран 1: пароль ---------- */
  const form = byId("gateForm");
  const pwd = byId("pwd");
  const gateError = byId("gateError");

  pwd.addEventListener("input", () => hide(gateError));

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    const value = normalize(pwd.value);
    const ok = (SITE.passwords || []).some((p) => normalize(p) === value);

    if (ok) {
      pwd.blur();
      hide(gateError);
      startMusicSetup();
      new Image().src = SITE.photos.main;      // заранее подгружаем фото
      goTo("envelope");
    } else {
      pwd.classList.remove("shake");
      void pwd.offsetWidth;                     // перезапуск анимации
      pwd.classList.add("shake");
      show(gateError);
    }
  });

  /* ---------- Музыка ---------- */
  const audio = byId("bgm");
  const musicBtn = byId("musicBtn");
  musicBtn.textContent = SITE.music.buttonOn;

  function musicFailed() { musicBtn.classList.remove("show"); musicBtn.hidden = true; }

  function startMusicSetup() {
    if (!SITE.music || !SITE.music.file) { musicFailed(); return; }
    audio.addEventListener("error", musicFailed);
    audio.preload = "metadata";
    audio.src = SITE.music.file;
    setTimeout(function () {
      if (!audio.error) show(musicBtn);
    }, 1200);
  }

  musicBtn.addEventListener("click", function () {
    if (audio.paused) {
      const p = audio.play();
      if (p && p.then) {
        p.then(() => {
          musicBtn.textContent = SITE.music.buttonOff;
          musicBtn.classList.add("playing");
        }).catch(() => {});
      }
    } else {
      audio.pause();
      musicBtn.textContent = SITE.music.buttonOn;
      musicBtn.classList.remove("playing");
    }
  });

  /* ---------- Экран 2: конверт ---------- */
  const envelope = byId("envelope");
  envelope.addEventListener("click", function () {
    if (envelope.classList.contains("open")) return;
    envelope.classList.add("open");
    envelope.setAttribute("aria-label", SITE.envelope.cardText);
    byId("envHint").classList.add("gone");
    setTimeout(() => show(byId("envNext")), reduce ? 0 : 2600);
  });
  byId("envNext").addEventListener("click", () => goTo("photo"));

  /* ---------- Экран 3 ---------- */
  byId("photoNext").addEventListener("click", () => goTo("letters"));

  /* ---------- Экран 4: письма ---------- */
  const L = SITE.letters;
  const list = byId("lettersList");
  const opened = new Set();
  const modal = byId("modal");
  const lettersHint = byId("lettersHint");
  let lastFocus = null;

  function isLocked(i) {
    return !!L.lockLast && i === L.items.length - 1 && opened.size < L.items.length - 1;
  }

  function renderLetterState(btn, i) {
    const state = btn.querySelector(".letter-state");
    const locked = isLocked(i);
    btn.classList.toggle("locked", locked);
    btn.classList.toggle("opened", opened.has(i));
    if (locked) state.textContent = "🔒";
    else state.innerHTML = HEART_SVG;
  }

  L.items.forEach((item, i) => {
    const li = document.createElement("li");
    li.style.setProperty("--i", i);
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "letter glass";
    btn.innerHTML =
      '<span class="letter-icon"></span><span class="letter-title"></span><span class="letter-state"></span>';
    btn.querySelector(".letter-icon").textContent = item.icon;
    btn.querySelector(".letter-title").textContent = item.title;
    renderLetterState(btn, i);
    btn.addEventListener("click", () => openLetter(i, btn));
    li.appendChild(btn);
    list.appendChild(li);
  });

  function refreshLetters() {
    list.querySelectorAll(".letter").forEach((btn, i) => renderLetterState(btn, i));
  }

  function openLetter(i, btn) {
    if (isLocked(i)) {
      btn.classList.remove("shake");
      void btn.offsetWidth;
      btn.classList.add("shake");
      lettersHint.textContent = L.lockedHint || "";
      show(lettersHint);
      setTimeout(() => hide(lettersHint), 2600);
      return;
    }
    const item = L.items[i];
    byId("mIcon").textContent = item.icon;
    byId("mTitle").textContent = item.title;
    byId("mText").textContent = item.text;
    lastFocus = btn;
    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");
    opened.add(i);
    setTimeout(() => byId("mClose").focus({ preventScroll: true }), 50);
  }

  function closeModal() {
    if (!modal.classList.contains("open")) return;
    modal.classList.remove("open");
    modal.setAttribute("aria-hidden", "true");
    refreshLetters();
    if (lastFocus) lastFocus.focus({ preventScroll: true });
    if (opened.size >= L.items.length) show(byId("lettersNext"));
  }

  modal.querySelectorAll("[data-close]").forEach((el) => el.addEventListener("click", closeModal));
  byId("mClose").addEventListener("click", closeModal);
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeModal(); });
  byId("lettersNext").addEventListener("click", () => goTo("reasons"));

  /* ---------- Экран 5: «За что я тебя люблю» ---------- */
  const R = SITE.reasons;
  const reasonBtn = byId("reasonBtn");
  const reasonsList = byId("reasonsList");
  let shownCount = 0;

  function updateReasonLabels() {
    setText("reasonBtnText", shownCount === 0 ? R.tapFirst : R.tapMore);
    setText(
      "reasonCount",
      (R.countTemplate || "{n} из {total}")
        .replace("{n}", shownCount)
        .replace("{total}", R.items.length)
    );
  }
  updateReasonLabels();

  function finishReasons() {
    reasonBtn.classList.add("done");
    reasonBtn.disabled = true;
    setTimeout(() => show(byId("reasonsNext")), reduce ? 0 : 500);
  }
  if (!R.items.length) finishReasons();

  reasonBtn.addEventListener("click", function () {
    if (shownCount >= R.items.length) return;
    const li = document.createElement("li");
    li.className = "reason";
    li.innerHTML = '<span class="r-heart">' + HEART_SVG + "</span><span></span>";
    li.lastChild.textContent = R.items[shownCount];
    reasonsList.insertBefore(li, reasonsList.firstChild);   // новая причина — сверху, кнопка не «убегает»
    shownCount++;

    const r = reasonBtn.getBoundingClientRect();
    burstAt(r.left + r.width / 2, r.top + r.height / 2, 6);

    updateReasonLabels();
    if (shownCount >= R.items.length) finishReasons();
  });
  byId("reasonsNext").addEventListener("click", () => goTo("final"));

  /* ---------- Экран 6: финал ---------- */
  const finalBtn = byId("finalBtn");
  finalBtn.addEventListener("click", function () {
    if (finalBtn.classList.contains("done")) return;
    const r = finalBtn.getBoundingClientRect();
    finalBtn.classList.add("done");
    finalBtn.disabled = true;
    stopAmbient();
    burstAt(r.left + r.width / 2, r.top + r.height / 2, 16);
    startRain();
    setTimeout(() => {
      const msg = byId("finalMsg");
      show(msg);
      msg.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "center" });
    }, reduce ? 0 : 700);
  });
})();
