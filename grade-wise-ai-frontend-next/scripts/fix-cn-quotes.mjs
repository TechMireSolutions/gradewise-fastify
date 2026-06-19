#!/usr/bin/env node
/** Fix unquoted Tailwind tokens inside cn() after migration. */
import fs from "node:fs";
import path from "node:path";

const SRC = path.join(process.cwd(), "src");

const UI_REFS =
  /^(btn|card|page|input|label|nav|eyebrow|tableHead|iconBadge|headingGradient|heroTitle|pageTitle|pageDesc|sectionTitle|statCard|skipLink|focusRing|gridPattern|cardGlow|cardInteractive|cardHeader|pageInner|inputError|eyebrowPill|iconBadgeTeal|tableRowHover)(\.[a-z]+)?$/;

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, files);
    else if (/\.(jsx?|tsx?)$/.test(entry.name)) files.push(full);
  }
  return files;
}

function quoteArg(arg) {
  const trimmed = arg.trim();
  if (!trimmed) return trimmed;
  if (trimmed.startsWith('"') || trimmed.startsWith("'")) return trimmed;
  if (UI_REFS.test(trimmed)) return trimmed;
  if (/^[A-Za-z_$][\w$]*$/.test(trimmed) && !trimmed.includes("-")) {
    return trimmed;
  }
  return `"${trimmed}"`;
}

function fixCnCalls(content) {
  return content.replace(/cn\(([^)]*)\)/g, (match, inner) => {
    if (!inner.includes("-") && !inner.includes(":") && !/\d\.\d/.test(inner)) {
      return match;
    }
    const parts = [];
    let depth = 0;
    let current = "";
    for (const ch of inner) {
      if (ch === "(") depth++;
      if (ch === ")" && depth > 0) depth--;
      if (ch === "," && depth === 0) {
        parts.push(current);
        current = "";
      } else {
        current += ch;
      }
    }
    if (current) parts.push(current);
    const fixed = parts.map(quoteArg).join(", ");
    return `cn(${fixed})`;
  });
}

for (const file of walk(SRC)) {
  let content = fs.readFileSync(file, "utf8");
  const next = fixCnCalls(content);
  if (next !== content) {
    fs.writeFileSync(file, next);
    console.log("fixed:", path.relative(process.cwd(), file));
  }
}

console.log("done");
