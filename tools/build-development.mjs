import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
const root = new URL('../preview/development/', import.meta.url);
const base = 'https://raw.githubusercontent.com/KINGTAEHEE/jideutno-legal/refs/heads/agent/remote-legal-development/preview/development/';
const source = JSON.parse(readFileSync(new URL('source.json', root), 'utf8'));
const documents = new Map();
function document(input) {
  const { path, ...metadata } = input;
  if (!/^(documents|notices)\/[a-zA-Z0-9_-]+\.html$/.test(path) || !path.endsWith(`/${input.id}.html`)) throw Error('Invalid immutable document path');
  const bytes = readFileSync(new URL(path, root));
  const html = bytes.toString('utf8');
  if (bytes.length > 512 * 1024 || !/<html[\s>]/i.test(html) || !/<head[\s>]/i.test(html) || !/<body[\s>]/i.test(html) ||
    /<(?:script|iframe|object|embed|form|input|button|base|link|svg|math|video|audio)\b|\bon\w+\s*=|http-equiv\s*=\s*["']?refresh|javascript\s*:|@import|url\s*\(/i.test(html)) throw Error(`Unsafe document: ${path}`);
  const sha256 = createHash('sha256').update(bytes).digest('hex');
  documents.set(path, sha256);
  return { ...metadata, url: base + path, sha256 };
}
const catalog = { schemaVersion: 1, revision: source.revision,
  documents: Object.fromEntries(Object.entries(source.documents).map(([kind, doc]) => [kind, document(doc)])),
  notices: source.notices.map(n => ({ ...n, document: document(n.document) })) };
if (new Set(catalog.notices.map(n => n.id)).size !== catalog.notices.length) throw Error('Duplicate notice');
for (const n of catalog.notices) if (!Number.isInteger(n.revision) || n.revision < 1 || !Number.isFinite(Date.parse(n.startsAt)) || !Number.isFinite(Date.parse(n.publishedAt)) || (n.endsAt && Date.parse(n.endsAt) <= Date.parse(n.startsAt))) throw Error('Invalid notice schedule');
const output = JSON.stringify(catalog, null, 2) + '\n';
if (Buffer.byteLength(output) > 64 * 1024) throw Error('Catalog too large');
const baseIndex = process.argv.indexOf('--base');
if (baseIndex !== -1) {
  const ref = process.argv[baseIndex + 1];
  const paths = execFileSync('git', ['ls-tree', '-r', '--name-only', ref, '--', 'preview/development/documents', 'preview/development/notices'], {encoding:'utf8'}).trim().split('\n').filter(Boolean);
  for (const path of paths) {
    const old = execFileSync('git', ['show', `${ref}:${path}`]);
    if (!old.equals(readFileSync(new URL(`../${path}`, import.meta.url)))) throw Error(`Published content is immutable; add a new ID: ${path}`);
  }
}
if (process.argv.includes('--check')) {
  if (readFileSync(new URL('current.json', root), 'utf8') !== output) throw Error('Run node tools/build-development.mjs');
} else writeFileSync(new URL('current.json', root), output);
console.log(`Development catalog verified: ${documents.size} documents, ${catalog.notices.length} notice(s).`);
