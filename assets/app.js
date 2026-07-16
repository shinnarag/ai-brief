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
    const editionsMeta = $("#editions-meta");
    const grid = $(".archive-grid");
    if (!cards.length && !hitsList) return;

    let activeFilter = "all";
    let hitSort = "relevance";
    let hitSection = "all";
    let editionSort = "newest";
    let searchIndex = null;
    let indexPromise = null;
    let lastHitItems = [];

    const SECTION_MATCH = {
      top: (s) => /top\s*5|꼭\s*볼/i.test(s),
      models: (s) => /모델|플랫폼/.test(s),
      creative: (s) => /콘텐츠|크리에이티브|제작/.test(s),
      marketing: (s) => /마케팅|비즈니스/.test(s),
      tech: (s) => /테크|인프라|규제|보안/.test(s),
      sns: (s) => /sns|루머|바이럴|트렌드/i.test(s),
      action: (s) => /액션|실무/.test(s),
    };

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

    function matchSection(sectionLabel, key) {
      if (!key || key === "all") return true;
      const fn = SECTION_MATCH[key];
      return fn ? fn(sectionLabel || "") : true;
    }

    function countOccurrences(hay, needle) {
      if (!needle) return 0;
      let n = 0;
      let i = 0;
      while (i < hay.length) {
        const at = hay.indexOf(needle, i);
        if (at < 0) break;
        n += 1;
        i = at + needle.length;
      }
      return n;
    }

    function relevanceScore(it, q) {
      const title = (it.title || "").toLowerCase();
      const text = (it.text || "").toLowerCase();
      const snip = (it.snippet || "").toLowerCase();
      let score = 0;
      if (title.includes(q)) score += 100;
      if (title.startsWith(q)) score += 40;
      score += countOccurrences(title, q) * 25;
      score += countOccurrences(snip, q) * 8;
      score += countOccurrences(text, q) * 3;
      return score;
    }

    function sortHits(list, q) {
      const arr = list.slice();
      if (hitSort === "newest") {
        arr.sort((a, b) => (b.date || "").localeCompare(a.date || "") || (a.n || 0) - (b.n || 0));
      } else if (hitSort === "oldest") {
        arr.sort((a, b) => (a.date || "").localeCompare(b.date || "") || (a.n || 0) - (b.n || 0));
      } else if (hitSort === "title") {
        arr.sort((a, b) =>
          (a.title || "").localeCompare(b.title || "", "ko") ||
          (b.date || "").localeCompare(a.date || "")
        );
      } else {
        // relevance
        arr.sort((a, b) => {
          const sa = relevanceScore(a, q);
          const sb = relevanceScore(b, q);
          if (sb !== sa) return sb - sa;
          return (b.date || "").localeCompare(a.date || "");
        });
      }
      return arr;
    }

    function filterHits(items, q) {
      return items.filter((it) => {
        const blob = ((it.title || "") + " " + (it.text || "") + " " + (it.snippet || "")).toLowerCase();
        if (!blob.includes(q)) return false;
        if (activeFilter !== "all") {
          const doms = (it.domains || []).map((d) => String(d).toLowerCase());
          if (!doms.includes(activeFilter)) return false;
        }
        if (!matchSection(it.section || "", hitSection)) return false;
        return true;
      });
    }

    function renderHits(q, items) {
      if (!hitsWrap || !hitsList) return 0;
      if (!q) {
        hitsWrap.classList.add("hidden");
        hitsList.innerHTML = "";
        lastHitItems = [];
        return 0;
      }
      const filtered = filterHits(items, q);
      lastHitItems = filtered;
      const sorted = sortHits(filtered, q);

      const max = 60;
      const slice = sorted.slice(0, max);
      hitsList.innerHTML = slice
        .map((it) => {
          const href = it.href || `${it.briefUrl}#${it.cardId || it.sectionId || ""}`;
          const snip = it.snippet || it.text || "";
          return (
            `<a class="search-hit" href="${escapeHtml(href)}">` +
            `<div class="search-hit-meta">` +
            `<span>${escapeHtml(it.date || "")}</span>` +
            `<span>${escapeHtml(it.section || "")}</span>` +
            (it.briefTitle ? `<span>${escapeHtml(it.briefTitle)}</span>` : "") +
            `</div>` +
            `<h3>${highlight(it.title || "(제목 없음)", q)}</h3>` +
            `<p>${highlight(snip, q)}</p>` +
            `<div class="search-hit-go">해당 카드로 이동 →</div>` +
            `</a>`
          );
        })
        .join("");

      const sortLabel = {
        relevance: "관련도",
        newest: "최신순",
        oldest: "오래된순",
        title: "제목순",
      }[hitSort] || "관련도";

      if (hitsMeta) {
        if (filtered.length === 0) {
          hitsMeta.textContent = "일치하는 본문 카드 없음 · 필터를 바꿔 보세요";
        } else if (filtered.length > max) {
          hitsMeta.textContent = `${filtered.length}건 · ${sortLabel} · 상위 ${max}건 표시`;
        } else {
          hitsMeta.textContent = `${filtered.length}건 · ${sortLabel}`;
        }
      }
      hitsWrap.classList.remove("hidden");
      return filtered.length;
    }

    function sortEditionCards() {
      if (!grid || !cards.length) return;
      const visible = cards.filter((c) => !c.classList.contains("hidden"));
      const hidden = cards.filter((c) => c.classList.contains("hidden"));
      const sorted = visible.slice().sort((a, b) => {
        const da = a.getAttribute("data-date") || "";
        const db = b.getAttribute("data-date") || "";
        const ta = (a.querySelector("h3")?.textContent || "").trim();
        const tb = (b.querySelector("h3")?.textContent || "").trim();
        if (editionSort === "oldest") return da.localeCompare(db);
        if (editionSort === "title") return ta.localeCompare(tb, "ko") || db.localeCompare(da);
        return db.localeCompare(da); // newest
      });
      sorted.forEach((c) => grid.appendChild(c));
      hidden.forEach((c) => grid.appendChild(c));
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
        sortEditionCards();
        if (editionsMeta) {
          editionsMeta.textContent =
            editionVisibleCount === cards.length
              ? `날짜별 브리프 · ${editionVisibleCount}건`
              : `표시 ${editionVisibleCount}건`;
        }
      };

      if (!q) {
        if (hitsWrap) hitsWrap.classList.add("hidden");
        if (hitsList) hitsList.innerHTML = "";
        lastHitItems = [];
        paintEditions(null);
        if (empty) empty.classList.toggle("hidden", editionVisibleCount > 0);
        return;
      }

      loadIndex().then((data) => {
        const items = data.items || [];
        const hitCount = renderHits(q, items);
        const hitDates = new Set(filterHits(items, q).map((it) => it.date));
        editionVisibleCount = 0;
        paintEditions(hitDates);
        if (empty) empty.classList.toggle("hidden", editionVisibleCount > 0 || hitCount > 0);
      });
    }

    if (input) {
      input.addEventListener("input", apply);
      input.addEventListener("focus", () => loadIndex(), { once: true });
    }
    chips.forEach((chip) => {
      chip.addEventListener("click", () => {
        activeFilter = chip.getAttribute("data-filter") || "all";
        chips.forEach((c) => c.classList.toggle("active", c === chip));
        apply();
      });
    });

    // Hit sort chips
    $$("#hit-sorts [data-sort]").forEach((btn) => {
      btn.addEventListener("click", () => {
        hitSort = btn.getAttribute("data-sort") || "relevance";
        $$("#hit-sorts [data-sort]").forEach((b) =>
          b.classList.toggle("active", b === btn)
        );
        const q = (input?.value || "").toLowerCase().trim();
        if (q && searchIndex) renderHits(q, searchIndex.items || []);
        else apply();
      });
    });

    // Hit section filter chips
    $$("#hit-sections [data-section]").forEach((btn) => {
      btn.addEventListener("click", () => {
        hitSection = btn.getAttribute("data-section") || "all";
        $$("#hit-sections [data-section]").forEach((b) =>
          b.classList.toggle("active", b === btn)
        );
        apply();
      });
    });

    // Edition sort
    $$("#edition-sorts [data-edition-sort]").forEach((btn) => {
      btn.addEventListener("click", () => {
        editionSort = btn.getAttribute("data-edition-sort") || "newest";
        $$("#edition-sorts [data-edition-sort]").forEach((b) =>
          b.classList.toggle("active", b === btn)
        );
        sortEditionCards();
      });
    });

    document.addEventListener("keydown", (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k" && input) {
        e.preventDefault();
        input.focus();
        input.select();
      }
    });

    // Deep-link: ?q= & sort= & section=
    if (input) {
      const params = new URLSearchParams(location.search);
      const q0 = params.get("q");
      const sort0 = params.get("sort");
      const sec0 = params.get("section");
      if (sort0 && ["relevance", "newest", "oldest", "title"].includes(sort0)) {
        hitSort = sort0;
        $$("#hit-sorts [data-sort]").forEach((b) =>
          b.classList.toggle("active", b.getAttribute("data-sort") === hitSort)
        );
      }
      if (sec0 && (sec0 === "all" || SECTION_MATCH[sec0])) {
        hitSection = sec0;
        $$("#hit-sections [data-section]").forEach((b) =>
          b.classList.toggle("active", b.getAttribute("data-section") === hitSection)
        );
      }
      if (q0) {
        input.value = q0;
        loadIndex().then(apply);
      } else {
        apply();
      }
    }
  }

  /* ---------- boot ---------- */
  initReadingChrome();
  initTocSpy();
  initArchive();
})();
