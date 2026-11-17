const assert = require('node:assert/strict');
const fs = require('node:fs');
const MANIFEST = '.agents/plugin.json';

const target = process.env.PLUGIN_VERSION || '';
if (target) {
  assert.match(
    target,
    /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/,
    'plugin-version must be stable, for example 0.3.0',
  );
  const manifest = JSON.parse(fs.readFileSync(MANIFEST, 'utf8'));
  const current = manifest.version.split('.').map(BigInt);
  const next = target.split('.').map(BigInt);
  const changed = current.findIndex((part, i) => part !== next[i]);
  assert(changed !== -1 && next[changed] > current[changed], `plugin-version must be above ${manifest.version}`);
  manifest.version = target;
  // The monorepo release import accepts only canonical two-space JSON.
  fs.writeFileSync(MANIFEST, `${JSON.stringify(manifest, null, 2)}\n`);
}
