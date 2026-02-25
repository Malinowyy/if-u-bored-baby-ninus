(() => {
  const ROW_HEIGHT = 70;
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

  const isMobileLever = () => window.innerWidth <= 820;

  const state = {
    spinning: false,
    dragActive: false,
    dragStartPos: 0,
    knobStartPos: 0,
    reelStates: [] // [{ reelEl, trackEl, currentTriple }]
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
        finish();
      };

      el.addEventListener("transitionend", onEnd);
      setTimeout(finish, fallbackMs);
    });
  }

  function showWinFlash() {
    winOverlay.classList.remove("hidden");
    setTimeout(() => {
      winOverlay.classList.add("hidden");
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
    return reelEl.querySelector(".reel-track");
  }

  function setTrackWords(trackEl, words) {
    trackEl.innerHTML = words.map((w, i) => {
      // Tylko lekki class (nie musi być idealny)
      const cls = (i % 3 === 1) ? "reel-cell center-ish" : "reel-cell";
      return `<div class="${cls}">${w}</div>`;
    }).join("");
  }

  function setTrackPosition(trackEl, y, animated, durationMs = 0, easing = "cubic-bezier(.12,.9,.16,1)") {
    trackEl.style.transition = animated ? `transform ${durationMs}ms ${easing}` : "none";
    trackEl.style.transform = `translateY(${y}px)`;
  }

  function setReelToTriple(reelState, triple) {
    // Pokazuje dokładnie 3 słowa: górne, środkowe, dolne
    setTrackWords(reelState.trackEl, triple);
    setTrackPosition(reelState.trackEl, 0, false);
    reelState.currentTriple = triple.slice();
  }

  function buildSpinSequence(startTriple, endTriple, extraSteps) {
    // startTriple widoczne na starcie, potem dużo losowych, na końcu finalne 3
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

    await nextFrame();
    await nextFrame();

    const finalOffset = -((sequence.length - 3) * ROW_HEIGHT);
    setTrackPosition(reelState.trackEl, finalOffset, true, durationMs);

    await waitTransition(reelState.trackEl, durationMs + 200);

    // Normalize (żeby nie trzymać wielkiej listy w DOM po każdym spinie)
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

    // Przegrana: środkowe słowa NIE mogą być wszystkie takie same
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

    // Każde koło kończy trochę później (fajniejszy efekt)
    const durations = [1400, 1850, 2300];

    await Promise.all([
      spinReelTo(state.reelStates[0], outcome.triples[0], durations[0]),
      spinReelTo(state.reelStates[1], outcome.triples[1], durations[1]),
      spinReelTo(state.reelStates[2], outcome.triples[2], durations[2]),
    ]);

    if (outcome.isWin) {
      showWinFlash();
    }

    state.spinning = false;
  }

  // =========================
  // Lever drag (pointer events)
  // =========================
  function getKnobAxisPos() {
    if (isMobileLever()) {
      const left = parseFloat(knob.style.left || "0");
      return Number.isFinite(left) ? left : 0;
    }
    const top = parseFloat(knob.style.top || "0");
    return Number.isFinite(top) ? top : 0;
  }

  function setKnobAxisPos(v) {
    if (isMobileLever()) {
      knob.style.left = `${v}px`;
    } else {
      knob.style.top = `${v}px`;
    }
  }

  function getPullMax() {
    const lever = knob.parentElement;
    if (!lever) return 0;

    if (isMobileLever()) {
      return Math.max(0, lever.clientWidth - knob.offsetWidth);
    }
    return Math.max(0, lever.clientHeight - knob.offsetHeight);
  }

  function getPointerAxis(e) {
    return isMobileLever() ? e.clientX : e.clientY;
  }

  function returnKnob() {
    knob.classList.add("returning");
    setKnobAxisPos(0);

    setTimeout(() => {
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

  knob.addEventListener("pointermove", (e) => {
    if (!state.dragActive) return;

    const delta = getPointerAxis(e) - state.dragStartPos;
    const maxPull = getPullMax();
    const next = Math.max(0, Math.min(maxPull, state.knobStartPos + delta));

    setKnobAxisPos(next);
  });

  function handlePointerRelease(e) {
    if (!state.dragActive) return;
    state.dragActive = false;

    const pulled = getKnobAxisPos();
    const maxPull = getPullMax();
    const trigger = maxPull * 0.55; // trzeba pociągnąć min. 55%

    returnKnob();

    if (pulled >= trigger) {
      startSpin();
    }

    if (e && typeof knob.releasePointerCapture === "function") {
      try { knob.releasePointerCapture(e.pointerId); } catch (_) {}
    }
  }

  knob.addEventListener("pointerup", handlePointerRelease);
  knob.addEventListener("pointercancel", handlePointerRelease);
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

  // Po resize reset pozycji wajchy (żeby mobile/desktop się nie rozjechało)
  window.addEventListener("resize", () => {
    if (state.dragActive) return;
    knob.classList.remove("returning");
    setKnobAxisPos(0);
  });
})();
