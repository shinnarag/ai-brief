/* AI Pulse — client interactions */
(function () {
  "use strict";

  /* ---------- helpers ---------- */
  function $(sel, root) {
    return (root || document).querySelector(sel);
  }
  function $$(sel, root) {
    return Array.from((root || document).querySelectorAll(sel));
  }
  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }
  function highlight(text, q) {
    if (!q) return escapeHtml(text);
    const src = String(text);
    const lower = src.toLowerCase();
    const needle = q.toLowerCase();
    let out = "";
    let i = 0;
    while (i < src.length) {
      const at = lower.indexOf(needle, i);
      if (at < 0) {
        out += escapeHtml(src.slice(i));
        break;
      }
      out += escapeHtml(src.slice(i, at));
      out += "<mark>" + escapeHtml(src.slice(at, at + needle.length)) + "</mark>";
      i = at + needle.length;
    }
    return out;
  }

  /* ---------- reading progress + back to top ---------- */
  function initReadingChrome() {
    const bar = $(".read-progress > i");
    const btn = $(".back-to-top");
    const onScroll = () => {
      const doc = document.documentElement;
      const max = Math.max(1, doc.scrollHeight - window.innerHeight);
      const p = Math.min(1, Math.max(0, window.scrollY / max));
      if (bar) bar.style.width = (p * 100).toFixed(2) + "%";
      if (btn) btn.classList.toggle("is-visible", window.scrollY > 480);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    if (btn) {
      btn.addEventListener("click", () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
    }
  }

  /* ---------- brief TOC scroll-spy + mobile mini nav ---------- */
  function initTocSpy() {
    const tocRoot = $(".toc-panel nav");
    const sections = $$(".news-section[id]");
    if (!tocRoot || !sections.length) return;

    const links = $$("a[href^='#']", tocRoot);
    if (!links.length) return;

    const byId = new Map();
    links.forEach((a) => {
      const id = decodeURIComponent((a.getAttribute("href") || "").slice(1));
      if (id) byId.set(id, a);
    });

    function setActive(id) {
      links.forEach((a) => {
        const on = a === byId.get(id);
        a.classList.toggle("is-active", on);
        if (on) a.setAttribute("aria-current", "true");
        else a.removeAttribute("aria-current");
      });
      $$(".toc-mini a").forEach((a) => {
        const href = decodeURIComponent((a.getAttribute("href") || "").slice(1));
        a.classList.toggle("is-active", href === id);
      });
    }

    // Mobile sticky mini TOC (chips)
    if (!$(".toc-mini") && window.matchMedia("(max-width: 900px)").matches) {
      const mini = document.createElement("nav");
      mini.className = "toc-mini";
      mini.setAttribute("aria-label", "섹션 점프");
      const inner = document.createElement("div");
      inner.className = "toc-mini-inner";
      links.forEach((a) => {
        const chip = document.createElement("a");
        chip.href = a.getAttribute("href") || "#";
        // strip emoji-heavy prefixes lightly for compact chips
        chip.textContent = (a.textContent || "").replace(/^\S+\s+/, "").trim() || a.textContent;
        chip.title = a.textContent || "";
        inner.appendChild(chip);
      });
      mini.appendChild(inner);
      const main = $("main.main");
      if (main) main.insertBefore(mini, main.firstChild);
    } else if (!$(".toc-mini")) {
      // Desktop: still build mini for resize into mobile; hide via CSS
      const mini = document.createElement("nav");
      mini.className = "toc-mini";
      mini.setAttribute("aria-label", "섹션 점프");
      const inner = document.createElement("div");
      inner.className = "toc-mini-inner";
      links.forEach((a) => {
        const chip = document.createElement("a");
        chip.href = a.getAttribute("href") || "#";
        chip.textContent = (a.textContent || "").replace(/^\S+\s+/, "").trim() || a.textContent;
        chip.title = a.textContent || "";
        inner.appendChild(chip);
      });
      mini.appendChild(inner);
      const main = $("main.main");
      if (main) main.insertBefore(mini, main.firstChild);
    }

    // Smooth offset scroll for TOC / mini clicks
    function scrollToId(id) {
      const el = document.getElementById(id);
      if (!el) return;
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      setActive(id);
      history.replaceState(null, "", "#" + encodeURIComponent(id));
    }

    document.addEventListener("click", (e) => {
      const a = e.target.closest(".toc-panel a[href^='#'], .toc-mini a[href^='#']");
      if (!a) return;
      const id = decodeURIComponent((a.getAttribute("href") || "").slice(1));
      if (!id || !document.getElementById(id)) return;
      e.preventDefault();
      scrollToId(id);
    });

    if ("IntersectionObserver" in window) {
      const ratios = new Map();
      const obs = new IntersectionObserver(
        (entries) => {
          entries.forEach((en) => {
            ratios.set(en.target.id, en.isIntersecting ? en.intersectionRatio : 0);
          });
          let bestId = "";
          let best = 0;
          ratios.forEach((r, id) => {
            if (r > best) {
              best = r;
              bestId = id;
            }
          });
          // Prefer the topmost section near the header when several intersect
          if (best < 0.08) {
            const headerH =
              parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--header")) ||
              56;
            const y = window.scrollY + headerH + 28;
            let current = sections[0].id;
            for (const sec of sections) {
              if (sec.offsetTop <= y) current = sec.id;
            }
            setActive(current);
          } else if (bestId) {
            setActive(bestId);
          }
        },
        {
          root: null,
          rootMargin: "-20% 0px -55% 0px",
          threshold: [0, 0.1, 0.25, 0.5, 0.75, 1],
        }
      );
      sections.forEach((s) => obs.observe(s));
    } else {
      const onScroll = () => {
        const headerH =
          parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--header")) || 56;
        const y = window.scrollY + headerH + 28;
        let current = sections[0].id;
        for (const sec of sections) {
          if (sec.offsetTop <= y) current = sec.id;
        }
        setActive(current);
      };
      window.addEventListener("scroll", onScroll, { passive: true });
      onScroll();
    }

    // Deep-link highlight for card / section
    function flashTarget() {
      const raw = location.hash.replace(/^#/, "");
      if (!raw) return;
      let id = raw;
      try {
        id = decodeURIComponent(raw);
      } catch (_) {}
      const el = document.getElementById(id);
      if (!el) return;
      el.classList.add("is-target-flash");
      if (el.classList.contains("news-section")) setActive(id);
      else {
        const sec = el.closest(".news-section");
        if (sec && sec.id) setActive(sec.id);
      }
      window.setTimeout(() => el.classList.remove("is-target-flash"), 2200);
    }
    window.addEventListener("hashchange", flashTarget);
    // after layout
    window.setTimeout(flashTarget, 60);
  }

  /* ---------- archive: edition filter + deep body search ---------- */
  function initArchive() {
    const input = $("#archive-search");
    const chips = $$("[data-filter]");
    const cards = $$("[data-archive-card]");
    const empty = $("#search-empty");
    const hitsWrap = $("#search-hits");
    const hitsList = $("#search-hits-list");
    const hitsMeta = $("#search-hits-meta");
    if (!cards.length && !hitsList) return;

    let activeFilter = "all";
    let searchIndex = null;
    let indexPromise = null;

    function loadIndex() {
      if (searchIndex) return Promise.resolve(searchIndex);
      if (indexPromise) return indexPromise;
      indexPromise = fetch("data/search.json", { cache: "no-store" })
        .then((r) => (r.ok ? r.json() : { items: [] }))
        .then((data) => {
          searchIndex = data;
          return data;
        })
        .catch(() => {
          searchIndex = { items: [] };
          return searchIndex;
        });
      return indexPromise;
    }

    function editionVisible(card, q, matchF) {
      const hay = (card.getAttribute("data-search") || card.textContent || "").toLowerCase();
      const domains = (card.getAttribute("data-domains") || "").toLowerCase();
      const matchQ = !q || hay.includes(q);
      const matchDomain =
        activeFilter === "all" ||
        domains.split(/\s+/).includes(activeFilter) ||
        hay.includes(activeFilter);
      return matchQ && matchDomain && matchF !== false;
    }

    function renderHits(q, items) {
      if (!hitsWrap || !hitsList) return 0;
      if (!q) {
        hitsWrap.classList.add("hidden");
        hitsList.innerHTML = "";
        return 0;
      }
      const filtered = items.filter((it) => {
        const blob = ((it.title || "") + " " + (it.text || "") + " " + (it.snippet || "")).toLowerCase();
        if (!blob.includes(q)) return false;
        if (activeFilter === "all") return true;
        const doms = (it.domains || []).map((d) => String(d).toLowerCase());
        return doms.includes(activeFilter);
      });

      // Prefer title matches first, then body
      filtered.sort((a, b) => {
        const at = (a.title || "").toLowerCase().includes(q) ? 0 : 1;
        const bt = (b.title || "").toLowerCase().includes(q) ? 0 : 1;
        if (at !== bt) return at - bt;
        return (b.date || "").localeCompare(a.date || "");
      });

      const max = 40;
      const slice = filtered.slice(0, max);
      hitsList.innerHTML = slice
        .map((it) => {
          const href = it.href || `${it.briefUrl}#${it.cardId || it.sectionId || ""}`;
          const snip = it.snippet || it.text || "";
          return (
            `<a class="search-hit" href="${escapeHtml(href)}">` +
            `<div class="search-hit-meta">` +
            `<span>${escapeHtml(it.date || "")}</span>` +
            `<span>${escapeHtml(it.section || "")}</span>` +
            `</div>` +
            `<h3>${highlight(it.title || "(제목 없음)", q)}</h3>` +
            `<p>${highlight(snip, q)}</p>` +
            `<div class="search-hit-go">해당 카드로 이동 →</div>` +
            `</a>`
          );
        })
        .join("");

      if (hitsMeta) {
        hitsMeta.textContent =
          filtered.length === 0
            ? "일치하는 본문 카드 없음"
            : filtered.length > max
              ? `${filtered.length}건 중 상위 ${max}건 표시`
              : `${filtered.length}건의 본문 카드`;
      }
      hitsWrap.classList.toggle("hidden", slice.length === 0 && !q);
      if (q && slice.length === 0) hitsWrap.classList.remove("hidden");
      return filtered.length;
    }

    function apply() {
      const q = (input?.value || "").toLowerCase().trim();
      let editionVisibleCount = 0;

      const paintEditions = (hitDates) => {
        for (const card of cards) {
          const date = card.getAttribute("data-date") || "";
          const hay = (card.getAttribute("data-search") || "").toLowerCase();
          const domains = (card.getAttribute("data-domains") || "").toLowerCase();
          const matchQ =
            !q ||
            hay.includes(q) ||
            (hitDates && hitDates.has(date));
          const matchF =
            activeFilter === "all" ||
            domains.split(/\s+/).includes(activeFilter) ||
            hay.includes(activeFilter);
          const show = matchQ && matchF;
          card.classList.toggle("hidden", !show);
          if (show) editionVisibleCount += 1;
        }
      };

      if (!q) {
        if (hitsWrap) hitsWrap.classList.add("hidden");
        if (hitsList) hitsList.innerHTML = "";
        paintEditions(null);
        if (empty) empty.classList.toggle("hidden", editionVisibleCount > 0);
        return;
      }

      loadIndex().then((data) => {
        const items = data.items || [];
        const hitCount = renderHits(q, items);
        const hitDates = new Set(
          items
            .filter((it) => {
              const blob = ((it.title || "") + " " + (it.text || "")).toLowerCase();
              if (!blob.includes(q)) return false;
              if (activeFilter === "all") return true;
              return (it.domains || []).map((d) => String(d).toLowerCase()).includes(activeFilter);
            })
            .map((it) => it.date)
        );
        editionVisibleCount = 0;
        paintEditions(hitDates);
        if (empty) empty.classList.toggle("hidden", editionVisibleCount > 0 || hitCount > 0);
      });
    }

    if (input) {
      input.addEventListener("input", apply);
      // Prefetch index when focusing search
      input.addEventListener("focus", () => loadIndex(), { once: true });
    }
    chips.forEach((chip) => {
      chip.addEventListener("click", () => {
        activeFilter = chip.getAttribute("data-filter") || "all";
        chips.forEach((c) => c.classList.toggle("active", c === chip));
        apply();
      });
    });

    document.addEventListener("keydown", (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k" && input) {
        e.preventDefault();
        input.focus();
        input.select();
      }
    });

    // Deep-link query from URL ?q=
    if (input) {
      const params = new URLSearchParams(location.search);
      const q0 = params.get("q");
      if (q0) {
        input.value = q0;
        loadIndex().then(apply);
      }
    }
  }

  /* ---------- boot ---------- */
  initReadingChrome();
  initTocSpy();
  initArchive();
})();
