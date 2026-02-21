// main.js

// Subtelna „klik animacja” też dla linków: dodaj klasę przy kliknięciu
document.addEventListener("click", (e) => {
  const el = e.target.closest(".btn, .topbar__homeBtn");
  if (!el) return;
  el.classList.add("btn--clicked");
  window.setTimeout(() => el.classList.remove("btn--clicked"), 140);
});

// Timer na stronie zegar.html (odliczanie od 29.09.2025 19:25)
(function () {
  const timeEl = document.getElementById("timeSince");
  if (!timeEl) return;

  const start = new Date(2025, 8, 29, 19, 25, 0);

  const pad2 = (n) => String(n).padStart(2, "0");

  // --- cookies helpers (lokalne dla zegara) ---
  const COOKIE_FMT = "timeFormat";
  const COOKIE_DAYS = 365;

  function setCookie(name, value, days) {
    const d = new Date();
    d.setTime(d.getTime() + days * 24 * 60 * 60 * 1000);
    const expires = "expires=" + d.toUTCString();
    document.cookie = `${name}=${encodeURIComponent(String(value))}; ${expires}; path=/; SameSite=Lax`;
  }

  function getCookie(name) {
    const prefix = name + "=";
    const parts = document.cookie.split(";").map(s => s.trim());
    for (const p of parts) {
      if (p.startsWith(prefix)) return decodeURIComponent(p.substring(prefix.length));
    }
    return null;
  }

  // format: seconds|minutes|hours|days|weeks|months|years
  let fmt = getCookie(COOKIE_FMT) || "days";

  const fmtBtns = Array.from(document.querySelectorAll("[data-timefmt]"));
  const applyBtnState = () => {
    for (const b of fmtBtns) {
      const on = b.getAttribute("data-timefmt") === fmt;
      b.classList.toggle("btn--primary", on);
      b.setAttribute("aria-pressed", on ? "true" : "false");
    }
  };

  for (const b of fmtBtns) {
    b.addEventListener("click", () => {
      fmt = b.getAttribute("data-timefmt") || "days";
      setCookie(COOKIE_FMT, fmt, COOKIE_DAYS);
      applyBtnState();
      render(); // od razu odśwież
    });
  }
  applyBtnState();

  // miesiące / lata liczymy „kalendarzowo”, nie z przybliżeń
  function diffCalendarMonths(a, b) {
    // zwraca liczbę pełnych miesięcy między a -> b (może być ujemna)
    const sign = b >= a ? 1 : -1;
    const from = sign === 1 ? a : b;
    const to = sign === 1 ? b : a;

    let months = (to.getFullYear() - from.getFullYear()) * 12 + (to.getMonth() - from.getMonth());

    // jeśli dzień-godzina w "to" jest wcześniejsza niż w "from", to miesiąc nie jest pełny
    const anchor = new Date(from.getTime());
    anchor.setMonth(anchor.getMonth() + months);

    if (to < anchor) months -= 1;

    return months * sign;
  }

  function diffCalendarYears(a, b) {
    const sign = b >= a ? 1 : -1;
    const from = sign === 1 ? a : b;
    const to = sign === 1 ? b : a;

    let years = to.getFullYear() - from.getFullYear();

    const anchor = new Date(from.getTime());
    anchor.setFullYear(anchor.getFullYear() + years);

    if (to < anchor) years -= 1;

    return years * sign;
  }

  function render() {
    const now = new Date();
    let diffMs = now.getTime() - start.getTime();

    const isFuture = diffMs < 0;
    diffMs = Math.abs(diffMs);

    const totalSeconds = Math.floor(diffMs / 1000);
    const totalMinutes = Math.floor(totalSeconds / 60);
    const totalHours = Math.floor(totalMinutes / 60);
    const totalDays = Math.floor(totalHours / 24);

    const seconds = totalSeconds % 60;
    const minutes = totalMinutes % 60;
    const hours = totalHours % 24;

    const prefix = isFuture ? "Do tej chwili pozostało: " : "Minęło: ";

    // „wartość” zależnie od formatu
    if (fmt === "seconds") {
      timeEl.textContent = `${prefix}${totalSeconds} sekund`;
      return;
    }
    if (fmt === "minutes") {
      timeEl.textContent = `${prefix}${totalMinutes} minut`;
      return;
    }
    if (fmt === "hours") {
      timeEl.textContent = `${prefix}${totalHours} godzin`;
      return;
    }
    if (fmt === "weeks") {
      const weeks = Math.floor(totalDays / 7);
      timeEl.textContent = `${prefix}${weeks} tygodni`;
      return;
    }
    if (fmt === "months") {
      const months = Math.abs(diffCalendarMonths(start, now));
      timeEl.textContent = `${prefix}${months} miesięcy`;
      return;
    }
    if (fmt === "years") {
      const years = Math.abs(diffCalendarYears(start, now));
      timeEl.textContent = `${prefix}${years} lat`;
      return;
    }

    // default / "days": zostawiamy Twój ładny format z HH:MM:SS
    timeEl.textContent = `${prefix}${totalDays} dni ${pad2(hours)}:${pad2(minutes)}:${pad2(seconds)}`;
  }

  render();
  window.setInterval(render, 250);
})();


