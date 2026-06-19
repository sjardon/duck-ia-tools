import type { AdditionalFile } from "./IToolsRepository.js";

export interface InstallOptions {
  toolName: string;
  toolType: string;
  content: string;
  projectPath: string;
  destination?: string;
  additionalFiles: AdditionalFile[];
}

export interface ITargetAdapter {
  name: string;
  install(options: InstallOptions): Promise<void>;
}
