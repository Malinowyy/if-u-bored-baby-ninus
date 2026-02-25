(() => {
  const WIN_RATE = 0.1;

  const WORDS = [
    "kocham", "ciebie", "misiu", "nina", "patryk", "przytulas", "buziak", "kino", "helios", "oaza",
    "sandomierz", "agata", "koda", "kalkow", "antek", "bubbletea", "maple", "piosenka", "candle", "warszawa",
    "bydgoszcz", "studia", "arcane", "dworzec", "cam", "lego", "badminton", "lisek", "charms", "ninus"
  ];

  const reels = [
    document.getElementById("reel0"),
    document.getElementById("reel1"),
    document.getElementById("reel2"),
  ];
  const knob = document.getElementById("knob");
  const winOverlay = document.getElementById("winOverlay");

  if (reels.some(r => !r) || !knob || !winOverlay) return;

  const state = {
    spinning: false,
    dragActive: false,
    dragStart: 0,
    knobStart: 0,
    reelStates: [],
    rowHeight: 70,
    winFlashTimer: null
  };

  // ---------- helpers ----------
  const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
  const randomWord = () => WORDS[randInt(0, WORDS.length - 1)];
  const randomTriple = () => [randomWord(), randomWord(), randomWord()];
  const nextFrame = () => new Promise(r => requestAnimationFrame(() => r()));
  const forceReflow = (el) => { void el.offsetHeight; };

  function waitTransition(el, fallbackMs) {
    return new Promise((resolve) => {
      let done = false;

      const finish = () => {
        if (done) return;
        done = true;
        el.removeEventListener("transitionend", onEnd);
        resolve();
      };

      const onEnd = (e) => {
        if (e.target !== el) return;
        if (e.propertyName && e.propertyName !== "transform") return;
        finish();
      };

      el.addEventListener("transitionend", onEnd);
      window.setTimeout(finish, fallbackMs);
    });
  }

  function showWinFlash() {
    if (state.winFlashTimer) clearTimeout(state.winFlashTimer);
    winOverlay.classList.remove("hidden");
    state.winFlashTimer = window.setTimeout(() => {
      winOverlay.classList.add("hidden");
      state.winFlashTimer = null;
    }, 1000);
  }

  // ---------- reel DOM ----------
  function buildReelDOM(reelEl) {
    reelEl.innerHTML = `
      <div class="reel-viewport">
        <div class="reel-track"></div>
        <div class="reel-centerline"></div>
      </div>
    `;

    const viewport = reelEl.querySelector(".reel-viewport");
    const track = reelEl.querySelector(".reel-track");
    const center = reelEl.querySelector(".reel-centerline");

    // KLUCZ: wymuszamy stacking / clipping niezależnie od CSS
    viewport.style.overflow = "hidden";
    viewport.style.position = "relative";
    viewport.style.isolation = "isolate";

    // Tekst NAD dekoracjami
    track.style.position = "relative";
    track.style.zIndex = "99";
    track.style.willChange = "transform";

    if (center) {
      center.style.position = "absolute";
      center.style.inset = "0";
      center.style.zIndex = "98";
      center.style.pointerEvents = "none";
    }

    return track;
  }

  function setTrackWords(trackEl, words) {
    trackEl.innerHTML = words.map((w, i) => {
      const cls = (i % 3 === 1) ? "reel-cell center-ish" : "reel-cell";
      return `<div class="${cls}">${w}</div>`;
    }).join("");
  }

  function setTrackPosition(trackEl, y, animated, durationMs = 0, easing = "cubic-bezier(.12,.9,.16,1)") {
    trackEl.style.transition = animated ? `transform ${durationMs}ms ${easing}` : "none";
    trackEl.style.transform = `translateY(${y}px)`;
  }

  function measureRowHeight() {
    const first = state.reelStates[0]?.trackEl?.querySelector(".reel-cell");
    if (!first) return;
    const h = first.getBoundingClientRect().height;
    if (Number.isFinite(h) && h > 10) state.rowHeight = h;
  }

  function setReelToTriple(reelState, triple) {
    setTrackWords(reelState.trackEl, triple);
    setTrackPosition(reelState.trackEl, 0, false);
    reelState.currentTriple = triple.slice();
  }

  function buildSpinSequence(startTriple, endTriple, extraSteps) {
    const seq = [...startTriple];
    for (let i = 0; i < extraSteps; i += 1) seq.push(randomWord());
    seq.push(...endTriple);
    return seq;
  }

  async function spinReelTo(reelState, endTriple, durationMs) {
    const extraSteps = randInt(26, 42);
    const sequence = buildSpinSequence(reelState.currentTriple, endTriple, extraSteps);

    setTrackWords(reelState.trackEl, sequence);
    setTrackPosition(reelState.trackEl, 0, false);

    await nextFrame();
    measureRowHeight();

    forceReflow(reelState.trackEl);
    await nextFrame();

    const finalOffset = -((sequence.length - 3) * state.rowHeight);
    setTrackPosition(reelState.trackEl, finalOffset, true, durationMs);

    await waitTransition(reelState.trackEl, durationMs + 300);

    setReelToTriple(reelState, endTriple);
  }

  // ---------- outcome (3% win) ----------
  function chooseOutcome() {
    const isWin = Math.random() < WIN_RATE;

    if (isWin) {
      const winWord = randomWord();
      const triples = [0, 1, 2].map(() => [randomWord(), winWord, randomWord()]);
      return { isWin: true, triples };
    }

    let mids = [randomWord(), randomWord(), randomWord()];
    while (mids[0] === mids[1] && mids[1] === mids[2]) {
      mids[randInt(0, 2)] = randomWord();
    }

    const triples = mids.map(mid => [randomWord(), mid, randomWord()]);
    return { isWin: false, triples };
  }

  async function startSpin() {
    if (state.spinning) return;
    state.spinning = true;

    const outcome = chooseOutcome();
    const durations = [1400, 1850, 2300];

    try {
      await Promise.all([
        spinReelTo(state.reelStates[0], outcome.triples[0], durations[0]),
        spinReelTo(state.reelStates[1], outcome.triples[1], durations[1]),
        spinReelTo(state.reelStates[2], outcome.triples[2], durations[2]),
      ]);

      if (outcome.isWin) showWinFlash();
    } finally {
      state.spinning = false;
    }
  }

  // ---------- lever (auto axis) ----------
  knob.style.touchAction = "none";

  function leverAxis() {
    const lever = knob.parentElement;
    if (!lever) return "y";
    // jeśli dłuższa oś to wysokość -> pion, inaczej poziom
    return (lever.clientHeight >= lever.clientWidth) ? "y" : "x";
  }

  function getKnobPos() {
    const ax = leverAxis();
    const v = parseFloat(ax === "y" ? (knob.style.top || "0") : (knob.style.left || "0"));
    return Number.isFinite(v) ? v : 0;
  }

  function setKnobPos(v) {
    const ax = leverAxis();
    if (ax === "y") {
      knob.style.top = `${v}px`;
      knob.style.left = "";
    } else {
      knob.style.left = `${v}px`;
      knob.style.top = "";
    }
  }

  function pullMax() {
    const lever = knob.parentElement;
    if (!lever) return 0;
    const ax = leverAxis();
    return ax === "y"
      ? Math.max(0, lever.clientHeight - knob.offsetHeight)
      : Math.max(0, lever.clientWidth - knob.offsetWidth);
  }

  function pointerAxis(e) {
    return leverAxis() === "y" ? e.clientY : e.clientX;
  }

  function returnKnob() {
    knob.classList.add("returning");
    setKnobPos(0);
    window.setTimeout(() => knob.classList.remove("returning"), 220);
  }

  knob.addEventListener("pointerdown", (e) => {
    if (state.spinning) return;

    state.dragActive = true;
    state.dragStart = pointerAxis(e);
    state.knobStart = getKnobPos();
    knob.classList.remove("returning");

    try { knob.setPointerCapture(e.pointerId); } catch (_) {}
    e.preventDefault();
  });

  function onMove(e) {
    if (!state.dragActive) return;
    const delta = pointerAxis(e) - state.dragStart;
    const max = pullMax();
    const next = Math.max(0, Math.min(max, state.knobStart + delta));
    setKnobPos(next);
    e.preventDefault();
  }

  function onRelease(e) {
    if (!state.dragActive) return;
    state.dragActive = false;

    const pulled = getKnobPos();
    const max = pullMax();
    const trigger = max * 0.55;

    returnKnob();

    if (pulled >= trigger) startSpin();

    if (e && typeof knob.releasePointerCapture === "function") {
      try { knob.releasePointerCapture(e.pointerId); } catch (_) {}
    }
  }

  knob.addEventListener("pointermove", onMove);
  window.addEventListener("pointermove", onMove, { passive: false });

  knob.addEventListener("pointerup", onRelease);
  knob.addEventListener("pointercancel", onRelease);
  window.addEventListener("pointerup", onRelease);
  window.addEventListener("pointercancel", onRelease);

  knob.addEventListener("lostpointercapture", () => {
    if (state.dragActive) {
      state.dragActive = false;
      returnKnob();
    }
  });

  // ---------- init ----------
  reels.forEach((reelEl) => {
    const trackEl = buildReelDOM(reelEl);
    const triple = randomTriple();

    const reelState = { reelEl, trackEl, currentTriple: triple.slice() };
    state.reelStates.push(reelState);
    setReelToTriple(reelState, triple);
  });

  measureRowHeight();

  // resize: reset lever + keep reels stable
  let resizeTimer = null;
  window.addEventListener("resize", () => {
    if (resizeTimer) clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(() => {
      if (!state.dragActive) {
        knob.classList.remove("returning");
        setKnobPos(0);
      }
      measureRowHeight();
      state.reelStates.forEach(rs => setReelToTriple(rs, rs.currentTriple));
    }, 80);
  });
})();
