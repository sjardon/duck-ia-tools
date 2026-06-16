import { mkdir, readFile, writeFile } from "fs/promises";
import { existsSync } from "fs";
import { join, dirname } from "path";
import type { ITargetAdapter, InstallOptions } from "../../shared/interfaces/ITargetAdapter.js";

export class ClaudeTarget implements ITargetAdapter {
  name = "claude";

  async install(options: InstallOptions): Promise<void> {
    const { toolType, content, projectPath } = options;

    if (toolType === "agent") {
      await this.installAgent(projectPath, options.toolName, content);
    } else if (toolType === "skill") {
      await this.installSkill(projectPath, content);
    } else if (toolType === "hook") {
      await this.updateSettingsHooks(projectPath, content);
    } else if (toolType === "mcp-server") {
      await this.updateSettingsMcpServers(projectPath, content);
    } else if (toolType === "instruction") {
      if (!options.destination) {
        throw new Error("destination is required for instruction type");
      }
      const absoluteDestination = join(projectPath, options.destination);
      await this.writeInstruction(absoluteDestination, content);
    }
  }

  private async writeInstruction(absoluteDestination: string, content: string): Promise<void> {
    await mkdir(dirname(absoluteDestination), { recursive: true });
    await writeFile(absoluteDestination, content, "utf8");
  }

  private async installAgent(projectPath: string, toolName: string, content: string): Promise<void> {
    const agentDir = join(projectPath, ".claude", "agents");
    await mkdir(agentDir, { recursive: true });
    await writeFile(join(agentDir, `${toolName}.md`), content, "utf8");
  }

  private async installSkill(projectPath: string, content: string): Promise<void> {
    const nameMatch = content.match(/^name:\s*(.+)$/m);
    const skillName = nameMatch?.[1]?.trim();
    if (!skillName) {
      throw new Error("Skill content is missing the required 'name' frontmatter field");
    }
    const skillDir = join(projectPath, ".claude", "skills", skillName);
    await mkdir(skillDir, { recursive: true });
    await writeFile(join(skillDir, "SKILL.md"), content, "utf8");
  }

  private async readSettings(settingsPath: string): Promise<Record<string, unknown>> {
    if (existsSync(settingsPath)) {
      const raw = await readFile(settingsPath, "utf8");
      return JSON.parse(raw) as Record<string, unknown>;
    }
    return { hooks: {} };
  }

  private async writeSettings(settingsPath: string, data: Record<string, unknown>): Promise<void> {
    await mkdir(dirname(settingsPath), { recursive: true });
    await writeFile(settingsPath, JSON.stringify(data, null, 2), "utf8");
  }

  private async updateSettingsHooks(projectPath: string, content: string): Promise<void> {
    const settingsPath = join(projectPath, ".claude", "settings.json");
    const settings = await this.readSettings(settingsPath);

    const parsed = JSON.parse(content) as Record<string, unknown>;
    const existingHooks = (settings.hooks ?? {}) as Record<string, unknown>;
    settings.hooks = { ...existingHooks, ...parsed };

    await this.writeSettings(settingsPath, settings);
  }

  private async updateSettingsMcpServers(projectPath: string, content: string): Promise<void> {
    const settingsPath = join(projectPath, ".claude", "settings.json");
    const settings = await this.readSettings(settingsPath);

    const parsed = JSON.parse(content) as unknown;
    const existing = Array.isArray(settings.mcpServers) ? settings.mcpServers : [];
    settings.mcpServers = [...existing, parsed];

    await this.writeSettings(settingsPath, settings);
  }
}
