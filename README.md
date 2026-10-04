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
- **Renderizado Vectorial Avanzado en SVG:**
  - Marcadores de flechas direccionales y puntos de inicio.
  - Curvatura automática mediante curvas Bézier cuadráticas para aristas bidireccionales/opuestas evitando superposiciones.
  - Etiquetas centradas de peso y capacidad (`flujo/peso`).

## 🛠️ Tecnologías
- HTML5
- CSS3
- JavaScript (ES6+)
- SVG (Scalable Vector Graphics)
