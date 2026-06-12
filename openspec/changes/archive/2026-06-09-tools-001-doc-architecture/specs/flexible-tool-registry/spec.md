## ADDED Requirements

### Requirement: Any directory with meta.json is a discoverable tool
The architecture SHALL define that any directory anywhere under `tools/` that contains a `meta.json` file is a valid tool component. There is no restriction on the directory path or depth. The fixed top-level type subdirectories (`agents/`, `hooks/`, `skills/`, `mcp-servers/`) are no longer the canonical organization unit.

#### Scenario: Tool at arbitrary nested path is valid
- **WHEN** a directory exists at any path under `tools/` and contains a `meta.json` file
- **THEN** the system SHALL recognize it as a discoverable tool component regardless of parent directory names

#### Scenario: Directory without meta.json is not a tool
- **WHEN** a directory under `tools/` does not contain a `meta.json` file
- **THEN** the system SHALL NOT treat it as a tool component

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
