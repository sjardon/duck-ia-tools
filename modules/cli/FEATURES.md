# cli

**Scope:** Capacidades del CLI `duck` — comandos disponibles, tipos de componentes soportados, y targets de instalación hacia herramientas de AI.

---
# Lista de features:

## CLI-001 — Soporte para instrucciones instalables
**Estado:** DONE
**Contexto:** El CLI actualmente soporta instalar agentes, herramientas, hooks y skills desde el repositorio `duck-ia-tools` hacia proyectos del usuario. No existe soporte para archivos de instrucciones de proyecto (como `CLAUDE.md` para Claude Code o `.github/copilot-instructions.md` para GitHub Copilot), que son archivos que configuran el comportamiento del AI tool a nivel de proyecto.
**Objetivo:** Permitir que el CLI instale archivos de instrucciones desde el repositorio hacia el proyecto del usuario, como un nuevo tipo de componente instalable mediante el comando `duck add`.
**Requerimientos funcionales:**
- El tipo `instruction` debe ser reconocido en `meta.json` junto con un campo `destination` que define la ruta de destino por defecto en el proyecto del usuario.
- Las instrucciones soportan variantes por target (e.g., `variants/claude.md`, `variants/copilot.md`), con el mismo mecanismo que los agentes.
- El comando `duck add` acepta un flag `--dest <ruta>` para sobreescribir el destino definido en `meta.json`.
- Si el archivo de destino ya existe en el proyecto del usuario, el CLI pregunta interactivamente si desea sobreescribirlo antes de proceder.
- `ClaudeTarget` y `CopilotTarget` son actualizados para resolver e instalar componentes de tipo `instruction`.
- Se agrega `ds/CLAUDE.md` como herramienta de tipo `instruction` en `tools/`, incluida en el duck-spec kit, como ejemplo concreto del nuevo tipo.
**Requerimientos no funcionales:**
- La confirmación interactiva usa Clack, consistente con el resto del CLI.
- El campo `destination` en `meta.json` es obligatorio para el tipo `instruction`.
**Fuera de scope:**
- Merge de contenido entre la instrucción instalada y un archivo existente.
- Creación de instrucciones adicionales más allá del ejemplo de duck-spec.
- Nuevo comando CLI dedicado a instrucciones (se reutiliza el comando `add`).
**Edge cases:**
- El usuario provee `--dest` y el archivo ya existe en esa ruta → mostrar confirmación con la ruta sobreescrita.
- El `meta.json` no define `destination` para un tipo `instruction` → abortar con error descriptivo.
- El target activo no tiene variante para la instrucción → usar `instructions.md` como fallback.
- El usuario rechaza sobreescribir → instalación cancelada sin modificar el archivo existente.
**Technical constraints:**
- El campo `destination` en `meta.json` puede ser una ruta relativa al directorio raíz del proyecto del usuario.
- La precedencia es: flag `--dest` > `destination` en `meta.json`.

---

## CLI-002 — Soporte para archivos adicionales instalables en componentes
**Estado:** TODO
**Contexto:** El pipeline de instalación del CLI está construido alrededor de un único `content: string`. `FsToolsRepository.getContent()` lee un solo archivo (`instructions.md` o su variante), y el target adapter lo escribe en un único destino. Algunos componentes (como los skills `ds-analysis` y `ds-design`) incluyen archivos adicionales junto a `instructions.md` (e.g., `analysis.template.md`, `design.template.md`) que actualmente son ignorados por `duck add`.
**Objetivo:** Permitir que cualquier componente declare archivos adicionales en `meta.json` que se instalen en el mismo directorio de destino que el contenido principal al ejecutar `duck add`.
**Requerimientos funcionales:**
- `meta.json` acepta un campo opcional `"files": string[]` con rutas de archivos relativas al directorio del componente.
- `FsToolsRepository` expone los archivos adicionales declarados en `"files"` junto al contenido principal.
- `InstallOptions` e `ITargetAdapter` reciben la lista de archivos adicionales (nombre + contenido).
- `ClaudeTarget` escribe cada archivo adicional en el mismo directorio de destino que el contenido principal, para todos los tipos de componente (`agent`, `skill`, `instruction`, `hook`, `mcp-server`).
- Los skills `ds-analysis` y `ds-design` declaran sus templates en sus respectivos `meta.json` usando el nuevo campo `"files"`.
**Requerimientos no funcionales:**
- Si un archivo declarado en `"files"` no existe en disco, la instalación aborta con un error descriptivo que identifica el archivo faltante y el componente.
**Fuera de scope:**
- Destino personalizado por archivo adicional (todos se instalan en el mismo directorio que el contenido principal).
- Auto-discovery de archivos (solo se instalan los declarados explícitamente en `"files"`).
- Variantes por target para archivos adicionales.
- Confirmación interactiva de sobreescritura para archivos adicionales.
**Edge cases:**
- `"files"` omitido o vacío → comportamiento sin cambios, no se instala ningún archivo adicional.
- Un archivo declarado en `"files"` no existe en disco → abortar instalación con error descriptivo.
- El archivo adicional ya existe en el destino → sobreescribir sin confirmación (mismo comportamiento que el contenido principal para `agent` y `skill`).
**Technical constraints:**
- Las rutas en `"files"` son relativas al directorio del componente en el repositorio.
- Los archivos adicionales no soportan variantes por target; se instala el archivo tal cual.
