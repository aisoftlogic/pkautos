#!/usr/bin/env node
/*
  Guard script: fails if any legacy Next.js Pages Router directories reappear.
  Policy: Apps must exclusively use the App Router (app/ directory) post-migration.
*/

const { execSync } = require('node:child_process');
const { exit } = require('node:process');

function run(cmd) {
  return execSync(cmd, { stdio: 'pipe', encoding: 'utf8' }).trim();
}

let matches = [];
try {
  // Use git ls-files if repo; fall back to find.
  try {
    const gitList = run("git ls-files 'apps/*/src/pages' 2>/dev/null || true");
    if (gitList) {
      matches = gitList.split('\n').filter(Boolean);
    }
  } catch (_) { /* ignore */ }
  if (matches.length === 0) {
    // Fallback: shell glob expansion via bash -lc to reliably handle no-match.
    try {
      const raw = run("bash -lc 'shopt -s nullglob; for d in apps/*/src/pages; do if [ -d \"$d\" ]; then echo $d; fi; done'");
      if (raw) {
        matches = raw.split('\n').filter(Boolean);
      }
    } catch (_) { /* ignore */ }
  }
} catch (err) {
  console.error('check-no-pages: unexpected error while scanning', err);
  exit(2);
}

if (matches.length === 0) {
  console.log('✅ No legacy pages directories detected.');
  process.exit(0);
}

console.error('❌ Legacy Next.js pages directories found (migration regression):');
for (const m of matches) console.error(' -', m);
console.error('\nRemove these directories entirely. Only the App Router (app/) is allowed.');
process.exit(1);
