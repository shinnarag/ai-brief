import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(scriptDirectory, "..");
const briefsDirectory = path.join(root, "briefs");

const sections = [
  ["major-ai", "주요 모델·플랫폼", 7],
  ["video-ai", "영상 생성", 5],
  ["music-ai", "음악 생성", 5],
  ["design-ai", "디자인·이미지", 5],
  ["ai-content-marketing-issues", "콘텐츠·마케팅", 5]
];

const forbiddenTeamTokens = [
  "data-team-filter",
  "data-team=",
  "audience-badge",
  "team-card",
  "team-section",
  "activeTeam",
  "primaryTeam"
];

const errors = [];
let checkedCards = 0;
let checkedExternalLinks = 0;

function reportError(file, message) {
  errors.push("[ERROR] " + file + ": " + message);
}

function assert(file, condition, message) {
  if (!condition) reportError(file, message);
}

function read(relativePath) {
  const absolutePath = path.join(root, relativePath);
  if (!fs.existsSync(absolutePath)) {
    reportError(relativePath, "required file is missing");
    return "";
  }
  return fs.readFileSync(absolutePath, "utf8");
}

function count(text, pattern) {
  return Array.from(text.matchAll(pattern)).length;
}

function stripTags(text) {
  return text.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function escapeRegex(text) {
  return text.replace(/[.*+?^$(){}|[\]\\]/g, "\\$&");
}

function getSection(html, id) {
  const marker = '<section class="section" id="' + id + '">';
  const start = html.indexOf(marker);
  if (start === -1) return "";
  const end = html.indexOf("</section>", start);
  return end === -1 ? "" : html.slice(start, end + "</section>".length);
}

function articleBlocks(sectionHtml) {
  return Array.from(
    sectionHtml.matchAll(/<article\b([^>]*)>([\s\S]*?)<\/article>/g),
    (match) => ({ attributes: match[1], body: match[2] })
  );
}

function hasClass(attributes, className) {
  const match = attributes.match(/\bclass="([^"]*)"/);
  return Boolean(match && match[1].split(/\s+/).includes(className));
}

function getId(attributes) {
  const match = attributes.match(/\bid="([^"]+)"/);
  return match ? match[1] : "";
}

function realArticles(sectionHtml) {
  return articleBlocks(sectionHtml).filter(
    (article) => hasClass(article.attributes, "card") && !hasClass(article.attributes, "empty-card")
  );
}

function sectionCounts(html) {
  return new Map(sections.map(([id]) => [id, realArticles(getSection(html, id)).length]));
}

function dateAtNoonUtc(value) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day, 12));
}

function formatDate(date) {
  return [
    date.getUTCFullYear(),
    String(date.getUTCMonth() + 1).padStart(2, "0"),
    String(date.getUTCDate()).padStart(2, "0")
  ].join("-");
}

function shiftDate(value, amount) {
  const date = dateAtNoonUtc(value);
  date.setUTCDate(date.getUTCDate() + amount);
  return formatDate(date);
}

function expectedWindow(runDate) {
  const day = dateAtNoonUtc(runDate).getUTCDay();
  // Legacy Mon/Thu editorial windows
  if (day === 1) return { start: shiftDate(runDate, -3), end: runDate, days: 4 };
  if (day === 4) return { start: shiftDate(runDate, -2), end: runDate, days: 3 };
  // Daily automation: previous calendar day → run date (KST date string)
  return { start: shiftDate(runDate, -1), end: runDate, days: 2 };
}

function validateTagBalance(relativePath, html) {
  const voidTags = new Set([
    "area", "base", "br", "col", "embed", "hr", "img", "input",
    "link", "meta", "param", "source", "track", "wbr"
  ]);
  const stack = [];
  const tokens = html.matchAll(/<!--[\s\S]*?-->|<!DOCTYPE[^>]*>|<\/?([a-zA-Z][\w:-]*)\b[^>]*>/g);

  for (const token of tokens) {
    const full = token[0];
    if (full.startsWith("<!--") || /^<!DOCTYPE/i.test(full)) continue;
    const name = token[1].toLowerCase();
    if (voidTags.has(name) || full.endsWith("/>")) continue;
    if (full.startsWith("</")) {
      const expected = stack.pop();
      if (expected !== name) {
        reportError(relativePath, "tag balance mismatch: expected </" + (expected || "none") + "> but found </" + name + ">");
        return;
      }
    } else {
      stack.push(name);
    }
  }

  assert(relativePath, stack.length === 0, "unclosed tags: " + stack.join(", "));
}

