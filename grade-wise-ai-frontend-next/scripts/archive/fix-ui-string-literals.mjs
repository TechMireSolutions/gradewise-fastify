#!/usr/bin/env node
/** Convert className={"page ..."} string literals back to ui.js token references. */
import fs from "node:fs";
import path from "node:path";

const SRC = path.join(process.cwd(), "src");

const UI_TOKENS = new Set([
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

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, files);
    else if (/\.(jsx?|tsx?)$/.test(entry.name)) files.push(full);
  }
  return files;
}

function literalToCn(inner) {
  const parts = inner.trim().split(/\s+/).filter(Boolean);
  const exprs = parts.map((p) => (UI_TOKENS.has(p) ? p : `"${p}"`));
  if (exprs.length === 1) return `{${exprs[0]}}`;
  return `{cn(${exprs.join(", ")})}`;
}

function ensureImports(content, tokens) {
  const needed = [...tokens].filter((t) => UI_TOKENS.has(t)).sort();
  if (needed.length === 0) return content;

  const usesCn = content.includes("cn(");
  let result = content;

  if (usesCn && !result.includes('from "@/lib/cn.js"')) {
    const firstImport = result.search(/^import /m);
    result =
      result.slice(0, firstImport) +
      'import { cn } from "@/lib/cn.js";\n' +
      result.slice(firstImport);
  }

  const uiMatch = result.match(/import \{([^}]+)\} from "@\/lib\/ui\.js";/);
  const uiNeeded = needed.filter((t) => t !== "btn" || result.includes("btn."));
  const uniqueNeeded = [...new Set(uiNeeded)];

  if (uiMatch) {
    const existing = uiMatch[1]
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const merged = [...new Set([...existing, ...uniqueNeeded])].sort();
    result = result.replace(
      /import \{[^}]+\} from "@\/lib\/ui\.js";/,
      `import { ${merged.join(", ")} } from "@/lib/ui.js";`
    );
  } else if (uniqueNeeded.length > 0) {
    const firstImport = result.search(/^import /m);
    const line = `import { ${uniqueNeeded.join(", ")} } from "@/lib/ui.js";\n`;
    if (firstImport >= 0) {
      result = result.slice(0, firstImport) + line + result.slice(firstImport);
    } else {
      result = line + result;
    }
  }

  return result;
}

function processFile(filePath) {
  if (filePath.includes("/lib/ui.js")) return;

  let content = fs.readFileSync(filePath, "utf8");
  const original = content;
  const usedTokens = new Set();

  content = content.replace(/className=\{"([^"]+)"\}/g, (match, inner) => {
    const parts = inner.trim().split(/\s+/).filter(Boolean);
    parts.forEach((p) => {
      if (UI_TOKENS.has(p)) usedTokens.add(p);
    });
    return `className=${literalToCn(inner)}`;
  });

  // Fix template literals like `input ${errors.email ? "inputError" : ""}`
  content = content.replace(
    /className=\{`input \$\{([^}]+) \? "inputError" : ""\}`\}/g,
    (match, cond) => {
      usedTokens.add("input");
      usedTokens.add("inputError");
      return `className={cn(input, ${cond.trim()} && inputError)}`;
    }
  );

  // Fix AuthCardHeader broken refs
  content = content.replace(/className=\{"iconBadgeTeal/g, () => {
    usedTokens.add("iconBadgeTeal");
    return "className={cn(iconBadgeTeal";
  });
  content = content.replace(/className=\{"headingGradient"\}/g, () => {
    usedTokens.add("headingGradient");
    return "className={headingGradient}";
  });

  if (content === original) return;

  content = ensureImports(content, usedTokens);
  fs.writeFileSync(filePath, content);
  console.log("fixed:", path.relative(process.cwd(), filePath));
}

for (const file of walk(SRC)) {
  processFile(file);
}

console.log("done");
