export interface ToolMeta {
  name: string;
  type: "agent" | "hook" | "skill" | "mcp-server";
  description: string;
  tags: string[];
  targets: string[];
}

export interface IToolsRepository {
  listAll(): Promise<ToolMeta[]>;
  getByName(name: string): Promise<ToolMeta | null>;
  getContent(name: string, target: string): Promise<string>;
}
