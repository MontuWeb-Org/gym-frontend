import fs from "fs";
import path from "path";

const messagesDir = path.join(process.cwd(), "messages");
const files = fs.readdirSync(messagesDir).filter((f) => f.endsWith(".json"));

function flattenKeys(obj, prefix = "") {
  return Object.entries(obj).flatMap(([key, value]) => {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    return typeof value === "object" && value !== null
      ? flattenKeys(value, fullKey)
      : [fullKey];
  });
}

const keySets = {};
for (const file of files) {
  const content = JSON.parse(
    fs.readFileSync(path.join(messagesDir, file), "utf-8"),
  );
  keySets[file] = new Set(flattenKeys(content));
}

const fileNames = Object.keys(keySets);
const baseFile = fileNames[0];
const baseKeys = keySets[baseFile];

let hasError = false;

for (const file of fileNames.slice(1)) {
  const currentKeys = keySets[file];

  const missing = [...baseKeys].filter((k) => !currentKeys.has(k));
  const extra = [...currentKeys].filter((k) => !baseKeys.has(k));

  if (missing.length > 0) {
    hasError = true;
    console.error(`❌ ${file} is missing keys present in ${baseFile}:`);
    missing.forEach((k) => console.error(`   - ${k}`));
  }

  if (extra.length > 0) {
    hasError = true;
    console.error(`❌ ${file} has extra keys not in ${baseFile}:`);
    extra.forEach((k) => console.error(`   - ${k}`));
  }
}

if (hasError) {
  console.error(
    "\nLocalization check failed: translation files are out of sync.",
  );
  process.exit(1);
} else {
  console.log("✅ All locale files have matching keys.");
}
