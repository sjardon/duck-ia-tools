## MODIFIED Requirements

### Requirement: ToolMeta carries the tool's filesystem path
The `ToolMeta` data structure SHALL include a `path` field of type `string` that holds the tool's location relative to the `tools/` root directory (e.g. `"analyst/openapi"`). This field is populated by the repository at deserialization time during the recursive scan and is used for content resolution in place of reconstructing paths from `type`.

#### Scenario: ToolMeta path field is present on every tool
- **WHEN** a tool is retrieved from the registry (via `listAll()` or `getByName()`)
- **THEN** the returned `ToolMeta` object SHALL have a non-empty `path` field reflecting the tool's relative directory under `tools/`

#### Scenario: Path field contains relative path from tools root
- **WHEN** a tool lives at `tools/analyst/openapi/meta.json`
- **THEN** its `ToolMeta.path` SHALL be `"analyst/openapi"` (relative, no leading slash, no trailing slash)

#### Scenario: Path field is injected by the repository, not read from meta.json
- **WHEN** a `meta.json` file is parsed during the recursive scan
- **THEN** the `path` field in the resulting `ToolMeta` SHALL be set to the directory's relative path from the `tools/` root, regardless of whether `path` is present in the raw `meta.json`

## ADDED Requirements

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
