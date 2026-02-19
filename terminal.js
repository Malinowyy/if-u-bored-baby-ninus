
// terminal.js
let appMode = "terminal";
(function () {
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

  if (
    !out || !input || !caret || !promptRow || !promptLabel || !terminalBody ||
    !normalCounterEl || !superCounterEl || !tableBody
  ) return;

  const LS_KEY_FOUND = "misiu_found_slots_v1";
  const LS_KEY_ALLDONE = "misiu_alldone_unlocked_v1";

  // =========================
  // 1) KONFIG: SLOTY + ALIASY
  // =========================

  const SPECIAL_COMMANDS = {
    "all done": "Suspicious behaviour detected. Activating defense protocol... \n.\n. \nInforming... THE ADMIN",
  };

  // Sloty w kolejności w tabeli (po zmianach: merged maple/poniedziałek, usunięty sylwester, dodany całus/buziak)
  const SLOT_DEFS = [
    { id: "haslo1", type: "normal", label: "Igrzyska śmierci w Heliosie", msg:"To właśnie tu mam pierwsze wspomnienie z Tobą.\nPrzyszedłem do kina z nowo poznaną paczką przyjaciół. Pamiętam to zaspanie w tym kinie i szok, że ktoś mnie rozpoznał, hahah.\nKto by wtedy przypuszczał...\n"},
    { id: "haslo2",  type: "normal", label: "Oaza w sandomierzu", msg: "Ah... Dla mnie tu zaczęła się nasza relacja. \n Pamiętasz jak ganiało za tobą multum chłopaków? Albo jak ja za Rokitą... To właśnie ta akcja zapoczątkowała naszą znajomość. \n To własnie był główny temat naszych pierwszych rozmów. A potem już poleciało.\n " },
    { id: "haslo3",  type: "normal", label: "Osiemnastka agaty", msg: "To było mocne haha. Jeszcze wtedy nie wiedziałem, że cię pokochałem, ale coś mnie do ciebie ciągnęło.\n Natomiast pamiętam, że już irytowała mnie obecność Antka obok ciebie i z jakiegoś powodu mu zazdrościłem. \n Nie zastanawiałem się nad tym jednak dłużej.\n Pamiętam, jak się stresowałem, bo to przecież pierwsza osiemnastka na której byłem w życiu. \n I pamiętam jak mnie w tym wspierałaś...\n" },
    { id: "haslo4",  type: "normal", label: "KODA", msg: "Na oko - ze 3 miesiąc od zauroczenia się w tobie. Pierwszy od zakochania się.\n Z każdym dniem coraz mocniej uświadamiałem sobie, że odkochanie się nie będzie takie proste. Wszystko się nasilało, jak codziennie widzieliśmy się, modliliśmy się czy jedliśmy. \n Wtedy też pobiłem ścianę z tej frustracji, dlaczego jest tak a nie inaczej. I wtedy też dowiedziała się Aga. \n Pamiętam jak krytykowałem w głowie to, jak antek się zachowywał wokół ciebie. Jak (według, wtedy, mnie) miernie okazywał ci tę miłość. Gdybym tylko miał kiedyś szansę pokazać ci na jaką miłość zasługujesz...\n Ale pewnie nigdy się nie dowiesz. Nie wiem co by się musiało wydarzyć, żebyśmy byli razem...\n" },
    { id: "haslo5",  type: "normal", label: "Kałków oaza", msg: "Tutaj już powoli myślałem, że udało mi się odkochać. Wielki sukces! - no, tak starałem sobie wmawiać. Pseudo - związek z Julką uświadamiał mi jednak, jak bardzo ty jesteś wyjątkowa.\n Jak bardzo idealną dziewczyną jesteś. Jak bardzo nie chce już nikogo innego szukać, skoro poznałem ciebie. Pamiętam jak wmawiałem sobie, że aby ostatecznie zamknąć nasz rozdział, konieczne będzie wyznanie ci, że kiedyś się w tobie zakochałem.\n Nie mogłem powiedzieć przecież, ze to nadal aktualne, bo pewnie byś mnie zablokowała hahah. Ale liczyłem, że może wtedy tłumione emocje znajdą ujście.\n Popłakałaś sie. \n A ja poczułem złość.\n Jakim cudem nikt cię nie wspierał. Czemu zostałaś sama. Ogarnęła mnie jeszcze większa złość. Myslałem, że jesteś szczęśliwa...\n Obiecałem sobie, że nie wtrącam się w twój ówczesny związek, bo kocham cię na tyle, że chce, żebyś była szczęśliwa. Nawet kosztem moich emocji. \nAle wtedy właśnie uświadomiłem sobie, że nie byłaś.\n" },
    { id: "haslo6", type: "normal", label: "The antek thing...", msg:"Hmm ciekawy wybór. \n \n Też to pamiętam. Cały ten dzień.\nJuż od paru dni byłaś zaaferowana, bo on budował to napięcie. Byłem wtedy na siłowni — pierwszy raz na tej nowej w Radomiu.\nWysyłałaś głosówki. Płakałaś. A we mnie coraz więcej złości i współczucia.\nW końcu jechałem na rowerze do dziadka. Zadzwoniłaś.\nRzuciłem rower na trawę i zacząłem chodzić po losowym polu w Jedlance, pocieszając Cię i jednocześnie smucąc się z Tobą.\n"},
    { id: "haslo7", type: "normal", label: "Osiemnastka Maliny!", msg:"Hahahah, pamiętam jak zacząłem sobie robić nadzieję na związek. „Ale ona dopiero wyszła ze związku, musisz poczekać...”. Mogłem. Ale nadal chciałem być coraz bliżej Ciebie.\nWika śmiała się, że jak się nie pocałujemy na tej imprezie, to ona nie wierzy w miłość, haha.\nParę osób wiedziało, że kocham Cię od dawna.\nPamiętam, jak Krzysiu puścił sneaky „Careless Whispera”, gdy byliśmy na parkiecie.\nAlbo jak odganiał wszystkich od prezentów, gdy wiedział, że poszedłem tam z Tobą, żeby je obejrzeć.\nPiękne wspomnienia.\n"},

    { id: "haslo8", type: "normal", label: "Pierwszy raz u mnie na caaaały dzień!", msg:"Ale się jarałem. Trochę jak spełnienie marzenia dziecka. Zdziwił mnie jednak fakt, że... przy Tobie w ogóle się nie stresowałem.\nNigdy nie potrafiłem rozmawiać z dziewczynami, które mi się podobały, żeby niczego nie schrzanić, a tu...\nZ Tobą było mi tak dobrze jak samemu. Nawet lepiej. Tak dobrze jak nigdy wcześniej.\n"},
    { id: "haslo9", type: "normal", label: "Bubbletea (mój pierwszy pretekst)", msg:"Pierwsze koty za płoty, hahah.\nJak po osiemnastce powiedziałem: „haha, mam kasę, to stawiam bubble tea”. Sneaky, peaky, leaky.\nPamiętasz jak szliśmy wybrać tapetę do Twojego pokoju, jedząc Takisy?\n"},
    // SCALONE: maple leaf + pamiętny poniedziałek
    { id: "haslo10", type: "normal", label: "Pewnego pamiętnego poniedziałku... Piosenka!", msg: "Wróciliśmy ze szkoły animatora. Posiedziałem trochę u ciebie, drugi raz w życiu. \n Tata odebrał mnie, był na basenie akurat. Pierwszy raz mijałem park, idąc z polnej na warszawską. Wrociłem do domu i rozmarzony zadawałem sobie pytanie: 'może jednak jest szansa?'.\n Położyłem się na łóżku i odpaliłem notatnik w telefonie. Reszta zrobiła się sama.\n Probowałem to nagrać swoim głosem, serio. Nawet wziąłem lepszy mikrofon i laptopa do szkoły. Ale brzmiało to absolutnie tragicznie. W końcu użyłem syntezatora mowy. \nPojechałem do ciebie, ty nic nie wiedziałaś. Któryś raz z rzędu w tym tygodniu się widzieliśmy. Jutro wyjeżdzasz na studia... Teraz albo nigdy. \n Wolę zaryzykować tę przyjaźń, niż całe życie żałować, że nigdy nie wyznałem ci tego, co czuje.\n Oglądaliśmy arcane. Zgadnij czy skupiłem się choć na sekundę hahah. W końcu się skończyło. \n Poszłaś do łazienki.\n Odpaliłem piosenkę. \n Powiedziałaś 'Chciałabym dać nam szansę'. \n Dziękuję za tę szanse. \n" },

    { id: "haslo11", type: "normal", label: "Candle!", msg: "Candle reminder!!\n" },

    // DODANE: całus/buziak
    { id: "haslo12", type: "normal", label: "Pierwszy pocałunek", msg: "Dwa tygodnie po pamiętnym poniedziałku! Gadaliśmy prawie codziennie na kamerce haha! \n W końcu wróciłaś. Tak mi się te dni dłużyłyyyy. \n Zrobiłem ci niespodzianke na dworcu! The prank was insane.\n Pojechaliśmy do ciebie. Rodziców nie było. Pierwszy cuddling haha - kolejne piękne wspomnienie. \n Pamiętam, że zastanawiałem się czy to czas na pocałunek, ale wysłałem ci reelsa gdzie facet wyciera rękę o włosy dziewczyny, a potem ją całuje.\n Napisałaś, że nigdy w życiu nie mogę tak wytrzeć ręki. A reszta spoko.\n Cicha, choć celna sugestia, nie powiem. Ale wcale nie uważam, że \n Za dużo mówisz \n" },

    { id: "haslo13", type: "normal", label: "Dziękuję! hahah", msg: "Kocham cię! (nie dziękuj :p) \n" },
    { id: "haslo14", type: "normal", label: "Bydgoszcz jeden", msg: "Ale było fajnie. W końcu widziałem wszystko to o czym mi opowiadałaś.\n Chociaż tak krótko byłem...\n" },
    { id: "haslo15", type: "normal", label: "Warszawa", msg: "Na dwa tygodnie przed zaczęło się coś psuć. Bałem się strasznie.\n Zaczęło się od tego, że przestałaś mi odpowiadać na 'Kocham cię'\n Trochę sus. Nie chciałaś czegoś powiedzieć. A ja ukrywałem, że czuję się zbędny...\n W warszawie było dziwnie. Dobrze się bawiłem, nie powiem, że nie, ale czułem te czarne chmury nad nami. \n I ta rozomwa wieczorem u Wiktorii. \n Pamiętam dokładnie co mówiłaś. I nie wiedziałem jak zareagować. \n Nie wiedziałem czy płakać, czy prosić czy być zły. Nie wiedziałem. Wrociłem do radomia i czułem się jakbyśmy właśnie zerwali. \n " },
    { id: "haslo16", type: "normal", label: "No contact", msg: "Dobrze, że miałem krzyśka wtedy. I Chat gpt mi mówił, kiedy mogę napisać a kiedy nie. Nauczyłem się wtedy też dużo o sobie. Zgodnie z chatem, miałem jeszcze poczekać tydzień. \n Bez przesady. \n Leciałem do pragi. Tak bardzo chciałem móc relacjonować ci wszystko! Lużno wysłałem losowe zdjęcie z lotniska. Napisałaś potem, że chyba możemy wrócić do kontaktu.\n Dawno się tak nie cieszyłem.\n" },
    { id: "haslo17", type: "normal", label: "Święta, Sylwester, Studniówka, Bydgoszcz dwa - happy ending. The happiest I can imagine", msg: "W święta mieliśmy kolejną rozmowę. Znacznie weselszą. Po lepieniu pierniczków haha. \n Wtedy nasza relacja odżyła na nowo. W sylwestra pierwszy french kiss hehehe. Ale się jarałem. \n Studniówka - ablsolute peak. Drugi raz w bydgoszczy tak samo. Piszę to po OMie. \n Kocham cię Ninuś bardzo. Jestem wdzięczny za to co przeżylismy i bardzo ciekawy co przed nami. \n A jestem pewien, że bardzo dobrze rzeczy.\n" },

    // SUPER
    { id: "super1",  type: "super",  label: "Liseeek", msg: "Liseeeeek! Pamiętnik. Syrena alarmowa. Trochę tego było.. \n Pamiętam jak byłem 'Skrzypcowy kawopij' hahahha\n" },
    { id: "super2",  type: "super",  label: "Kształcenie słuchu", msg: "W sumie to fajna sprawa, zmieniłem zdanie\n" },
  ];

  // Alias listy -> slot
  const ALIASES = [
    { slot: "haslo1",  words: ["kino", "igrzyska", "helios", "igrzyska śmierci", "igrzyska smierci"] },
    { slot: "haslo2",  words: ["sandomierz", "trójka", "trojka"] },
    { slot: "haslo3",  words: ["agata", "osiemnastka agi"] },
    { slot: "haslo4",  words: ["koda", "sciana", "ściana"] },
    { slot: "haslo5",  words: ["kałków", "kalkow", "eremy", "oaza", "wakacje"] },
    { slot: "haslo6",  words: ["antek", "rozstanie", "zerwanie"] },
    { slot: "haslo7",  words: ["osiemnastka", "impreza"] },
    { slot: "haslo8",  words: ["badminton", "lego", "kpop demon hunters", "jedlanka"] },
    { slot: "haslo9",  words: ["bubble tea", "bubbletea", "radom", "wyjście", "wyjscie"] },

    // SCALONE: maple leaf + piosenka + pamiętny poniedziałek
    { slot: "haslo10", words: ["like a maple leaf", "piosenka", "maple leaf", "pamiętny poniedziałek", "pamietny poniedzialek", "poniedziałek", "poniedzialek"] },

    { slot: "haslo11", words: ["candle"] },

    // NOWE: całus/buziak
    { slot: "haslo12", words: ["całus", "calus", "buziak"] },

    { slot: "haslo13", words: ["kocham cię", "kocham cie", "dziekuje", "dziękuję"] },
    { slot: "haslo14", words: ["bydgoszcz", "bydgoszcz jeden"] },
    { slot: "haslo15", words: ["warszawa"] },
    { slot: "haslo16", words: ["no contact"] },
    { slot: "haslo17", words: ["bydgoszcz dwa", "swieta", "sylwester"] },

    // SUPER
    { slot: "super1",  words: ["lisek", "wiewiorka", "wiewiórka", "misia"] },
    { slot: "super2",  words: ["kształcenie słuchu", "ksztalcenie sluchu"] },
  ];

  // mapy
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

  const normalize = (s) =>
    s
      .trim()
      .toLowerCase()
      .replace(/\s+/g, " ")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

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
    "Ale jak to dokładnie było?\n"
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
  let alarmOsc = null;
let alarmGain = null;

function startAlarm() {
  ensureAudio();

  const t = audioCtx.currentTime;

  alarmOsc = audioCtx.createOscillator();
  alarmGain = audioCtx.createGain();

  alarmOsc.type = "sawtooth";
  alarmOsc.frequency.setValueAtTime(110, t); // niski ton

  // lekkie falowanie tonu
  const lfo = audioCtx.createOscillator();
  const lfoGain = audioCtx.createGain();
  lfo.frequency.value = 0.6;
  lfoGain.gain.value = 30;
  lfo.connect(lfoGain);
  lfoGain.connect(alarmOsc.frequency);
  lfo.start();

  alarmGain.gain.setValueAtTime(0.0001, t);
  alarmGain.gain.exponentialRampToValueAtTime(0.05, t + 2);

  alarmOsc.connect(alarmGain);
  alarmGain.connect(audioCtx.destination);

  alarmOsc.start();
}

function stopAlarm() {
  if (!alarmOsc) return;
  const t = audioCtx.currentTime;
  alarmGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.5);
  alarmOsc.stop(t + 0.6);
  alarmOsc = null;
}


  // =========================
  // 4) TABELA + SZYFROWANIE
  // =========================
  const TABLE_ROWS = SLOT_DEFS.length;
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
    normalCounterEl.textContent = `Canon event ${usedNormals.size}/${NORMAL_TOTAL}`;
    superCounterEl.textContent = `Inside joke ${usedSupers.size}/${SUPER_TOTAL}`;
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
  // 6) HELPERS
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

  // echo komendy w historii jako CMD
  out.textContent += `C:\\Users\\misiu> ${trimmed}\n`;
  scrollToBottom();

  if (key.length === 0) {
    out.textContent += "\n";
    scrollToBottom();
    return;
  }

  // Komendy specjalne (po odblokowaniu)
  if (isAllDoneUnlocked() && key === "all done") {
  if (appMode !== "terminal") return;
  startAllDoneSequence();
  return;
}


  // Sloty (tabela + liczniki)
  const slot = INPUT_TO_SLOT[key];
  if (slot && Object.prototype.hasOwnProperty.call(SLOT_POSITION, slot)) {
    const rowIndex = SLOT_POSITION[slot];

    // czy to była nowa odblokowana rzecz (żeby unlock check robić tylko raz)
    let isNewUnlock = false;

    if (!usedCommands.has(slot)) {
      isNewUnlock = true;

      usedCommands.add(slot);
      if (SLOT_TYPE[slot] === "normal") usedNormals.add(slot);
      if (SLOT_TYPE[slot] === "super") usedSupers.add(slot);

      lockRowAsFound(rowIndex, SLOT_LABEL[slot] || trimmed);
      updateCounters();

      // PERSIST: zapisz znaleziony slot
      const found = loadFoundSlots();
      if (!found.includes(slot)) {
        found.push(slot);
        saveFoundSlots(found);
      }
    }

    // 1) najpierw wypisz wiadomość dla slotu
    out.textContent += (SLOT_MSG[slot] || "\n") + "\n";
    scrollToBottom();

    // 2) dopiero potem ewentualnie pokaż "Odblokowano komendę - 'all done'"
    if (isNewUnlock) {
      maybeUnlockAllDone();
    }

    // daj odstęp jak w cmd
    out.textContent += "\n";
    scrollToBottom();
    return;
  }

  // Nieznana komenda
  out.textContent += cmdNotFound(trimmed);
  scrollToBottom();
};

 

  // =========================
  // 8) START
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
  // 9) INPUT
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

  if (resetBtn) {
    resetBtn.addEventListener("click", () => {
      try {
        localStorage.removeItem(LS_KEY_FOUND);
        localStorage.removeItem(LS_KEY_ALLDONE);
      } catch (_) {}
      location.reload();
    });
  }
  function delay(ms) {
  return new Promise(res => setTimeout(res, ms));
}

