## Purpose

Defines the flexible tool registry model: any directory under `tools/` containing a `meta.json` is a discoverable tool component. The `name` field in `meta.json` is the global unique identifier. Duplicate names are detected at startup and cause the process to abort. The `kit` type groups tools by name reference for composite installs.

## Requirements

### Requirement: Any directory with meta.json is a discoverable tool
The architecture SHALL define that any directory anywhere under `tools/` that contains a `meta.json` file is a valid tool component. There is no restriction on the directory path or depth. The fixed top-level type subdirectories (`agents/`, `hooks/`, `skills/`, `mcp-servers/`) are no longer present in the repository — tools live directly under `tools/<name>/` or at any nested path.

#### Scenario: Tool at arbitrary nested path is valid
- **WHEN** a directory exists at any path under `tools/` and contains a `meta.json` file
- **THEN** the system SHALL recognize it as a discoverable tool component regardless of parent directory names

#### Scenario: Directory without meta.json is not a tool
- **WHEN** a directory under `tools/` does not contain a `meta.json` file
- **THEN** the system SHALL NOT treat it as a tool component

#### Scenario: Tool at flat path tools/<name> is valid
- **WHEN** a tool directory exists directly under `tools/` (e.g., `tools/analyst/meta.json`)
- **THEN** the system SHALL discover it and its `ToolMeta.path` SHALL be `"analyst"` (single segment, no type prefix)

### Requirement: name is the global unique identifier for tools
The architecture SHALL define that the `name` field in `meta.json` is the global unique identifier for a tool across the entire repository. The filesystem path is secondary — used for content resolution — but `name` is what callers and consumers reference.

#### Scenario: Tool referenced by name not by path
- **WHEN** any part of the system (CLI, kit, configuration) needs to reference a tool
- **THEN** it SHALL do so by `name`, not by filesystem path

#### Scenario: Two tools with different paths but same name is invalid
- **WHEN** two `meta.json` files under `tools/` declare the same `name` value
- **THEN** the system SHALL treat this as an invalid state and MUST NOT load either tool silently

### Requirement: Duplicate name causes startup failure with both paths reported
The architecture SHALL define that, on service/CLI startup, if two or more tools share the same `name`, the process MUST abort and emit an error message that includes both (all) conflicting filesystem paths. Silently picking one or ignoring duplicates is not allowed.

#### Scenario: Startup aborts on duplicate name
- **WHEN** the tool discovery scan finds two `meta.json` files with the same `name`
- **THEN** the process SHALL abort startup (non-zero exit) before serving any command

#### Scenario: Error message identifies both conflicting paths
- **WHEN** a duplicate `name` is detected at startup
- **THEN** the error message SHALL include the full relative paths of both conflicting `meta.json` files so the operator can locate and resolve the conflict

### Requirement: ToolMeta carries the tool's filesystem path
The `ToolMeta` data structure SHALL include a `path` field of type `string` that holds the tool's location relative to the `tools/` root directory (e.g. `"analyst/openapi"`). This field is used for content resolution in place of reconstructing paths from `type`.

#### Scenario: ToolMeta path field is present on every tool
- **WHEN** a tool is retrieved from the registry (via `listAll()` or `getByName()`)
- **THEN** the returned `ToolMeta` object SHALL have a non-empty `path` field reflecting the tool's relative directory under `tools/`

#### Scenario: Path field contains relative path from tools root
- **WHEN** a tool lives at `tools/analyst/openapi/meta.json`
- **THEN** its `ToolMeta.path` SHALL be `"analyst/openapi"` (relative, no leading slash, no trailing slash)

#### Scenario: Path field is injected by the repository, not read from meta.json
- **WHEN** a `meta.json` file is parsed during the recursive scan
- **THEN** the `path` field in the resulting `ToolMeta` SHALL be set to the directory's relative path from the `tools/` root, regardless of whether `path` is present in the raw `meta.json`

### Requirement: ToolMeta type union includes "kit"
The `type` field on `ToolMeta` SHALL accept `"kit"` as a valid value in addition to the existing values (`"agent"`, `"hook"`, `"skill"`, `"mcp-server"`).

