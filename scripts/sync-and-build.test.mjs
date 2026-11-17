import test from 'node:test';
import assert from 'node:assert/strict';
import {commandInvocation, supportedNode, syncAndBuild} from './sync-and-build.mjs';

const target = '/project/onlinemikro';
const remote = 'refs/remotes/origin/main';
function fixture(overrides = {}) {
  const calls = [], logs = [];
  const options = {
    branch: 'main', origin: 'https://github.com/AkbotaS/onlinemikro.git',
    status: '', root: target, ...overrides,
  };
  const dependencies = {
    nodeVersion: '22.12.0', platform: 'linux',
    stat: () => ({isDirectory: () => true}), realpath: value => value,
    log: message => logs.push(message),
    run(command, args, cwd) {
      calls.push({command, args, cwd});
      const key = `${command} ${args.join(' ')}`;
      if (key === options.fail) throw new Error(`test failure: ${key}`);
      if (key === 'git rev-parse --show-toplevel') return options.root;
      if (key === 'git branch --show-current') return options.branch;
      if (key === 'git remote get-url origin') return options.origin;
      if (key === 'git status --porcelain --untracked-files=normal') return options.status;
      if (key === 'git rev-parse HEAD') return 'abc123';
      if (key === 'pnpm --version') return '10.0.0';
      return '';
    },
  };
  return {calls, logs, dependencies, execute: () => syncAndBuild(target, dependencies)};
}
const commands = fixture => fixture.calls.map(({command, args}) => `${command} ${args.join(' ')}`);

test('clean main is fast-forwarded, installed with frozen lockfile, then built', () => {
  const f = fixture();
  assert.deepEqual(f.execute(), {sha: 'abc123', dist: `${target}/dist`});
  assert.deepEqual(commands(f), [
    'git rev-parse --show-toplevel', 'git branch --show-current',
    'git remote get-url origin', 'git status --porcelain --untracked-files=normal',
    'pnpm --version', `git fetch origin refs/heads/main:${remote}`,
    `git merge-base --is-ancestor HEAD ${remote}`, `git merge --ff-only ${remote}`,
    'pnpm install --frozen-lockfile', 'pnpm build', 'git rev-parse HEAD',
  ]);
  assert(f.calls.every(call => call.cwd === target));
  assert.match(f.logs.at(-1), /abc123/);
});

for (const status of [' M src/App.tsx', 'M  src/App.tsx', '?? new-file.txt']) {
  test(`dirty tree stops before network or install (${status})`, () => {
    const f = fixture({status});
    assert.throws(f.execute, /незакоммиченные/);
    assert.equal(f.calls.at(-1).command, 'git');
    assert(!commands(f).some(command => /fetch|merge|pnpm/.test(command)));
  });
}

test('other branch, detached HEAD, wrong origin, and nested target stop safely', () => {
  for (const config of [{branch:'feature'}, {branch:''}, {origin:'https://github.com/other/project.git'}, {root:'/project'}]) {
    const f = fixture(config);
    assert.throws(f.execute);
    assert(!commands(f).some(command => /fetch|merge|pnpm/.test(command)));
  }
});

test('only the expected GitHub repository is accepted over HTTPS or SSH', () => {
  for (const origin of ['https://github.com/AkbotaS/onlinemikro', 'git@github.com:AkbotaS/onlinemikro.git', 'ssh://git@github.com/AkbotaS/onlinemikro.git']) {
    assert.doesNotThrow(fixture({origin}).execute);
  }
  for (const origin of ['https://github.com.evil/AkbotaS/onlinemikro.git','https://token@github.com/AkbotaS/onlinemikro.git','file:///project/onlinemikro']) {
    assert.throws(fixture({origin}).execute, /origin/);
  }
});

test('diverged or locally ahead branch never reaches merge or install', () => {
  const f = fixture({fail:`git merge-base --is-ancestor HEAD ${remote}`});
  assert.throws(f.execute, /собственные коммиты/);
  assert(!commands(f).some(command => command.startsWith('git merge --') || command.startsWith('pnpm install')));
});

test('missing pnpm, failed fetch, failed merge, and failed install stop subsequent steps', () => {
  for (const fail of ['pnpm --version', `git fetch origin refs/heads/main:${remote}`, `git merge --ff-only ${remote}`, 'pnpm install --frozen-lockfile']) {
    const f = fixture({fail});
    assert.throws(f.execute, /test failure/);
    assert.equal(commands(f).at(-1), fail);
    assert(!commands(f).includes('pnpm build'));
  }
});

test('build failure never reports success', () => {
  const f = fixture({fail:'pnpm build'});
  assert.throws(f.execute, /test failure/);
  assert(!f.logs.some(message => message.startsWith('Готово.')));
});

test('reject unsupported Node or unavailable directory without running commands', () => {
  for (const nodeVersion of ['18.20.0','20.18.3','21.7.0','22.11.0']) {
    const f = fixture();
    assert.throws(() => syncAndBuild(target, {...f.dependencies,nodeVersion}), /Node.js/);
    assert.equal(f.calls.length, 0);
  }
  const f = fixture();
  assert.throws(() => syncAndBuild(target, {...f.dependencies,stat:()=>{throw new Error('ENOENT')}}), /недоступна/);
  assert.throws(() => syncAndBuild('relative/path', f.dependencies), /абсолютный/);
  assert.equal(f.calls.length, 0);
  for (const version of ['20.19.0','22.12.0','24.0.0']) assert(supportedNode(version));
});

test('Windows pnpm uses a trusted interpreter and fixed command text, never target interpolation', () => {
  const invocation = commandInvocation('pnpm',['install','--frozen-lockfile'],'win32',{SystemRoot:'C:\\Windows'});
  assert.deepEqual(invocation, {file:'C:\\Windows\\System32\\cmd.exe',args:['/d','/s','/c','pnpm.cmd install --frozen-lockfile']});
  assert.throws(() => commandInvocation('pnpm',['build','&','evil'],'win32'), /Недопустимая/);
  assert.deepEqual(commandInvocation('git',['status'],'win32'),{file:'git',args:['status']});
  assert.deepEqual(commandInvocation('pnpm',['build'],'linux'),{file:'pnpm',args:['build']});
});
