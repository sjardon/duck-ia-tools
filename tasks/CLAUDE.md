# tasks/CLAUDE.md

## Cómo crear una épica nueva
1. Conversá la iniciativa con Claude hasta tener claro: objetivo, módulo al que pertenece y lista de tareas
2. Creá `tasks/<epic>/epic.md` con el formato estándar
3. Cada tarea debe tener: Estado, Objetivo, Requerimientos funcionales, Documentación relevante

## Cómo modificar una épica existente
- Para agregar tareas: agregá al final del epic.md respetando el formato
- Para cambiar el alcance: revisá si las tareas existentes siguen siendo válidas antes de agregar nuevas
- No elimines tareas con Estado DONE, marcalas como DEPRECATED si ya no aplican

## Formato de epic.md
[...]

## Convención de IDs
El prefijo del task-id debe coincidir con el nombre de la carpeta en mayúsculas.
Ej: tasks/auth/ → AUTH-001, AUTH-002