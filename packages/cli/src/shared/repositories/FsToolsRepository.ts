import { readdir, readFile } from "fs/promises";
import { join, relative } from "path";
import type { IToolsRepository, ToolMeta } from "../interfaces/IToolsRepository.js";

export class FsToolsRepository implements IToolsRepository {
  constructor(private readonly toolsPath: string) {}

  private async walkForMetaFiles(dir: string): Promise<string[]> {
    const found: string[] = [];

    let entries;
    try {
      entries = await readdir(dir, { withFileTypes: true });
    } catch {
      return found;
    }

    for (const entry of entries) {
      if (!entry.isDirectory()) continue;

      const subDir = join(dir, entry.name);
      const metaPath = join(subDir, "meta.json");

      // Check if this directory contains a meta.json
      try {
        await readFile(metaPath, "utf-8");
        found.push(metaPath);
      } catch {
        // No meta.json in this directory; still recurse
      }

      // Recurse regardless of whether meta.json was found here
      const nested = await this.walkForMetaFiles(subDir);
      found.push(...nested);
    }

    return found;
  }

  async listAll(): Promise<ToolMeta[]> {
    const metaPaths = await this.walkForMetaFiles(this.toolsPath);
    const results: ToolMeta[] = [];

    for (const metaPath of metaPaths) {
      try {
        const raw = await readFile(metaPath, "utf-8");
        const parsed = JSON.parse(raw) as ToolMeta;
        const toolDir = join(metaPath, "..");
        parsed.path = relative(this.toolsPath, toolDir);
        results.push(parsed);
      } catch {
        continue;
      }
    }

    // Validate name uniqueness
    const byName = new Map<string, string[]>();
    for (const meta of results) {
      const paths = byName.get(meta.name) ?? [];
      paths.push(join(meta.path, "meta.json"));
      byName.set(meta.name, paths);
    }

    const duplicates: string[] = [];
    for (const [name, paths] of byName) {
      if (paths.length > 1) {
        duplicates.push(`"${name}": ${paths.join(", ")}`);
      }
    }

    if (duplicates.length > 0) {
      throw new Error(
        `Duplicate tool names detected in ${this.toolsPath}:\n${duplicates.join("\n")}`
      );
    }

    return results;
  }

  async getByName(name: string): Promise<ToolMeta | null> {
    const all = await this.listAll();
    return all.find((tool) => tool.name === name) ?? null;
  }

  async getContent(name: string, target: string): Promise<string> {
    const meta = await this.getByName(name);

    if (meta === null) {
      throw new Error(`Tool "${name}" not found in ${this.toolsPath}`);
    }

    const toolDir = join(this.toolsPath, meta.path);

    const variantPath = join(toolDir, "variants", `${target}.md`);
    try {
      return await readFile(variantPath, "utf-8");
    } catch {
      // fall through to instructions.md
    }

    const instructionsPath = join(toolDir, "instructions.md");
    return await readFile(instructionsPath, "utf-8");
  }
}
