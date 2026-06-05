import { readdir, readFile, stat } from "fs/promises";
import { join } from "path";
import type { IToolsRepository, ToolMeta } from "../interfaces/IToolsRepository.js";

const TOOL_TYPES = ["agents", "hooks", "skills", "mcp-servers"] as const;

export class FsToolsRepository implements IToolsRepository {
  constructor(private readonly toolsPath: string) {}

  async listAll(): Promise<ToolMeta[]> {
    const results: ToolMeta[] = [];

    for (const type of TOOL_TYPES) {
      const typeDir = join(this.toolsPath, type);

      let entries: string[];
      try {
        entries = await readdir(typeDir);
      } catch {
        continue;
      }

      for (const entry of entries) {
        const entryPath = join(typeDir, entry);
        let entryStat;
        try {
          entryStat = await stat(entryPath);
        } catch {
          continue;
        }
        if (!entryStat.isDirectory()) continue;

        const metaPath = join(entryPath, "meta.json");
        try {
          const raw = await readFile(metaPath, "utf-8");
          const meta: ToolMeta = JSON.parse(raw);
          results.push(meta);
        } catch {
          continue;
        }
      }
    }

    return results;
  }

  async getByName(name: string): Promise<ToolMeta | null> {
    const all = await this.listAll();
    return all.find((tool) => tool.name === name) ?? null;
  }

  async getContent(name: string, target: string): Promise<string> {
    for (const type of TOOL_TYPES) {
      const toolDir = join(this.toolsPath, type, name);

      let dirStat;
      try {
        dirStat = await stat(toolDir);
      } catch {
        continue;
      }
      if (!dirStat.isDirectory()) continue;

      const variantPath = join(toolDir, "variants", `${target}.md`);
      try {
        return await readFile(variantPath, "utf-8");
      } catch {
        // fall through to instructions.md
      }

      const instructionsPath = join(toolDir, "instructions.md");
      return await readFile(instructionsPath, "utf-8");
    }

    throw new Error(`Tool "${name}" not found in ${this.toolsPath}`);
  }
}
