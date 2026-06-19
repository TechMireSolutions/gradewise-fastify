#!/usr/bin/env node
/**
 * One-shot migration: replace edu-* custom classes with Tailwind utilities / ui.js tokens.
 */
import fs from "node:fs";
import path from "node:path";

const SRC = path.join(process.cwd(), "src");

const TOKEN_MAP = {
  "edu-page-inner": "pageInner",
  "edu-card-glow": "cardGlow",
  "edu-card-interactive": "cardInteractive",
  "edu-card-header": "cardHeader",
  "edu-card": "card",
  "edu-btn-primary": "btn.primary",
  "edu-btn-secondary": "btn.secondary",
  "edu-btn-google": "btn.google",
  "edu-input-error": "inputError",
  "edu-input": "input",
  "edu-label": "label",
  "edu-nav": "nav",
  "edu-eyebrow-pill": "eyebrowPill",
  "edu-eyebrow": "eyebrow",
  "edu-page-title": "pageTitle",
  "edu-hero-title": "heroTitle",
  "edu-page-desc": "pageDesc",
  "edu-heading-gradient": "headingGradient",
  "edu-section-title": "sectionTitle",
  "edu-icon-badge-teal": "iconBadgeTeal",
  "edu-icon-badge": "iconBadge",
  "edu-table-head": "tableHead",
  "edu-table-row-hover": "tableRowHover",
  "edu-table-divider": "border-border",
  "edu-stat-card": "statCard",
  "edu-skip-link": "skipLink",
  "edu-focus-ring": "focusRing",
  "edu-grid-pattern": "gridPattern",
  "edu-page": "page",
  "edu-sr-only": "sr-only",
  "edu-text-primary": "text-foreground",
  "edu-text-secondary": "text-secondary-foreground",
  "edu-text-muted": "text-muted-foreground",
  "edu-text-subtle": "text-subtle-foreground",
};

const UI_IMPORTS = new Set([
  "page",
  "pageInner",
  "card",
  "cardGlow",
  "cardInteractive",
  "cardHeader",
  "btn",
  "input",
  "inputError",
  "label",
  "nav",
  "eyebrowPill",
  "eyebrow",
  "pageTitle",
  "heroTitle",
  "pageDesc",
  "headingGradient",
  "sectionTitle",
  "iconBadgeTeal",
  "iconBadge",
  "tableHead",
  "tableRowHover",
  "statCard",
  "skipLink",
  "focusRing",
  "gridPattern",
]);

const SIMPLE_REPLACEMENTS = [
  [/border-\[var\(--edu-border\)\]/g, "border-border"],
  [/divide-\[var\(--edu-border\)\]/g, "divide-border"],
  [/bg-\[var\(--edu-surface-elevated\)\]/g, "bg-surface-elevated"],
  [/bg-\[var\(--edu-surface\)\]/g, "bg-surface"],
  [/bg-\[var\(--edu-input-bg\)\]/g, "bg-input"],
  [/bg-\[var\(--edu-nav-bg\)\]/g, "bg-nav"],
  [/bg-\[var\(--edu-card-bg\)\]/g, "bg-card"],
  [/bg-\[var\(--edu-card-header-bg\)\]/g, "bg-card-header"],
  [/text-\[var\(--edu-text-primary\)\]/g, "text-foreground"],
  [/text-\[var\(--edu-text-secondary\)\]/g, "text-secondary-foreground"],
  [/text-\[var\(--edu-text-muted\)\]/g, "text-muted-foreground"],
  [/text-\[var\(--edu-text-subtle\)\]/g, "text-subtle-foreground"],
  [/hover:text-\[var\(--edu-text-primary\)\]/g, "hover:text-foreground"],
  [/hover:border-\[var\(--edu-accent\)\]/g, "hover:border-accent"],
  [/focus-visible:ring-\[var\(--edu-accent\)\]/g, "focus-visible:ring-accent"],
  [/border-\[var\(--edu-btn-secondary-border\)\]/g, "border-border"],
  [/var\(--edu-blob-teal\)/g, "var(--blob-teal)"],
  [/var\(--edu-blob-indigo\)/g, "var(--blob-indigo)"],
  [/var\(--edu-blob-sky\)/g, "var(--blob-sky)"],
  [/var\(--edu-grid-line\)/g, "var(--grid-line)"],
  [/var\(--edu-bg\)/g, "var(--app-bg)"],
  [/var\(--edu-text-primary\)/g, "var(--app-text)"],
  [/var\(--edu-accent\)/g, "var(--app-accent)"],
];

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, files);
    else if (/\.(jsx?|tsx?)$/.test(entry.name)) files.push(full);
  }
  return files;
}

function tokenToExpr(token) {
  if (token.startsWith("text-") || token === "sr-only" || token === "border-border") {
    return token;
  }
  if (token.includes(".")) {
    const [obj, key] = token.split(".");
    return `${obj}.${key}`;
  }
  return token;
}

