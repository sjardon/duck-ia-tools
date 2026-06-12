## 1. Update Repository Layout Section

- [x] 1.1 Replace the fixed `tools/` tree diagram with a flexible layout showing that tools can live at any path under `tools/` as long as they contain `meta.json`
- [x] 1.2 Update the "Tool component structure" subsection to remove the `tools/<type>/<name>/` path constraint and describe the new layout

## 2. Document the Flexible Tool Discovery Model

- [x] 2.1 Add a "Tool discovery" subsection describing the recursive `meta.json` scan over `tools/`
- [x] 2.2 Document that `name` (from `meta.json`) is the global unique identifier, not the filesystem path
- [x] 2.3 Document the startup-time duplicate-name validation: if two `meta.json` files share the same `name`, the process aborts and reports both conflicting paths

## 3. Document the kit Type

- [x] 3.1 Add a "kit type" subsection describing `type: "kit"` in `meta.json`
- [x] 3.2 Document the `components: string[]` field and how it references other tools by `name`
- [x] 3.3 Document that installing a kit installs all tools referenced in `components`