// Free hugs: hug.mp4, restart na KAŻDY klik, licznik od razu (cookies) + reset
(function () {
  const vid = document.getElementById("hugVid");
  const btn = document.getElementById("hugPlayBtn");
  const counterEl = document.getElementById("hugCount");
  const resetBtn = document.getElementById("hugResetBtn");
  if (!vid || !btn || !counterEl) return;

  const VIDEO_SRC = "hug.mp4";
  const COOKIE_KEY = "hugCount";
  const COOKIE_DAYS = 365;

  // --- cookies helpers ---
  function setCookie(name, value, days) {
    const d = new Date();
    d.setTime(d.getTime() + days * 24 * 60 * 60 * 1000);
    const expires = "expires=" + d.toUTCString();
    document.cookie = `${name}=${encodeURIComponent(String(value))}; ${expires}; path=/; SameSite=Lax`;
  }

  function getCookie(name) {
    const prefix = name + "=";
    const parts = document.cookie.split(";").map(s => s.trim());
    for (const p of parts) {
      if (p.startsWith(prefix)) return decodeURIComponent(p.substring(prefix.length));
    }
    return null;
  }

  function readHugsFromCookie() {
    const raw = getCookie(COOKIE_KEY);
    const n = parseInt(raw || "0", 10);
    return Number.isFinite(n) && n >= 0 ? n : 0;
  }

  // --- video setup ---
  vid.muted = true;
  vid.loop = false;
  vid.playsInline = true;
  vid.preload = "auto";
  vid.controls = false;

  if (!vid.querySelector("source")) {
    const src = document.createElement("source");
    src.src = VIDEO_SRC;
    src.type = "video/mp4";
    vid.appendChild(src);
  }

  let hugs = readHugsFromCookie();
  counterEl.textContent = String(hugs);

  const freezeToStart = () => {
    vid.pause();
    try { vid.currentTime = 0; } catch (_) {}
  };

  vid.addEventListener("loadedmetadata", () => {
    freezeToStart();
  });

  // Po end i tak zamrażamy na początku (ale NIE wpływa to na licznik)
  vid.addEventListener("ended", () => {
    freezeToStart();
  });

  btn.addEventListener("click", async () => {
    // 1) licznik od razu (spam = spam)
    hugs += 1;
    counterEl.textContent = String(hugs);
    setCookie(COOKIE_KEY, hugs, COOKIE_DAYS);

    // 2) reset i start filmu od nowa na KAŻDY klik
    try {
      vid.pause();

      // na niektórych przeglądarkach bezpieczniej: mały "reflow" resetu
      // ale zwykle wystarczy:
      vid.currentTime = 0;

      await vid.play();
    } catch (_) {
      // jeśli autoplay/play failnie, licznik i tak zostaje (bo klik jest gestem, powinno przejść)
    }
  });

  if (resetBtn) {
    resetBtn.addEventListener("click", () => {
      hugs = 0;
      counterEl.textContent = "0";
      setCookie(COOKIE_KEY, 0, COOKIE_DAYS);
      freezeToStart();
    });
  }

  freezeToStart();
})();
