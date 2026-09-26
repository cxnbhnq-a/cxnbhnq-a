import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const root = resolve(fileURLToPath(new URL("../../", import.meta.url)));

export function flagValue(name, args = process.argv.slice(2)) {
  const at = args.indexOf(name);
  return at < 0 ? undefined : args[at + 1];
}

function need(ok, message) {
  if (!ok) throw new Error(`profile.config.json: ${message}`);
}

function text(value, path, limit) {
  need(typeof value === "string" && value.trim().length > 0, `${path} must be text.`);
  need(value.length <= limit, `${path} exceeds ${limit} characters.`);
}

function list(value, path, min, max) {
  need(Array.isArray(value) && value.length >= min && value.length <= max, `${path} must contain ${min}–${max} items.`);
}

function webAddress(value, path, mail = false) {
  try {
    const parsed = new URL(value);
    need(["https:", "http:", ...(mail ? ["mailto:"] : [])].includes(parsed.protocol), `${path} has an unsupported URL scheme.`);
  } catch {
    throw new Error(`profile.config.json: ${path} must be a valid URL.`);
  }
}

export function checkConfig(data) {
  need(data && typeof data === "object" && !Array.isArray(data), "expected an object.");
  const p = data.profile;
  need(p && typeof p === "object", "profile is required.");
  text(p.name, "profile.name", 40);
  text(p.username, "profile.username", 39);
  need(/^[A-Za-z0-9](?:[A-Za-z0-9-]{0,37}[A-Za-z0-9])?$/.test(p.username), "profile.username is not valid.");
  text(p.headline, "profile.headline", 46);
  text(p.affiliation, "profile.affiliation", 40);
  text(p.location, "profile.location", 32);
  text(p.status, "profile.status", 42);
  list(p.about, "profile.about", 1, 3);
  p.about.forEach((v, i) => text(v, `profile.about[${i}]`, 320));
  list(p.quickFacts, "profile.quickFacts", 1, 8);
  p.quickFacts.forEach((v, i) => text(v, `profile.quickFacts[${i}]`, 80));

  const r = data.research;
  need(r && typeof r === "object", "research is required.");
  text(r.primary, "research.primary", 28);
  text(r.direction, "research.direction", 38);
  text(r.themes, "research.themes", 46);
  text(r.narrative, "research.narrative", 420);

  list(data.focus, "focus", 1, 6);
  data.focus.forEach((item, i) => {
    text(item?.name, `focus[${i}].name`, 28);
    text(item?.description, `focus[${i}].description`, 180);
  });
  list(data.projects, "projects", 1, 6);
  data.projects.forEach((item, i) => {
    text(item?.name, `projects[${i}].name`, 18);
    webAddress(item?.url, `projects[${i}].url`);
    if (item?.homepage) webAddress(item.homepage, `projects[${i}].homepage`);
    text(item?.focus, `projects[${i}].focus`, 44);
    text(item?.summary, `projects[${i}].summary`, 220);
    text(item?.heroLabel, `projects[${i}].heroLabel`, 30);
  });
  list(data.techStack, "techStack", 1, 30);
  data.techStack.forEach((v, i) => text(v, `techStack[${i}]`, 30));
  list(data.links, "links", 1, 4);
  data.links.forEach((item, i) => {
    text(item?.label, `links[${i}].label`, 14);
    text(item?.value, `links[${i}].value`, 28);
    webAddress(item?.url, `links[${i}].url`, true);
    text(item?.logo ?? "", `links[${i}].logo`, 30);
    need(/^[\da-f]{6}$/i.test(item?.color ?? ""), `links[${i}].color must be a six-digit color.`);
  });
  need(["signal", "ocean", "solar"].includes(data.appearance?.palette), "appearance.palette must be signal, ocean, or solar.");
  text(data.footer, "footer", 120);
  return data;
}

export async function readConfig(path = resolve(root, "profile.config.json")) {
  let value;
  try {
    value = JSON.parse(await readFile(resolve(path), "utf8"));
  } catch (error) {
    throw new Error(`Could not read profile configuration: ${error.message}`);
  }
  return checkConfig(value);
}
