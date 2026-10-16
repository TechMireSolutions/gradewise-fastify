#!/usr/bin/env node
/** Apply shared Tailwind primitives — replace duplicated class strings. */
import fs from "node:fs";
import path from "node:path";

const SRC = path.join(process.cwd(), "src");

const REPLACEMENTS = [
  [
    /bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-400 hover:to-violet-500 text-white rounded-xl font-semibold text-sm shadow-lg shadow-indigo-500\/30 hover:shadow-indigo-500\/50 transition-all duration-200 active:scale-95/g,
    "BTN_PRIMARY_TAIL",
  ],
  [
    /bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-400 hover:to-violet-500 text-white rounded-xl font-semibold text-sm shadow-lg shadow-indigo-500\/30 hover:shadow-indigo-500\/50 transition-all duration-200 active:scale-\[0\.98\]/g,
    "BTN_PRIMARY_TAIL",
  ],
  [
    /bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white rounded-xl font-semibold text-sm shadow-lg shadow-emerald-500\/30 hover:shadow-emerald-500\/50 transition-all duration-200 active:scale-95/g,
    "BTN_SUCCESS_TAIL",
  ],
  [
    /bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500\/25/g,
    "ICON_BADGE",
  ],
  [
    /bg-gradient-to-br from-indigo-500\/20 to-violet-500\/20 border border-indigo-500\/30/g,
    "ACCENT_PANEL_BORDER",
  ],
  [
    /w-full bg-input backdrop-blur-sm border border-border hover:border-accent\/40 focus:border-indigo-500 rounded-xl px-4 py-3 text-secondary-foreground placeholder:text-subtle-foreground text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500\/30/g,
    "INPUT_PLAIN_TAIL",
  ],
  [
    /w-full bg-input backdrop-blur-sm border border-border hover:border-accent\/40 focus:border-indigo-500 rounded-xl pl-11 pr-4 py-3 text-secondary-foreground placeholder:text-subtle-foreground text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500\/30/g,
    "INPUT_ICON_TAIL",
  ],
];

const CHIP_REPLACEMENTS = [
  [
    /cn\("inline-flex", "items-center", "gap-1\.5", "px-3", "py-1\.5", "bg-btn-secondary", "hover:bg-indigo-500\/20", "border", "border-border", "hover:border-indigo-500\/40", "text-secondary-foreground", "hover:text-indigo-300", "rounded-lg", "font-medium", "text-xs", "transition-all", "duration-200", "cursor-pointer"\)/g,
    'cn(chip, chipTone.indigo, focusRing)',
  ],
  [
    /cn\("inline-flex", "items-center", "gap-1\.5", "px-3", "py-1\.5", "bg-btn-secondary", "hover:bg-emerald-500\/20", "border", "border-border", "hover:border-emerald-500\/40", "text-secondary-foreground", "hover:text-emerald-300", "rounded-lg", "font-medium", "text-xs", "transition-all", "duration-200", "cursor-pointer"\)/g,
    'cn(chip, chipTone.emerald, focusRing)',
  ],
  [
    /cn\("inline-flex", "items-center", "gap-1\.5", "px-3", "py-1\.5", "bg-btn-secondary", "hover:bg-violet-500\/20", "border", "border-border", "hover:border-violet-500\/40", "text-secondary-foreground", "hover:text-violet-300", "rounded-lg", "font-medium", "text-xs", "transition-all", "duration-200", "cursor-pointer"\)/g,
    'cn(chip, chipTone.violet, focusRing)',
  ],
  [
    /cn\("inline-flex", "items-center", "gap-1\.5", "px-3", "py-1\.5", "bg-btn-secondary", "hover:bg-amber-500\/20", "border", "border-border", "hover:border-amber-500\/40", "text-secondary-foreground", "hover:text-amber-300", "rounded-lg", "font-medium", "text-xs", "transition-all", "duration-200", "active:scale-95", "cursor-pointer"\)/g,
    'cn(chip, chipTone.amber, focusRing, "active:scale-95")',
  ],
  [
    /cn\("inline-flex", "items-center", "gap-1\.5", "px-3", "py-1\.5", "bg-btn-secondary", "hover:bg-sky-500\/20", "border", "border-border", "hover:border-sky-500\/40", "text-secondary-foreground", "hover:text-sky-300", "rounded-lg", "font-medium", "text-xs", "transition-all", "duration-200", "cursor-pointer"\)/g,
    'cn(chip, chipTone.sky, focusRing)',
  ],
  [
    /className="inline-flex items-center gap-1\.5 px-3 py-1\.5 bg-red-500\/15 text-red-400 border border-red-500\/20 hover:bg-red-500\/25 rounded-lg font-medium text-xs transition-all duration-200 active:scale-95 cursor-pointer"/g,
    'className={cn(chip, chipTone.danger, focusRing, "active:scale-95")}',
  ],
];

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, files);
    else if (/\.(jsx?|tsx?)$/.test(entry.name)) files.push(full);
  }
  return files;
}

