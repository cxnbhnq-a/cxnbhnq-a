import { createHash } from "node:crypto";
import { mkdir, readFile, readdir, unlink, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { bounded, xmlText } from "./xml.mjs";

const rendererRevision = "nabhan-terminal-art-2026-09-26-r5";
const portraitRows = 80;
const portraitFont = 4.8;
const portraitStep = 4.5;

const colorSets = {
  signal: { dark: ["#111214", "#15191A", "#DCE8E4", "#788781", "#00D6AA", "#2864F0", "#00B879"], light: ["#F1F3F5", "#FFFFFF", "#17221F", "#66736E", "#008F75", "#2858D8", "#087C57"] },
  ocean: { dark: ["#0C1418", "#111D21", "#DCEBED", "#73888D", "#40D7C0", "#4B9BFF", "#38BC87"], light: ["#F0F8F8", "#FFFFFF", "#17333A", "#657D81", "#087D73", "#2778C6", "#087C57"] },
  solar: { dark: ["#151310", "#1D1A16", "#F0E9DB", "#948A78", "#48D2AE", "#75A5FF", "#C2D65C"], light: ["#FBF8F0", "#FFFFFF", "#30291F", "#817663", "#087D67", "#365FBE", "#617C20"] }
};

async function portraitFromImage(path) {
  const { default: sharp } = await import("sharp");
  const image = await readFile(path);
  const meta = await sharp(image).metadata();
  const bounds = { background: { r: 0, g: 0, b: 0, alpha: 0 }, threshold: 8 };
  // Keep the full frame for photos such as JPEGs; transparent illustrations can
  // still be trimmed to their visible artwork.
  let cropped;
  if (meta.hasAlpha) {
    cropped = sharp(image).ensureAlpha().trim(bounds);
  } else {
    const side = Math.min(meta.width, meta.height);
    const left = Math.floor((meta.width - side) / 2);
    const top = Math.floor((meta.height - side) * 0.12);
    cropped = sharp(image).extract({ left, top, width: side, height: side }).ensureAlpha();
  }
  const dimensions = await cropped.metadata();
  const displayCellRatio = (portraitFont * 0.6 - 0.12) / portraitStep;
  const contentWidth = Math.max(1, Math.min(96, Math.round(portraitRows * (dimensions.width / dimensions.height) / displayCellRatio)));
  const [gray, alpha] = await Promise.all([
    cropped.clone().flatten({ background: "white" }).greyscale().normalise().linear(1.25, -24).sharpen().resize(contentWidth, portraitRows, { fit: "fill" }).raw().toBuffer(),
    cropped.clone().extractChannel("alpha").resize(contentWidth, portraitRows, { fit: "fill" }).raw().toBuffer()
  ]);
  const glyphs = " .:-=+*#%@";
  return Array.from({ length: portraitRows }, (_, y) => Array.from({ length: 96 }, (_, x) => {
    const sourceX = x - Math.floor((96 - contentWidth) / 2);
    if (sourceX < 0 || sourceX >= contentWidth) return " ";
    const i = y * contentWidth + sourceX;
    const opacity = alpha[i] / 255;
    if (opacity < 0.08) return " ";
    const light = gray[i] * opacity + 255 * (1 - opacity);
    // Bright parts of the source need denser glyphs so the portrait reads on
    // the dark terminal panel; reverse the usual dark-on-light mapping.
    const tone = bounded(Math.round(light / 255 * (glyphs.length - 1)), 0, glyphs.length - 1);
    return glyphs[tone];
  }).join(""));
}

async function portraitFromAssets(directory) {
  const manifest = JSON.parse(await readFile(resolve(directory, "manifest.json"), "utf8"));
  const svg = await readFile(resolve(directory, manifest.assets.desktopDark), "utf8");
  const encoded = svg.match(/<text class="(?:portrait-source|ascii-source)"[^>]*>([\s\S]*?)<\/text>/)?.[1];
  if (!encoded) throw new Error("Portrait source is unavailable. Pass --source with a transparent PNG.");
  return [...encoded.matchAll(/<tspan>([\s\S]*?)<\/tspan>/g)].map((match) => match[1]);
}

function profileRows(config) {
  return [
    ["prompt", `${config.profile.username}@profile ~ $ neofetch`],
    ["SYSTEM.INFO /", ""], ["Name", config.profile.name], ["Role", config.profile.headline],
    ["Study", config.profile.affiliation], ["Base", config.profile.location], ["Status", config.profile.status],
    ["ABOUT.ME /", ""], ...config.profile.quickFacts.slice(0, 5).map((v, i) => [`Note ${i + 1}`, v]),
    ["RESEARCH.NODE /", ""], ["Primary", config.research.primary], ["Direction", config.research.direction], ["Themes", config.research.themes],
    ["BUILD.LOG /", ""], ...config.projects.slice(0, 2).map((item) => [item.name, item.focus]),
    ["GRID.LINKS /", ""], ...config.links.slice(0, 3).map((item) => [item.label, item.value])
  ];
}

function makeSvg(config, portrait, variant) {
  const mobile = variant.includes("mobile");
  const light = variant.includes("light");
  const [bg, panel, ink, muted, cyan, blue, green] = colorSets[config.appearance.palette][light ? "light" : "dark"];
  const width = mobile ? 720 : 1180;
  const height = mobile ? 1230 : 650;
  const frame = mobile ? { x: 34, y: 84, w: 652, h: 426 } : { x: 36, y: 94, w: 458, h: 466 };
  const info = mobile ? { x: 34, y: 532, w: 652, h: 570, left: 56, top: 620, step: 20, font: 14 } : { x: 514, y: 94, w: 630, h: 466, left: 536, top: 141, step: 17.5, font: 12 };
  const portraitY = frame.y + 38 + (frame.h - 50 - (portraitRows - 1) * portraitStep) / 2;
  const picture = portrait.slice(0, portraitRows).map((row, i) => `<tspan x="${frame.x + frame.w / 2}" y="${(portraitY + i * portraitStep).toFixed(1)}">${xmlText(row)}</tspan>`).join("");
  const details = profileRows(config).map(([key, value], i) => {
    const y = info.top + i * info.step;
    if (key === "prompt") return `<text x="${info.left}" y="${y}" fill="${blue}" font-size="${info.font + 1}" font-weight="bold">${xmlText(value)}</text>`;
    if (!value) return `<text x="${info.left}" y="${y}" fill="${cyan}" font-size="${info.font - .2}" font-weight="bold">${xmlText(key)} <tspan fill="${muted}">${"─".repeat(mobile ? 24 : 32)}</tspan></text>`;
    return `<text x="${info.left}" y="${y}" fill="${muted}" font-size="${info.font}"><tspan fill="${cyan}">${xmlText(key)}</tspan><tspan fill="${muted}">${"·".repeat(Math.max(2, 14 - key.length))}</tspan><tspan x="${info.left + (mobile ? 120 : 126)}" fill="${ink}">${xmlText(value)}</tspan></text>`;
  }).join("\n");
  const rain = Array.from({ length: mobile ? 24 : 38 }, (_, i) => {
    const x = (i * (mobile ? 82 : 108) - 94) % (width + 140);
    const y = -70 + (i % (mobile ? 11 : 9)) * (mobile ? 110 : 92);
    const stream = Array.from({ length: 8 }, (_, row) => `<tspan x="${x}" dy="${row ? 18 : 0}">${(i + row) % 3 ? "01  11  001  0" : "10  00  101  1"}</tspan>`).join("");
    return `<text x="${x}" y="${y}" font-size="15" transform="rotate(18 ${x} ${y})">${stream}</text>`;
  }).join("");
  const secondRain = Array.from({ length: mobile ? 19 : 30 }, (_, i) => {
    const x = (i * (mobile ? 98 : 124) - 24) % (width + 120);
    const y = -15 + (i % 7) * (mobile ? 134 : 106);
    const stream = Array.from({ length: 6 }, (_, row) => `<tspan x="${x}" dy="${row ? 18 : 0}">11  00  101  01</tspan>`).join("");
    return `<text x="${x}" y="${y}" font-size="14" transform="rotate(18 ${x} ${y})">${stream}</text>`;
  }).join("");
  const bars = Array.from({ length: 31 }, (_, i) => {
    const value = [3, 5, 8, 14, 8, 4, 11, 18, 9, 5, 14, 22, 11, 6, 16, 25, 10, 5, 12, 19, 9, 4, 14, 20, 8, 4, 11, 17, 7, 4, 9][i];
    return `<rect x="${52 + i * 5}" y="${height - 55 - value / 2}" width="2.4" height="${value}" rx="1.2" fill="${cyan}"/>`;
  }).join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-label="${xmlText(config.profile.name)} terminal profile">
<title>${xmlText(config.profile.name)} — ${xmlText(config.profile.headline)}</title>
<defs><clipPath id="portrait-window"><rect x="${frame.x}" y="${frame.y}" width="${frame.w}" height="${frame.h}" rx="12"/></clipPath><linearGradient id="edge"><stop stop-color="${blue}"/><stop offset="1" stop-color="${green}"/></linearGradient><linearGradient id="beam"><stop stop-color="${cyan}" stop-opacity="0"/><stop offset=".5" stop-color="${cyan}" stop-opacity=".35"/><stop offset="1" stop-color="${cyan}" stop-opacity="0"/></linearGradient></defs>
<style>text{font-family:'Courier New',monospace}.portrait{font-size:${portraitFont}px;letter-spacing:-.12px}@media(prefers-reduced-motion:reduce){animate,animateTransform{display:none}}</style>
<rect width="100%" height="100%" fill="${bg}"/><g fill="${green}" opacity=".21">${rain}<animateTransform attributeName="transform" type="translate" values="0 90;90 -80;180 -250" dur="22s" repeatCount="indefinite"/></g><g fill="${green}" opacity=".12">${secondRain}<animateTransform attributeName="transform" type="translate" values="0 0;80 -145;160 -290" dur="31s" repeatCount="indefinite"/></g>
<rect x="24" y="28" width="${width - 48}" height="${height - 56}" fill="none" stroke="url(#edge)" stroke-width="1.5"/>
<circle cx="54" cy="54" r="6" fill="#ff3334"/><circle cx="72" cy="54" r="6" fill="#ffb01f"/><circle cx="90" cy="54" r="6" fill="#00c853"/>
<text x="142" y="58" fill="${muted}" font-size="13">${xmlText(config.profile.username)}@profile ~ % ./profile-live</text><text x="${width - 48}" y="59" fill="${cyan}" font-size="11" text-anchor="end"><animate attributeName="opacity" values="1;.2;1" dur="1.2s" repeatCount="indefinite"/>● SCANNING</text>
<rect x="${frame.x}" y="${frame.y}" width="${frame.w}" height="${frame.h}" rx="12" fill="${panel}" fill-opacity=".45" stroke="${blue}"/>
<rect x="${info.x}" y="${info.y}" width="${info.w}" height="${info.h}" rx="12" fill="${panel}" fill-opacity=".55" stroke="${green}" stroke-opacity=".7"/>
<text x="${frame.x + 20}" y="${frame.y + 28}" fill="${muted}" font-size="11" letter-spacing="1.2">VISUAL.ID / PORTRAIT.SIGNAL</text>
<g clip-path="url(#portrait-window)"><text class="portrait" text-anchor="middle" fill="${cyan}" opacity=".95">${picture}</text></g>
<text x="${info.x + 22}" y="${info.y + 28}" fill="${muted}" font-size="11" letter-spacing="1.2">SYSTEM.INFO / RESEARCH.BUILDS</text>
<g font-size="${info.font}">${details}</g>
<rect x="24" y="28" width="${width - 48}" height="12" fill="url(#beam)" opacity=".8"><animate attributeName="y" values="28;${height - 42};28" dur="14s" repeatCount="indefinite"/></rect>
${bars}<text x="220" y="${height - 50}" fill="${cyan}" font-size="10">AUDIO SIGNAL</text>
<text x="${width - 48}" y="${height - 50}" text-anchor="end" fill="${muted}" font-size="11">TEGAL, INDONESIA · ${xmlText(config.profile.status.toUpperCase())}</text>
<text class="portrait-source" display="none">${portrait.slice(0, portraitRows).map((row) => `<tspan>${xmlText(row)}</tspan>`).join("")}</text></svg>`;
}

export async function createHeroAssets(config, sourcePath, directory) {
  const portrait = sourcePath ? await portraitFromImage(resolve(sourcePath)) : await portraitFromAssets(directory);
  const id = createHash("sha256").update(rendererRevision).update(JSON.stringify(config)).update(portrait.join("\n")).digest("hex").slice(0, 8);
  const assets = { desktopDark: `terminal-profile-${id}-dark.svg`, desktopLight: `terminal-profile-${id}-light.svg`, mobileDark: `terminal-profile-${id}-mobile-dark.svg`, mobileLight: `terminal-profile-${id}-mobile-light.svg` };
  await mkdir(directory, { recursive: true });
  await Promise.all(Object.entries(assets).map(([key, filename]) => writeFile(resolve(directory, filename), makeSvg(config, portrait, key))));
  const oldFiles = await readdir(directory);
  await Promise.all(oldFiles.filter((name) => /^terminal-profile-[a-f0-9]{8}-(?:mobile-)?(?:dark|light)\.svg$/.test(name) && !Object.values(assets).includes(name)).map((name) => unlink(resolve(directory, name))));
  const manifest = { generator: rendererRevision, version: id, assets };
  await writeFile(resolve(directory, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);
  return manifest;
}
