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
