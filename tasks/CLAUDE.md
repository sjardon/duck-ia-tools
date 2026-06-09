# tasks/CLAUDE.md

# Crear o modificar épicas
1. Si la iniciativa afecta a un módulo para el cual NO existe una épica aun -> crear una épica nueva.
2. Si la iniciativa afecta a un módulo para el cual ya existe una épica -> modificar una épica existente.
3. Si una iniciativa nueva afecta a diferentes módulos -> crear y modificar una o más épicas según corresponda.
4. Nunca usar una mísma épica para dos módulos distintos. Un módulo -> una épica.

## Formato de epic.md
**Lee el archivo de template de epicas [`../docs/templates/epic.md`](../docs/templates/epic.md)**

## Cómo crear una épica nueva
1. Conversá la iniciativa con Claude hasta tener claro: objetivo, módulo al que pertenece y lista de tareas
2. Creá `tasks/<epic>/epic.md` con el formato estándar
3. Cada tarea debe tener: Estado, Objetivo, Requerimientos funcionales, Documentación relevante

## Cómo modificar una épica existente
- Para agregar tareas: agregá al final del epic.md respetando el formato
- Para cambiar el alcance: revisá si las tareas existentes siguen siendo válidas antes de agregar nuevas
- No elimines tareas con Estado DONE, marcalas como DEPRECATED si ya no aplican

## Convención de tareas
- El prefijo del task-id debe coincidir con el nombre de la carpeta en mayúsculas. Ej: tasks/auth/ → AUTH-001, AUTH-002
