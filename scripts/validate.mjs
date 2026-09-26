#!/usr/bin/env node

import { access, readFile, readdir } from "node:fs/promises";
import { resolve } from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { readConfig, root } from "./lib/config.mjs";

const run = promisify(execFile);

try {
  await readConfig();
  const scripts = resolve(root, "scripts");
  const modules = [...(await readdir(scripts)).filter((name) => name.endsWith(".mjs")), ...(await readdir(resolve(scripts, "lib"))).filter((name) => name.endsWith(".mjs")).map((name) => `lib/${name}`)];
  for (const item of modules) await run(process.execPath, ["--check", resolve(scripts, item)]);

  const manifest = JSON.parse(await readFile(resolve(root, "assets/hero/manifest.json"), "utf8"));
  const readme = await readFile(resolve(root, "README.md"), "utf8");
  for (const file of Object.values(manifest.assets)) {
    await access(resolve(root, "assets/hero", file));
    const svg = await readFile(resolve(root, "assets/hero", file), "utf8");
    if (!svg.startsWith("<svg") || !svg.endsWith("</svg>") || !readme.includes(file)) throw new Error(`Generated image is missing or incomplete: ${file}`);
  }
  process.stdout.write(`Configuration and ${modules.length} source modules look consistent.\n`);
} catch (error) {
  process.stderr.write(`Could not verify project files: ${error.message}\n`);
  process.exitCode = 1;
}
