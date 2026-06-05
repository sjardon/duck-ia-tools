import type { Command } from "commander";
import { intro, outro, log } from "@clack/prompts";
import type { IListToolsRepository } from "./interfaces/IListToolsRepository.js";
import { ListToolsUseCase } from "./list.useCase.js";

export function registerListCommand(program: Command, repository: IListToolsRepository): void {
  program
    .command("list")
    .description("List all available duck tools")
    .action(async () => {
      intro("duck list");

      const useCase = new ListToolsUseCase(repository);
      const grouped = await useCase.execute();

      const types = Object.keys(grouped);

      if (types.length === 0) {
        log.info("No tools found.");
      } else {
        for (const type of types) {
          log.step(type);
          for (const tool of grouped[type]) {
            const targets = tool.targets.length > 0 ? ` [${tool.targets.join(", ")}]` : "";
            log.message(`  • ${tool.name} — ${tool.description}${targets}`);
          }
        }
      }

      outro("Done");
    });
}
