import {spawnSync} from 'node:child_process';
import {realpathSync, statSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const repositoryDirectory = fileURLToPath(new URL('../', import.meta.url));
const remoteMain = 'refs/remotes/origin/main';

export function supportedNode(version) {
  const [major, minor] = version.replace(/^v/, '').split('.').map(Number);
  return major > 22 || (major === 22 && minor >= 12) || (major === 20 && minor >= 19);
}

// Windows cannot spawn a .cmd file directly. Only these fixed pnpm commands
// reach cmd.exe; the user-supplied directory is passed separately as cwd.
export function commandInvocation(command, args, platform = process.platform, env = process.env) {
  if (platform !== 'win32' || command !== 'pnpm') return {file: command, args};
  const allowed = ['--version', 'install --frozen-lockfile', 'build'];
  const argumentsText = args.join(' ');
  if (!allowed.includes(argumentsText)) throw new Error('Недопустимая команда pnpm.');
  const windows = env.SystemRoot || env.WINDIR || 'C:\\Windows';
  return {
    file: path.win32.join(windows, 'System32', 'cmd.exe'),
    args: ['/d', '/s', '/c', `pnpm.cmd ${argumentsText}`],
  };
}

export function runCommand(command, args, cwd) {
  const invocation = commandInvocation(command, args);
  const result = spawnSync(invocation.file, invocation.args, {
    cwd, encoding: 'utf8', windowsHide: true, maxBuffer: 16 * 1024 * 1024,
  });
  if (result.error) {
    throw new Error(`Не удалось запустить ${command}. Проверьте установку и PATH. ${result.error.message}`);
  }
  if (result.status !== 0) {
    throw new Error(`Команда ${command} ${args.join(' ')} завершилась с ошибкой.\n${result.stderr || result.stdout || `Код: ${result.status}`}`);
  }
  return result.stdout.trim();
}

export function syncAndBuild(target = repositoryDirectory, dependencies = {}) {
  const {
    run = runCommand, realpath = realpathSync, stat = statSync,
    nodeVersion = process.versions.node, platform = process.platform, log = console.log,
  } = dependencies;
  if (!supportedNode(nodeVersion)) {
    throw new Error('Нужен Node.js 20.19+ или 22.12+ (Node.js 21 не поддерживается). Установите актуальную LTS-версию.');
  }
  if (!path.isAbsolute(target)) throw new Error('Укажите абсолютный путь к папке onlinemikro.');
  let directory;
  try {
    if (!stat(target).isDirectory()) throw new Error('not a directory');
    directory = realpath(target);
  } catch {
    throw new Error(`Папка проекта недоступна: ${target}. Проверьте путь и доступ к ней.`);
  }
  const git = (...args) => run('git', args, directory);
  const sameDirectory = (left, right) => {
    const a = path.normalize(left), b = path.normalize(right);
    return platform === 'win32' ? a.toLowerCase() === b.toLowerCase() : a === b;
  };
  let root;
  try { root = realpath(git('rev-parse', '--show-toplevel')); }
  catch { throw new Error('В указанной папке не найден доступный Git-репозиторий. Укажите корень клона onlinemikro.'); }
  if (!sameDirectory(root, directory)) throw new Error(`Укажите корень репозитория: ${root}. Вложенная папка не обновлялась.`);
  if (git('branch', '--show-current') !== 'main') {
    throw new Error('Текущая ветка — не main. Сохраните свою работу и самостоятельно переключитесь на main, затем повторите запуск.');
  }
  const origin = git('remote', 'get-url', 'origin');
  if (!/^(?:https:\/\/github\.com\/|git@github\.com:|ssh:\/\/git@github\.com\/)AkbotaS\/onlinemikro(?:\.git)?\/?$/i.test(origin)) {
    throw new Error('origin не указывает на AkbotaS/onlinemikro в GitHub. Проверьте git remote -v; другой репозиторий не обновлялся.');
  }
  if (git('status', '--porcelain', '--untracked-files=normal')) {
    throw new Error('В папке есть незакоммиченные или новые файлы. Сохраните их отдельно либо создайте свой коммит и проверьте историю. Ничего не удалено; синхронизация не выполнялась.');
  }
  run('pnpm', ['--version'], directory);
  log(`Синхронизация main: ${directory}`);
  git('fetch', 'origin', `refs/heads/main:${remoteMain}`);
  try { git('merge-base', '--is-ancestor', 'HEAD', remoteMain); }
  catch {
    throw new Error('Локальная main содержит собственные коммиты или расходится с origin/main. Автоматическое объединение остановлено. Проверьте git log --oneline --graph --all; reset, stash и принудительные операции не выполнялись.');
  }
  git('merge', '--ff-only', remoteMain);
  log('Установка зависимостей по pnpm-lock.yaml…');
  run('pnpm', ['install', '--frozen-lockfile'], directory);
  log('Production-сборка…');
  run('pnpm', ['build'], directory);
  const sha = git('rev-parse', 'HEAD');
  const dist = path.join(directory, 'dist');
  log(`Готово. Коммит: ${sha}\nСборка: ${dist}`);
  return {sha, dist};
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    if (process.argv.length > 3) throw new Error('Использование: node scripts/sync-and-build.mjs [абсолютный-путь-к-проекту]');
    syncAndBuild(process.argv[2]);
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}
