import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import { mkdir, writeFile, rm } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { FsToolsRepository } from "./FsToolsRepository.js";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function makeMeta(
  dir: string,
  meta: Partial<{
    name: string;
    type: string;
    description: string;
    tags: string[];
    targets: string[];
    components: string[];
  }>
): Promise<void> {
  await mkdir(dir, { recursive: true });
  await writeFile(join(dir, "meta.json"), JSON.stringify(meta), "utf-8");
}

async function makeFile(filePath: string, content: string): Promise<void> {
  await mkdir(join(filePath, ".."), { recursive: true });
  await writeFile(filePath, content, "utf-8");
}

// ---------------------------------------------------------------------------
// Test suite
// ---------------------------------------------------------------------------

describe("FsToolsRepository", () => {
  // -------------------------------------------------------------------------
  // listAll() — discovery and path population
  // -------------------------------------------------------------------------
  describe("listAll()", () => {
    let toolsRoot: string;

    before(async () => {
      toolsRoot = join(tmpdir(), `duck-test-listAll-${Date.now()}`);

      // tools/analysts/openapi  (depth 2)
      await makeMeta(join(toolsRoot, "analysts", "openapi"), {
        name: "openapi-analyst",
        type: "agent",
        description: "OpenAPI analyst",
        tags: ["api"],
        targets: ["claude"],
      });

      // tools/hooks/pre-commit  (depth 1)
      await makeMeta(join(toolsRoot, "hooks", "pre-commit"), {
        name: "pre-commit-hook",
        type: "hook",
        description: "Pre-commit hook",
        tags: [],
        targets: ["claude"],
      });

      // tools/a/b/c  (depth 3 — arbitrary nesting)
      await makeMeta(join(toolsRoot, "a", "b", "c"), {
        name: "deep-tool",
        type: "skill",
        description: "Deeply nested tool",
        tags: [],
        targets: ["claude"],
      });

      // a directory WITHOUT meta.json — should be silently skipped
      await mkdir(join(toolsRoot, "no-meta-dir"), { recursive: true });
    });

    after(async () => {
      await rm(toolsRoot, { recursive: true, force: true });
    });

    it("discovers tools at arbitrary nested paths", async () => {
      const repo = new FsToolsRepository(toolsRoot);
      const tools = await repo.listAll();
      const names = tools.map((t) => t.name).sort();
      assert.deepEqual(names, ["deep-tool", "openapi-analyst", "pre-commit-hook"]);
    });

    it("populates path as relative from toolsPath — depth-2 tool", async () => {
      const repo = new FsToolsRepository(toolsRoot);
      const tools = await repo.listAll();
      const tool = tools.find((t) => t.name === "openapi-analyst");
      assert.ok(tool, "openapi-analyst should be found");
      assert.equal(tool.path, join("analysts", "openapi"));
    });

    it("populates path as relative from toolsPath — depth-1 tool", async () => {
      const repo = new FsToolsRepository(toolsRoot);
      const tools = await repo.listAll();
      const tool = tools.find((t) => t.name === "pre-commit-hook");
      assert.ok(tool, "pre-commit-hook should be found");
      assert.equal(tool.path, join("hooks", "pre-commit"));
    });

    it("populates path as relative from toolsPath — depth-3 tool", async () => {
      const repo = new FsToolsRepository(toolsRoot);
      const tools = await repo.listAll();
      const tool = tools.find((t) => t.name === "deep-tool");
      assert.ok(tool, "deep-tool should be found");
      assert.equal(tool.path, join("a", "b", "c"));
    });

    it("does not emit an entry for directories without meta.json", async () => {
      const repo = new FsToolsRepository(toolsRoot);
      const tools = await repo.listAll();
      const hasNoMeta = tools.some((t) => t.path === "no-meta-dir");
      assert.equal(hasNoMeta, false);
    });

    it("returns empty array when toolsPath does not exist", async () => {
      const repo = new FsToolsRepository(join(tmpdir(), "nonexistent-dir-duck-test"));
      const tools = await repo.listAll();
      assert.deepEqual(tools, []);
    });
  });

  // -------------------------------------------------------------------------
  // listAll() — duplicate name validation
  // -------------------------------------------------------------------------
  describe("listAll() — duplicate name detection", () => {
    let toolsRoot: string;

    before(async () => {
      toolsRoot = join(tmpdir(), `duck-test-duplicates-${Date.now()}`);

      // Two meta.json files sharing the same name
      await makeMeta(join(toolsRoot, "agents", "analyst"), {
        name: "shared-name",
        type: "agent",
        description: "First",
        tags: [],
        targets: [],
      });
      await makeMeta(join(toolsRoot, "skills", "analyst"), {
        name: "shared-name",
        type: "skill",
        description: "Second",
        tags: [],
        targets: [],
      });
    });

    after(async () => {
      await rm(toolsRoot, { recursive: true, force: true });
    });

    it("throws when two meta.json files share the same name", async () => {
      const repo = new FsToolsRepository(toolsRoot);
      await assert.rejects(() => repo.listAll(), {
        message: /Duplicate tool names detected/,
      });
    });

    it("error message includes both conflicting paths", async () => {
      const repo = new FsToolsRepository(toolsRoot);
      let thrownError: Error | null = null;
      try {
        await repo.listAll();
      } catch (err) {
        thrownError = err as Error;
      }
      assert.ok(thrownError, "should have thrown");
      assert.match(thrownError.message, /agents[/\\]analyst[/\\]meta\.json/);
      assert.match(thrownError.message, /skills[/\\]analyst[/\\]meta\.json/);
    });
  });

  // -------------------------------------------------------------------------
  // getContent() — content resolved via meta.path
  // -------------------------------------------------------------------------
  describe("getContent()", () => {
    let toolsRoot: string;

    before(async () => {
      toolsRoot = join(tmpdir(), `duck-test-getContent-${Date.now()}`);

      // Tool with both a variant file and an instructions.md
      const deepDir = join(toolsRoot, "analyst", "openapi");
      await makeMeta(deepDir, {
        name: "openapi-analyst",
        type: "agent",
        description: "OpenAPI analyst",
        tags: [],
        targets: ["claude", "copilot"],
      });
      await makeFile(join(deepDir, "variants", "claude.md"), "# Claude variant content");
      await makeFile(join(deepDir, "instructions.md"), "# Fallback instructions");

      // Tool with only instructions.md (no variant)
      const simpleDir = join(toolsRoot, "hooks", "pre-commit");
      await makeMeta(simpleDir, {
        name: "pre-commit-hook",
        type: "hook",
        description: "Pre-commit hook",
        tags: [],
        targets: ["claude"],
      });
      await makeFile(join(simpleDir, "instructions.md"), "# Pre-commit instructions");
    });

    after(async () => {
      await rm(toolsRoot, { recursive: true, force: true });
    });

    it("resolves content via meta.path for a deeply nested tool", async () => {
      const repo = new FsToolsRepository(toolsRoot);
      const content = await repo.getContent("openapi-analyst", "claude");
      assert.equal(content, "# Claude variant content");
    });

    it("variant file takes precedence over instructions.md", async () => {
      const repo = new FsToolsRepository(toolsRoot);
      const content = await repo.getContent("openapi-analyst", "claude");
      // Should return variant, not instructions
      assert.equal(content, "# Claude variant content");
      assert.notEqual(content, "# Fallback instructions");
    });

    it("falls back to instructions.md when variant does not exist", async () => {
      const repo = new FsToolsRepository(toolsRoot);
      const content = await repo.getContent("pre-commit-hook", "claude");
      assert.equal(content, "# Pre-commit instructions");
    });

    it("throws when name is not found", async () => {
      const repo = new FsToolsRepository(toolsRoot);
      await assert.rejects(() => repo.getContent("nonexistent-tool", "claude"), {
        message: /Tool "nonexistent-tool" not found/,
      });
    });
  });
});
