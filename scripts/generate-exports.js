import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.join(__dirname, "../dist/plugins/markdown");
const rootDir = path.join(__dirname, "..");

// Get all .d.ts files except utils
const files = fs
  .readdirSync(distDir)
  .filter((f) => f.endsWith(".d.ts") && !f.startsWith("utils"))
  .map((f) => f.replace(".d.ts", ""));

// Generate index.js
const indexJs = files
  .map(
    (file) =>
      `export { ${toCamelCase(file)} } from "./dist/plugins/markdown/${file}.js";`
  )
  .join("\n");

fs.writeFileSync(path.join(rootDir, "index.js"), indexJs + "\n");
console.log(`✓ Generated index.js with ${files.length} exports`);

// Generate index.d.ts
const indexDts = files
  .map(
    (file) =>
      `export { ${toCamelCase(file)} } from "./dist/plugins/markdown/${file}";`
  )
  .join("\n");

fs.writeFileSync(path.join(rootDir, "index.d.ts"), indexDts + "\n");
console.log(`✓ Generated index.d.ts with ${files.length} exports`);

// Convert file names to camelCase export names
function toCamelCase(str) {
  return str
    .split("-")
    .map((word, i) => {
      if (i === 0) return word;
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join("");
}
