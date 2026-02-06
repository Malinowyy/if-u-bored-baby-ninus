// terminal.js
(function () {
  const out = document.getElementById("terminalText");
  if (!out) return;

  // Zmień ten tekst jak chcesz (zostaw \n na nowe linie)
  const lines = [
    "C:\\Users\\misiu> uruchom_historia.exe",
    "",
    "[OK] Ładowanie wspomnień...",
    "[OK] Synchronizacja spojrzeń...",
    "[OK] Sprawdzanie czy to przypadek czy przeznaczenie...",
    "",
    "=> A potem nagle: hello.",
    "=> I jakoś już zostało.",
    "",
    "C:\\Users\\misiu> _"
  ];

  const fullText = lines.join("\n");

  let i = 0;
  const speedMs = 22; // tempo pisania

  const tick = () => {
    // Pisanie znak po znaku
    out.textContent = fullText.slice(0, i);
    i += 1;

    if (i <= fullText.length) {
      window.setTimeout(tick, speedMs);
    }
  };

  tick();
})();
