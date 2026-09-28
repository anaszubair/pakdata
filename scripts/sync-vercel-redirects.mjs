// Rewrites the redirects in vercel.json from redirects.mjs.
import { readFileSync, writeFileSync } from 'node:fs';
import { buildVercelRedirects } from '../redirects.mjs';

const path = new URL('../vercel.json', import.meta.url);
const config = JSON.parse(readFileSync(path, 'utf8'));
config.trailingSlash = false;
config.redirects = buildVercelRedirects();
writeFileSync(path, `${JSON.stringify(config, null, 2)}\n`);
console.log(`vercel.json: ${config.redirects.length} redirects`);
