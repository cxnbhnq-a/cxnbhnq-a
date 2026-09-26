#!/usr/bin/env node

import { resolve } from "node:path";
import { flagValue, readConfig, root } from "./lib/config.mjs";
import { createHeroAssets } from "./lib/hero.mjs";
import { writeReadme } from "./lib/readme.mjs";

try {
  const config = await readConfig(flagValue("--config") ?? resolve(root, "profile.config.json"));
  const assetsDirectory = resolve(root, "assets/hero");
  const manifest = await createHeroAssets(config, flagValue("--source"), assetsDirectory);
  await writeReadme(config, manifest, resolve(root, "README.md"));
  process.stdout.write(`Profile files created (${manifest.version}).\n`);
} catch (error) {
  process.stderr.write(`${error.message}\n`);
  process.exitCode = 1;
}
