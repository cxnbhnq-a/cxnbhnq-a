import { readFile, writeFile } from "node:fs/promises";

const HERO_START = "<!-- PROFILE-HERO:START -->";
const HERO_END = "<!-- PROFILE-HERO:END -->";

function heroBlock(config, assets) {
  return `${HERO_START}\n<p align="center">\n  <picture>\n    <source media="(max-width: 760px) and (prefers-color-scheme: dark)" srcset="./assets/hero/${assets.mobileDark}">\n    <source media="(max-width: 760px)" srcset="./assets/hero/${assets.mobileLight}">\n    <source media="(prefers-color-scheme: dark)" srcset="./assets/hero/${assets.desktopDark}">\n    <source media="(prefers-color-scheme: light)" srcset="./assets/hero/${assets.desktopLight}">\n    <img src="./assets/hero/${assets.desktopDark}" alt="${config.profile.name} — ${config.profile.headline}" width="100%">\n  </picture>\n</p>\n${HERO_END}`;
}

export async function writeReadme(config, manifest, path) {
  const current = await readFile(path, "utf8");
  const block = heroBlock(config, manifest.assets);
  const markerPattern = new RegExp(`${HERO_START}[\\s\\S]*?${HERO_END}`);

  if (markerPattern.test(current)) {
    await writeFile(path, current.replace(markerPattern, block));
    return current.replace(markerPattern, block);
  }

  // Migrate the existing generated hero once; all README content after it stays user-owned.
  const legacyHeroPattern = /<p align="center">\s*<picture>[\s\S]*?<\/picture>\s*<\/p>/;
  if (!legacyHeroPattern.test(current)) {
    throw new Error(`README is missing the ${HERO_START} / ${HERO_END} markers and the generated hero block.`);
  }

  const updated = current.replace(legacyHeroPattern, block);
  await writeFile(path, updated);
  return updated;
}
