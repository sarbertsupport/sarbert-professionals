/**
 * One-off migration helper: replaces console.* with logger.* and adds import after the first import block.
 * Do not use on files with multiline `import {` blocks without manual follow-up (imports must stay contiguous).
 * Run from repo: cd client && node scripts/migrate-console-to-logger.cjs
 */
const fs = require("fs");
const path = require("path");

const srcRoot = path.join(__dirname, "..", "src");

function walk(dir, acc = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, acc);
    else if (/\.(jsx?)$/.test(e.name)) acc.push(p);
  }
  return acc;
}

function loggerImportLine(fromFile) {
  let rel = path
    .relative(path.dirname(fromFile), path.join(srcRoot, "utils", "logger.js"))
    .replace(/\\/g, "/")
    .replace(/\.js$/, "");
  if (!rel.startsWith(".")) rel = "./" + rel;
  return `import logger from '${rel}';`;
}

let updated = 0;
for (const file of walk(srcRoot)) {
  if (file.replace(/\\/g, "/").endsWith("utils/logger.js")) continue;

  let code = fs.readFileSync(file, "utf8");
  const original = code;
  if (!/\bconsole\.(log|info|warn|error|debug)\s*\(/.test(code)) continue;

  const hasLogger = /from\s+['"][^'"]*utils\/logger['"]/.test(code);
  code = code
    .replace(/\bconsole\.log\s*\(/g, "logger.debug(")
    .replace(/\bconsole\.info\s*\(/g, "logger.info(")
    .replace(/\bconsole\.warn\s*\(/g, "logger.warn(")
    .replace(/\bconsole\.error\s*\(/g, "logger.error(")
    .replace(/\bconsole\.debug\s*\(/g, "logger.debug(");

  if (!hasLogger) {
    const lines = code.split("\n");
    let insertAt = 0;
    for (let i = 0; i < lines.length; i++) {
      if (/^\s*import\s/.test(lines[i])) insertAt = i + 1;
      else if (insertAt > 0 && lines[i].trim() !== "" && !/^\s*import\s/.test(lines[i])) break;
    }
    lines.splice(insertAt, 0, loggerImportLine(file));
    code = lines.join("\n");
  }

  if (code !== original) {
    fs.writeFileSync(file, code, "utf8");
    updated++;
  }
}

console.log("migrate-console-to-logger: updated", updated, "files");