function validateNoInlineAssets(relativePath, html, cssHref, jsSrc) {
  assert(
    relativePath,
    count(html, new RegExp('<link\\b[^>]*href="' + escapeRegex(cssHref) + '"[^>]*>', "g")) === 1,
    "shared stylesheet must be linked exactly once"
  );
  assert(
    relativePath,
    count(html, new RegExp('<script\\b[^>]*src="' + escapeRegex(jsSrc) + '"[^>]*\\bdefer\\b[^>]*><\\/script>', "g")) === 1,
    "deferred shared script must be linked exactly once"
  );
  assert(relativePath, !/<style\b/i.test(html), "inline <style> is not allowed");

  const scripts = Array.from(html.matchAll(/<script\b([^>]*)>/gi), (match) => match[1]);
  assert(relativePath, scripts.every((attributes) => /\bsrc="[^"]+"/.test(attributes)), "inline page script is not allowed");
}

function validateUniqueIds(relativePath, html) {
  const ids = Array.from(html.matchAll(/\bid="([^"]+)"/g), (match) => match[1]);
  const seen = new Set();
  for (const id of ids) {
    if (seen.has(id)) reportError(relativePath, 'duplicate id "' + id + '"');
    seen.add(id);
  }
}

function validateStrictBrief(runDate) {
  const relativePath = "briefs/" + runDate + ".html";
  const html = read(relativePath);
  if (!html) return { html: "", counts: new Map(), window: null };

  const window = expectedWindow(runDate);
  assert(relativePath, Boolean(window), "run date must be a Monday or Thursday in KST");
  validateTagBalance(relativePath, html);
  validateUniqueIds(relativePath, html);
  validateNoInlineAssets(relativePath, html, "../assets/platform.css", "../assets/platform.js");

  assert(relativePath, /<body class="brief-page">/.test(html), 'missing <body class="brief-page">');
  assert(relativePath, /<main class="wrap" id="main-content">/.test(html), 'missing <main class="wrap" id="main-content">');
  assert(relativePath, html.includes("<title>AI Brief | " + runDate + "</title>"), "title does not match run date");
  assert(relativePath, html.includes('href="../index.html"'), "home link is missing");

  if (window) {
    const expectedMeta = "run date " + runDate + " / window " + window.start + " ~ " + window.end + " KST";
    assert(relativePath, html.includes(expectedMeta), "run/window metadata does not match KST schedule");
    assert(
      relativePath,
      html.includes('content="' + window.start + "부터 " + window.end + "까지의 AI Brief"),
      "meta description does not contain the expected window"
    );
  }

  const sectionPositions = sections.map(([id]) => html.indexOf('<section class="section" id="' + id + '">'));
  assert(relativePath, sectionPositions.every((position) => position >= 0), "all five canonical sections must exist");
  assert(
    relativePath,
    sectionPositions.every((position, index) => index === 0 || position > sectionPositions[index - 1]),
    "canonical sections are not in the required order"
  );

  const navMatch = html.match(/<nav class="section-nav"[\s\S]*?<\/nav>/);
  const navTargets = navMatch
    ? Array.from(navMatch[0].matchAll(/href="#([^"]+)"/g), (match) => match[1])
    : [];
  assert(relativePath, JSON.stringify(navTargets) === JSON.stringify(sections.map(([id]) => id)), "section navigation does not match canonical section order");

  const counts = new Map();

  for (const [sectionId, , maximum] of sections) {
    const sectionHtml = getSection(html, sectionId);
    if (!sectionHtml) {
      counts.set(sectionId, 0);
      continue;
    }

    const articles = articleBlocks(sectionHtml).filter((article) => hasClass(article.attributes, "card"));
    const real = articles.filter((article) => !hasClass(article.attributes, "empty-card"));
    const empty = articles.filter((article) => hasClass(article.attributes, "empty-card"));
    counts.set(sectionId, real.length);
    checkedCards += real.length;

    const pill = sectionHtml.match(/<div class="count-pill">(\d+)\s+items?<\/div>/);
    assert(relativePath, Boolean(pill), sectionId + " is missing a numeric count-pill");
    if (pill) assert(relativePath, Number(pill[1]) === real.length, sectionId + " count-pill does not match real cards");
    assert(relativePath, real.length <= maximum, sectionId + " exceeds the card limit of " + maximum);

    if (real.length === 0) {
      assert(relativePath, empty.length === 1, sectionId + " must contain exactly one empty-card");
      assert(relativePath, empty.length === 1 && stripTags(empty[0].body).includes("발견된 이슈없음"), sectionId + " empty-card is missing the required message");
    } else {
      assert(relativePath, empty.length === 0, sectionId + " cannot mix real cards and empty-card");
    }

    real.forEach((article, index) => {
      const expectedId = sectionId + "-item-" + (index + 1);
      const articleId = getId(article.attributes);
      assert(relativePath, articleId === expectedId, sectionId + " card IDs must be unique and sequential; expected " + expectedId);
      assert(relativePath, count(article.body, /<h3 class="card-title">[\s\S]*?<\/h3>/g) === 1, expectedId + " must contain one card-title");
      assert(relativePath, count(article.body, /<span class="tag">[\s\S]*?<\/span>/g) === 2, expectedId + " must contain exactly two metadata tags");

      const labels = Array.from(
        article.body.matchAll(/<span class="detail-label">([\s\S]*?)<\/span>/g),
        (match) => stripTags(match[1])
      );
      assert(
        relativePath,
        JSON.stringify(labels) === JSON.stringify(["요약", "실무적 시사점", "직접 링크"]),
        expectedId + " detail labels must be 요약 / 실무적 시사점 / 직접 링크"
      );

      const issueDate = article.body.match(/<span class="tag">발행일\s+(\d{4}-\d{2}-\d{2})<\/span>/);
      assert(relativePath, Boolean(issueDate), expectedId + " is missing a YYYY-MM-DD publication date");
      if (issueDate && window) {
        assert(
          relativePath,
          issueDate[1] >= window.start && issueDate[1] <= window.end,
          expectedId + " publication date falls outside the KST window"
        );
      }

      const directLinks = Array.from(
        article.body.matchAll(/<a\b([^>]*)href="(https:\/\/[^"]+)"([^>]*)>/g),
        (match) => ({ attributes: match[1] + " " + match[3], url: match[2] })
      );
      checkedExternalLinks += directLinks.length;
      assert(relativePath, directLinks.length === 1, expectedId + " must contain exactly one HTTPS direct link");
      for (const link of directLinks) {
        assert(relativePath, /\btarget="_blank"/.test(link.attributes), expectedId + " external link must use target=_blank");
        assert(relativePath, /\brel="[^"]*\bnoreferrer\b[^"]*"/.test(link.attributes), expectedId + " external link must use rel=noreferrer");
      }
    });
  }

  for (const token of forbiddenTeamTokens) {
    assert(relativePath, !html.includes(token), 'team-specific platform token reintroduced: "' + token + '"');
  }

  return { html, counts, window };
}

