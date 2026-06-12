## 1. Recursive Walk Helper

- [x] 1.1 Add a private `walkForMetaFiles(dir: string): Promise<string[]>` method that recursively traverses a directory and returns the absolute paths of all `meta.json` files found at any depth
- [x] 1.2 Ensure the walk skips non-directory entries and silently continues on permission/stat errors (matching current error-handling style)

## 2. Refactor listAll()

- [x] 2.1 Remove the `TOOL_TYPES` constant
- [x] 2.2 Replace the type-loop body with a call to `walkForMetaFiles(this.toolsPath)` to collect all `meta.json` paths
- [x] 2.3 For each found `meta.json`, parse its content and inject `path` as the relative path of its parent directory from `this.toolsPath` (use `path.relative`)
- [x] 2.4 After building the full list, validate name uniqueness: group entries by `name`, and if any group has more than one entry, throw an `Error` listing the conflicting relative `meta.json` paths

## 3. Refactor getContent()

- [x] 3.1 Remove the `TOOL_TYPES` iteration loop from `getContent`
- [x] 3.2 Replace it with a call to `this.getByName(name)` to retrieve the `ToolMeta`
- [x] 3.3 If `getByName` returns `null`, throw `Error: Tool "${name}" not found in ${this.toolsPath}` (same message as before)
- [x] 3.4 Use `meta.path` to construct the tool directory path (`join(this.toolsPath, meta.path)`) and resolve the variant or instructions file as before

## 4. Tests

- [x] 4.1 Write unit tests for `listAll()`: verify tools at arbitrary nested paths are discovered and `path` is populated correctly
- [x] 4.2 Write unit test: two `meta.json` files with the same `name` cause `listAll()` to throw with both paths in the error message
- [x] 4.3 Write unit test for `getContent()`: content is resolved via `meta.path`, not via type iteration; verify variant file takes precedence over `instructions.md`
- [x] 4.4 Write unit test for `getContent()`: throws when `name` is not found
