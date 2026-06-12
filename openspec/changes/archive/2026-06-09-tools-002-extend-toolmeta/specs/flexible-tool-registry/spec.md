## ADDED Requirements

### Requirement: ToolMeta carries the tool's filesystem path
The `ToolMeta` data structure SHALL include a `path` field of type `string` that holds the tool's location relative to the `tools/` root directory (e.g. `"analyst/openapi"`). This field is used for content resolution in place of reconstructing paths from `type`.

#### Scenario: ToolMeta path field is present on every tool
- **WHEN** a tool is retrieved from the registry (via `listAll()` or `getByName()`)
- **THEN** the returned `ToolMeta` object SHALL have a non-empty `path` field reflecting the tool's relative directory under `tools/`

#### Scenario: Path field contains relative path from tools root
- **WHEN** a tool lives at `tools/analyst/openapi/meta.json`
- **THEN** its `ToolMeta.path` SHALL be `"analyst/openapi"` (relative, no leading slash, no trailing slash)

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