function parseArchiveCards(indexHtml) {
  return Array.from(
    indexHtml.matchAll(/<a class="archive-card" href="briefs\/([^"]+\.html)">([\s\S]*?)<\/a>/g),
    (match) => ({ filename: match[1], body: match[2] })
  );
}

function expectedArchiveMeta(briefHtml) {
  const counts = sectionCounts(briefHtml);
  return sections
    .map(([id, label]) => [label, counts.get(id) || 0])
    .filter(([, value]) => value > 0);
}

function actualArchiveMeta(cardBody) {
  const block = cardBody.match(/<div class="archive-meta">([\s\S]*?)<\/div>/);
  if (!block) return [];
  return Array.from(block[1].matchAll(/<span>(.+?)\s+(\d+)<\/span>/g), (match) => [match[1].trim(), Number(match[2])]);
}

function validateIndex(runDate, latestBrief) {
  const relativePath = "index.html";
  const html = read(relativePath);
  if (!html) return;

  validateTagBalance(relativePath, html);
  validateUniqueIds(relativePath, html);
  validateNoInlineAssets(relativePath, html, "assets/platform.css", "assets/platform.js");

  assert(relativePath, /<body class="home-page">/.test(html), 'missing <body class="home-page">');
  assert(relativePath, /<main class="wrap" id="main-content">/.test(html), 'missing <main class="wrap" id="main-content">');
  assert(relativePath, html.includes('id="latest"'), "latest section is missing");
  assert(relativePath, html.includes('id="signals"'), "signals section is missing");
  assert(relativePath, html.includes('id="archive"'), "archive section is missing");

  const filterKeys = Array.from(html.matchAll(/data-archive-filter="([^"]+)"/g), (match) => match[1]);
  assert(
    relativePath,
    JSON.stringify(filterKeys) === JSON.stringify(["all", "major", "video", "music", "design", "marketing"]),
    "archive topic filter keys changed"
  );

  const cards = parseArchiveCards(html);
  const actualFiles = cards.map((card) => card.filename);
  const briefFiles = fs
    .readdirSync(briefsDirectory)
    .filter((filename) => /^\d{4}-\d{2}-\d{2}\.html$/.test(filename))
    .sort((left, right) => right.localeCompare(left));

  assert(relativePath, new Set(actualFiles).size === actualFiles.length, "archive contains a duplicate brief card");
  assert(relativePath, JSON.stringify(actualFiles) === JSON.stringify(briefFiles), "archive cards must match brief files in newest-to-oldest order");
  assert(relativePath, actualFiles[0] === runDate + ".html", "latest archive card does not match run date");
  assert(relativePath, cards.length > 0 && cards[0].body.includes(">Latest<"), "first archive card must be labeled Latest");
  cards.slice(1).forEach((card) => {
    assert(relativePath, card.body.includes(">Archive<"), card.filename + " must be labeled Archive");
  });

  const archiveTotal = html.match(/<div class="meta-pill">(\d+)개 브리프<\/div>/);
  const resultTotal = html.match(/id="archive-result-count"[^>]*>전체\s+(\d+)개<\/span>/);
  assert(relativePath, Boolean(archiveTotal) && Number(archiveTotal[1]) === cards.length, "archive total does not match archive cards");
  assert(relativePath, Boolean(resultTotal) && Number(resultTotal[1]) === cards.length, "archive fallback result count does not match archive cards");

  for (const card of cards) {
    const briefHtml = read("briefs/" + card.filename);
    const expected = expectedArchiveMeta(briefHtml);
    const actual = actualArchiveMeta(card.body);
    assert(relativePath, JSON.stringify(actual) === JSON.stringify(expected), card.filename + " archive metadata does not match real section counts");
    assert(relativePath, card.body.includes("AI Brief | " + card.filename.replace(".html", "")), card.filename + " archive title is missing its date");
  }

  const latestPath = "briefs/" + runDate + ".html";
  assert(relativePath, html.includes('class="header-cta" href="' + latestPath + '"'), "header CTA does not point to the latest brief");
  assert(relativePath, html.includes("Latest AI Brief · " + runDate.replaceAll("-", ".")), "hero latest date does not match run date");

  if (cards.length > 1) {
    assert(relativePath, html.includes('class="ghost" href="briefs/' + cards[1].filename + '"'), "previous brief link does not point to the second archive card");
  }

  const latestMeta = html.match(/<div class="latest-meta"[\s\S]*?<\/div>/);
  const latestCount = Array.from(latestBrief.counts.values()).reduce((sum, value) => sum + value, 0);
  const activeTopics = Array.from(latestBrief.counts.values()).filter((value) => value > 0).length;
  if (latestMeta) {
    assert(relativePath, new RegExp("<strong>" + latestCount + "<\\/strong>개 항목").test(latestMeta[0]), "latest item count is inaccurate");
    assert(relativePath, new RegExp("<strong>" + activeTopics + "<\\/strong>개 분야 업데이트").test(latestMeta[0]), "active topic count is inaccurate");
    if (latestBrief.window) {
      assert(
        relativePath,
        new RegExp("<strong>" + latestBrief.window.days + "(?:일<\\/strong> 수집|<\\/strong>일 수집)").test(latestMeta[0]),
        "collection day count is inaccurate"
      );
    }
  } else {
    reportError(relativePath, "latest-meta block is missing");
  }

  if (latestBrief.window) {
    const shortStart = latestBrief.window.start.slice(5).replace("-", ".");
    const shortEnd = latestBrief.window.end.slice(5).replace("-", ".");
    assert(relativePath, html.includes("수집 범위 " + shortStart + "–" + shortEnd + " KST"), "latest snapshot window is inaccurate");
  }

  const deepLinks = Array.from(
    html.matchAll(/href="(briefs\/[^"#]+\.html)#([^"]+)"/g),
    (match) => ({ file: match[1], fragment: match[2] })
  );
  for (const link of deepLinks) {
    const target = read(link.file);
    assert(relativePath, target.includes('id="' + link.fragment + '"'), link.file + "#" + link.fragment + " does not resolve to a source HTML ID");
  }

  const localLinks = Array.from(html.matchAll(/\bhref="([^"]+)"/g), (match) => match[1]).filter(
    (href) => !href.startsWith("#") && !/^https?:\/\//.test(href) && !href.startsWith("mailto:")
  );
  for (const href of localLinks) {
    const filePart = href.split("#")[0];
    assert(relativePath, fs.existsSync(path.join(root, filePart)), 'local link target does not exist: "' + href + '"');
  }

  const infrastructure = [
    ["assets/platform.css", read("assets/platform.css")],
    ["assets/platform.js", read("assets/platform.js")],
    [relativePath, html]
  ];
  for (const [file, content] of infrastructure) {
    for (const token of forbiddenTeamTokens) {
      assert(file, !content.includes(token), 'team-specific platform token reintroduced: "' + token + '"');
    }
  }
  assert("assets/platform.css", read("assets/platform.css").includes("color-scheme: light"), "light color scheme contract is missing");
}

