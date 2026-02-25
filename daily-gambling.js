(() => {
  const WIN_RATE = 0.03;

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
    dragStartPos: 0,
    knobStartPos: 0,
    reelStates: [],
    rowHeight: 70,
    winFlashTimer: null
  };

  // =========================
  // Helpers
  // =========================
  const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
  const randomWord = () => WORDS[randInt(0, WORDS.length - 1)];

  function randomTriple() {
    return [randomWord(), randomWord(), randomWord()];
  }

  function sleep(ms) {
    return new Promise(res => setTimeout(res, ms));
  }

  function nextFrame() {
    return new Promise(res => requestAnimationFrame(() => res()));
  }

  function forceReflow(el) {
    // wymusza przeliczenie layoutu przed startem transition
    void el.offsetHeight;
  }

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
    if (state.winFlashTimer) {
      clearTimeout(state.winFlashTimer);
      state.winFlashTimer = null;
    }

    winOverlay.classList.remove("hidden");
    state.winFlashTimer = window.setTimeout(() => {
      winOverlay.classList.add("hidden");
      state.winFlashTimer = null;
    }, 1000);
  }

  // =========================
  // Reel DOM / render
  // =========================
  function buildReelDOM(reelEl) {
    reelEl.innerHTML = `
      <div class="reel-viewport">
        <div class="reel-track"></div>
        <div class="reel-centerline"></div>
      </div>
    `;
    const track = reelEl.querySelector(".reel-track");
    track.style.willChange = "transform";
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
    // bierzemy realną wysokość komórki z DOM (ważne na mobile)
    const firstTrack = state.reelStates[0] && state.reelStates[0].trackEl;
    if (!firstTrack) return;

    const firstCell = firstTrack.querySelector(".reel-cell");
    if (!firstCell) return;

    const h = firstCell.getBoundingClientRect().height;
    if (Number.isFinite(h) && h > 10) {
      state.rowHeight = h;
    }
  }

  function setReelToTriple(reelState, triple) {
    setTrackWords(reelState.trackEl, triple);
    setTrackPosition(reelState.trackEl, 0, false);
    reelState.currentTriple = triple.slice();
  }

  function buildSpinSequence(startTriple, endTriple, extraSteps) {
    // start -> sporo losowych -> end
    const seq = [...startTriple];
    for (let i = 0; i < extraSteps; i += 1) {
      seq.push(randomWord());
    }
    seq.push(...endTriple);
    return seq;
  }

  async function spinReelTo(reelState, endTriple, durationMs) {
    const extraSteps = randInt(26, 42);
    const sequence = buildSpinSequence(reelState.currentTriple, endTriple, extraSteps);

    setTrackWords(reelState.trackEl, sequence);
    setTrackPosition(reelState.trackEl, 0, false);

    // przelicz row height po zbudowaniu tracka
    measureRowHeight();

    // wymuś layout zanim odpalimy transition
    forceReflow(reelState.trackEl);
    await nextFrame();

    const finalOffset = -((sequence.length - 3) * state.rowHeight);
    setTrackPosition(reelState.trackEl, finalOffset, true, durationMs);

    await waitTransition(reelState.trackEl, durationMs + 300);

    // Normalize (czyścimy DOM po spinie)
    setReelToTriple(reelState, endTriple);
  }

  // =========================
  // Outcome logic (3% win)
  // =========================
  function chooseOutcome() {
    const isWin = Math.random() < WIN_RATE;

    if (isWin) {
      const winWord = randomWord();

      const triples = [0, 1, 2].map(() => {
        const top = randomWord();
        const mid = winWord;
        const bottom = randomWord();
        return [top, mid, bottom];
      });

      return { isWin: true, triples };
    }

    // Przegrana: środkowe NIE mogą być wszystkie identyczne
    let mids = [randomWord(), randomWord(), randomWord()];
    while (mids[0] === mids[1] && mids[1] === mids[2]) {
      mids[randInt(0, 2)] = randomWord();
    }

    const triples = mids.map((mid) => [randomWord(), mid, randomWord()]);
    return { isWin: false, triples };
  }

  async function startSpin() {
    if (state.spinning) return;
    state.spinning = true;

    const outcome = chooseOutcome();

    // Każde koło kończy później
    const durations = [1400, 1850, 2300];

    try {
      await Promise.all([
        spinReelTo(state.reelStates[0], outcome.triples[0], durations[0]),
        spinReelTo(state.reelStates[1], outcome.triples[1], durations[1]),
        spinReelTo(state.reelStates[2], outcome.triples[2], durations[2]),
      ]);

      if (outcome.isWin) {
        showWinFlash();
      }
    } finally {
      state.spinning = false;
    }
  }

  // =========================
  // Lever drag (always vertical)
  // =========================
  knob.style.touchAction = "none";

  function getKnobAxisPos() {
    const top = parseFloat(knob.style.top || "0");
    return Number.isFinite(top) ? top : 0;
  }

  function setKnobAxisPos(v) {
    knob.style.top = `${v}px`;
    // czyścimy left, bo wajcha ma być pionowa zawsze
    knob.style.left = "";
  }

  function getPullMax() {
    const lever = knob.parentElement;
    if (!lever) return 0;
    return Math.max(0, lever.clientHeight - knob.offsetHeight);
  }

  function getPointerAxis(e) {
    return e.clientY;
  }

  function returnKnob() {
    knob.classList.add("returning");
    setKnobAxisPos(0);

    window.setTimeout(() => {
      knob.classList.remove("returning");
    }, 220);
  }

  knob.addEventListener("pointerdown", (e) => {
    if (state.spinning) return;

    state.dragActive = true;
    state.dragStartPos = getPointerAxis(e);
    state.knobStartPos = getKnobAxisPos();

    knob.classList.remove("returning");

    try { knob.setPointerCapture(e.pointerId); } catch (_) {}

    e.preventDefault();
  });

  function onPointerMove(e) {
    if (!state.dragActive) return;

    const delta = getPointerAxis(e) - state.dragStartPos;
    const maxPull = getPullMax();
    const next = Math.max(0, Math.min(maxPull, state.knobStartPos + delta));

    setKnobAxisPos(next);
    e.preventDefault();
  }

  function handlePointerRelease(e) {
    if (!state.dragActive) return;
    state.dragActive = false;

    const pulled = getKnobAxisPos();
    const maxPull = getPullMax();
    const trigger = maxPull * 0.55;

    returnKnob();

    if (pulled >= trigger) {
      startSpin();
    }

    if (e && typeof knob.releasePointerCapture === "function" && e.pointerId !== undefined) {
      try { knob.releasePointerCapture(e.pointerId); } catch (_) {}
    }
  }

  // Ruch i puszczenie obsługuj też globalnie (Safari/mobile bywa kapryśny)
  knob.addEventListener("pointermove", onPointerMove);
  window.addEventListener("pointermove", onPointerMove, { passive: false });

  knob.addEventListener("pointerup", handlePointerRelease);
  knob.addEventListener("pointercancel", handlePointerRelease);
  window.addEventListener("pointerup", handlePointerRelease);
  window.addEventListener("pointercancel", handlePointerRelease);

  knob.addEventListener("lostpointercapture", () => {
    if (state.dragActive) {
      state.dragActive = false;
      returnKnob();
    }
  });

  // =========================
  // Init
  // =========================
  reels.forEach((reelEl) => {
    const trackEl = buildReelDOM(reelEl);
    const triple = randomTriple();

    const reelState = {
      reelEl,
      trackEl,
      currentTriple: triple.slice(),
    };

    state.reelStates.push(reelState);
    setReelToTriple(reelState, triple);
  });

  // zmierz finalny rowHeight po pierwszym renderze
  measureRowHeight();

  // Po resize: reset wajchy + poprawne przeliczenie wysokości wiersza
  let resizeTimer = null;
  window.addEventListener("resize", () => {
    if (resizeTimer) clearTimeout(resizeTimer);

    resizeTimer = window.setTimeout(() => {
      if (!state.dragActive) {
        knob.classList.remove("returning");
        setKnobAxisPos(0);
      }

      measureRowHeight();

      // Utrzymaj aktualny stan slotów po zmianie rozmiaru
      state.reelStates.forEach((reelState) => {
        setReelToTriple(reelState, reelState.currentTriple);
      });
    }, 80);
  });
})();
