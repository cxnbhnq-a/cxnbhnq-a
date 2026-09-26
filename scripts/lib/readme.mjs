import { writeFile } from "node:fs/promises";

const cell = (value) => String(value).replaceAll("|", "\\|").replaceAll("\n", " ");
const plain = (value) => String(value);

function badge(link) {
  const segment = (value) => encodeURIComponent(String(value).replaceAll("-", "--").replaceAll("_", "__").replaceAll(" ", "_"));
  const icon = link.logo ? `&logo=${encodeURIComponent(link.logo)}&logoColor=white` : "";
  const image = `https://img.shields.io/badge/${segment(link.label)}-${segment(link.value)}-${link.color}?style=for-the-badge${icon}`;
  return `<a href="${link.url}"><img alt="${link.label}: ${link.value}" src="${image}"></a>`;
}

function skillTable(skills) {
  const known = { "VS Code": "vscode", "JavaScript": "js", "TypeScript": "ts", "Next.js": "nextjs", "Node.js": "nodejs", "Arch Linux": "arch", "Kali Linux": "kali", "Burp Suite": "burpsuite" };
  const cells = skills.map((name) => `<td align="center" width="96"><img src="https://skillicons.dev/icons?i=${known[name] ?? name.toLowerCase().replaceAll(" ", "")}" width="48" height="48" alt="${cell(name)} icon"><br>${cell(name)}</td>`);
  return `<table>\n${Array.from({ length: Math.ceil(cells.length / 5) }, (_, row) => `<tr>${cells.slice(row * 5, row * 5 + 5).join("")}</tr>`).join("\n")}\n</table>`;
}

export async function writeReadme(config, manifest, path) {
  const hero = manifest.assets;
  const links = config.links.map(badge).join("\n");
  const focus = ["| Area | What I am exploring |", "| --- | --- |", ...config.focus.map((item) => `| **${cell(item.name)}** | ${cell(item.description)} |`)].join("\n");
  const work = ["| Project | Focus | Details |", "| --- | --- | --- |", ...config.projects.map((item) => `| [**${cell(item.name)}**](${item.url}) | ${cell(item.focus)} | ${cell(item.summary)}${item.homepage ? ` [Live](${item.homepage})` : ""} |`)].join("\n");
  const readme = `<!-- Generated from profile.config.json with Nabhan's profile builder. -->
<p align="center">
  <picture>
    <source media="(max-width: 760px) and (prefers-color-scheme: dark)" srcset="./assets/hero/${hero.mobileDark}">
    <source media="(max-width: 760px)" srcset="./assets/hero/${hero.mobileLight}">
    <source media="(prefers-color-scheme: dark)" srcset="./assets/hero/${hero.desktopDark}">
    <source media="(prefers-color-scheme: light)" srcset="./assets/hero/${hero.desktopLight}">
    <img src="./assets/hero/${hero.desktopDark}" alt="${plain(config.profile.name)} — ${plain(config.profile.headline)}" width="100%">
  </picture>
</p>

<p align="center">${links}</p>
<p align="center"><strong>${plain(config.profile.headline)}</strong></p>

## About Me

${config.profile.about.join("\n\n")}

${config.profile.quickFacts.map((fact) => `- ${plain(fact)}`).join("\n")}
- ${plain(config.profile.location)}

## Skills

<div align="center">\n\n${skillTable(config.techStack)}\n\n</div>

## Current Focus

${focus}

## Featured Work

${work}

## Research Direction

${plain(config.research.narrative)}

## Tech Stack

${config.techStack.map((name) => `\`${cell(name)}\``).join(" · ")}

## GitHub Stats

<p align="center"><img src="https://github-readme-streak-stats.herokuapp.com/?user=${encodeURIComponent(config.profile.username)}&theme=tokyonight&hide_border=true" alt="GitHub streak stats"></p>

## Connect With Me

<p align="center">${links}</p>

---

<p align="center">${plain(config.footer)}</p>
`;
  await writeFile(path, readme);
  return readme;
}
