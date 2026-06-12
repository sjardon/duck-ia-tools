import type { Command } from "commander";
import { select, spinner, intro, outro, log, confirm } from "@clack/prompts";
import { existsSync } from "fs";
import { join } from "path";
import type { IAddToolsRepository, ITargetAdapter } from "./interfaces/IAddRepository.js";
import { AddUseCase } from "./add.useCase.js";

export function registerAddCommand(
  program: Command,
  repository: IAddToolsRepository,
  adapters: ITargetAdapter[],
): void {
  program
    .command("add [tool]")
    .description("Install an AI component into your AI tool")
    .option("--target <target>", "Target AI tool to install into")
    .option("--dest <path>", "Override install destination path")
    .action(async (tool: string | undefined, options: { target?: string; dest?: string }) => {
      intro("duck add");

      const useCase = new AddUseCase(repository, adapters);

      let toolName = tool;

      if (!toolName) {
        const tools = await repository.listAll();

        if (tools.length === 0) {
          log.error("No tools available.");
          process.exit(1);
        }

        const chosen = await select({
          message: "Which component do you want to install?",
          options: tools.map((t) => ({
            value: t.name,
            label: t.name,
            hint: t.description,
          })),
        });

        if (typeof chosen !== "string") {
          log.warn("Cancelled.");
          process.exit(0);
        }

        toolName = chosen;
      }

      let targetName = options.target;

      if (!targetName) {
        const toolMeta = await repository.getByName(toolName);

        if (!toolMeta) {
          log.error(`Tool "${toolName}" not found.`);
          process.exit(1);
        }

        if (toolMeta.targets.length === 0) {
          log.error(`Tool "${toolName}" has no available targets.`);
          process.exit(1);
        }

        const chosenTarget = await select({
          message: "Which AI tool do you want to install it into?",
          options: toolMeta.targets.map((t) => ({ value: t, label: t })),
        });

        if (typeof chosenTarget !== "string") {
          log.warn("Cancelled.");
          process.exit(0);
        }

        targetName = chosenTarget;
      }

      const toolMeta = await repository.getByName(toolName);

      let resolvedDest: string | undefined;
      if (toolMeta) {
        resolvedDest = options.dest ?? toolMeta.destination;
      }

      if (toolMeta?.type === "instruction" && resolvedDest !== undefined) {
        const absoluteDest = join(process.cwd(), resolvedDest);
        if (existsSync(absoluteDest)) {
          const shouldOverwrite = await confirm({
            message: `"${resolvedDest}" already exists. Overwrite?`,
          });
          if (shouldOverwrite !== true) {
            log.warn("Installation cancelled.");
            process.exit(0);
          }
        }
      }

      const s = spinner();
      s.start(`Installing "${toolName}" into "${targetName}"...`);

      try {
        await useCase.execute(toolName, targetName, resolvedDest);
        s.stop(`"${toolName}" installed successfully into "${targetName}".`);
        outro("Done!");
      } catch (err) {
        s.stop("Installation failed.");
        log.error(err instanceof Error ? err.message : String(err));
        process.exit(1);
      }
    });
}
