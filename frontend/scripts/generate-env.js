// Genera src/environments/environment.ts desde frontend/.env (o variables de entorno: en Vercel mandan las del dashboard).
// Sin dependencias: parseo minimo KEY=VALOR. Se ejecuta solo via `npm run build` (hook prebuild).
const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '..');
const out = path.join(dir, 'src', 'environments', 'environment.ts');

function parseDotEnv(file) {
  const vars = {};
  if (!fs.existsSync(file)) return vars;
  for (const line of fs.readFileSync(file, 'utf8').split('\n')) {
    const t = line.trim();
    if (!t || t.startsWith('#')) continue;
    const i = t.indexOf('=');
    if (i < 0) continue;
    let v = t.slice(i + 1).trim().replace(/^["']|["']$/g, '');
    vars[t.slice(0, i).trim()] = v;
  }
  return vars;
}

const fromFile = parseDotEnv(path.join(dir, '.env'));
const apiBaseUrl = (process.env.API_BASE_URL !== undefined ? process.env.API_BASE_URL : (fromFile.API_BASE_URL || '')).replace(/\/$/, '');

fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, `// generado por scripts/generate-env.js - no editar a mano, edita frontend/.env\n` +
  `export const environment = { apiBaseUrl: '${apiBaseUrl.replace(/'/g, "\\'")}' };\n`);
console.log(`[generate-env] apiBaseUrl='${apiBaseUrl || '(vacio: usa proxy /api)'}'`);
