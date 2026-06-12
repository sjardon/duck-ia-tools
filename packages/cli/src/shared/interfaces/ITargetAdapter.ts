export interface InstallOptions {
  toolName: string;
  toolType: string;
  content: string;
  projectPath: string;
  destination?: string;
}

export interface ITargetAdapter {
  name: string;
  install(options: InstallOptions): Promise<void>;
}
