const fs = require('fs/promises');
const os = require('os');
const path = require('path');
const { spawn } = require('child_process');
const tsNodeBin = require.resolve('ts-node/dist/bin.js');

function runProcess(command, args, { cwd, input, timeoutMs = 7000 }) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd,
      stdio: 'pipe',
    });

    let stdout = '';
    let stderr = '';
    let timedOut = false;

    const timer = setTimeout(() => {
      timedOut = true;
      child.kill('SIGKILL');
    }, timeoutMs);

    child.stdout.on('data', (chunk) => {
      stdout += chunk.toString();
      if (stdout.length > 50000) stdout = stdout.slice(-50000);
    });

    child.stderr.on('data', (chunk) => {
      stderr += chunk.toString();
      if (stderr.length > 50000) stderr = stderr.slice(-50000);
    });

    child.on('error', (error) => {
      clearTimeout(timer);
      reject(error);
    });

    child.on('close', (code) => {
      clearTimeout(timer);
      if (timedOut) {
        reject(new Error('代码执行超时（>7s）'));
        return;
      }

      resolve({ stdout, stderr, exitCode: code ?? 1 });
    });

    if (input) child.stdin.write(input);
    child.stdin.end();
  });
}

function normalizeLanguage(language) {
  const v = String(language || '').toLowerCase();
  if (v === 'javascript' || v === 'js') return 'javascript';
  if (v === 'typescript' || v === 'ts') return 'typescript';
  if (v === 'python' || v === 'py') return 'python';
  if (v === 'java') return 'java';
  return '';
}

function ensureJavaMain(code) {
  if (/class\s+Main/.test(code)) return code;
  return `public class Main {\n  public static void main(String[] args) {\n${code
    .split('\n')
    .map((line) => `    ${line}`)
    .join('\n')}\n  }\n}`;
}

async function runCode({ language, code, input }) {
  const lang = normalizeLanguage(language);
  if (!lang) throw new Error('不支持该语言');

  const rootDir = await fs.mkdtemp(path.join(os.tmpdir(), 'label1276-'));
  const startAt = Date.now();

  try {
    if (lang === 'javascript') {
      const filePath = path.join(rootDir, 'main.js');
      await fs.writeFile(filePath, code, 'utf8');
      const result = await runProcess('node', [filePath], { cwd: rootDir, input });
      return {
        stdout: result.stdout,
        stderr: result.stderr,
        runtimeMs: Date.now() - startAt,
        exitCode: result.exitCode,
      };
    }

    if (lang === 'typescript') {
      const filePath = path.join(rootDir, 'main.ts');
      await fs.writeFile(filePath, code, 'utf8');
      const result = await runProcess('node', [tsNodeBin, '--transpile-only', filePath], {
        cwd: rootDir,
        input,
      });
      return {
        stdout: result.stdout,
        stderr: result.stderr,
        runtimeMs: Date.now() - startAt,
        exitCode: result.exitCode,
      };
    }

    if (lang === 'python') {
      const filePath = path.join(rootDir, 'main.py');
      await fs.writeFile(filePath, code, 'utf8');
      const result = await runProcess('python3', [filePath], { cwd: rootDir, input });
      return {
        stdout: result.stdout,
        stderr: result.stderr,
        runtimeMs: Date.now() - startAt,
        exitCode: result.exitCode,
      };
    }

    const javaCode = ensureJavaMain(code);
    const sourcePath = path.join(rootDir, 'Main.java');
    await fs.writeFile(sourcePath, javaCode, 'utf8');
    const compileResult = await runProcess('javac', ['Main.java'], { cwd: rootDir, input: '' });
    if (compileResult.exitCode !== 0) {
      return {
        stdout: compileResult.stdout,
        stderr: compileResult.stderr,
        runtimeMs: Date.now() - startAt,
        exitCode: compileResult.exitCode,
      };
    }
    const result = await runProcess('java', ['-cp', rootDir, 'Main'], { cwd: rootDir, input });
    return {
      stdout: result.stdout,
      stderr: result.stderr,
      runtimeMs: Date.now() - startAt,
      exitCode: result.exitCode,
    };
  } finally {
    await fs.rm(rootDir, { recursive: true, force: true });
  }
}

module.exports = { runCode, normalizeLanguage };
