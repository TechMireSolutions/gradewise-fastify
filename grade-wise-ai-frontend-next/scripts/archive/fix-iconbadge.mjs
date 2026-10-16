#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const SRC = path.join(process.cwd(), "src");

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, files);
    else if (/\.(jsx?|tsx?)$/.test(entry.name)) files.push(full);
  }
  return files;
}

function ensureImports(content) {
  let result = content;
  result = result.replace(/, cn(?=,|\s*\} from "@\/lib\/ui\.js")/g, "");
  result = result.replace(/\{\s*cn,\s*/g, "{ ");
  result = result.replace(/,\s*cn\s*\}/g, " }");

  if (result.includes("iconBadge") && !result.includes('from "@/lib/ui.js"')) {
    const line = 'import { iconBadge } from "@/lib/ui.js";\n';
    const first = result.search(/^import /m);
    result = first >= 0 ? result.slice(0, first) + line + result.slice(first) : line + result;
  } else if (result.includes("${iconBadge}") || result.includes("iconBadge")) {
    const m = result.match(/import \{([^}]+)\} from "@\/lib\/ui\.js";/);
    if (m && !m[1].includes("iconBadge")) {
      const merged = [...m[1].split(",").map((s) => s.trim()).filter(Boolean), "iconBadge"].sort();
      result = result.replace(
        /import \{[^}]+\} from "@\/lib\/ui\.js";/,
        `import { ${merged.join(", ")} } from "@/lib/ui.js";`
      );
    }
  }

  if ((result.includes("cn(") || result.includes("${iconBadge}")) && !result.includes('from "@/lib/cn.js"')) {
    const line = 'import { cn } from "@/lib/cn.js";\n';
    const first = result.search(/^import /m);
    result = first >= 0 ? result.slice(0, first) + line + result.slice(first) : line + result;
  }

  return result;
}

function fixIconBadge(content) {
  return content.replace(
    /className="([^"]*?)\$\{iconBadge\}([^"]*?)"/g,
    (_, before, after) => {
      const parts = [...before.trim().split(/\s+/), "iconBadge", ...after.trim().split(/\s+/)].filter(Boolean);
      const unique = parts.filter((p, i) => p !== "p-2.5" && p !== "p-3" && p !== "rounded-xl" || i === parts.indexOf(p));
      const exprs = unique.map((p) => (p === "iconBadge" ? "iconBadge" : `"${p}"`));
      return `className={cn(${exprs.join(", ")})}`;
    }
  ).replace(
    /iconClass:\s*"([^"]*?)\$\{iconBadge\}([^"]*?)"/g,
    (_, before, after) => {
      const extras = [before.trim(), after.trim()].filter(Boolean).map((e) => `"${e}"`).join(", ");
      return extras ? `iconClass: cn(iconBadge, ${extras})` : "iconClass: iconBadge";
    }
  ).replace(
    /iconBg:\s*"\$\{iconBadge\}"/g,
    "iconBg: iconBadge"
  ).replace(
    /:\s*"\$\{iconBadge\}"/g,
    ": iconBadge"
  ).replace(
    /\$\{iconBadge\}/g,
    ""
  );
}

for (const file of walk(SRC)) {
  if (!fs.readFileSync(file, "utf8").includes("${iconBadge}") && !fs.readFileSync(file, "utf8").includes(", cn } from \"@/lib/ui.js\"")) continue;
  let content = fs.readFileSync(file, "utf8");
  const original = content;
  content = fixIconBadge(content);
  content = ensureImports(content);
  if (content !== original) {
    fs.writeFileSync(file, content);
    console.log("fixed:", path.relative(process.cwd(), file));
  }
}

console.log("done");