function migrateClassString(classStr) {
  const usedUi = new Set();

  const tokens = [...classStr.split(/\s+/)].filter(Boolean);
  const parts = [];

  for (const t of tokens) {
    if (TOKEN_MAP[t]) {
      const mapped = TOKEN_MAP[t];
      if (UI_IMPORTS.has(mapped.split(".")[0])) {
        parts.push(tokenToExpr(mapped));
        usedUi.add(mapped.split(".")[0]);
      } else {
        parts.push(mapped);
      }
    } else {
      parts.push(t);
    }
  }

  if (parts.length === 0) return { expr: '""', usedUi, usedCn: false };

  const usedCn = parts.some((p) => p.includes(".") || p.includes("("));
  const allSimple = parts.every(
    (p) => !p.includes(".") && !p.includes("btn.") && !p.includes("(")
  );

  if (allSimple && parts.length === 1) {
    return { expr: `"${parts[0]}"`, usedUi, usedCn: false };
  }

  if (allSimple) {
    return { expr: `"${parts.join(" ")}"`, usedUi, usedCn: false };
  }

  const cnArgs = parts.map((p) => {
    if (p.includes(".")) return p;
    if (p.startsWith('"') || p.startsWith("'")) return p;
    return `"${p}"`;
  });

  return { expr: `cn(${cnArgs.join(", ")})`, usedUi, usedCn };
}

function processFile(filePath) {
  if (filePath.includes("/lib/ui.js") || filePath.includes("/lib/cn.js")) return;
  if (filePath.endsWith("globals.css")) return;

  let content = fs.readFileSync(filePath, "utf8");
  const original = content;

  for (const [re, repl] of SIMPLE_REPLACEMENTS) {
    content = content.replace(re, repl);
  }

  const usedUi = new Set();
  let needsCn = false;

  // className="..."
  content = content.replace(
    /className="([^"]*)"/g,
    (match, classStr) => {
      if (!classStr.includes("edu-")) return match;
      const { expr, usedUi: u, usedCn } = migrateClassString(classStr);
      u.forEach((x) => usedUi.add(x));
      if (usedCn) needsCn = true;
      return `className={${expr}}`;
    }
  );

  // className='...'
  content = content.replace(
    /className='([^']*)'/g,
    (match, classStr) => {
      if (!classStr.includes("edu-")) return match;
      const { expr, usedUi: u, usedCn } = migrateClassString(classStr);
      u.forEach((x) => usedUi.add(x));
      if (usedCn) needsCn = true;
      return `className={${expr}}`;
    }
  );

  // Remaining edu- in template literals - direct token replace
  for (const [edu, mapped] of Object.entries(TOKEN_MAP).sort(
    (a, b) => b.length - a.length
  )) {
    if (content.includes(edu)) {
      const expr = tokenToExpr(mapped);
      if (UI_IMPORTS.has(mapped.split(".")[0])) {
        usedUi.add(mapped.split(".")[0]);
      }
      content = content.split(edu).join(
        UI_IMPORTS.has(mapped.split(".")[0]) && mapped.includes(".")
          ? `\${${expr}}`
          : mapped
      );
      needsCn = true;
    }
  }

  if (content === original) return;

  const uiNames = [...usedUi].sort();
  if (uiNames.length > 0 || needsCn) {
    const importLines = [];
    if (needsCn && !content.includes('from "@/lib/cn.js"')) {
      importLines.push('import { cn } from "@/lib/cn.js";');
    }
    if (uiNames.length > 0 && !content.includes('from "@/lib/ui.js"')) {
      importLines.push(`import { ${uiNames.join(", ")} } from "@/lib/ui.js";`);
    } else if (uiNames.length > 0) {
      const m = content.match(/import \{([^}]+)\} from "@\/lib\/ui\.js";/);
      if (m) {
        const existing = m[1].split(",").map((s) => s.trim()).filter(Boolean);
        const merged = [...new Set([...existing, ...uiNames])].sort();
        content = content.replace(
          /import \{[^}]+\} from "@\/lib\/ui\.js";/,
          `import { ${merged.join(", ")} } from "@/lib/ui.js";`
        );
      }
    }
    if (importLines.length > 0) {
      const firstImport = content.search(/^import /m);
      if (firstImport >= 0) {
        content =
          content.slice(0, firstImport) +
          importLines.join("\n") +
          "\n" +
          content.slice(firstImport);
      } else {
        content = importLines.join("\n") + "\n" + content;
      }
    }
  }

  fs.writeFileSync(filePath, content);
  console.log("migrated:", path.relative(process.cwd(), filePath));
}

for (const file of walk(SRC)) {
  processFile(file);
}

console.log("done");
