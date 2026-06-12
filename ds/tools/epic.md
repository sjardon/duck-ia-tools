# Flexible Tool Registry y Kits

**Módulo:** tools / cli
**Objetivo:** Reemplazar la estructura de directorios fija (`agents/`, `hooks/`, etc.) por un registry dinámico que descubre tools recursivamente por `meta.json`, valida unicidad de `name` al inicio, y agrega el tipo `kit` para agrupar componentes relacionados.
**Estado:** active

---

## TOOLS-001 — Documentar nuevo modelo de directorio en ARCHITECTURE.md
**Estado:** DONE
**Objetivo:** Actualizar la arquitectura para reflejar el nuevo modelo antes de tocar código: scan recursivo, `name` como identificador único global, tipo `kit`, y validación al inicio del servicio.
**Requerimientos funcionales:**
- Describir que cualquier directorio con `meta.json` es una tool, sin restricción de path
- Documentar que `name` es el identificador único global (no el path)
- Documentar el comportamiento de fallo en startup ante `name` duplicado (indicando ambos paths)
- Documentar el tipo `kit` y el campo `components: string[]` que referencia tools por `name`
- Actualizar el diagrama de layout del repositorio en `tools/`
**Documentación relevante:** docs/ARCHITECTURE.md

---

## TOOLS-002 — Extender interfaz ToolMeta
**Estado:** DONE
**Objetivo:** Agregar los campos necesarios para soportar el nuevo modelo: `path` para localización en disco, `"kit"` como valor válido de `type`, y `components` para kits.
**Requerimientos funcionales:**
- Agregar `path: string` (relativo a la raíz de `tools/`, ej: `"analyst/openapi"`)
- Extender el union de `type` para incluir `"kit"`
- Agregar campo opcional `components?: string[]` (solo relevante cuando `type === "kit"`)
**Documentación relevante:** docs/ARCHITECTURE.md
**Dependencias:** TOOLS-001

---

## TOOLS-003 — Refactorizar FsToolsRepository con scan recursivo
**Estado:** DONE
**Objetivo:** Eliminar la constante `TOOL_TYPES` hardcodeada y reemplazar la lógica de discovery por un walk recursivo que registra toda tool con `meta.json`, valida unicidad de `name`, y resuelve contenido por `path`.
**Requerimientos funcionales:**
- `listAll()`: walk recursivo de `tools/`, parsear cada `meta.json` encontrado, poblar `path` con la ruta relativa al directorio raíz de tools
- Validación de unicidad: si dos `meta.json` tienen el mismo `name`, lanzar error indicando ambos paths
- `getContent(name, target)`: resolver el directorio por `path` del `ToolMeta` en lugar de iterar `TOOL_TYPES`
- La validación debe ejecutarse en el primer uso de `listAll()` (lazy) o en la construcción del repositorio
**Documentación relevante:** docs/ARCHITECTURE.md, packages/cli/src/shared/repositories/FsToolsRepository.ts, packages/cli/src/shared/interfaces/IToolsRepository.ts
**Dependencias:** TOOLS-002

---

## TOOLS-004 — Migrar estructura de tools/ al nuevo layout flexible
**Estado:** DONE
**Objetivo:** Reorganizar el directorio `tools/` eliminando las carpetas de tipo forzado (`agents/`, `hooks/`, etc.) y mover cada tool a un path que refleje su organización lógica.
**Requerimientos funcionales:**
- Mover el contenido de `tools/agents/*`, `tools/hooks/*`, `tools/skills/*`, `tools/mcp-servers/*` al nuevo layout (puede ser flat o con subcarpetas temáticas)
- Cada `meta.json` debe tener `name` único y explícito
- Verificar que el CLI levanta correctamente y no reporta duplicados tras la migración
**Documentación relevante:** docs/ARCHITECTURE.md
**Dependencias:** TOOLS-003
