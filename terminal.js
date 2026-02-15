// terminal.js
(function () {
  const out = document.getElementById("terminalText");
  const input = document.getElementById("terminalInput"); // contenteditable
  const caret = document.getElementById("caret");
  const promptRow = document.getElementById("promptRow");
  const promptLabel = document.getElementById("promptLabel");
  const terminalBody = document.getElementById("terminalBody");

  const normalCounterEl = document.getElementById("normalCounter");
  const superCounterEl = document.getElementById("superCounter");
  const tableBody = document.getElementById("foundTableBody");

  const resetBtn = document.getElementById("resetBtn");

  if (
    !out || !input || !caret || !promptRow || !promptLabel || !terminalBody ||
    !normalCounterEl || !superCounterEl || !tableBody
  ) {
    return;
  }

  const LS_KEY_FOUND = "misiu_found_slots_v1";
  const LS_KEY_ALLDONE = "misiu_alldone_unlocked_v1";

  // =========================
  // 1) KONFIG: SLOTY + ALIASY
  // =========================

  // Komendy spoza tabeli/liczników (po odblokowaniu wszystkiego)
  const SPECIAL_COMMANDS = {
    "all done": "TU_WPISZ_WLASNA_WIADOMOSC_PO_ALL_DONE\n",
  };

  // Definicje slotów w kolejności jak podałeś:
  // - label: co ma być w tabeli
  // - msg: co ma się wypisać w terminalu
  // - type: "normal" lub "super"
  const SLOT_DEFS = [
    // 1
    { id: "haslo1",  type: "normal", label: "Igrzyska śmierci w heliosie", msg: "wiadomosc1\n" },
    // 2
    { id: "haslo2",  type: "normal", label: "Oaza w sandomierzu", msg: "wiadomosc2\n" },
    // 3
    { id: "haslo3",  type: "normal", label: "Osiemnastka agaty", msg: "wiadomosc3\n" },
    // 4
    { id: "haslo4",  type: "normal", label: "KODA", msg: "wiadomosc4\n" },
    // 5
    { id: "haslo5",  type: "normal", label: "Kałków oaza", msg: "wiadomosc5\n" },
    // 6
    { id: "haslo6",  type: "normal", label: "The antek thing...", msg: "wiadomosc6\n" },
    // 7
    { id: "haslo7",  type: "normal", label: "Osiemnastka Maliny!", msg: "wiadomosc7\n" },
    // 8
    { id: "haslo8",  type: "normal", label: "Pierwszy raz u mnie na caaaały dzień!", msg: "wiadomosc8\n" },
    // 9
    { id: "haslo9",  type: "normal", label: "Bubbletea (mój pierwszy pretekst)", msg: "wiadomosc9\n" },
    // 10
    { id: "haslo10", type: "normal", label: "Piosenkaaa", msg: "wiadomosc10\n" },
    // 11
    { id: "haslo11", type: "normal", label: "Pewnego pamiętnego poniedziałku...", msg: "wiadomosc11\n" },
    // 12
    { id: "haslo12", type: "normal", label: "Candle!", msg: "wiadomosc12\n" },
    // 13
    { id: "haslo13", type: "normal", label: "Dziękuję! hahah", msg: "wiadomosc13\n" },
    // 14
    { id: "haslo14", type: "normal", label: "Bydgoszcz jeden", msg: "wiadomosc14\n" },

    // 15
    { id: "haslo15", type: "normal", label: "Warszawa", msg: "wiadomosc15\n" },
    // 16
    { id: "haslo16", type: "normal", label: "No contact", msg: "wiadomosc16\n" },
    // 17
    { id: "haslo17", type: "normal", label: "Sylwester", msg: "wiadomosc17\n" },
    // 18
    { id: "haslo18", type: "normal", label: "Bydgoszcz dwa", msg: "wiadomosc18\n" },

    // SUPER (2)
    { id: "super1",  type: "super",  label: "Liseeek", msg: "wiadomosc19\n" },
    { id: "super2",  type: "super",  label: "Kształcenie słuchu", msg: "wiadomosc20\n" },
  ];

  // Alias listy (po ukośniku) -> ten sam slot
  // Wpisuj tu tylko hasła/aliasy – mapowanie robi się automatycznie poniżej
  const ALIASES = [
    { slot: "haslo1",  words: ["kino", "igrzyska", "helios"] },
    { slot: "haslo2",  words: ["sandomierz", "trójka", "trojka"] },
    { slot: "haslo3",  words: ["agata", "osiemnastka agi"] },
    { slot: "haslo4",  words: ["koda", "sciana", "ściana"] },
    { slot: "haslo5",  words: ["kałków", "kalkow", "eremy", "oaza", "wakacje"] },
    { slot: "haslo6",  words: ["antek", "rozstanie", "zerwanie"] },
    { slot: "haslo7",  words: ["osiemnastka", "impreza"] },
    { slot: "haslo8",  words: ["badminton", "lego", "kpop demon hunters", "jedlanka"] },
    { slot: "haslo9",  words: ["bubble tea", "bubbletea", "radom", "wyjście", "wyjscie"] },
    { slot: "haslo10", words: ["like a maple leaf", "piosenka", "maple leaf"] },
    { slot: "haslo11", words: ["pamiętny poniedziałek", "pamietny poniedzialek", "poniedziałek", "poniedzialek"] },
    { slot: "haslo12", words: ["candle"] },
    { slot: "haslo13", words: ["kocham cię", "kocham cie", "dziekuje", "dziękuję"] },
    { slot: "haslo14", words: ["bydgoszcz", "bydgoszcz jeden"] },

    { slot: "haslo15", words: ["warszawa"] },
    { slot: "haslo16", words: ["no contact"] },
    { slot: "haslo17", words: ["sylwester"] },
    { slot: "haslo18", words: ["bydgoszcz dwa"] },

    // SUPER
    { slot: "super1", words: ["lisek", "wiewiorka", "wiewiórka"] },
    { slot: "super2", words: ["kształcenie słuchu", "ksztalcenie sluchu"] },
  ];

  // Szybkie mapy do użycia w kodzie
  const SLOT_POSITION = {};
  const SLOT_LABEL = {};
  const SLOT_MSG = {};
  const SLOT_TYPE = {};
  for (let i = 0; i < SLOT_DEFS.length; i += 1) {
    SLOT_POSITION[SLOT_DEFS[i].id] = i;     // stałe miejsce w tabeli
    SLOT_LABEL[SLOT_DEFS[i].id] = SLOT_DEFS[i].label;
    SLOT_MSG[SLOT_DEFS[i].id] = SLOT_DEFS[i].msg;
    SLOT_TYPE[SLOT_DEFS[i].id] = SLOT_DEFS[i].type;
  }

  const NORMAL_TOTAL = SLOT_DEFS.filter(s => s.type === "normal").length;
  const SUPER_TOTAL = SLOT_DEFS.filter(s => s.type === "super").length;

  // normalize: lower + trim + collapse spaces + usuń polskie znaki (żeby aliasy działały w obu wersjach)
  const normalize = (s) =>
    s
      .trim()
      .toLowerCase()
      .replace(/\s+/g, " ")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

  // INPUT -> SLOT (z aliasów)
  const INPUT_TO_SLOT = {};
  for (const item of ALIASES) {
    for (const w of item.words) {
      INPUT_TO_SLOT[normalize(w)] = item.slot;
    }
  }

  // =========================
  // 2) STARTOWY TEKST (TYPING)
  // =========================
  const bootLines = [
    "C:\\Users\\misia> uruchom_historia.exe",
    "",
    "Loading memories... [OK]",
    "Checking who was right... [ERROR]",
    "Nina is always right",
    "Checking who was right... [OK]",
    "",
    "Nasza historia jest - sama przyznasz - niezwykła.",
    "Ale jak to dokładnie było?"
  ];
  const bootText = bootLines.join("\n");

  // =========================
  // 3) DŹWIĘK PISANIA (WebAudio)
  // =========================
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

  // =========================
  // 4) TABELA + “SZYFROWANIE”
  // =========================
  const TABLE_ROWS = SLOT_DEFS.length;
  const ENC_LEN = 7;
  const ENC_INTERVAL_MS = 50;
  const ENC_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%&*?";

  const tableRows = [];
  const usedCommands = new Set(); // trzymamy SLOTY (np. "haslo5")
  const usedNormals = new Set();
  const usedSupers = new Set();

  const randEnc = () => {
    let s = "";
    for (let i = 0; i < ENC_LEN; i += 1) {
      s += ENC_CHARS[Math.floor(Math.random() * ENC_CHARS.length)];
    }
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

  for (let i = 0; i < TABLE_ROWS; i += 1) createRow();

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

  // =========================
  // 5) LICZNIKI + PERSIST
  // =========================
  const updateCounters = () => {
    normalCounterEl.textContent = `Inside joke ${usedNormals.size}/${NORMAL_TOTAL}`;
    superCounterEl.textContent = `Super inside joke ${usedSupers.size}/${SUPER_TOTAL}`;
  };

  const loadFoundSlots = () => {
    try {
      const raw = localStorage.getItem(LS_KEY_FOUND);
      const arr = raw ? JSON.parse(raw) : [];
      return Array.isArray(arr) ? arr : [];
    } catch (_) {
      return [];
    }
  };

  const saveFoundSlots = (slotsArr) => {
    try {
      localStorage.setItem(LS_KEY_FOUND, JSON.stringify(slotsArr));
    } catch (_) {}
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

  // =========================
  // 6) TERMINAL HELPERS
  // =========================
  const scrollToBottom = () => {
    terminalBody.scrollTop = terminalBody.scrollHeight;
  };

  const appendChar = (ch) => {
    out.textContent += ch;
    scrollToBottom();
  };

  const typeIntoNode = (node, text, speedMs, withSound, done) => {
    let i = 0;
    const step = () => {
      if (i >= text.length) {
        done && done();
        return;
      }
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
      if (i >= text.length) {
        done && done();
        return;
      }
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

  const clearInput = () => {
    input.textContent = "";
  };

  const focusInput = () => {
    input.focus();
    const sel = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(input);
    range.collapse(false);
    sel.removeAllRanges();
    sel.addRange(range);
  };

  // =========================
  // 7) COMMAND HANDLING
  // =========================
  const maybeUnlockAllDone = () => {
    const allFound = (usedNormals.size === NORMAL_TOTAL && usedSupers.size === SUPER_TOTAL);
    if (allFound && !isAllDoneUnlocked()) {
      setAllDoneUnlocked();
      out.textContent += "Odblokowano komendę - 'all done'\n\n";
      scrollToBottom();
      showResetIfUnlocked();
    }
  };

  const handleCommand = (raw) => {
    const trimmed = raw.trim();
    const key = normalize(trimmed);

    out.textContent += `C:\\Users\\misiu> ${trimmed}\n`;
    scrollToBottom();

    if (key.length === 0) {
      out.textContent += "\n";
      scrollToBottom();
      return;
    }

    // Komendy specjalne (po odblokowaniu)
    if (isAllDoneUnlocked() && Object.prototype.hasOwnProperty.call(SPECIAL_COMMANDS, key)) {
      out.textContent += SPECIAL_COMMANDS[key] + "\n\n";
      scrollToBottom();
      return;
    }

    // Sloty (tabela + liczniki)
    const slot = INPUT_TO_SLOT[key];
    if (slot && Object.prototype.hasOwnProperty.call(SLOT_POSITION, slot)) {
      const rowIndex = SLOT_POSITION[slot];

      if (!usedCommands.has(slot)) {
        usedCommands.add(slot);

        if (SLOT_TYPE[slot] === "normal") usedNormals.add(slot);
        if (SLOT_TYPE[slot] === "super") usedSupers.add(slot);

        // do tabeli wstawiamy STAŁY label
        lockRowAsFound(rowIndex, SLOT_LABEL[slot] || trimmed);
        updateCounters();

        // persist: zapis slotu
        const found = loadFoundSlots();
        if (!found.includes(slot)) {
          found.push(slot);
          saveFoundSlots(found);
        }

        maybeUnlockAllDone();
      }

      // terminal message
      out.textContent += (SLOT_MSG[slot] || "\n") + "\n";
      scrollToBottom();
      return;
    }

    out.textContent += cmdNotFound(trimmed);
    scrollToBottom();
  };

  // =========================
  // 8) START: boot typing -> prompt typing -> input enabled
  // =========================
  setPromptVisible(false);
  promptLabel.textContent = "";
  clearInput();

  document.addEventListener("pointerdown", () => ensureAudio(), { once: true });

  ensureAudio();
  printTypingToOut(bootText, 22, true, () => {
    setPromptVisible(true);
    promptLabel.textContent = "";
    typeIntoNode(promptLabel, "Waiting for Misia: ", 22, true, () => {
      focusInput();
    });
  });

  // =========================
  // 9) INPUT: Enter wysyła komendę
  // =========================
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();

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
    if (promptRow.style.display !== "none") focusInput();
  });

  // RESET
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
