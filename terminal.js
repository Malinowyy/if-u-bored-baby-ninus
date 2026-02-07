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

  if (
    !out || !input || !caret || !promptRow || !promptLabel || !terminalBody ||
    !normalCounterEl || !superCounterEl || !tableBody
  ) {
    return;
  }

  // =========================
  // 1) KONFIG: HASŁA + TEKSTY
  // =========================
  // UWAGA: klucze = to, co użytkownik wpisuje
  const NORMAL_COMMANDS = {
    "nigger": "test\n",
    "haslo2": "TU wpiszesz wiadomość dla haslo2\n",
    "haslo3": "...\n",
    "haslo4": "...\n",
    "haslo5": "...\n",
    "haslo6": "...\n",
    "haslo7": "...\n",
    "haslo8": "...\n",
    "haslo9": "...\n",
    "haslo10": "...\n",
    "haslo11": "...\n",
    "haslo12": "...\n",
    "haslo13": "...\n",
    "haslo14": "...\n",
  };

  const SUPER_COMMANDS = {
    "gigga nigga": "SUPER_MESSAGE_1\n", // <- wpisz tu swoją, nieobraźliwą treść
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
    ""
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

    // “thock”: krótki noise + delikatny lowpass
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
  // 4) TABELA 16x2 + “SZYFROWANIE”
  // =========================
  const TABLE_ROWS = 16;
  const ENC_LEN = 7;
  const ENC_INTERVAL_MS = 50;
  const ENC_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%&*?";

  const tableRows = [];
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
  const normalize = (s) =>
    s.trim().toLowerCase().replace(/\s+/g, " ");

  const handleCommand = (raw) => {
    const trimmed = raw.trim();
    const key = normalize(trimmed);

    // echo komendy w historii jako CMD
    out.textContent += `C:\\Users\\misiu> ${trimmed}\n`;
    scrollToBottom();

    if (key.length === 0) {
      out.textContent += "\n";
      scrollToBottom();
      return;
    }

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

      // dolny prompt zostaje
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

})();
