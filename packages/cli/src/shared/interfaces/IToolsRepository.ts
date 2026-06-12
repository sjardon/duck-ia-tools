export interface ToolMeta {
  name: string;
  type: "agent" | "hook" | "skill" | "mcp-server" | "kit" | "instruction";
  description: string;
  tags: string[];
  targets: string[];
  path: string;
  components?: string[];
  destination?: string;
}

export interface IToolsRepository {
  listAll(): Promise<ToolMeta[]>;
  getByName(name: string): Promise<ToolMeta | null>;
  getContent(name: string, target: string): Promise<string>;
}
