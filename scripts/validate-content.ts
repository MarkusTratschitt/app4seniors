import { readFile, readdir, stat } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

import { validateHowTo } from "../lib/validateHowTo";

const HOWTO_ROOT = path.resolve(process.cwd(), "content", "howtos");

async function collectJsonFiles(dir: string): Promise<string[]> {
  const entries = await readdir(dir);
  const files: string[] = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry);
    const info = await stat(fullPath);
    if (info.isDirectory()) {
      files.push(...(await collectJsonFiles(fullPath)));
    } else if (info.isFile() && entry.toLowerCase().endsWith(".json")) {
      files.push(fullPath);
    }
  }

  return files;
}

async function loadJson(filePath: string): Promise<unknown> {
  const content = await readFile(filePath, "utf-8");
  try {
    return JSON.parse(content);
  } catch (error) {
    throw new Error(`JSON in Datei ${filePath} ist ungültig: ${(error as Error).message}`);
  }
}

async function main() {
  const files = await collectJsonFiles(HOWTO_ROOT);
  if (files.length === 0) {
    console.info("Keine HowTo-Dateien gefunden.");
    return;
  }

  const errors: string[] = [];

  for (const file of files.sort()) {
    const payload = await loadJson(file);
    const result = validateHowTo(payload);
    if (!result.valid) {
      errors.push(`❌ ${path.relative(process.cwd(), file)}:`, ...result.errors.map((message) => `   - ${message}`));
    } else {
      console.info(`✅ ${path.relative(process.cwd(), file)} gültig.`);
    }
  }

  if (errors.length > 0) {
    console.error("Die folgenden Inhalte sind fehlerhaft:");
    errors.forEach((line) => console.error(line));
    process.exitCode = 1;
    return;
  }

  console.info("Alle HowTo-Dateien sind gültig.");
}

main().catch((error) => {
  console.error("Inhalt konnte nicht validiert werden.", error);
  process.exitCode = 1;
});
