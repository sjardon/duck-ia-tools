# CLI-002 — Soporte para archivos adicionales instalables en componentes

## Reason for being

El pipeline de instalación del CLI `duck` está construido alrededor de un único `content: string`. `FsToolsRepository.getContent()` lee un solo archivo (`instructions.md` o su variante) y el target adapter lo escribe en un único destino. Algunos componentes (como los skills `ds-analysis` y `ds-design`) incluyen archivos adicionales junto a `instructions.md` (por ejemplo, `analysis.template.md`, `design.template.md`) que actualmente son ignorados por `duck add`, lo que produce instalaciones incompletas para esos componentes.

El objetivo es permitir que cualquier componente declare en su `meta.json` archivos adicionales que el CLI instalará en el mismo directorio de destino que el contenido principal cuando se ejecute `duck add`.

## Scope

Los requerimientos cubren la extensión de `meta.json` con un campo opcional `"files"`, la propagación de esos archivos a través del repositorio (`FsToolsRepository`), las interfaces de instalación (`InstallOptions`, `ITargetAdapter`), la escritura efectiva por parte de `ClaudeTarget` para todos los tipos de componente soportados, y la actualización de los skills `ds-analysis` y `ds-design` para usar el nuevo campo. También se cubre el manejo de errores cuando un archivo declarado no existe en disco.

## Out of scope

- Destino personalizado por archivo adicional (todos se instalan en el mismo directorio que el contenido principal).
- Auto-discovery de archivos (solo se instalan los declarados explícitamente en `"files"`).
- Variantes por target para archivos adicionales.
- Confirmación interactiva de sobreescritura para archivos adicionales.

## Functional requirements

| ID | EARS type | Statement |
|---|---|---|
| R001 | Ubiquitous | The system shall accept an optional `"files": string[]` field in `meta.json` whose entries are file paths relative to the component directory. |
| R002 | Event-driven | WHEN `FsToolsRepository` resolves a component, the system shall expose the additional files declared in `"files"` alongside the main content, each entry containing file name and content. |
| R003 | Ubiquitous | The system shall extend `InstallOptions` and `ITargetAdapter` so that the list of additional files (name + content) is passed to the target adapter during installation. |
| R004 | Event-driven | WHEN `ClaudeTarget` installs a component of type `agent`, `skill`, `instruction`, `hook`, or `mcp-server`, the system shall write each additional file into the same destination directory as the main content. |
| R005 | Ubiquitous | The system shall declare the templates of the `ds-analysis` and `ds-design` skills in their respective `meta.json` using the `"files"` field. |
| R006 | Conditional | IF a file declared in `"files"` does not exist on disk, THEN the system shall abort the installation with a descriptive error that identifies both the missing file and the component. |

## Non-functional requirements

| ID | Statement |
|---|---|
| NF001 | When aborting due to a missing additional file, the system shall produce an error message that includes the component name and the missing file path so the operator can diagnose it without further inspection. |

## Edge cases

| ID | Description |
|---|---|
| EC001 | WHEN `"files"` is omitted or is an empty array in `meta.json`, the system shall complete installation with unchanged behavior and shall not install any additional file. |
| EC002 | WHEN a path listed in `"files"` does not exist on disk at install time, the system shall abort the installation with a descriptive error identifying the missing file and the component, and shall not write the main content nor any additional file. |
| EC003 | WHEN an additional file already exists at the destination path, the system shall overwrite it without interactive confirmation (same behavior as the main content for `agent` and `skill`). |

## Technical constraints

- Las rutas declaradas en `"files"` son relativas al directorio del componente en el repositorio `duck-ia-tools`.
- Los archivos adicionales no soportan variantes por target; se instala el archivo tal cual desde el repositorio.
- La precedencia de capas debe respetarse: el useCase no importa desde `repositories/` ni desde `infrastructure/` directamente; las implementaciones concretas se inyectan en `index.ts`.
- Los archivos adicionales se instalan en el mismo directorio de destino que el contenido principal, sin posibilidad de override por archivo.
