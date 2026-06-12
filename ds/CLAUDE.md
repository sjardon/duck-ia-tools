# tasks/CLAUDE.md

Esta carpeta contiene todas las herramientas para trabajar con el workflow de duck-spec.

## Árbol de carpetas

```
/
│
│   # ── CAPA 0: Contexto global
│
├── PRODUCT.md               # Visión del producto, usuarios objetivo, objetivos de negocio
├── BACKEND.md               # Convenciones, patrones y stack del backend
├── FRONTEND.md              # Convenciones, componentes y design system del frontend
├── ARCHITECTURE.md          # Infraestructura, servicios y decisiones de despliegue  ← se actualiza en Docs
├── DOMAIN.md                # Índice/registro de todos los artefactos de dominio      ← se actualiza en Docs
│
│   # ── CAPA 1: Por módulo
│
└── modules/
    │
    ├── <module-01>/
    │   ├── FEATURES.md      # Registro de features del módulo con metadata
    │   ├── SPEC.md          # Estado funcional actual del módulo (spec viva) ← se actualiza en Docs
    │   │
    │   │   # ── CAPA 2: Por feature (Analysis → Design → Implement) ─────────
    │   │
    │   ├── <feature-01>/
    │   │   ├── analysis.md  # Razón de ser, requerimientos EARS, scope / out-of-scope
    │   │   ├── design.md    # 3 alternativas evaluadas, decisión, archivos a modificar
    │   │   └── tasks.md     # Tareas con IDs (T001…) referenciando requerimientos (R1…)
    │   │
    │   └── <feature-02>/
    │       ├── analysis.md
    │       ├── design.md
    │       └── tasks.md
    │
    └── <module-02>/
        ├── FEATURES.md
        ├── SPEC.md
        │
        └── <feature-01>/
            ├── analysis.md
            ├── design.md
            └── tasks.md
```

## Crear o modificar un módulo y FEATURES.md
- Si la iniciativa afecta a un módulo que aun NO existe -> crear un módulo nuevo y FEATURES.md.
- Si la iniciativa afecta a un módulo ya existe -> modificar el archivo FEATURES.md existente.
- Si una iniciativa nueva afecta a diferentes módulos -> crear y modificar uno o más módulos y sus archivos FEATURES.md según corresponda.
- Nunca usar un FEATURES.md para dos módulos distintos. Un módulo -> un FEATURES.md.

## Formato de FEATURES.md
**Lee el archivo de template de FEATURES [`../docs/templates/FEATURES.md`](../docs/templates/FEATURES.md)**

## Cómo modificar una feature en FEATURES.md existente
- Para agregar features nuevas: agregá al final del FEATURES.md respetando el formato
- Para cambiar el alcance de una feature existente: revisá si las features existentes siguen siendo válidas antes de agregar nuevas.
- No elimines features con Estado DONE, marcalas como DEPRECATED si ya no aplican