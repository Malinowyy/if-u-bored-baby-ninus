// main.js
(function () {
  // Subtelna „klik animacja” też dla linków: dodaj klasę przy kliknięciu
  document.addEventListener("click", (e) => {
    const el = e.target.closest(".btn");
    if (!el) return;
    el.classList.add("btn--clicked");
    window.setTimeout(() => el.classList.remove("btn--clicked"), 140);
  });

  // Zegar świata: licz od 29.09.2025 18:00 do teraz
(function () {
  const timeEl = document.getElementById("timeSince");
  if (!timeEl) return;

  const start = new Date(2025, 8, 29, 18, 0, 0); // 8 = wrzesień

  const pad2 = (n) => String(n).padStart(2, "0");

  const render = () => {
    const now = new Date();
    let diffMs = now - start;

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

  // Zegar świata: dopasuj długość ścieżki serca do stroke-dash (żeby nie było "kreski")
(function () {
  const path = document.querySelector(".heart__path");
  if (!path) return;

  try {
    const len = path.getTotalLength();
    path.style.setProperty("--pathLen", String(len));
  } catch (_) {
    // jeśli coś nietypowego w przeglądarce, zostanie fallback z CSS
  }
})();


// Free hugs: lokalny hug.mp4, play raz, freeze na pierwszej klatce, licznik
(function () {
  const vid = document.getElementById("hugVid");
  const btn = document.getElementById("hugPlayBtn");
  const counterEl = document.getElementById("hugCount");
  if (!vid || !btn || !counterEl) return;

  const VIDEO_SRC = "hug.mp4"; // <-- lokalny plik w repo

  // Konfiguracja video
  vid.muted = true;
  vid.loop = false;
  vid.playsInline = true;
  vid.preload = "auto";
  vid.controls = false;

  // Podpięcie źródła
  const src = document.createElement("source");
  src.src = VIDEO_SRC;
  src.type = "video/mp4";
  vid.appendChild(src);

  let hugs = 0;
  let busy = false;

  const freezeToStart = () => {
    vid.pause();
    try {
      vid.currentTime = 0;
    } catch (_) {}
  };

  // Gwarancja pierwszej klatki po załadowaniu
  vid.addEventListener("loadedmetadata", () => {
    freezeToStart();
  });

  // Po zakończeniu animacji
  vid.addEventListener("ended", () => {
    hugs += 1;
    counterEl.textContent = String(hugs);

    freezeToStart();
    busy = false;
    btn.disabled = false;
  });

  // Klik przycisku
  btn.addEventListener("click", async () => {
    if (busy) return;

    busy = true;
    btn.disabled = true;

    try {
      freezeToStart();      // zawsze start od 0
      await vid.play();     // dokładnie jedno odtworzenie
    } catch (err) {
      busy = false;
      btn.disabled = false;
    }
  });

  // Startowo: zamarznięte na pierwszej klatce
  freezeToStart();
})();
