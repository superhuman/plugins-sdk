import {createGitTag} from '../cli/git_helpers';
import {execFileSync} from 'child_process';
import fs from 'fs';
import {gitTagExists} from '../cli/git_helpers';
import os from 'os';
import path from 'path';

describe('Git helpers', () => {
  let repoDir: string;

  beforeEach(() => {
    repoDir = fs.mkdtempSync(path.join(os.tmpdir(), 'git-helpers-test-'));
    const git = (...args: string[]) => execFileSync('git', args, {cwd: repoDir, stdio: 'pipe'});
    git('init', '-q');
    git('config', 'user.name', 'test');
    git('config', 'user.email', 'test@example.com');
    git('config', 'tag.gpgSign', 'false');
    git('commit', '-q', '--allow-empty', '--no-gpg-sign', '-m', 'init');
  });

  afterEach(() => {
    fs.rmSync(repoDir, {recursive: true, force: true});
  });

  it('creates an annotated tag and detects it', () => {
    assert.isFalse(gitTagExists('pack/1/v1', repoDir));
    assert.isTrue(createGitTag('pack/1/v1', 'Release ID: 1', repoDir));
    assert.isTrue(gitTagExists('pack/1/v1', repoDir));
  });

  it('does not interpret shell metacharacters in the tag message', () => {
    const message = 'notes $(touch pwned1) `touch pwned2` \\"; touch pwned3; echo \\"';
    assert.isTrue(createGitTag('pack/1/v2', message, repoDir));
    assert.isFalse(fs.existsSync(path.join(repoDir, 'pwned1')));
    assert.isFalse(fs.existsSync(path.join(repoDir, 'pwned2')));
    assert.isFalse(fs.existsSync(path.join(repoDir, 'pwned3')));
    const stored = execFileSync('git', ['tag', '-l', '--format=%(contents)', 'pack/1/v2'], {
      cwd: repoDir,
      encoding: 'utf-8',
    });
    assert.equal(stored.trim(), message);
  });

  it('does not interpret shell metacharacters in the tag name', () => {
    assert.isFalse(gitTagExists('x"; touch pwned; echo "', repoDir));
    assert.isFalse(createGitTag('x"; touch pwned; echo "', 'msg', repoDir));
    assert.isFalse(fs.existsSync(path.join(repoDir, 'pwned')));
  });
});
