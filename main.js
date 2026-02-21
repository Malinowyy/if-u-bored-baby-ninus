// main.js

// Subtelna „klik animacja” też dla linków: dodaj klasę przy kliknięciu
document.addEventListener("click", (e) => {
  const el = e.target.closest(".btn, .topbar__homeBtn");
  if (!el) return;
  el.classList.add("btn--clicked");
  window.setTimeout(() => el.classList.remove("btn--clicked"), 140);
});

// Timer na stronie zegar.html (odliczanie od 29.09.2025 18:00)
(function () {
  const timeEl = document.getElementById("timeSince");
  if (!timeEl) return;

  const start = new Date(2025, 8, 29, 19, 25, 0);

  const pad2 = (n) => String(n).padStart(2, "0");

  const render = () => {
    const now = new Date();
    let diffMs = now.getTime() - start.getTime();

    const isFuture = diffMs < 0;
    diffMs = Math.abs(diffMs);

    const totalSeconds = Math.floor(diffMs / 1000);
    const seconds = totalSeconds % 60;

    const totalMinutes = Math.floor(totalSeconds / 60);
    const minutes = totalMinutes % 60;

    const totalHours = Math.floor(totalMinutes / 60);
    const hours = totalHours % 24;

    const days = Math.floor(totalHours / 24);

    const prefix = isFuture ? "Do tej chwili pozostało: " : "Minęło: ";
    timeEl.textContent = `${prefix}${days} dni ${pad2(hours)}:${pad2(minutes)}:${pad2(seconds)}`;
  };

  render();
  window.setInterval(render, 250);
})();


// Free hugs: lokalny hug.mp4, play raz, freeze na pierwszej klatce, licznik (cookies) + reset
(function () {
  const vid = document.getElementById("hugVid");
  const btn = document.getElementById("hugPlayBtn");
  const counterEl = document.getElementById("hugCount");
  const resetBtn = document.getElementById("hugResetBtn");
  if (!vid || !btn || !counterEl) return;

  const VIDEO_SRC = "hug.mp4"; // lokalny plik w repo
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
      if (p.startsWith(prefix)) {
        return decodeURIComponent(p.substring(prefix.length));
      }
    }
    return null;
  }

  function deleteCookie(name) {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; SameSite=Lax`;
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

  // Podpięcie źródła (tylko raz)
  if (!vid.querySelector("source")) {
    const src = document.createElement("source");
    src.src = VIDEO_SRC;
    src.type = "video/mp4";
    vid.appendChild(src);
  }

  let hugs = readHugsFromCookie();
  counterEl.textContent = String(hugs);

  let busy = false;

  const freezeToStart = () => {
    vid.pause();
    try { vid.currentTime = 0; } catch (_) {}
  };

  vid.addEventListener("loadedmetadata", () => {
    freezeToStart();
  });

  vid.addEventListener("ended", () => {
    freezeToStart();
    busy = false;
    btn.disabled = false;
  });

  btn.addEventListener("click", async () => {
    if (busy) return;
    busy = true;
    btn.disabled = true;

    // ++ licznik ZA KAŻDYM kliknięciem
    hugs += 1;
    counterEl.textContent = String(hugs);
    setCookie(COOKIE_KEY, hugs, COOKIE_DAYS);

    try {
      vid.pause();
      vid.currentTime = 0;
      await vid.play();
    } catch (_) {
      busy = false;
      btn.disabled = false;
    }
  });

  // Reset przyciskiem (jeśli istnieje)
  if (resetBtn) {
    resetBtn.addEventListener("click", () => {
      hugs = 0;
      counterEl.textContent = "0";
      setCookie(COOKIE_KEY, 0, COOKIE_DAYS);
      // ewentualnie zamiast setCookie możesz całkiem usunąć:
      // deleteCookie(COOKIE_KEY);
    });
  }

  freezeToStart();
})();
