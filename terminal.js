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

  if (!out || !input || !caret || !promptRow || !promptLabel || !terminalBody || !normalCounterEl || !superCounterEl || !tableBody) {
    return;
  }

  // =========================
  // 1) KONFIG: HASŁA + TEKSTY
  // =========================
  const NORMAL_COMMANDS = {
    "haslo1":  "TU wpiszesz wiadomość dla haslo1\n",
    "haslo2":  "TU wpiszesz wiadomość dla haslo2\n",
    "haslo3":  "...\n",
    "haslo4":  "...\n",
    "haslo5":  "...\n",
    "haslo6":  "...\n",
    "haslo7":  "...\n",
    "haslo8":  "...\n",
    "haslo9":  "...\n",
    "haslo10": "...\n",
    "haslo11": "...\n",
    "haslo12": "...\n",
    "haslo13": "...\n",
    "haslo14": "...\n",
  };

  const SUPER_COMMANDS = {
    "super1": "SUPER WIADOMOŚĆ 1 — wpisz swoją\n",
    "super2": "SUPER WIADOMOŚĆ 2 — wpisz swoją\n",
  };

  const NORMAL_TOTAL = 14;
  const SUPER_TOTAL = 2;

  // =========================
  // 2) STARTOWY TEKST (TYPING)
  // =========================
  const bootLines = [
    "C:\\Users\\misiu> uruchom_historia.exe",
    "",
    "[OK] Ładowanie wspomnień...",
    "[OK] Synchronizacja spojrzeń...",
    "[OK] Sprawdzanie czy to przypadek czy przeznaczenie...",
    "",
    "=> A potem nagle: hello.",
    "=> I jakoś już zostało.",
    "",
    "C:\\Users\\misiu> "
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

    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = "square";

    const f = 850 + Math.random() * 250;
    osc.frequency.setValueAtTime(f, t);

    gain.gain.setValueAtTime(0.0, t);
    gain.gain.linearRampToValueAtTime(0.03, t + 0.005);
    gain.gain.linearRampToValueAtTime(0.0, t + 0.035);

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start(t);
    osc.stop(t + 0.05);
  };

  // =========================
  // 4) TABELA 16x2 + “SZYFROWANIE”
  // =========================
  const TABLE_ROWS = 16;
  const ENC_LEN = 7;
  const ENC_INTERVAL_MS = 400;
  const ENC_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%&*?";

  const tableRows = []; // { leftTd, rightTd, locked, intervalId }
  const usedCommands = new Set();
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

  const lockNextRowAsFound = (commandText) => {
    const rowObj = tableRows.find(r => !r.locked);
    if (!rowObj) return;

    rowObj.locked = true;

    rowObj.leftTd.textContent = commandText;
    rowObj.leftTd.classList.remove("cell-enc");
    rowObj.leftTd.classList.add("cell-found");

    rowObj.rightTd.textContent = "FOUND!";
    rowObj.rightTd.classList.remove("cell-notfound");
    rowObj.rightTd.classList.add("cell-found");
  };

  // =========================
  // 5) LICZNIKI
  // =========================
  const updateCounters = () => {
    normalCounterEl.textContent = `Inside joke ${usedNormals.size}/${NORMAL_TOTAL}`;
    superCounterEl.textContent = `Super inside joke ${usedSupers.size}/${SUPER_TOTAL}`;
  };
  updateCounters();

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

  const normalize = (s) => s.trim().toLowerCase();

  const cmdNotFound = (raw) =>
    `'${raw}' is not recognized as an internal or external command,\noperable program or batch file.\n\n`;

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
    // ustaw kursor na koniec
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
  const handleCommand = (raw) => {
    const trimmed = raw.trim();
    const key = normalize(trimmed);

    // echo komendy jak w cmd: prompt + komenda w historii
    out.textContent += `Waiting for Misia: ${trimmed}\n\n`;
    scrollToBottom();

    if (key.length === 0) return;

    if (Object.prototype.hasOwnProperty.call(NORMAL_COMMANDS, key)) {
      if (!usedCommands.has(key)) {
        usedCommands.add(key);
        usedNormals.add(key);
        lockNextRowAsFound(trimmed);
        updateCounters();
      }
      out.textContent += NORMAL_COMMANDS[key] + "\n";
      scrollToBottom();
      return;
    }

    if (Object.prototype.hasOwnProperty.call(SUPER_COMMANDS, key)) {
      if (!usedCommands.has(key)) {
        usedCommands.add(key);
        usedSupers.add(key);
        lockNextRowAsFound(trimmed);
        updateCounters();
      }
      out.textContent += SUPER_COMMANDS[key] + "\n";
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

  // Audio odblokuje się dopiero po interakcji usera (Chrome i Safari)
  document.addEventListener("pointerdown", () => ensureAudio(), { once: true });

  ensureAudio();
  printTypingToOut(bootText, 22, true, () => {
    // teraz typingiem pokaż prompt
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

      // “nowy prompt”: wpisz go od razu (bez typingu) albo z typingu jak chcesz
      promptLabel.textContent = "Waiting for Misia: ";
      focusInput();
      return;
    }

    // click sound przy wpisywaniu
    if (e.key.length === 1) {
      ensureAudio();
      clickSound();
    }
  });

  // klik w terminal focusuje input
  terminalBody.addEventListener("pointerdown", () => {
    if (promptRow.style.display !== "none") focusInput();
  });

})();
