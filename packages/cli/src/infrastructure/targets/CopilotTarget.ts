import { mkdir, appendFile, writeFile } from "fs/promises";
import { existsSync } from "fs";
import { join, dirname } from "path";
import type { ITargetAdapter, InstallOptions } from "../../shared/interfaces/ITargetAdapter.js";

export class CopilotTarget implements ITargetAdapter {
  name = "copilot";

  async install(options: InstallOptions): Promise<void> {
    const { toolType, content, projectPath } = options;

    if (toolType === "instruction") {
      if (!options.destination) {
        throw new Error("destination is required for instruction type");
      }
      const absoluteDestination = join(projectPath, options.destination);
      await mkdir(dirname(absoluteDestination), { recursive: true });
      await writeFile(absoluteDestination, content, "utf8");
      return;
    }

    const githubDir = join(projectPath, ".github");
    const filePath = join(githubDir, "copilot-instructions.md");

    await mkdir(githubDir, { recursive: true });

    if (existsSync(filePath)) {
      await appendFile(filePath, `\n\n---\n\n${content}`, "utf8");
    } else {
      await writeFile(filePath, `# Copilot Instructions\n\n${content}`, "utf8");
    }
  }
}
