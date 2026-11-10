# 🌐 Simulador de Flujo Máximo — Algoritmo de Ford-Fulkerson

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![SVG](https://img.shields.io/badge/SVG-Vector_Graphics-FFB13B?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)

https://flujo-maximo-sem7-grupo-9.netlify.app/

Una herramienta web interactiva y pedagógica desarrollada en **JavaScript Vanilla**, **HTML5** y **SVG** para modelar redes de transporte, configurar fuentes y sumideros, y resolver problemas de **Flujo Máximo** paso a paso mediante el **Algoritmo de Ford-Fulkerson**.

---

## 📌 Descripción del Proyecto

Este proyecto permite visualizar, experimentar y aprender de forma didáctica la teoría de redes y optimización de flujo máximo. El usuario puede diseñar un grafo dirigido de forma manual o generarlo proceduralmente, definir el nodo origen (**Fuente**) y destino (**Sumidero**), e interactuar directamente con la interfaz seleccionando caminos aumentantes y calculando cuellos de botella en tiempo real.

Ideal para estudiantes y docentes de **Investigación de Operaciones**, **Optimización**, **Teoría de Grafos** y **Estructuras de Datos y Algoritmos**.

---

## ✨ Características Principales

- **🔢 Configuración Dinámica de Vértices y Layout Horizontal:**
  - Soporta entre 7 y 16 nodos distribuidos ordenadamente de izquierda a derecha ($X_{\min}$ para fuentes, $X_{\max}$ para sumideros) con arrastre interactivo (*Drag & Drop*).
- **🌟 Reducción Canónica Multifuente y Multisumidero:**
  - **Detección Automática:** Analiza grados ($\text{in-degree} = 0 \land \text{out-degree} > 0$ para fuentes; $\text{out-degree} = 0 \land \text{in-degree} > 0$ para sumideros).
  - **Inyección de Nodos Ficticios:** Si se detectan $\ge 2$ fuentes, agrega automáticamente una **Fuente Ficticia ($S$)** conectada a cada fuente original con capacidad infinita ($\infty$). Si se detectan $\ge 2$ sumideros, agrega automáticamente un **Sumidero Ficticio ($T$)** con aristas desde cada sumidero original con capacidad infinita ($\infty$).
  - **Renderizado Diferenciado:** Estilo visual con bordes y líneas discontinuas (`stroke-dasharray="6 4"`) y etiqueta `flujo/∞`.
  - **Resolución Formal:** Ejecución de Ford-Fulkerson entre $S$ y $T$.
- **🔗 Generación Aleatoria Estructurada:**
  - Construcción por capas sin cruces caóticos, garantizando que todo nodo intermedio tenga al menos una entrada y una salida, evitando atajos directos triviales desde la fuente al sumidero.
- **🛡️ Contenedor de Diagnóstico:**
  - Evalúa e indica de forma directa si la red es **Válida** o **Inválida**, listando puntualmente errores como detección de ciclos dirigidos (DFS), falta de camino, nodos aislados o callejones sin salida.
- **🚫 Prevención Estricta de Ciclos y Eliminación de Circulaciones:**
  - **Detección con DFS (3 estados):** Identifica y rastrea la trayectoria exacta de cualquier ciclo dirigido en la red.
  - **Bloqueo Preventivo en Modo Manual:** Impide agregar aristas dirigidas que cierren ciclos en el grafo.
  - **Caminos Aumentantes Simples:** Restringe la selección interactiva para que ningún nodo se repita en el camino de aumento.
  - **Cancelación de Circulaciones:** Rutina de descomposición de flujo que elimina automáticamente cualquier flujo circulante en ciclos sin alterar el flujo neto del sumidero.
- **✂️ Cálculo y Representación Visual del Corte Mínimo:**
  - Al agotar los caminos aumentantes, determina la partición $(S, T)$ de la red residual: $S$ (alcanzables) y $T$ (no alcanzables).
  - **Línea de corte en el canvas:** Traza una línea divisoria discontinua en el SVG separando $S$ de $T$.
  - **Verificación teórica:** Comprueba formalmente que $|f| = c(S, T) = \sum_{u \in S, v \in T} c(u, v)$ sustentando el óptimo global.
- **🔗 Creación Flexible de Aristas:**
  - **Modo Manual:** Ingreso de nodo origen, nodo destino y capacidad/peso (1 - 9999).
  - **Modo Aleatorio:** Generación estructurada por niveles orientados.
  - **Soporte de Aristas Bidireccionales:** Curvatura automática mediante curvas Bézier cuadráticas (`Q cx cy x2 y2`).
- **🎯 Definición de Fuente y Sumidero:**
  - Modos manual y auto-canónico, con validación de conectividad mediante **BFS** y detección de ciclos con **DFS**.
- **🕹️ Aprendizaje Interactivo del Algoritmo:**
  - Selección de caminos aumentantes haciendo clic directamente sobre los nodos en el SVG (resaltado morado).
  - Validación de caminos válidos y cálculo del cuello de botella (capacidad residual mínima).
  - Desafío interactivo para ingresar el incremento de flujo correspondiente.
- **🎨 Semáforo Visual de Saturación:**
  - Código de colores dinámico en tiempo real según el ratio `flujo / capacidad`:
    - ⚫ **Negro:** Flujo nulo (`flujo = 0`).
    - 🟢 **Verde:** Saturación baja (`≤ 30%`).
    - 🟠 **Naranja:** Saturación media (`< 100%`).
    - 🔴 **Rojo:** Arista saturada (`100%`).
- **📊 Resumen y Finalización Automática:**
  - Verificación por BFS para detectar fin de algoritmo.
  - Reporte final con flujo máximo total alcanzado e historial ordenado de caminos con opción de replay.

---

## 🚀 Cómo Ejecutar el Proyecto

Este proyecto no requiere servidores pesados, compilación ni dependencias externas (`0 dependencies`).

1. **Clonar el repositorio:**
   ```bash
   git clone https://github.com/lincolnangae/FlujoMaximo-Ford-F-Grupo-9.git
   ```
2. **Abrir la aplicación:**
   - Navega a la carpeta del proyecto y abre el archivo `index.html` en cualquier navegador web moderno (Google Chrome, Mozilla Firefox, Microsoft Edge, Safari).
   - Opcionalmente, puedes utilizar la extensión **Live Server** de VS Code.

---

## 📖 Guía de Uso Paso a Paso

1. **Configurar la Red:**
   - Define el número de vértices deseado (entre 7 y 16) y presiona **Aplicar**.
2. **Agregar Aristas y Capacidades:**
   - Presiona **Manual** para ingresar pares de nodos con sus pesos o haz clic en **Aleatorio** para una red automática.
3. **Establecer Fuente y Sumidero:**
   - Asigna los números de los nodos de origen (Fuente) y destino (Sumidero), y presiona **Aceptar**.
4. **Ejecutar Ford-Fulkerson:**
   - Haz clic secuencialmente sobre los nodos del grafo para trazar un camino aumentante desde la fuente hacia el sumidero.
   - Presiona **Verificar**.
   - Ingresa el cuello de botella (capacidad residual mínima) y haz clic en **Confirmar**.
   - Repite el proceso hasta que el simulador determine que se ha alcanzado el **Flujo Máximo**.

---

## 📂 Estructura del Proyecto

```plaintext
FlujoMaximo-Ford-F-Grupo-9/
├── index.html       # Estructura semántica, panel de control y lienzo SVG
├── style.css        # Hoja de estilos con maquetación Flexbox, modales y estilos SVG
├── script.js        # Lógica del grafo, Ford-Fulkerson, BFS, DFS y eventos DOM
├── .gitignore       # Archivos y carpetas excluidos del control de versiones
└── README.md        # Documentación técnica completa y guía de usuario
```

---

## 🛠️ Tecnologías Empleadas

- **HTML5:** Estructura semántica y maquetación de paneles.
- **CSS3:** Diseño responsivo con Flexbox, modal overlays y tipografías legibles.
- **JavaScript (ES6+):** Lógica matemática de redes, validación de ciclos, cálculo de flujos residuales y manipulación del DOM.
- **SVG (Scalable Vector Graphics):** Renderizado vectorial de nodos, aristas dirigidas, marcadores de flechas dinámicos y etiquetas de capacidades.

---

## 📄 Licencia

Este proyecto está distribuido bajo la Licencia **MIT**. Siéntete libre de utilizarlo con fines educativos, de investigación o proyectos personales.