async function startAllDoneSequence() {
  appMode = "countdown";
  setPromptVisible(false);

  // 1. wypisz wiadomość
  out.textContent += SPECIAL_COMMANDS["all done"] + "\n";
  scrollToBottom();

  // 2. odliczanie
  startAlarm();
  for (let i = 20; i >= 0; i--) {
    out.textContent += i + "\n";
    scrollToBottom();
    await delay(700);
  }
  stopAlarm();

  // 3. glitch
  appMode = "glitch";
  const glitch = document.getElementById("glitchVideo");
  glitch.classList.remove("hidden");
  glitch.play();

  await delay(2000);

  glitch.pause();
  glitch.classList.add("hidden");

  // 4. wyczyść ekran
  out.textContent = "";
  document.getElementById("foundTableBody").innerHTML = "";

  out.textContent = "UNAUTHORIZED ACCESS \n";
  await delay(2000);

  out.textContent = "";
  await delay(800);

  // 5. admin intro
  appMode = "adminQuiz";

  const overlay = document.getElementById("adminOverlay");
  const content = document.getElementById("adminContent");

  overlay.classList.remove("hidden");

  function typeAdminText(container, lines, done) {
  container.innerHTML = "<M4LINA> Widzę co próbujesz zrobić. \n Myślisz, że tak łatwo ci na to pozwolę? HAHAHAHAHAHAAH (laughs ominously) ";
  let i = 0;

  function nextLine() {
    if (i >= lines.length) {
      setTimeout(() => {
        done && done();
      }, 7000); // 7 sekund pauzy po napisaniu
      return;
    }

    const p = document.createElement("p");
    container.appendChild(p);

    // wolniejsze pisanie
    typeIntoNode(p, lines[i], 60, true, () => {
      i++;
      setTimeout(nextLine, 1200);
    });
  }

  nextLine();
}

}