#### Scenario: Kit meta.json is deserialized into ToolMeta with type kit
- **WHEN** a `meta.json` with `"type": "kit"` is read from disk
- **THEN** the resulting `ToolMeta` object SHALL have `type === "kit"`

### Requirement: ToolMeta exposes optional components list for kits
The `ToolMeta` data structure SHALL include an optional `components` field of type `string[]`. This field is only meaningful when `type === "kit"` and lists the `name` values of tools to install as part of the kit.

#### Scenario: Kit ToolMeta has components populated
- **WHEN** a kit `meta.json` is read that includes a `components` array
- **THEN** the resulting `ToolMeta` SHALL have `components` set to that array of name strings

#### Scenario: Non-kit ToolMeta does not require components
- **WHEN** a `meta.json` with any type other than `"kit"` is read
- **THEN** the resulting `ToolMeta` MAY have `components` as `undefined` and the system SHALL NOT require it to be present

### Requirement: kit type groups tool components by name reference
The architecture SHALL define a `kit` as a tool whose `meta.json` has `type: "kit"` and a `components: string[]` field. Each entry in `components` is a tool `name`. A kit does not install its own content; it installs all tools referenced by its `components` list.

#### Scenario: Kit meta.json structure is valid
- **WHEN** a `meta.json` has `type: "kit"` and a non-empty `components` array of tool name strings
- **THEN** the system SHALL recognize it as a valid kit definition

#### Scenario: Kit install resolves component names to tool content
- **WHEN** a user installs a kit
- **THEN** the system SHALL resolve each name in `components` to its corresponding tool and install that tool's content for the requested target

#### Scenario: Kit component referencing unknown name fails
- **WHEN** a `components` entry in a kit refers to a `name` that does not match any discovered tool
- **THEN** the system SHALL report an error identifying the unresolved name and the kit that referenced it

### Requirement: FsToolsRepository discovers tools via recursive scan
`FsToolsRepository.listAll()` SHALL walk the entire `tools/` directory tree recursively, finding every directory that contains a `meta.json` file. The walk SHALL NOT be restricted to any set of top-level subdirectories.

#### Scenario: Tool at arbitrary depth is discovered
- **WHEN** a `meta.json` file exists at `tools/a/b/c/meta.json`
- **THEN** `listAll()` SHALL include the corresponding `ToolMeta` in its result

#### Scenario: Tool at root level of tools is discovered
- **WHEN** a `meta.json` file exists at `tools/my-tool/meta.json`
- **THEN** `listAll()` SHALL include the corresponding `ToolMeta` in its result

#### Scenario: Directories without meta.json are skipped
- **WHEN** a directory under `tools/` does not contain a `meta.json`
- **THEN** `listAll()` SHALL NOT emit a `ToolMeta` entry for that directory

### Requirement: FsToolsRepository validates name uniqueness and aborts on duplicates
`FsToolsRepository.listAll()` SHALL, after completing the recursive scan, check that all discovered `ToolMeta` entries have unique `name` values. If two or more entries share the same `name`, it SHALL throw an `Error` before returning any results. The error message SHALL include all filesystem paths that share the conflicting name.

#### Scenario: Duplicate name causes listAll to throw
- **WHEN** two `meta.json` files under `tools/` declare the same `name` value
- **THEN** `listAll()` SHALL throw an `Error` and SHALL NOT return a partial result

#### Scenario: Error message identifies all conflicting paths
- **WHEN** a duplicate `name` is detected
- **THEN** the thrown error message SHALL include the relative paths of every `meta.json` that shares the conflicting name

### Requirement: FsToolsRepository resolves content using ToolMeta.path
`FsToolsRepository.getContent(name, target)` SHALL resolve the tool's directory using the `path` field of the corresponding `ToolMeta` (obtained via `getByName(name)`) rather than by iterating a hardcoded list of type subdirectories.

#### Scenario: Content resolved via path for deeply nested tool
- **WHEN** a tool at `tools/analyst/openapi/` is requested via `getContent("openapi-analyst", target)`
- **THEN** the content SHALL be read from `tools/analyst/openapi/variants/<target>.md` or `tools/analyst/openapi/instructions.md`

#### Scenario: getContent throws when tool name is not found
- **WHEN** `getContent` is called with a `name` that does not match any discovered tool
- **THEN** it SHALL throw an `Error` identifying the tool name
