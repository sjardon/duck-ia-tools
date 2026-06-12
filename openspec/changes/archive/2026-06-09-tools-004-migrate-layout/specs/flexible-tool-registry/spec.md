## MODIFIED Requirements

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
