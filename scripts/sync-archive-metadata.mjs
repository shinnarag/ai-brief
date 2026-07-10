import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(scriptDirectory, "..");
const indexPath = path.join(root, "index.html");

const sections = [
  ["major-ai", "주요 모델·플랫폼"],
  ["video-ai", "영상 생성"],
  ["music-ai", "음악 생성"],
  ["design-ai", "디자인·이미지"],
  ["ai-content-marketing-issues", "콘텐츠·마케팅"]
];

function getSection(html, id) {
  const marker = `<section class="section" id="${id}">`;
  const start = html.indexOf(marker);
  if (start === -1) return "";
  const end = html.indexOf("</section>", start);
  return end === -1 ? "" : html.slice(start, end);
}

function countIssues(sectionHtml) {
  return Array.from(sectionHtml.matchAll(/<article\b[^>]*class="([^"]*)"[^>]*>/g)).filter(
    (match) => !match[1].split(/\s+/).includes("empty-card")
  ).length;
}

let index = fs.readFileSync(indexPath, "utf8");
let updated = 0;

index = index.replace(
  /<a class="archive-card" href="briefs\/([^"]+\.html)">([\s\S]*?)<\/a>/g,
  (fullCard, filename, body) => {
    const briefPath = path.join(root, "briefs", filename);
    if (!fs.existsSync(briefPath)) return fullCard;

    const brief = fs.readFileSync(briefPath, "utf8");
    const tags = sections
      .map(([id, label]) => [label, countIssues(getSection(brief, id))])
      .filter(([, count]) => count > 0)
      .map(([label, count]) => `              <span>${label} ${count}</span>`)
      .join("\n");

    const nextBody = body.replace(
      /<div class="archive-meta">[\s\S]*?<\/div>/,
      `<div class="archive-meta">\n${tags}\n            </div>`
    );
    if (nextBody !== body) updated += 1;
    return `<a class="archive-card" href="briefs/${filename}">${nextBody}</a>`;
  }
);

fs.writeFileSync(indexPath, index);
console.log(`Updated ${updated} archive cards.`);
