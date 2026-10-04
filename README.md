# 🌐 Simulador de Flujo Máximo — Algoritmo de Ford-Fulkerson

Proyecto grupal para la visualización, experimentación y resolución de problemas de **Flujo Máximo** en redes mediante el algoritmo de **Ford-Fulkerson**.

## 🚀 Estado del Proyecto

### Fase 1: Estructura Base y Nodos
- Panel de configuración lateral en HTML5 / CSS3 (Flexbox).
- Generación dinámica de nodos distribuidos circularmente (7 a 16 vértices).
- Modal interactivo de advertencias para validaciones de entrada.

### Fase 2: Gestión y Renderizado de Aristas
- **Modo Manual:** Conexión de pares de nodos con validación de rangos, pesos (1 - 9999) y prevención de auto-bucles o aristas duplicadas.
- **Modo Aleatorio:** Generación automática de aristas dirigidas sin ciclos directos.
- **Renderizado Vectorial en SVG:**
  - Marcadores de flechas direccionales y puntos de inicio con código de colores.
  - Curvatura automática mediante curvas Bézier cuadráticas para aristas bidireccionales evitando solapamientos.
  - Etiquetas centradas de relación `flujo/capacidad`.

### Fase 3: Configuración de Fuente, Sumidero y Algoritmos de Grafos (DFS / BFS)
- **Definición de Nodos Clave:** Asignación visual de nodo Fuente (verde) y nodo Sumidero (rojo).
- **Detección de Ciclos (DFS):** Búsqueda en profundidad con seguimiento de 3 estados para evitar ciclos dirigidos en la red.
- **Validación de Conectividad Residual (BFS):** Búsqueda en anchura para comprobar la existencia de caminos aumentantes con capacidad residual positiva.

### Fase 4: Ejecución Interactiva del Algoritmo de Ford-Fulkerson
- **Selección Interactiva de Caminos:** Trazado de rutas aumentantes haciendo clic directamente sobre los nodos en el SVG (resaltados en morado).
- **Verificación de Rutas:** Validación de camino completo desde la Fuente al Sumidero y comprobación de capacidad residual disponible en cada tramo.
- **Cálculo de Cuello de Botella:** Desafío interactivo para ingresar la capacidad mínima del camino seleccionado y actualización acumulada del Flujo Total.
- **Semáforo Dinámico de Saturación:** Coloreado de aristas según el nivel de utilización (negro = 0%, verde ≤ 30%, naranja < 100%, rojo = 100% saturado).
- **Finalización y Reporte de Resultados:** Detección automática de terminación mediante BFS cuando no quedan más caminos residuales, con desglose detallado de todos los caminos utilizados.

## 🛠️ Tecnologías
- HTML5
- CSS3
- JavaScript (ES6+)
- SVG (Scalable Vector Graphics)
