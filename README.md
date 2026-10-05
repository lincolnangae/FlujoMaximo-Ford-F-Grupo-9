# 🌐 Simulador de Flujo Máximo — Algoritmo de Ford-Fulkerson

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![SVG](https://img.shields.io/badge/SVG-Vector_Graphics-FFB13B?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)

Una herramienta web interactiva y pedagógica desarrollada en **JavaScript Vanilla**, **HTML5** y **SVG** para modelar redes de transporte, configurar fuentes y sumideros, y resolver problemas de **Flujo Máximo** paso a paso mediante el **Algoritmo de Ford-Fulkerson**.

---

## 📌 Descripción del Proyecto

Este proyecto permite visualizar, experimentar y aprender de forma didáctica la teoría de redes y optimización de flujo máximo. El usuario puede diseñar un grafo dirigido de forma manual o generarlo proceduralmente, definir el nodo origen (**Fuente**) y destino (**Sumidero**), e interactuar directamente con la interfaz seleccionando caminos aumentantes y calculando cuellos de botella en tiempo real.

Ideal para estudiantes y docentes de **Investigación de Operaciones**, **Optimización**, **Teoría de Grafos** y **Estructuras de Datos y Algoritmos**.

---

## ✨ Características Principales

- **🔢 Configuración Dinámica de Vértices:**
  - Soporta entre 7 y 16 nodos distribuidos automáticamente en disposición circular mediante cálculo trigonométrico.
- **🔗 Creación Flexible de Aristas:**
  - **Modo Manual:** Ingreso de nodo origen, nodo destino y capacidad/peso (1 - 9999).
  - **Modo Aleatorio:** Generación procedural de grafos dirigidos conectados sin ciclos directos hacia adelante.
  - **Soporte de Aristas Bidireccionales:** Curvatura automática mediante curvas Bézier cuadráticas (`Q cx cy x2 y2`) para evitar solapamientos entre aristas opuestas.
- **🎯 Definición de Fuente y Sumidero:**
  - Validación de conectividad mediante **BFS** (*Breadth-First Search*) y detección preventiva de ciclos dirigidos mediante **DFS** (*Depth-First Search*).
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
  - Verificación por BFS para detectar cuándo ya no existen caminos residuales disponibles.
  - Reporte final con el valor del **Flujo Máximo total alcanzado** y el historial ordenado de todos los caminos aumentantes empleados.
- **⚠️ Sistema de Alertas y Validaciones:**
  - Modales de advertencia amigables ante entradas inválidas, capacidades fuera de rango o nodos desconectados.

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