function ensureUiImports(content, names) {
  const needed = [...names].filter(Boolean).sort();
  if (needed.length === 0) return content;

  const usesCn = content.includes("cn(");
  let result = content;

  if (usesCn && !result.includes('from "@/lib/cn.js"')) {
    const first = result.search(/^import /m);
    result =
      (first >= 0 ? result.slice(0, first) : "") +
      'import { cn } from "@/lib/cn.js";\n' +
      (first >= 0 ? result.slice(first) : result);
  }

  const uiMatch = result.match(/import \{([^}]+)\} from "@\/lib\/ui\.js";/);
  if (uiMatch) {
    const existing = uiMatch[1]
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const merged = [...new Set([...existing, ...needed])].sort();
    result = result.replace(
      /import \{[^}]+\} from "@\/lib\/ui\.js";/,
      `import { ${merged.join(", ")} } from "@/lib/ui.js";`
    );
  } else {
    const line = `import { ${needed.join(", ")} } from "@/lib/ui.js";\n`;
    const first = result.search(/^import /m);
    result =
      first >= 0
        ? result.slice(0, first) + line + result.slice(first)
        : line + result;
  }

  return result;
}

function processFile(filePath) {
  if (filePath.includes("/lib/ui.js") || filePath.includes("/lib/cn.js")) return;

  let content = fs.readFileSync(filePath, "utf8");
  const original = content;
  const uiImports = new Set();

  for (const [re, token] of REPLACEMENTS) {
    if (re.test(content)) {
      content = content.replace(re, token);
      if (token === "BTN_PRIMARY_TAIL") uiImports.add("btn");
      if (token === "BTN_SUCCESS_TAIL") uiImports.add("btn");
      if (token === "ICON_BADGE") uiImports.add("iconBadge");
      if (token === "ACCENT_PANEL_BORDER") uiImports.add("accentPanel");
      if (token === "INPUT_PLAIN_TAIL") {
        uiImports.add("inputPlain");
        uiImports.add("focusRing");
      }
      if (token === "INPUT_ICON_TAIL") {
        uiImports.add("input");
        uiImports.add("focusRing");
      }
    }
  }

  content = content.replace(
    /className="([^"]*?)BTN_PRIMARY_TAIL([^"]*?)"/g,
    (_, before, after) => {
      uiImports.add("btn");
      uiImports.add("cn");
      const extras = [before.trim(), after.trim()].filter(Boolean);
      if (extras.length === 0) return 'className={btn.primary}';
      return `className={cn(btn.primary, ${extras.map((e) => `"${e}"`).join(", ")})}`;
    }
  );

  content = content.replace(
    /className=\{cn\(([^)]*?)BTN_PRIMARY_TAIL([^)]*?)\)\}/g,
    (_, before, after) => {
      uiImports.add("btn");
      return `className={cn(btn.primary${before ? `, ${before.trim()}` : ""}${after ? `, ${after.trim()}` : ""})}`;
    }
  );

  content = content.replace(
    /className="([^"]*?)BTN_SUCCESS_TAIL([^"]*?)"/g,
    (_, before, after) => {
      uiImports.add("btn");
      uiImports.add("cn");
      const extras = [before.trim(), after.trim()].filter(Boolean);
      if (extras.length === 0) return 'className={btn.success}';
      return `className={cn(btn.success, ${extras.map((e) => `"${e}"`).join(", ")})}`;
    }
  );

  content = content.replace(/ICON_BADGE/g, () => {
    uiImports.add("iconBadge");
    return '${iconBadge}';
  });

  content = content.replace(/ACCENT_PANEL_BORDER/g, () => {
    uiImports.add("accentPanel");
    return "ACCENT_PANEL";
  });

  content = content.replace(/className="([^"]*?)ACCENT_PANEL([^"]*?)"/g, (_, b, a) => {
    uiImports.add("accentPanel");
    uiImports.add("cn");
    const extras = [b.trim(), a.trim()].filter(Boolean);
    return extras.length
      ? `className={cn(accentPanel, ${extras.map((e) => `"${e}"`).join(", ")})}`
      : "className={accentPanel}";
  });

  for (const [re, repl] of CHIP_REPLACEMENTS) {
    if (re.test(content)) {
      content = content.replace(re, repl);
      uiImports.add("chip");
      uiImports.add("chipTone");
      uiImports.add("focusRing");
      uiImports.add("cn");
    }
  }

  content = content.replace(
    /\s*{\/\* Custom CSS for animations \*\/}\s*<style dangerouslySetInnerHTML=\{\{ __html: `[\s\S]*?` \}\} \/>/g,
  );

  content = content.replace(/animate-slideInUp/g, "animate-slide-in-up");
  content = content.replace(/animate-fadeIn/g, "animate-fade-in");

  if (content === original) return;

  if (uiImports.size > 0 || content.includes("cn(")) {
    content = ensureUiImports(content, [...uiImports, ...(content.includes("cn(") ? ["cn"] : [])]);
  }

  fs.writeFileSync(filePath, content);
  console.log("updated:", path.relative(process.cwd(), filePath));
}

for (const file of walk(SRC)) processFile(file);
console.log("done");