function parseRunDate() {
  const args = process.argv.slice(2);
  const index = args.indexOf("--run-date");
  if (index >= 0) {
    const value = args[index + 1];
    if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      reportError("validate-site", "--run-date requires YYYY-MM-DD");
      return "";
    }
    return value;
  }

  const latest = fs
    .readdirSync(briefsDirectory)
    .filter((filename) => /^\d{4}-\d{2}-\d{2}\.html$/.test(filename))
    .sort((left, right) => right.localeCompare(left))[0];
  return latest ? latest.replace(".html", "") : "";
}

[
  "index.html",
  "assets/platform.css",
  "assets/platform.js",
  "scripts/sync-archive-metadata.mjs",
  "SEARCH-PROMPT.md",
  "WATCHLIST.md"
].forEach((file) => read(file));

const runDate = parseRunDate();
if (runDate) {
  const latestBrief = validateStrictBrief(runDate);
  validateIndex(runDate, latestBrief);
}

if (errors.length > 0) {
  errors.forEach((message) => console.error(message));
  console.error(
    "[FAIL] " + errors.length + " validation error(s); checked " +
      checkedCards + " current cards and " + checkedExternalLinks + " external links."
  );
  process.exitCode = 1;
} else {
  console.log(
    "[OK] AI Brief site validated for " + runDate + ": " +
      checkedCards + " current cards, " + checkedExternalLinks +
      " external links, archive metadata and deep links verified."
  );
}
