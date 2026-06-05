import type { IListToolsRepository, ToolMeta } from "./interfaces/IListToolsRepository.js";

export class ListToolsUseCase {
  constructor(private readonly repository: IListToolsRepository) {}

  async execute(): Promise<Record<string, ToolMeta[]>> {
    const tools = await this.repository.listAll();

    const grouped: Record<string, ToolMeta[]> = {};
    for (const tool of tools) {
      if (!grouped[tool.type]) {
        grouped[tool.type] = [];
      }
      grouped[tool.type].push(tool);
    }

    return grouped;
  }
}
