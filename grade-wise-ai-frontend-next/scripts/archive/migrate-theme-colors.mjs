#!/usr/bin/env node
/** Replace hardcoded slate palette with semantic theme tokens. */
import fs from "node:fs";
import path from "node:path";

const SRC = path.join(process.cwd(), "src");

const REPLACEMENTS = [
  [/bg-slate-900\/90/g, "bg-nav/95"],
  [/bg-slate-900\/50/g, "bg-card"],
  [/bg-slate-800\/60/g, "bg-input"],
  [/bg-slate-800\/50/g, "bg-card"],
  [/bg-slate-800\/40/g, "bg-card/60"],
  [/bg-slate-700\/60/g, "bg-btn-secondary"],
  [/hover:bg-slate-700\/60/g, "hover:bg-surface-elevated"],
  [/hover:bg-slate-700\b/g, "hover:bg-surface-elevated"],
  [/border-slate-700\/60/g, "border-border"],
  [/border-slate-700\/50/g, "border-border"],
  [/border-slate-700\/40/g, "border-border"],
  [/border-slate-600\/60/g, "border-border"],
  [/border-slate-600\/50/g, "border-border"],
  [/border-slate-600\/40/g, "border-border"],
  [/hover:border-slate-600\b/g, "hover:border-accent/40"],
  [/hover:border-slate-500\/60/g, "hover:border-accent/40"],
  [/divide-slate-700\/50/g, "divide-border"],
  [/text-slate-300/g, "text-secondary-foreground"],
  [/text-slate-400/g, "text-muted-foreground"],
  [/placeholder-slate-500/g, "placeholder:text-subtle-foreground"],
  [/hover:text-white\b/g, "hover:text-foreground"],
  [/text-white text-xl/g, "text-foreground text-xl"],
  [/from-gray-50/g, "from-slate-50 dark:from-slate-900/40"],
  [/to-gray-50/g, "to-slate-50 dark:to-slate-900/40"],
  [/border-gray-300/g, "border-border"],
  [/border-gray-200/g, "border-border"],
  [/text-gray-800/g, "text-foreground"],
  [/text-gray-700/g, "text-secondary-foreground"],
  [/text-gray-600/g, "text-muted-foreground"],
  [/text-gray-500/g, "text-muted-foreground"],
  [/bg-gray-100/g, "bg-surface-elevated"],
  [/bg-gray-50/g, "bg-card/60"],
  [/border-blue-200/g, "border-indigo-500/20 dark:border-indigo-500/30"],
  [/from-blue-50/g, "from-indigo-50 dark:from-indigo-950/30"],
  [/to-blue-50/g, "to-sky-50 dark:to-sky-950/30"],
];

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, files);
    else if (/\.(jsx?|tsx?)$/.test(entry.name)) files.push(full);
  }
  return files;
}

for (const file of walk(SRC)) {
  if (file.includes("/lib/ui.js")) continue;
  let content = fs.readFileSync(file, "utf8");
  const original = content;
  for (const [re, repl] of REPLACEMENTS) {
    content = content.replace(re, repl);
  }
  if (content !== original) {
    fs.writeFileSync(file, content);
    console.log("updated:", path.relative(process.cwd(), file));
  }
}

console.log("done");
