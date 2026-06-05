#!/usr/bin/env node
import { fileURLToPath } from "url";
import path from "path";
import { Command } from "commander";
import { FsToolsRepository } from "./shared/repositories/FsToolsRepository.js";
import { ClaudeTarget } from "./infrastructure/targets/ClaudeTarget.js";
import { CopilotTarget } from "./infrastructure/targets/CopilotTarget.js";
import { registerListCommand } from "./commands/list/handler.js";
import { registerAddCommand } from "./commands/add/handler.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Running from packages/cli/dist/index.js — monorepo root is three levels up
const toolsPath = path.resolve(__dirname, "..", "..", "..", "tools");

const repository = new FsToolsRepository(toolsPath);
const claudeTarget = new ClaudeTarget();
const copilotTarget = new CopilotTarget();

const program = new Command();

program
  .name("duck")
  .description("Install AI coding components into your AI tools")
  .version("0.1.0");

registerListCommand(program, repository);
registerAddCommand(program, repository, [claudeTarget, copilotTarget]);

program.parse();
