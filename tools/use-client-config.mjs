#!/usr/bin/env node
/**
 * Swap the active client configuration.
 *
 *   npm run config:use -- salon-only
 *   npm run config:use -- spa-only
 *   npm run config:use -- salon-and-spa
 *
 * Copies every *.json from src/assets/config/examples/<name>/ over
 * src/assets/config/. Files the example does not provide are left as they are.
 * Nothing in src/app changes — that is the point.
 */
import { copyFileSync, existsSync, readdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const configDir = join(root, 'src/assets/config');
const examplesDir = join(configDir, 'examples');

const name = process.argv[2];
const available = existsSync(examplesDir)
  ? readdirSync(examplesDir, { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .map((d) => d.name)
  : [];

if (!name || !available.includes(name)) {
  console.error(`Usage: npm run config:use -- <${available.join(' | ')}>`);
  process.exit(1);
}

const source = join(examplesDir, name);
const files = readdirSync(source).filter((f) => f.endsWith('.json'));
for (const file of files) {
  copyFileSync(join(source, file), join(configDir, file));
  console.log(`  ✓ ${file}`);
}
console.log(`\nActive client configuration: ${name}`);
