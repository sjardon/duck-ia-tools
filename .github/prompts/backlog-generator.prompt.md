# Generador de BACKLOG.md — SaaS Project

Analiza toda la conversación y genera un archivo `BACKLOG.md` con el siguiente formato y criterios.

---

## Estructura del archivo

```md
# BACKLOG — [Nombre del producto]

> Referencia principal: [archivos de referencia]
> Última actualización: [mes año] | Tareas completadas: ver `CHANGELOG.md`

---

## Leyenda de estados
- `[ ]` Pendiente
- `[x]` Completada

---

## Índice de etapas

| Etapa | Descripción | Tareas |
|-------|-------------|--------|
| [Etapa N](#anchor) | Descripción corta | TASK-01, TASK-02 |

---

## Etapa N: [Nombre]

> Descripción breve del dominio funcional que agrupa las tareas de esta etapa.

### TASK-01 — [Título]

**Estado:** `[ ]` Pendiente

**1. Objetivo**
Qué debe lograrse y por qué.

**2. Requerimientos funcionales**
- [ ] Subtarea concreta y ejecutable
- [ ] Subtarea concreta y ejecutable

**3. Consideraciones técnicas importantes**
Restricciones, efectos colaterales, tipos afectados, dependencias críticas.

**4. Documentación relevante**
- `ruta/al/archivo.ts`
```

---

## Criterios de agrupación en etapas

- Cada etapa representa un **dominio funcional cohesivo** (auth, pagos, snippet JS, métricas, email, etc.)
- Las etapas deben ser **independientes entre sí** siempre que sea posible
- El tamaño ideal de una etapa: entre 1 y 4 tareas, suficiente para un contexto de agente sin overflow
- Si una funcionalidad es grande, partirla en subtareas dentro de la misma etapa

## Criterios para cada tarea

- El **Objetivo** debe ser 2-4 oraciones: qué, por qué, valor entregado
- Los **Requerimientos funcionales** deben ser acciones atómicas en imperativo (`Eliminar`, `Crear`, `Actualizar`)
- Las **Consideraciones técnicas** deben anticipar efectos secundarios, tipos rotos, dependencias implícitas
- La **Documentación relevante** debe listar rutas de archivos reales mencionadas en la conversación

## Criterios de completitud y estado

- Marca como `[x]` solo las funcionalidades explícitamente confirmadas como terminadas en la conversación
- Si hay duda, usar `[ ]`
- Numerar etapas en orden lógico de implementación, no de discusión

## Output

Devuelve únicamente el contenido del archivo `BACKLOG.md`, sin explicaciones previas ni comentarios posteriores.