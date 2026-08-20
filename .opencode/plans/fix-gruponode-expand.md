# Plan: Corregir expand/collapse en GrupoNode

## Problema
El click en los nodos de bienes (GrupoNode) no funciona para expandir/colapsar la lista de bienes individuales.

## Causa Raíz
Hay **doble manejo de eventos** que causa que el toggle se ejecute dos veces:
1. El `onClick` del header div (línea 473) llama `data.__onToggle?.(id)`
2. El `onNodeClick` de ReactFlow (líneas 722-726) TAMBIÉN llama `toggleGroup(node.id)`

Cuando ambos se ejecutan, el estado se alterna dos veces (expand -> colapsa inmediatamente), haciendo parecer que no pasó nada.

## Archivo a Modificar
`artifacts/sigpic/src/pages/diagramas.tsx`

## Cambio 1: Remover onClick duplicado del header

**Ubicación**: Líneas 471-475 (GrupoNode)

**Antes**:
```tsx
<div
  className="w-full flex items-center gap-2 px-3 py-2.5 cursor-pointer select-none text-left"
  onClick={(e) => { e.stopPropagation(); data.__onToggle?.(id); }}
  onPointerDown={(e) => { e.stopPropagation(); }}
>
```

**Después**:
```tsx
<div
  className="w-full flex items-center gap-2 px-3 py-2.5 cursor-pointer select-none text-left"
  onClick={() => data.__onToggle?.(id)}
  onPointerDown={(e) => e.stopPropagation()}
>
```

**Explicación**:
- Se remueve `e.stopPropagation()` del `onClick` para permitir que el evento llegue a ReactFlow
- Se mantiene `onPointerDown` con `stopPropagation` para prevenir drag en edit mode
- El `onClick` ahora solo llama al toggle sin interferir

## Cambio 2 (Alternativo): Simplificar el flujo

Si el cambio anterior no funciona, la alternativa es remover completamente el `onClick` del header y dejar que ReactFlow maneje todo via `onNodeClick`:

**Después**:
```tsx
<div
  className="w-full flex items-center gap-2 px-3 py-2.5 cursor-pointer select-none text-left"
  onPointerDown={(e) => e.stopPropagation()}
>
```

## Cambio 3: Verificar onNodeClick

Asegurar que el handler en líneas 722-726 funcione correctamente:

```tsx
const onNodeClick = useCallback((_: any, node: Node) => {
  if (node.type === 'grupo') {
    toggleGroup(node.id);
  }
}, [toggleGroup]);
```

Este handler ya está correcto, solo necesita que el evento click llegue sin ser bloqueado.

## Verificación
1. Hacer click en un nodo de bienes (GrupoNode)
2. Verificar que se expande mostrando la lista de bienes individuales
3. Hacer click nuevamente
4. Verificar que se colapsa
5. Verificar que el estado se persiste en localStorage
6. Verificar que click en un bien individual navega a `/bienes/{id}`
