/* AI Pulse — client interactions */
(function () {
  "use strict";

  // Archive search + domain filter
  const input = document.getElementById("archive-search");
  const chips = Array.from(document.querySelectorAll("[data-filter]"));
  const cards = Array.from(document.querySelectorAll("[data-archive-card]"));
  const empty = document.getElementById("search-empty");
  let activeFilter = "all";

  function apply() {
    if (!cards.length) return;
    const q = (input?.value || "").toLowerCase().trim();
    let visible = 0;
    for (const card of cards) {
      const hay = (card.getAttribute("data-search") || card.textContent || "").toLowerCase();
      const domains = (card.getAttribute("data-domains") || "").toLowerCase();
      const matchQ = !q || hay.includes(q);
      const matchF =
        activeFilter === "all" ||
        domains.split(/\s+/).includes(activeFilter) ||
        hay.includes(activeFilter);
      const show = matchQ && matchF;
      card.classList.toggle("hidden", !show);
      if (show) visible += 1;
    }
    if (empty) empty.classList.toggle("hidden", visible > 0);
  }

  if (input) input.addEventListener("input", apply);
  chips.forEach((chip) => {
    chip.addEventListener("click", () => {
      activeFilter = chip.getAttribute("data-filter") || "all";
      chips.forEach((c) => c.classList.toggle("active", c === chip));
      apply();
    });
  });

  // Cmd/Ctrl+K focus search
  document.addEventListener("keydown", (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k" && input) {
      e.preventDefault();
      input.focus();
      input.select();
    }
  });
})();