function typeAdminText(container, lines, done) {
  container.innerHTML = "";
  let i = 0;

  function nextLine() {
    if (i >= lines.length) {
      done && done();
      return;
    }

    const p = document.createElement("p");
    container.appendChild(p);

    typeIntoNode(p, lines[i], 25, true, () => {
      i++;
      setTimeout(nextLine, 500);
    });
  }

  nextLine();
}
const quizData = [
  {
    img: "photo1.png",
    question: "Gdzie zrobilismy to zdjecie? (miasto)",
    answer: "Warszawa"
  },
  {
    img: "photo2.png",
    question: "W ktorym miesiacu zrobilismy to zdjecie?",
    answer: "październik"
  },
  {
    img: "photo3.png",
    question: "Na jakim evencie zrobiono to zdjecie?",
    answer: "szkola animatora"
  },
  {
    img: "photo4.png",
    question: "Co bylo w pudelku?",
    answer: "charms"
  }
];

let quizIndex = 0;

function normalizeAnswer(s) {
  return s
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function startQuiz() {
  showQuizQuestion();
}

function showQuizQuestion() {
  const overlay = document.getElementById("adminOverlay");
  const content = document.getElementById("adminContent");

  const q = quizData[quizIndex];

  content.innerHTML = `
    <img src="${q.img}">
    <p>${q.question}</p>
    <input id="quizInput" />
    <div id="quizMsg"></div>
  `;

  const input = document.getElementById("quizInput");
  const msg = document.getElementById("quizMsg");

  input.focus();

  input.addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
      const val = normalizeAnswer(input.value);

      if (val === q.answer) {
        quizIndex++;

        if (quizIndex >= quizData.length) {
          showFinal();
        } else {
          showQuizQuestion();
        }
      } else {
        msg.textContent = "Nie tak latwo...";
      }
    }
  });
}

function showFinal() {
  appMode = "final";

  const content = document.getElementById("adminContent");

  content.innerHTML = `
    <img src="photo_final.png">
    <p>Co??? JAK CI SIE TO UDAŁO??? \n Ech... Zapomniałem że jesteśmy klonami. Wchodź zatem, zasłużyłaś.</p>
    <button id="authorBtn">Wiadomość od autora (koniec) </button>
  `;

  document.getElementById("authorBtn").onclick = () => {
    content.innerHTML = `
      <p>Wow! Imponujące. Jestem ciekawy ile rzeczy musiałem ci podpowiedzieć hahah. Ale mam nadzieję, że ta gierka zapewniła ci trochę radości, trochę nostalgii i trochę cię zaciekawiła. Kocham cię! Do zobaczenia w pszyszłych projektach - Twój informatyk <3.\n.</p>
      <button id="resetAll">Resetuj</button>
    `;

    document.getElementById("resetAll").onclick = () => {
      localStorage.clear();
      location.reload();
    };
  };
}

})();
