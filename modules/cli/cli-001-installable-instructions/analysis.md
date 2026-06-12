# CLI-001 — Soporte para instrucciones instalables

## Reason for being

El CLI `duck` actualmente soporta instalar agentes, herramientas, hooks y skills desde el repositorio `duck-ia-tools` hacia proyectos del usuario. No existe soporte para archivos de instrucciones de proyecto (como `CLAUDE.md` para Claude Code o `.github/copilot-instructions.md` para GitHub Copilot), que son archivos que configuran el comportamiento del AI tool a nivel de proyecto.

El objetivo es habilitar que el CLI instale archivos de instrucciones desde el repositorio hacia el proyecto del usuario, como un nuevo tipo de componente instalable reutilizando el comando `duck add`, incluyendo soporte para variantes por target, destino configurable y confirmación interactiva ante sobreescritura.

## Scope

Los requerimientos cubren: (1) introducir el tipo de componente `instruction` con su campo `destination` en `meta.json`, (2) extender el comando `duck add` con el flag `--dest` y la confirmación interactiva de sobreescritura, (3) actualizar los targets `ClaudeTarget` y `CopilotTarget` para resolver e instalar instrucciones con variantes y fallback, y (4) incorporar `ds/CLAUDE.md` como ejemplo concreto del nuevo tipo dentro del duck-spec kit.

## Out of scope

- Merge de contenido entre la instrucción instalada y un archivo existente en el proyecto del usuario.
- Creación de instrucciones adicionales más allá del ejemplo `ds/CLAUDE.md` del duck-spec.
- Nuevo comando CLI dedicado a instrucciones (se reutiliza el comando `add`).

## Functional requirements

| ID | EARS type | Statement |
|---|---|---|
| R001 | Ubiquitous | The system shall recognize `instruction` as a valid component type in `meta.json` alongside the existing types (agent, tool, hook, skill, kit). |
| R002 | Ubiquitous | The system shall read a `destination` field from `meta.json` for components of type `instruction`, representing the default install path relative to the user's project root. |
| R003 | Ubiquitous | The system shall support per-target variants for `instruction` components (e.g., `variants/claude.md`, `variants/copilot.md`) using the same resolution mechanism applied to agents. |
| R004 | Event-driven | WHEN the user runs `duck add` with the flag `--dest <path>`, the system shall use `<path>` as the install destination instead of the value defined in `meta.json`. |
| R005 | Event-driven | WHEN `duck add` is invoked to install an `instruction` component and the resolved destination file already exists in the user's project, the system shall interactively prompt the user to confirm overwriting before writing the file. |
| R006 | Conditional | IF the user confirms overwrite at the prompt, THEN the system shall write the instruction content to the resolved destination, replacing the existing file. |
| R007 | Conditional | IF the user rejects overwrite at the prompt, THEN the system shall cancel the installation for that component without modifying the existing file. |
| R008 | Ubiquitous | The system shall update `ClaudeTarget` to resolve and install components of type `instruction`, selecting the `claude` variant when available. |
| R009 | Ubiquitous | The system shall update `CopilotTarget` to resolve and install components of type `instruction`, selecting the `copilot` variant when available. |
| R010 | Conditional | IF the active target does not have a matching variant file for an `instruction` component, THEN the system shall fall back to `instructions.md` as the content source. |
| R011 | Ubiquitous | The system shall add `ds/CLAUDE.md` as a component of type `instruction` under `tools/`, and include it in the duck-spec kit. |
| R012 | Conditional | IF both `--dest` and `destination` in `meta.json` are provided, THEN the system shall apply the precedence `--dest` > `destination`. |

## Non-functional requirements

| ID | Statement |
|---|---|
| NF001 | The interactive overwrite confirmation shall be implemented using Clack, consistent with the rest of the CLI's interactive prompts. |
| NF002 | The `destination` field shall be mandatory for components of type `instruction`; its absence is a registry/validation error. |

## Edge cases

| ID | Description |
|---|---|
| EC001 | The user provides `--dest <path>` and the file already exists at that path → the system shows the overwrite confirmation referencing the overridden path (not the `meta.json` default). |
| EC002 | The `meta.json` of an `instruction` component does not define `destination` → the system aborts the install with a descriptive error identifying the offending component. |
| EC003 | The active target (e.g., Copilot) has no variant file for the instruction → the system uses `instructions.md` as the fallback content source. |
| EC004 | The user rejects the overwrite confirmation → the installation is cancelled for that component, the existing file remains unchanged, and the CLI reports the cancellation. |

## Technical constraints

- El campo `destination` en `meta.json` puede ser una ruta relativa al directorio raíz del proyecto del usuario.
- La precedencia de resolución del destino de instalación es: flag `--dest` > campo `destination` en `meta.json`.
- La resolución de variantes para componentes `instruction` reutiliza el mismo mecanismo ya implementado para componentes `agent` (no se introduce un nuevo resolver).
