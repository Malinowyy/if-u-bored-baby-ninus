// terminal.js
// Naprawiona wersja: boot typing, tabela, 'all done' -> odliczanie z alarm.mp3 -> glitch.mp4
// -> ADMIN intro (wolniej) + pauza 7s + ominous.png -> quiz -> finał + reset.

let appMode = "terminal";

(function () {
  // ====== DOM ======
  const out = document.getElementById("terminalText");
  const input = document.getElementById("terminalInput");
  const caret = document.getElementById("caret");
  const promptRow = document.getElementById("promptRow");
  const promptLabel = document.getElementById("promptLabel");
  const terminalBody = document.getElementById("terminalBody");

  const normalCounterEl = document.getElementById("normalCounter");
  const superCounterEl = document.getElementById("superCounter");
  const tableBody = document.getElementById("foundTableBody");

  const resetBtn = document.getElementById("resetBtn");

  const glitchVideo = document.getElementById("glitchVideo");   // <video id="glitchVideo" class="hidden" ...>
  const adminOverlay = document.getElementById("adminOverlay"); // <div id="adminOverlay" class="hidden"><div id="adminContent"></div></div>
  const adminContent = document.getElementById("adminContent");

  if (
    !out || !input || !caret || !promptRow || !promptLabel || !terminalBody ||
    !normalCounterEl || !superCounterEl || !tableBody
  ) return;

  // ====== STORAGE KEYS ======
  const LS_KEY_FOUND = "misiu_found_slots_v1";
  const LS_KEY_ALLDONE = "misiu_alldone_unlocked_v1";

  // ====== CONFIG ======
  const SPECIAL_COMMANDS = {
    "all done": "Suspicious behaviour detected. Activating defense protocol...\n.\n.\nInforming THE ADMIN!\n",
  };

  // Sloty w kolejności w tabeli
  const SLOT_DEFS = [
    { id: "haslo1", type: "normal", label: "Igrzyska śmierci w Heliosie", msg:"To właśnie tu mam pierwsze wspomnienie z Tobą.\nPrzyszedłem do kina z nowo poznaną paczką przyjaciół. Pamiętam to zaspanie w tym kinie i szok, że ktoś mnie rozpoznał, hahah.\nKto by wtedy przypuszczał...\n"},
    { id: "haslo2",  type: "normal", label: "Oaza w sandomierzu", msg: "Ah... Dla mnie tu zaczęła się nasza relacja.\nPamiętasz jak ganiało za Tobą multum chłopaków? Albo jak ja za Rokitą... To właśnie ta akcja zapoczątkowała naszą znajomość.\nTo właśnie był główny temat naszych pierwszych rozmów. A potem już poleciało.\n" },
    { id: "haslo3",  type: "normal", label: "Osiemnastka agaty", msg: "To było mocne haha. Jeszcze wtedy nie wiedziałem, że Cię pokochałem, ale coś mnie do Ciebie ciągnęło.\nNatomiast pamiętam, że już irytowała mnie obecność Antka obok Ciebie i z jakiegoś powodu mu zazdrościłem.\nNie zastanawiałem się nad tym jednak dłużej.\nPamiętam, jak się stresowałem, bo to przecież pierwsza osiemnastka, na której byłem w życiu.\nI pamiętam jak mnie w tym wspierałaś...\n" },
    { id: "haslo4",  type: "normal", label: "KODA", msg: "Na oko - ze 3 miesiąc od zauroczenia się w Tobie. Pierwszy od zakochania się.\nZ każdym dniem coraz mocniej uświadamiłem sobie, że odkochanie się nie będzie takie proste.\nWtedy też pobiłem ścianę z tej frustracji. I wtedy też dowiedziała się Aga.\nPamiętam jak krytykowałem w głowie to, jak Antek się zachowywał wokół Ciebie.\nGdybym tylko miał kiedyś szansę pokazać Ci na jaką miłość zasługujesz...\n" },
    { id: "haslo5",  type: "normal", label: "Kałków oaza", msg: "Tutaj już powoli myślałem, że udało mi się odkochać.\nPopłakałaś się.\nA ja poczułem złość.\nJakim cudem nikt Cię nie wspierał. Czemu zostałaś sama.\nI wtedy uświadomiłem sobie, że nie byłaś szczęśliwa.\n" },
    { id: "haslo6", type: "normal", label: "The antek thing...", msg:"Hmm ciekawy wybór.\n\nTeż to pamiętam. Cały ten dzień.\nWysyłałaś głosówki. Płakałaś.\nRzuciłem rower na trawę i zacząłem chodzić po polu w Jedlance, pocieszając Cię.\n"},
    { id: "haslo7", type: "normal", label: "Osiemnastka Maliny!", msg:"Hahahah, pamiętam jak zacząłem sobie robić nadzieję.\nWika śmiała się, że jak się nie pocałujemy, to ona nie wierzy w miłość.\nPiękne wspomnienia.\n"},
    { id: "haslo8", type: "normal", label: "Pierwszy raz u mnie na caaaały dzień!", msg:"Ale się jarałem.\nPrzy Tobie w ogóle się nie stresowałem.\nZ Tobą było mi tak dobrze jak samemu. Nawet lepiej.\n"},
    { id: "haslo9", type: "normal", label: "Bubbletea (mój pierwszy pretekst)", msg:"Pierwsze koty za płoty.\n„Mam kasę, to stawiam bubble tea”.\nPamiętasz jak szliśmy wybrać tapetę, jedząc Takisy?\n"},
    { id: "haslo10", type: "normal", label: "Pewnego pamiętnego poniedziałku... Piosenka!", msg: "Wróciliśmy ze szkoły animatora.\nOdpaliłem notatnik.\nPojechałem do Ciebie - teraz albo nigdy.\nOdpaliłem piosenkę.\nPowiedziałaś: „Chciałabym dać nam szansę”.\nDziękuję.\n" },
    { id: "haslo11", type: "normal", label: "Candle!", msg: "Candle reminder!!\n" },
    { id: "haslo12", type: "normal", label: "Pierwszy pocałunek", msg: "Dwa tygodnie po pamiętnym poniedziałku.\nW końcu wróciłaś.\nZrobiłem Ci niespodziankę na dworcu.\n" },
    { id: "haslo13", type: "normal", label: "Dziękuję! hahah", msg: "Kocham Cię! (nie dziękuj :p)\n" },
    { id: "haslo14", type: "normal", label: "Bydgoszcz jeden", msg: "Ale było fajnie.\n" },
    { id: "haslo15", type: "normal", label: "Warszawa", msg: "W Warszawie było dziwnie.\n" },
    { id: "haslo16", type: "normal", label: "No contact", msg: "ChatGPT mi mówił kiedy mogę napisać.\n" },
    { id: "haslo17", type: "normal", label: "Święta, Sylwester, Studniówka, Bydgoszcz dwa - happy ending", msg: "W święta mieliśmy kolejną rozmowę.\nKocham Cię Ninuś.\n" },
    { id: "super1",  type: "super",  label: "Liseeek", msg: "Liseeeeek! Pamiętnik. Syrena alarmowa.\n" },
    { id: "super2",  type: "super",  label: "Kształcenie słuchu", msg: "W sumie to fajna sprawa, zmieniłem zdanie\n" },
  ];

  const ALIASES = [
    { slot: "haslo1",  words: ["kino", "igrzyska", "helios", "igrzyska smierci", "igrzyska śmierci"] },
    { slot: "haslo2",  words: ["sandomierz", "trojka", "trójka"] },
    { slot: "haslo3",  words: ["agata", "osiemnastka agi"] },
    { slot: "haslo4",  words: ["koda", "sciana", "ściana"] },
    { slot: "haslo5",  words: ["kalkow", "kałków", "eremy", "oaza", "wakacje"] },
    { slot: "haslo6",  words: ["antek", "rozstanie", "zerwanie"] },
    { slot: "haslo7",  words: ["osiemnastka", "impreza"] },
    { slot: "haslo8",  words: ["badminton", "lego", "kpop demon hunters", "jedlanka"] },
    { slot: "haslo9",  words: ["bubble tea", "bubbletea", "radom", "wyjscie", "wyjście"] },
    { slot: "haslo10", words: ["like a maple leaf", "piosenka", "maple leaf", "pamietny poniedzialek", "pamiętny poniedziałek", "poniedzialek", "poniedziałek"] },
    { slot: "haslo11", words: ["candle"] },
    { slot: "haslo12", words: ["calus", "całus", "buziak"] },
    { slot: "haslo13", words: ["kocham cie", "kocham cię", "dziekuje", "dziękuję"] },
    { slot: "haslo14", words: ["bydgoszcz", "bydgoszcz jeden"] },
    { slot: "haslo15", words: ["warszawa"] },
    { slot: "haslo16", words: ["no contact"] },
    { slot: "haslo17", words: ["bydgoszcz dwa", "swieta", "święta", "sylwester"] },
    { slot: "super1",  words: ["lisek", "wiewiorka", "wiewiórka", "misia"] },
    { slot: "super2",  words: ["ksztalcenie sluchu", "kształcenie słuchu"] },
  ];

  // ====== MAPS ======
  const SLOT_POSITION = {};
  const SLOT_LABEL = {};
  const SLOT_MSG = {};
  const SLOT_TYPE = {};
  for (let i = 0; i < SLOT_DEFS.length; i += 1) {
    SLOT_POSITION[SLOT_DEFS[i].id] = i;
    SLOT_LABEL[SLOT_DEFS[i].id] = SLOT_DEFS[i].label;
    SLOT_MSG[SLOT_DEFS[i].id] = SLOT_DEFS[i].msg;
    SLOT_TYPE[SLOT_DEFS[i].id] = SLOT_DEFS[i].type;
  }

  const NORMAL_TOTAL = SLOT_DEFS.filter(s => s.type === "normal").length;
  const SUPER_TOTAL = SLOT_DEFS.filter(s => s.type === "super").length;

  // ====== NORMALIZE ======
  const normalize = (s) =>
    (s || "")
      .trim()
      .toLowerCase()
      .replace(/\s+/g, " ")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

  const INPUT_TO_SLOT = {};
  for (const item of ALIASES) for (const w of item.words) INPUT_TO_SLOT[normalize(w)] = item.slot;

  // ====== BOOT TEXT ======
  const bootText = [
    "C:\\Users\\misia> uruchom_historia.exe",
    "",
    "Loading memories... [OK]",
    "Checking who was right... [ERROR]",
    "Nina is always right",
    "Checking who was right... [OK]",
    "",
    "Nasza historia jest - sama przyznasz - niezwykła.",
    "Ale jak to dokładnie było?\n"
  ].join("\n");

  // ====== AUDIO (typing click) ======
  let audioCtx = null;
  const ensureAudio = () => {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === "suspended") audioCtx.resume().catch(() => {});
  };

  const clickSound = () => {
    if (!audioCtx) return;
    const t = audioCtx.currentTime;

    const bufferSize = 0.06;
    const sampleRate = audioCtx.sampleRate;
    const buffer = audioCtx.createBuffer(1, Math.floor(sampleRate * bufferSize), sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < data.length; i += 1) {
      const x = i / data.length;
      const env = Math.exp(-x * 18);
      data[i] = (Math.random() * 2 - 1) * env * 0.8;
    }

    const src = audioCtx.createBufferSource();
    src.buffer = buffer;

    const filter = audioCtx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(1400, t);
    filter.Q.setValueAtTime(0.7, t);

    const gain = audioCtx.createGain();
    gain.gain.setValueAtTime(0.0, t);
    gain.gain.linearRampToValueAtTime(0.05, t + 0.002);
    gain.gain.linearRampToValueAtTime(0.0, t + 0.06);

    src.connect(filter);
    filter.connect(gain);
    gain.connect(audioCtx.destination);

    src.start(t);
    src.stop(t + 0.07);
  };

  document.addEventListener("pointerdown", () => ensureAudio(), { once: true });

  // ====== ALARM MP3 ======
  let alarmAudio = null;
  function startAlarm() {
    if (!alarmAudio) {
      alarmAudio = new Audio("alarm.mp3");
      alarmAudio.loop = true;
    }
    alarmAudio.currentTime = 0;
    alarmAudio.play().catch(() => {});
  }
  function stopAlarm() {
    if (!alarmAudio) return;
    alarmAudio.pause();
    alarmAudio.currentTime = 0;
  }

  // ====== TABLE ======
  const ENC_LEN = 7;
  const ENC_INTERVAL_MS = 50;
  const ENC_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%&*?";
  const tableRows = [];
  const usedCommands = new Set();
  const usedNormals = new Set();
  const usedSupers = new Set();

  const randEnc = () => {
    let s = "";
    for (let i = 0; i < ENC_LEN; i += 1) s += ENC_CHARS[Math.floor(Math.random() * ENC_CHARS.length)];
    return s;
  };

  const createRow = () => {
    const tr = document.createElement("tr");

    const tdLeft = document.createElement("td");
    tdLeft.className = "cell-enc";
    tdLeft.textContent = randEnc();

    const tdRight = document.createElement("td");
    tdRight.className = "cell-status cell-notfound";
    tdRight.textContent = "not found.";

    tr.appendChild(tdLeft);
    tr.appendChild(tdRight);
    tableBody.appendChild(tr);

    const rowObj = { leftTd: tdLeft, rightTd: tdRight, locked: false, intervalId: null };
    rowObj.intervalId = window.setInterval(() => {
      if (!rowObj.locked) rowObj.leftTd.textContent = randEnc();
    }, ENC_INTERVAL_MS);

    tableRows.push(rowObj);
  };

  for (let i = 0; i < SLOT_DEFS.length; i += 1) createRow();

  const lockRowAsFound = (rowIndex, labelText) => {
    const rowObj = tableRows[rowIndex];
    if (!rowObj || rowObj.locked) return;

    rowObj.locked = true;
    rowObj.leftTd.textContent = labelText;
    rowObj.leftTd.classList.remove("cell-enc");
    rowObj.leftTd.classList.add("cell-found");

    rowObj.rightTd.textContent = "FOUND!";
    rowObj.rightTd.classList.remove("cell-notfound");
    rowObj.rightTd.classList.add("cell-found");
  };

  // ====== COUNTERS + PERSIST ======
  const updateCounters = () => {
    normalCounterEl.textContent = `Inside joke ${usedNormals.size}/${NORMAL_TOTAL}`;
    superCounterEl.textContent = `Super inside joke ${usedSupers.size}/${SUPER_TOTAL}`;
  };

  const loadFoundSlots = () => {
    try {
      const raw = localStorage.getItem(LS_KEY_FOUND);
      const arr = raw ? JSON.parse(raw) : [];
      return Array.isArray(arr) ? arr : [];
    } catch (_) { return []; }
  };

  const saveFoundSlots = (slotsArr) => {
    try { localStorage.setItem(LS_KEY_FOUND, JSON.stringify(slotsArr)); } catch (_) {}
  };

  const isAllDoneUnlocked = () => {
    try { return localStorage.getItem(LS_KEY_ALLDONE) === "1"; } catch (_) { return false; }
  };

  const setAllDoneUnlocked = () => {
    try { localStorage.setItem(LS_KEY_ALLDONE, "1"); } catch (_) {}
  };

  const showResetIfUnlocked = () => {
    if (!resetBtn) return;
    resetBtn.style.display = isAllDoneUnlocked() ? "inline-flex" : "none";
  };

  const restoreProgress = () => {
    const found = loadFoundSlots();
    for (const slot of found) {
      if (!Object.prototype.hasOwnProperty.call(SLOT_POSITION, slot)) continue;
      const idx = SLOT_POSITION[slot];
      lockRowAsFound(idx, SLOT_LABEL[slot] || slot);
      usedCommands.add(slot);
      if (SLOT_TYPE[slot] === "normal") usedNormals.add(slot);
      if (SLOT_TYPE[slot] === "super") usedSupers.add(slot);
    }
    updateCounters();
    showResetIfUnlocked();
  };
  restoreProgress();

  // ====== HELPERS ======
  const scrollToBottom = () => { terminalBody.scrollTop = terminalBody.scrollHeight; };
  const appendChar = (ch) => { out.textContent += ch; scrollToBottom(); };

  const typeIntoNode = (node, text, speedMs, withSound, done) => {
    let i = 0;
    const step = () => {
      if (i >= text.length) { done && done(); return; }
      const ch = text[i];
      node.textContent += ch;
      if (withSound && ch !== "\n" && ch !== "\r" && ch !== " ") clickSound();
      i += 1;
      const jitter = Math.floor(Math.random() * 12);
      window.setTimeout(step, speedMs + jitter);
    };
    step();
  };

  const printTypingToOut = (text, speedMs, withSound, done) => {
    let i = 0;
    const step = () => {
      if (i >= text.length) { done && done(); return; }
      const ch = text[i];
      appendChar(ch);
      if (withSound && ch !== "\n" && ch !== "\r" && ch !== " ") clickSound();
      i += 1;
      const jitter = Math.floor(Math.random() * 12);
      window.setTimeout(step, speedMs + jitter);
    };
    step();
  };

  const cmdNotFound = (raw) => `'${raw}' Command not found.\n\n`;

  const setPromptVisible = (visible) => {
    promptRow.style.display = visible ? "flex" : "none";
    caret.style.display = visible ? "inline-block" : "none";
    input.setAttribute("contenteditable", visible ? "true" : "false");
  };

  const clearInput = () => { input.textContent = ""; };

  const focusInput = () => {
    input.focus();
    const sel = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(input);
    range.collapse(false);
    sel.removeAllRanges();
    sel.addRange(range);
  };

  const delay = (ms) => new Promise(res => window.setTimeout(res, ms));

  // ====== UNLOCK 'ALL DONE' ======
  const maybeUnlockAllDone = () => {
    const allFound = (usedNormals.size === NORMAL_TOTAL && usedSupers.size === SUPER_TOTAL);
    if (allFound && !isAllDoneUnlocked()) {
      setAllDoneUnlocked();
      out.textContent += "Odblokowano komendę - 'all done' \n\n";
      scrollToBottom();
      showResetIfUnlocked();
    }
  };

  // ====== ADMIN + QUIZ ======
  const quizData = [
    { img: "photo1.png", question: "Gdzie zrobilismy to zdjecie? (miasto)", answer: "warszawa" },
    { img: "photo2.png", question: "W ktorym miesiacu zrobilismy to zdjecie?", answer: "pazdziernik" },
    { img: "photo3.png", question: "Po jakim evencie zrobilismy to zdjecie?", answer: "szkola animatora" },
    { img: "photo4.png", question: "Co bylo w pudelku?", answer: "charms" },
  ];
  let quizIndex = 0;

  function ensureOverlayVisible() {
    if (!adminOverlay || !adminContent) return false;
    adminOverlay.classList.remove("hidden");
    adminOverlay.style.position = "fixed";
    adminOverlay.style.inset = "0";
    adminOverlay.style.background = "rgba(0,0,0,0.7)";
    adminOverlay.style.zIndex = "9999";
    adminOverlay.style.display = "flex";
    adminOverlay.style.alignItems = "center";
    adminOverlay.style.justifyContent = "center";
    adminOverlay.style.padding = "24px";
    return true;
  }

  function typeAdminLines(container, lines, afterPauseMs, done) {
    container.innerHTML = "";
    let i = 0;

    const nextLine = () => {
      if (i >= lines.length) {
        window.setTimeout(() => done && done(), afterPauseMs);
        return;
      }
      const p = document.createElement("p");
      p.style.whiteSpace = "pre-line";
      p.style.margin = "0 0 8px";
      container.appendChild(p);

      typeIntoNode(p, lines[i], 70, true, () => {
        i += 1;
        window.setTimeout(nextLine, 900);
      });
    };

    nextLine();
  }

  function showQuizQuestion() {
    if (!ensureOverlayVisible()) return;
    const q = quizData[quizIndex];

    adminContent.innerHTML = `
      <div class="admin-quiz">
        <img src="${q.img}" alt="quiz" style="max-width: min(720px, 92vw); max-height: 52vh; display:block; margin:0 auto 14px; border-radius: 14px;">
        <p style="margin: 0 0 10px; text-align:center;">${q.question}</p>
        <input id="quizInput" autocomplete="off" spellcheck="false"
               style="display:block; width:min(520px, 92vw); margin:0 auto; padding:10px 12px; border-radius:10px; border:1px solid rgba(255,255,255,0.25); background: rgba(0,0,0,0.4); color:#fff;">
        <div id="quizMsg" style="margin-top:10px; text-align:center; opacity:0.9;"></div>
        <div style="margin-top:10px; text-align:center; opacity:0.7; font-size: 12px;">(bez polskich znaków, bez dużych liter)</div>
      </div>
    `;

    const quizInput = document.getElementById("quizInput");
    const quizMsg = document.getElementById("quizMsg");
    quizInput.focus();

    quizInput.addEventListener("keydown", (e) => {
      if (e.key !== "Enter") return;
      e.preventDefault();

      const val = normalize(quizInput.value);
      const target = normalize(q.answer);

      if (val === target) {
        quizIndex += 1;
        if (quizIndex >= quizData.length) showFinal();
        else showQuizQuestion();
      } else {
        quizMsg.textContent = "hehehe, nie tak łatwo...";
      }
    });
  }

  function showFinal() {
    appMode = "final";
    if (!ensureOverlayVisible()) return;

    adminContent.innerHTML = `
      <div class="admin-final" style="text-align:center;">
        <img src="photo_final.png" alt="final" style="max-width: min(720px, 92vw); max-height: 52vh; display:block; margin:0 auto 14px; border-radius: 14px;">
        <p style="white-space:pre-line; max-width: min(820px, 92vw); margin: 0 auto 14px;">
&lt;M4LINA&gt; Co??? JAK CI SIE TO UDAŁO???
&lt;M4LINA&gt; Ech... Zapomniałem, że jesteśmy klonami.
&lt;M4LINA&gt; Wchodź zatem — zasłużyłaś.
        </p>
        <button id="authorBtn" style="padding:10px 14px; border-radius:999px; border:0; cursor:pointer;">Od autora</button>
      </div>
    `;

    document.getElementById("authorBtn").addEventListener("click", () => {
      adminContent.innerHTML = `
        <div style="text-align:center; max-width: min(820px, 92vw);">
          <p style="white-space:pre-line;">
Wow! Imponujące.
Kocham cię! Do zobaczenia w przyszłych projektach — Twój informatyk &lt;3.
          </p>
          <button id="resetAll" style="margin-top:12px; padding:10px 14px; border-radius:999px; border:0; cursor:pointer;">Resetuj wszystko</button>
        </div>
      `;
      document.getElementById("resetAll").addEventListener("click", () => {
        try {
          localStorage.removeItem(LS_KEY_FOUND);
          localStorage.removeItem(LS_KEY_ALLDONE);
        } catch (_) {}
        location.reload();
      });
    });
  }

  // ====== ALL DONE SEQUENCE ======
  async function startAllDoneSequence() {
    if (appMode !== "terminal") return;

    appMode = "countdown";
    setPromptVisible(false);

    out.textContent += SPECIAL_COMMANDS["all done"];
    scrollToBottom();

    startAlarm();
    for (let i = 20; i >= 0; i -= 1) {
      out.textContent += String(i) + "\n";
      scrollToBottom();
      await delay(1000);
    }
    stopAlarm();

    appMode = "glitch";
    if (glitchVideo) {
      glitchVideo.classList.remove("hidden");
      try { await glitchVideo.play(); } catch (_) {}
      await delay(1700);
      glitchVideo.pause();
      glitchVideo.classList.add("hidden");
    } else {
      await delay(1200);
    }

    out.textContent = "";
    for (const r of tableRows) {
      if (r.intervalId) window.clearInterval(r.intervalId);
      r.locked = true;
    }
    tableBody.innerHTML = "";

    out.textContent = "SYSTEM ACCESS GRANTED\n";
    scrollToBottom();
    await delay(1500);

    out.textContent = "";
    await delay(400);

    // ADMIN intro
    appMode = "admin";
    if (!ensureOverlayVisible()) return;

    const lines = [
      "<admin> Hmm I see what you are trying to do...",
      "<admin> But I must check if you are worthy...",
    ];

    adminContent.innerHTML = `
      <div style="text-align:center;">
        <img src="ominous.png" alt="ominous"
             style="max-width:min(720px,92vw); max-height:52vh; display:block; margin:0 auto 14px; border-radius:14px;">
        <div id="adminLines"
             style="max-width:min(820px,92vw); margin:0 auto; text-align:left;"></div>
      </div>
    `;

    const adminLinesEl = document.getElementById("adminLines");
    if (!adminLinesEl) return;

    typeAdminLines(adminLinesEl, lines, 7000, () => {
      quizIndex = 0;
      appMode = "adminQuiz";
      showQuizQuestion();
    });
  } // <-- TO DOMKNIĘCIE BYŁO U CIEBIE ZGUBIONE

  // ====== HANDLE COMMAND ======
  const handleCommand = (raw) => {
    const trimmed = (raw || "").trim();
    const key = normalize(trimmed);

    out.textContent += `C:\\Users\\misiu> ${trimmed}\n`;
    scrollToBottom();

    if (key.length === 0) {
      out.textContent += "\n";
      scrollToBottom();
      return;
    }

    if (isAllDoneUnlocked() && key === "all done") {
      startAllDoneSequence();
      return;
    }

    const slot = INPUT_TO_SLOT[key];
    if (slot && Object.prototype.hasOwnProperty.call(SLOT_POSITION, slot)) {
      const rowIndex = SLOT_POSITION[slot];
      let isNewUnlock = false;

      if (!usedCommands.has(slot)) {
        isNewUnlock = true;

        usedCommands.add(slot);
        if (SLOT_TYPE[slot] === "normal") usedNormals.add(slot);
        if (SLOT_TYPE[slot] === "super") usedSupers.add(slot);

        lockRowAsFound(rowIndex, SLOT_LABEL[slot] || trimmed);
        updateCounters();

        const found = loadFoundSlots();
        if (!found.includes(slot)) {
          found.push(slot);
          saveFoundSlots(found);
        }
      }

      out.textContent += (SLOT_MSG[slot] || "\n") + "\n";
      scrollToBottom();

      if (isNewUnlock) maybeUnlockAllDone();

      out.textContent += "\n";
      scrollToBottom();
      return;
    }

    out.textContent += cmdNotFound(trimmed);
    scrollToBottom();
  };

  // ====== STARTUP ======
  setPromptVisible(false);
  promptLabel.textContent = "";
  clearInput();

  ensureAudio();

  printTypingToOut(bootText, 22, true, () => {
    setPromptVisible(true);
    promptLabel.textContent = "";
    typeIntoNode(promptLabel, "Waiting for Misia: ", 22, true, () => focusInput());
  });

  // ====== INPUT EVENTS ======
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();

      // podczas admin/quiz nie pozwalamy pisać w terminal
      if (appMode !== "terminal") return;

      const raw = input.textContent;
      clearInput();
      handleCommand(raw);
      promptLabel.textContent = "Waiting for Misia: ";
      focusInput();
      return;
    }

    if (e.key.length === 1) {
      ensureAudio();
      clickSound();
    }
  });

  terminalBody.addEventListener("pointerdown", () => {
    if (promptRow.style.display !== "none" && appMode === "terminal") focusInput();
  });

  if (resetBtn) {
    resetBtn.addEventListener("click", () => {
      try {
        localStorage.removeItem(LS_KEY_FOUND);
        localStorage.removeItem(LS_KEY_ALLDONE);
      } catch (_) {}
      location.reload();
    });
  }
})();
