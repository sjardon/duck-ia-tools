import type {
  IAddToolsRepository,
  ITargetAdapter,
  InstallOptions,
} from "./interfaces/IAddRepository.js";

export class AddUseCase {
  constructor(
    private readonly repository: IAddToolsRepository,
    private readonly adapters: ITargetAdapter[],
  ) {}

  async execute(toolName: string, targetName: string, dest?: string): Promise<void> {
    const tool = await this.repository.getByName(toolName);
    if (!tool) {
      throw new Error(`Tool "${toolName}" not found.`);
    }

    if (!tool.targets.includes(targetName)) {
      throw new Error(
        `Tool "${toolName}" is not compatible with target "${targetName}". Compatible targets: ${tool.targets.join(", ")}.`,
      );
    }

    if (tool.type === "kit") {
      for (const componentName of tool.components ?? []) {
        await this.execute(componentName, targetName);
      }
      return;
    }

    const content = await this.repository.getContent(toolName, targetName);

    const adapter = this.adapters.find((a) => a.name === targetName);
    if (!adapter) {
      throw new Error(`No adapter found for target "${targetName}".`);
    }

    const options: InstallOptions = {
      toolName: tool.name,
      toolType: tool.type,
      content,
      projectPath: process.cwd(),
      destination: dest ?? tool.destination,
    };

    await adapter.install(options);
  }
}
