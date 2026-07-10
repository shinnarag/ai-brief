(function () {
  "use strict";

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

  function addSkipLink() {
    if ($(".skip-link")) return;
    const link = document.createElement("a");
    link.className = "skip-link";
    link.href = "#main-content";
    link.textContent = "본문으로 건너뛰기";
    document.body.prepend(link);
  }

  function showToast(message) {
    let toast = $(".copy-toast");
    if (!toast) {
      toast = document.createElement("div");
      toast.className = "copy-toast";
      toast.setAttribute("role", "status");
      toast.setAttribute("aria-live", "polite");
      document.body.append(toast);
    }
    toast.textContent = message;
    toast.classList.add("is-visible");
    window.clearTimeout(showToast.timer);
    showToast.timer = window.setTimeout(() => toast.classList.remove("is-visible"), 1800);
  }

  async function copyText(text) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (error) {
      const input = document.createElement("textarea");
      input.value = text;
      input.setAttribute("readonly", "");
      input.style.position = "fixed";
      input.style.opacity = "0";
      document.body.append(input);
      input.select();
      const copied = document.execCommand("copy");
      input.remove();
      return copied;
    }
  }

  function createFooter(isBrief) {
    if ($(".platform-footer")) return;
    const footer = document.createElement("footer");
    footer.className = "platform-footer";
    footer.innerHTML = `
      <div class="platform-footer__inner">
        <div>
          <strong>AI Brief · 사내 AI 제품 인텔리전스</strong>
          <p>핵심 업데이트와 실무 영향을 빠르게 판단할 수 있도록 정리합니다.</p>
        </div>
        <div class="footer-policy" aria-label="브리프 운영 기준">
          <div><span>Update</span><b>매주 월·목</b></div>
          <div><span>Focus</span><b>AI 변화와 업무 영향</b></div>
          <div><span>Source</span><b>원문 링크 기반</b></div>
        </div>
      </div>`;
    document.body.append(footer);

    if (isBrief) {
      const note = $(".platform-footer p");
      if (note) note.textContent = "브리프의 모든 항목은 원문 출처와 함께 확인할 수 있습니다.";
    }
  }

  function bindSearchShortcut(input) {
    if (!input) return;
    document.addEventListener("keydown", (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        input.focus();
        input.select();
      }
      if (event.key === "Escape" && document.activeElement === input) {
        input.value = "";
        input.dispatchEvent(new Event("input", { bubbles: true }));
        input.blur();
      }
    });
  }

  function initHome() {
    const main = $(".home-page .wrap");
    if (!main) return;
    main.id = "main-content";
    main.setAttribute("role", "main");

    const cards = $$(".archive-card", main);
    const search = $("#archive-search");
    const buttons = $$("[data-archive-filter]");
    const count = $("#archive-result-count");
    const empty = $("#archive-empty");
    const grid = $(".archive-grid", main);
    let activeFilter = "all";
    let archiveExpanded = false;

    const filterAliases = {
      major: ["major ai", "주요 모델"],
      video: ["video ai", "영상"],
      music: ["music ai", "음악"],
      design: ["design ai", "디자인", "이미지"],
      marketing: ["content", "marketing", "콘텐츠", "마케팅"]
    };

    cards.forEach((card, index) => {
      const title = $(".archive-title", card);
      const date = title?.textContent.match(/\d{4}-\d{2}-\d{2}/)?.[0];
      if (title && date) title.textContent = `${date.replaceAll("-", ".")} AI 브리프`;
      if (title) card.setAttribute("aria-label", `${title.textContent.trim()} 읽기`);
      const label = $(".tiny-label", card);
      if (label) label.textContent = index === 0 ? "최신" : "아카이브";
      const dateChip = $(".date-chip", card);
      if (dateChip) {
        dateChip.textContent = dateChip.textContent
          .replace(/^window\s*/i, "수집 ")
          .replaceAll("-", ".")
          .replace(" ~ ", "–");
      }
      card.dataset.search = card.textContent.replace(/\s+/g, " ").trim().toLowerCase();
      card.dataset.categories = $$(".archive-meta span", card)
        .map((tag) => tag.textContent.trim().toLowerCase())
        .join(" ");
      if (index > 5) card.dataset.initiallyArchived = "true";
    });

    const moreButton = document.createElement("button");
    moreButton.type = "button";
    moreButton.className = "archive-more";
    moreButton.setAttribute("aria-controls", "archive");
    moreButton.setAttribute("aria-expanded", "false");
    if (grid) grid.insertAdjacentElement("afterend", moreButton);

    function applyFilters() {
      const query = (search?.value || "").trim().toLowerCase();
      const hasCriteria = Boolean(query) || activeFilter !== "all";
      let visible = 0;

      cards.forEach((card) => {
        const matchesQuery = !query || card.dataset.search.includes(query);
        const aliases = filterAliases[activeFilter] || [];
        const matchesFilter =
          activeFilter === "all" || aliases.some((alias) => card.dataset.categories.includes(alias));
        const passesInitialLimit =
          archiveExpanded || hasCriteria || card.dataset.initiallyArchived !== "true";
        const show = matchesQuery && matchesFilter && passesInitialLimit;
        card.hidden = !show;
        if (show) visible += 1;
      });

      if (count) {
        count.textContent = hasCriteria
          ? `${cards.length}개 중 ${visible}개`
          : archiveExpanded
            ? `전체 ${cards.length}개 표시`
            : `최근 ${visible}개 표시 · 전체 ${cards.length}개`;
      }
      if (empty) empty.hidden = visible !== 0;
      moreButton.hidden = hasCriteria;
      moreButton.setAttribute("aria-expanded", String(archiveExpanded));
      moreButton.textContent = archiveExpanded
        ? "아카이브 간단히 보기 ↑"
        : `지난 브리프 ${cards.length - 6}개 더 보기 ↓`;
    }

    search?.addEventListener("input", applyFilters);
    buttons.forEach((button) => {
      button.addEventListener("click", () => {
        activeFilter = button.dataset.archiveFilter;
        buttons.forEach((item) => item.setAttribute("aria-pressed", String(item === button)));
        applyFilters();
      });
    });
    moreButton.addEventListener("click", () => {
      archiveExpanded = !archiveExpanded;
      applyFilters();
      if (!archiveExpanded) $("#archive", main)?.scrollIntoView({ behavior: "smooth" });
    });

    bindSearchShortcut(search);
    applyFilters();
    createFooter(false);
  }

  function formatBriefMeta() {
    const meta = $(".brief-page .meta-pill");
    if (!meta) return;
    const raw = meta.textContent.trim();
    const run = raw.match(/run date\s+([0-9-]+)/i)?.[1];
    const windowRange = raw.match(/window\s+(.+?)(?:\s+KST)?$/i)?.[1];
    if (run && windowRange) {
      meta.textContent = `발행 ${run.replaceAll("-", ".")} · 수집 ${windowRange.replaceAll("-", ".")} KST`;
    }
    meta.setAttribute("title", raw);
  }

  function enhanceSourceLinks(card) {
    const sourceTag = $$(".tag", card).find((tag) => tag.textContent.includes("출처"));
    const sourceName = sourceTag?.textContent.replace(/^출처\s*/, "").trim();
    const links = $$(".detail-item a[href]", card);
    links.forEach((link) => {
      let label = links.length === 1 ? sourceName : "";
      if (!label) {
        try {
          label = new URL(link.href).hostname.replace(/^www\./, "");
        } catch (error) {
          label = "원문";
        }
      }
      link.textContent = `원문 보기 · ${label} ↗`;
      link.setAttribute("aria-label", `${label} 원문을 새 탭에서 보기`);
      link.rel = "noreferrer noopener";
    });
  }

  function initReadingProgress() {
    const progress = document.createElement("div");
    progress.className = "reading-progress";
    progress.setAttribute("aria-hidden", "true");
    progress.innerHTML = "<span></span>";
    document.body.prepend(progress);
    const bar = $("span", progress);

    const update = () => {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      const value = scrollable > 0 ? Math.min(1, window.scrollY / scrollable) : 0;
      bar.style.width = `${value * 100}%`;
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
  }

  function initBackToTop() {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "back-to-top";
    button.setAttribute("aria-label", "페이지 맨 위로 이동");
    button.textContent = "↑";
    document.body.append(button);

    const update = () => button.classList.toggle("is-visible", window.scrollY > 720);
    window.addEventListener("scroll", update, { passive: true });
    update();
    button.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
  }

  async function addBriefPager(wrap) {
    try {
      const response = await fetch("../index.html");
      if (!response.ok) return;
      const html = await response.text();
      const page = new DOMParser().parseFromString(html, "text/html");
      const links = $$(".archive-card[href]", page).map((link) => ({
        href: link.getAttribute("href").replace(/^briefs\//, ""),
        date: link.textContent.match(/\d{4}-\d{2}-\d{2}/)?.[0]
      }));
      const currentFile = window.location.pathname.split("/").pop();
      const currentIndex = links.findIndex((item) => item.href === currentFile);
      if (currentIndex === -1) return;

      const newer = links[currentIndex - 1];
      const older = links[currentIndex + 1];
      if (!newer && !older) return;

      const pager = document.createElement("nav");
      pager.className = "brief-pager";
      pager.setAttribute("aria-label", "이전 및 다음 브리프");
      pager.innerHTML = `
        ${
          older
            ? `<a href="${older.href}" class="brief-pager__link"><span>← 이전 브리프</span><strong>${older.date?.replaceAll("-", ".") || "아카이브"}</strong></a>`
            : "<span></span>"
        }
        ${
          newer
            ? `<a href="${newer.href}" class="brief-pager__link is-next"><span>다음 브리프 →</span><strong>${newer.date?.replaceAll("-", ".") || "아카이브"}</strong></a>`
            : "<span></span>"
        }`;
      wrap.append(pager);
    } catch (error) {
      // Navigation is optional when the page is opened directly from the file system.
    }
  }

  function initBrief() {
    const wrap = $(".brief-page .wrap");
    const hero = $(".brief-page .hero");
    const nav = $(".brief-page .section-nav");
    if (!wrap || !hero) return;
    wrap.id = "main-content";
    wrap.setAttribute("role", "main");

    const homeButton = $(".home-btn", wrap);
    if (homeButton) homeButton.textContent = "AI Brief 홈";
    formatBriefMeta();

    const eyebrow = $(".eyebrow", hero);
    if (eyebrow) eyebrow.textContent = "Internal AI Intelligence";

    const sections = $$(".section", wrap);
    const quickRead = $(".quick-read", wrap);
    const contentCards = $$(".card:not(.empty-card)", wrap);
    const totalChars = contentCards.reduce((sum, card) => {
      const readableCopy = card.cloneNode(true);
      $$(".detail-item:last-child", readableCopy).forEach((item) => item.remove());
      return sum + readableCopy.textContent.trim().length;
    }, 0);
    const readMinutes = Math.max(3, Math.ceil(totalChars / 1200));
    const summaryMeta = document.createElement("div");
    summaryMeta.className = "brief-summary-meta";
    summaryMeta.innerHTML = `<span>${contentCards.length}개 브리프 항목</span><span>약 ${readMinutes}분 읽기</span><span>원문 출처 포함</span>`;
    hero.append(summaryMeta);

    const toolbar = document.createElement("div");
    toolbar.className = "brief-toolbar";
    toolbar.setAttribute("aria-label", "브리프 검색 및 도구");
    toolbar.innerHTML = `
      <label class="search-field">
        <span class="sr-only">브리프 내 검색</span>
        <input id="brief-search" type="search" placeholder="제품·모델·업무 변화 검색" autocomplete="off" />
        <span class="search-hint" aria-hidden="true">⌘ K</span>
      </label>
      <span class="result-count" id="brief-result-count" aria-live="polite"></span>
      <div class="brief-tool-actions">
        <button class="tool-button" type="button" data-copy-link>링크 복사</button>
        <button class="tool-button" type="button" data-print>인쇄</button>
      </div>`;
    hero.insertAdjacentElement("afterend", toolbar);

    if (nav) {
      toolbar.append(nav);
      const labelMap = {
        "major-ai": "주요 모델·플랫폼",
        "video-ai": "영상 생성",
        "music-ai": "음악 생성",
        "design-ai": "디자인·이미지",
        "ai-content-marketing-issues": "콘텐츠·마케팅"
      };
      $$("a[href^='#']", nav).forEach((link) => {
        const id = link.getAttribute("href").slice(1);
        if (labelMap[id]) link.textContent = labelMap[id];
      });
    }

    const labelMap = {
      "요약": "핵심 내용",
      "실무적 시사점": "실무 영향",
      "직접 링크": "원문"
    };
    const topicMap = {
      "major-ai": "major",
      "video-ai": "video",
      "music-ai": "music",
      "design-ai": "design",
      "ai-content-marketing-issues": "marketing"
    };

    sections.forEach((section) => {
      const id = section.id;
      const topic = topicMap[id] || "major";
      section.dataset.topic = topic;
      section.classList.add(`topic-${topic}`);

      const countPill = $(".count-pill", section);
      const realCards = $$(".card:not(.empty-card)", section);
      if (countPill) countPill.textContent = `${realCards.length}건`;

      $$(".card", section).forEach((card, index) => {
        const isEmpty = card.classList.contains("empty-card");
        const searchableCopy = card.cloneNode(true);
        $$(".detail-item", searchableCopy).forEach((item) => {
          if ($("a[href]", item)) item.remove();
        });
        const searchableText = searchableCopy.textContent
          .replace(/\s+/g, " ")
          .trim()
          .toLowerCase();
        card.dataset.search = searchableText;
        if (!isEmpty) card.id = `${id || "brief"}-item-${index + 1}`;

        $$(".detail-label", card).forEach((label) => {
          const current = label.textContent.trim();
          if (labelMap[current]) label.textContent = labelMap[current];
        });
        $$(".tag", card).forEach((tag) => {
          tag.textContent = tag.textContent
            .replace(/^발행일\s*/, "발행 ")
            .replace(/^시행일\s*/, "시행 ");
        });
        enhanceSourceLinks(card);
      });
    });

    const emptyResults = document.createElement("div");
    emptyResults.className = "brief-empty-results";
    emptyResults.innerHTML = "<strong>검색 결과가 없습니다.</strong><br />다른 제품명이나 키워드로 다시 검색해 주세요.";
    wrap.append(emptyResults);

    const search = $("#brief-search", toolbar);
    const resultCount = $("#brief-result-count", toolbar);

    function applyFilters() {
      const query = search.value.trim().toLowerCase();
      let visible = 0;

      sections.forEach((section) => {
        let sectionVisible = 0;
        const realCards = $$(".card:not(.empty-card)", section);
        const emptyCards = $$(".empty-card", section);

        realCards.forEach((card) => {
          const show = !query || card.dataset.search.includes(query);
          card.hidden = !show;
          if (show) {
            visible += 1;
            sectionVisible += 1;
          }
        });

        emptyCards.forEach((card) => {
          const show = !query && realCards.length === 0;
          card.hidden = !show;
          if (show) sectionVisible += 1;
        });

        section.hidden = sectionVisible === 0;
        const countPill = $(".count-pill", section);
        if (countPill && realCards.length > 0) {
          const shown = realCards.filter((card) => !card.hidden).length;
          countPill.textContent = query ? `${shown}/${realCards.length}건` : `${realCards.length}건`;
        }
      });

      if (resultCount) resultCount.textContent = `${visible}개 항목`;
      emptyResults.classList.toggle("is-visible", visible === 0 && Boolean(query));
      if (quickRead) quickRead.hidden = Boolean(query);
      $$("a[href^='#']", nav || document).forEach((link) => {
        const section = $(link.getAttribute("href"), wrap);
        link.hidden = Boolean(section?.hidden);
      });
      if (nav) nav.hidden = sections.every((section) => section.hidden);
    }

    search.addEventListener("input", applyFilters);
    bindSearchShortcut(search);
    applyFilters();

    $("[data-copy-link]", toolbar)?.addEventListener("click", async () => {
      const copied = await copyText(window.location.href);
      showToast(copied ? "브리프 링크를 복사했습니다." : "링크를 복사하지 못했습니다.");
    });
    $("[data-print]", toolbar)?.addEventListener("click", () => window.print());

    if ("IntersectionObserver" in window && nav) {
      const links = $$("a[href^='#']", nav);
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            links.forEach((link) => {
              link.classList.toggle("is-active", link.getAttribute("href") === `#${entry.target.id}`);
            });
          });
        },
        { rootMargin: "-22% 0px -68% 0px", threshold: 0 }
      );
      sections.forEach((section) => observer.observe(section));
    }

    initReadingProgress();
    initBackToTop();
    addBriefPager(wrap);
    createFooter(true);
  }

  document.documentElement.classList.add("js");
  document.addEventListener("DOMContentLoaded", () => {
    addSkipLink();
    if (document.body.classList.contains("home-page")) initHome();
    if (document.body.classList.contains("brief-page")) initBrief();
  });
})();
