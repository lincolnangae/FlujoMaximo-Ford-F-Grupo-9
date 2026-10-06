const COLORES = ['gray', '#2e7d32', '#c62828'];

const inputVertices = document.getElementById('num-vertices');
const btnAplicar = document.getElementById('btn-aplicar');
const svgRed = document.getElementById('svg-red');
const grupoAristas = document.getElementById('grupo-aristas');
const grupoNodos = document.getElementById('grupo-nodos');

const overlayAdvertencia = document.getElementById('overlay-advertencia');
const tituloAdvertencia = document.getElementById('titulo-advertencia');
const mensajeAdvertencia = document.getElementById('mensaje-advertencia');
const btnCerrarAdvertencia = document.getElementById('btn-cerrar-advertencia');

const btnManual = document.getElementById('btn-manual');
const btnAleatorio = document.getElementById('btn-aleatorio');
const contenedorManual = document.getElementById('contenedor-manual');

const inputNodoInicial = document.getElementById('num-nodo-inicial');
const inputNodoFinal = document.getElementById('num-nodo-final');
const inputPeso = document.getElementById('num-peso');
const btnConectar = document.getElementById('btn-conectar');

const inputFuente = document.getElementById('num-fuente');
const inputSumidero = document.getElementById('num-sumidero');
const btnAceptarFuenteSumidero = document.getElementById('btn-aceptar-fuente-sumidero');

const COLOR_MORADO = '#8e24aa';

const seccionFord = document.getElementById('seccion-ford');
const instruccionFord = document.getElementById('instruccion-ford');
const textoCamino = document.getElementById('texto-camino');
const btnVerificarCamino = document.getElementById('btn-verificar-camino');
const btnLimpiarCamino = document.getElementById('btn-limpiar-camino');
const divPreguntaCapacidad = document.getElementById('div-pregunta-capacidad');
const inputCapacidadCamino = document.getElementById('input-capacidad-camino');
const btnConfirmarCapacidad = document.getElementById('btn-confirmar-capacidad');
const valFlujoTotal = document.getElementById('val-flujo-total');
const panelFinalFlujo = document.getElementById('panel-final-flujo');
const textoResumenFinal = document.getElementById('texto-resumen-final');
const listaCaminosRecorridos = document.getElementById('lista-caminos-recorridos');

let posicionesNodos = [];
let aristas = [];
let nodoFuente = null;
let nodoSumidero = null;

let caminoSeleccionado = [];
let flujoTotal = 0;
let historialRecorridos = [];
let algoritmoTerminado = false;

// Determina el color y nombre de estilo de una arista según su nivel de flujo y capacidad.
function obtenerColorArista(flujo, peso) {
  if (flujo === 0) return { nombre: 'negro', hex: '#333333' };
  const ratio = flujo / peso;
  if (ratio <= 0.3) return { nombre: 'verde', hex: '#2e7d32' };
  if (ratio < 1) return { nombre: 'naranja', hex: '#f57c00' };
  return { nombre: 'rojo', hex: '#c62828' };
}

// Muestra el modal de advertencia en pantalla con un título y mensaje específico.
function mostrarAdvertencia(mensaje, titulo = 'Restricción') {
  tituloAdvertencia.textContent = titulo;
  mensajeAdvertencia.textContent = mensaje;
  overlayAdvertencia.style.display = 'flex';
}

// Oculta el modal de advertencia.
function ocultarAdvertencia() {
  overlayAdvertencia.style.display = 'none';
}

btnCerrarAdvertencia.addEventListener('click', ocultarAdvertencia);

btnManual.addEventListener('click', () => {
  const visible = contenedorManual.style.display === 'flex';
  contenedorManual.style.display = visible ? 'none' : 'flex';
});

// Valida la cantidad de vértices, reinicia las variables del grafo y distribuye los nodos circularmente.
function generarRed() {
  const valor = inputVertices.value.trim();
  const n = Number(valor);

  if (valor === '' || isNaN(n) || !Number.isInteger(n) || n < 7 || n > 16) {
    mostrarAdvertencia('Estos datos no se permiten. El número de vértices debe ser un número entero entre 7 y 16.');
    return;
  }

  inputNodoInicial.max = n;
  inputNodoFinal.max = n;
  inputFuente.max = n;
  inputSumidero.max = n;
  nodoFuente = null;
  nodoSumidero = null;
  inputFuente.value = '';
  inputSumidero.value = '';
  if (Number(inputNodoInicial.value) > n) inputNodoInicial.value = 1;
  if (Number(inputNodoFinal.value) > n) inputNodoFinal.value = n;

  aristas = [];
  posicionesNodos = [];
  caminoSeleccionado = [];
  flujoTotal = 0;
  historialRecorridos = [];
  algoritmoTerminado = false;
  if (seccionFord) seccionFord.style.display = 'none';

  const centroX = 300;
  const centroY = 300;
  const radio = 200;

  for (let i = 0; i < n; i++) {
    const angulo = (2 * Math.PI / n) * i - (Math.PI / 2);
    const x = centroX + radio * Math.cos(angulo);
    const y = centroY + radio * Math.sin(angulo);
    posicionesNodos.push({ x, y });
  }

  dibujarRed();
}

// Renderiza los nodos, aristas dirigidas y etiquetas de flujo/capacidad en el elemento SVG.
function dibujarRed() {
  const n = posicionesNodos.length;
  const radioNodo = 20;

  grupoAristas.innerHTML = '';
  grupoNodos.innerHTML = '';

  const textos = [];

  aristas.forEach(arista => {
    arista.flujo = arista.flujo || 0;
    const p1 = posicionesNodos[arista.origen - 1];
    const p2 = posicionesNodos[arista.destino - 1];

    if (!p1 || !p2) return;

    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    const dist = Math.hypot(dx, dy);

    if (dist === 0) return;

    const ux = dx / dist;
    const uy = dy / dist;

    const x1 = p1.x + radioNodo * ux;
    const y1 = p1.y + radioNodo * uy;
    const x2 = p2.x - radioNodo * ux;
    const y2 = p2.y - radioNodo * uy;

    const tieneOpuesta = aristas.some(a => a.origen === arista.destino && a.destino === arista.origen);

    const nx = -uy;
    const ny = ux;

    let dRuta = '';
    let lx = 0;
    let ly = 0;

    if (tieneOpuesta) {
      const cx = (x1 + x2) / 2 + nx * 24;
      const cy = (y1 + y2) / 2 + ny * 24;
      dRuta = `M ${x1} ${y1} Q ${cx} ${cy} ${x2} ${y2}`;
      lx = (x1 + x2) / 2 + nx * 12;
      ly = (y1 + y2) / 2 + ny * 12;
    } else {
      dRuta = `M ${x1} ${y1} L ${x2} ${y2}`;
      lx = (x1 + x2) / 2;
      ly = (y1 + y2) / 2;
    }

    const colorInfo = obtenerColorArista(arista.flujo, arista.peso);

    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', dRuta);
    path.setAttribute('class', 'arista-linea');
    path.setAttribute('stroke', colorInfo.hex);
    path.setAttribute('marker-start', `url(#punto-inicio-${colorInfo.nombre})`);
    path.setAttribute('marker-end', `url(#flecha-${colorInfo.nombre})`);
    grupoAristas.appendChild(path);

    const textoPeso = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    textoPeso.setAttribute('x', lx);
    textoPeso.setAttribute('y', ly);
    textoPeso.setAttribute('class', 'peso-arista');
    textoPeso.textContent = `${arista.flujo}/${arista.peso}`;
    textos.push(textoPeso);
  });

  textos.forEach(t => grupoAristas.appendChild(t));

  posicionesNodos.forEach((pos, i) => {
    const idNodo = i + 1;
    const grupo = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    grupo.setAttribute('class', 'nodo');
    grupo.setAttribute('id', `nodo-${idNodo}`);
    grupo.style.cursor = 'pointer';

    let color = COLORES[0];
    if (idNodo === nodoFuente) {
      color = COLORES[1];
    } else if (idNodo === nodoSumidero) {
      color = COLORES[2];
    }

    if (caminoSeleccionado.includes(idNodo)) {
      color = COLOR_MORADO;
    }

    const circulo = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circulo.setAttribute('cx', pos.x);
    circulo.setAttribute('cy', pos.y);
    circulo.setAttribute('r', radioNodo);
    circulo.setAttribute('fill', color);

    const texto = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    texto.setAttribute('x', pos.x);
    texto.setAttribute('y', pos.y);
    texto.textContent = idNodo;

    grupo.appendChild(circulo);
    grupo.appendChild(texto);

    grupo.addEventListener('click', () => {
      manejarClickNodo(idNodo);
    });

    grupoNodos.appendChild(grupo);
  });
}

// Valida los datos del formulario manual e inserta una nueva arista dirigida en el grafo.
function conectarArista() {
  const n = posicionesNodos.length;
  const origenVal = inputNodoInicial.value.trim();
  const destinoVal = inputNodoFinal.value.trim();
  const pesoVal = inputPeso.value.trim();

  const origen = Number(origenVal);
  const destino = Number(destinoVal);
  const peso = Number(pesoVal);

  if (origenVal === '' || isNaN(origen) || !Number.isInteger(origen) || origen < 1 || origen > n) {
    mostrarAdvertencia(`El nodo inicial debe ser un número entero entre 1 y ${n}.`);
    return;
  }
  if (destinoVal === '' || isNaN(destino) || !Number.isInteger(destino) || destino < 1 || destino > n) {
    mostrarAdvertencia(`El nodo final debe ser un número entero entre 1 y ${n}.`);
    return;
  }

  if (origen === destino) {
    mostrarAdvertencia('El nodo inicial y el nodo final no pueden ser iguales.');
    return;
  }

  if (pesoVal === '' || isNaN(peso) || !Number.isInteger(peso) || peso < 1 || peso > 9999) {
    mostrarAdvertencia('El peso de la arista debe ser un número entero entre 1 y 9999 (no puede ser 0).');
    return;
  }

  const yaExiste = aristas.some(a => a.origen === origen && a.destino === destino);
  if (yaExiste) {
    mostrarAdvertencia(`Ya existe una arista del nodo ${origen} al nodo ${destino}.`);
    return;
  }

  aristas.push({ origen, destino, peso, flujo: 0 });
  if (seccionFord) seccionFord.style.display = 'none';
  dibujarRed();
}

// Genera un conjunto aleatorio de aristas dirigidas sin ciclos hacia adelante.
function generarAristasAleatorias() {
  const n = posicionesNodos.length;
  aristas = [];

  const mapaAristas = new Set();
  function agregarArista(u, v) {
    if (u === v || u < 1 || u > n || v < 1 || v > n) return;
    const clave = `${u}->${v}`;
    if (!mapaAristas.has(clave)) {
      mapaAristas.add(clave);
      const peso = Math.floor(Math.random() * 20) + 1;
      aristas.push({ origen: u, destino: v, peso, flujo: 0 });
    }
  }

  for (let i = 1; i < n; i++) {
    agregarArista(i, i + 1);
    if (i + 2 <= n && Math.random() < 0.5) {
      agregarArista(i, i + 2);
    }
  }

  const aristasExtra = Math.floor(n * 0.8);
  for (let k = 0; k < aristasExtra; k++) {
    const u = Math.floor(Math.random() * (n - 1)) + 1;
    const v = Math.floor(Math.random() * (n - u)) + u + 1;
    agregarArista(u, v);
  }

  if (seccionFord) seccionFord.style.display = 'none';
  dibujarRed();
}

// Detecta si existen ciclos dirigidos en el grafo mediante búsqueda en profundidad (DFS).
function tieneCiclos() {
  const n = posicionesNodos.length;
  const adj = Array.from({ length: n + 1 }, () => []);
  aristas.forEach(a => {
    if (a.origen <= n && a.destino <= n) {
      adj[a.origen].push(a.destino);
    }
  });

  const estado = Array(n + 1).fill(0);
  function dfs(u) {
    estado[u] = 1;
    for (const v of adj[u]) {
      if (estado[v] === 1) return true;
      if (estado[v] === 0 && dfs(v)) return true;
    }
    estado[u] = 2;
    return false;
  }

  for (let i = 1; i <= n; i++) {
    if (estado[i] === 0) {
      if (dfs(i)) return true;
    }
  }
  return false;
}

// Localiza un camino aumentante con capacidad residual disponible entre fuente y sumidero usando BFS.
function buscarCaminoAumentanteBFS() {
  const n = posicionesNodos.length;
  const parent = Array(n + 1).fill(null);
  const queue = [nodoFuente];
  const visitado = Array(n + 1).fill(false);
  visitado[nodoFuente] = true;

  while (queue.length > 0) {
    const u = queue.shift();
    if (u === nodoSumidero) break;

    for (const a of aristas) {
      if (a.origen === u && !visitado[a.destino] && (a.peso - a.flujo > 0)) {
        visitado[a.destino] = true;
        parent[a.destino] = u;
        queue.push(a.destino);
      }
    }
  }

  if (!visitado[nodoSumidero]) return null;

  const camino = [];
  let curr = nodoSumidero;
  while (curr !== nodoFuente) {
    camino.unshift(curr);
    curr = parent[curr];
  }
  camino.unshift(nodoFuente);
  return camino;
}

// Maneja la interacción al hacer clic en un nodo para construir el camino de flujo paso a paso.
function manejarClickNodo(idNodo) {
  if (isDragging) return;
  if (seccionFord.style.display !== 'flex') return;
  if (algoritmoTerminado) return;
  if (divPreguntaCapacidad.style.display === 'flex') return;

  if (caminoSeleccionado[caminoSeleccionado.length - 1] === idNodo) return;

  caminoSeleccionado.push(idNodo);
  textoCamino.textContent = caminoSeleccionado.join(' -> ');
  btnVerificarCamino.disabled = false;
  dibujarRed();
}

// Restablece la selección del camino actual y desactiva el botón de verificación.
function limpiarSeleccionCamino() {
  caminoSeleccionado = [];
  textoCamino.textContent = 'Ninguno';
  btnVerificarCamino.disabled = true;
  divPreguntaCapacidad.style.display = 'none';
  dibujarRed();
}

// Valida que el camino elegido inicie en la fuente, finalice en el sumidero y posea aristas con capacidad disponible.
function verificarCamino() {
  if (caminoSeleccionado.length < 2) {
    mostrarAdvertencia('El camino debe tener al menos 2 nodos.');
    limpiarSeleccionCamino();
    return;
  }

  if (caminoSeleccionado[0] !== nodoFuente) {
    mostrarAdvertencia(`El camino no es correcto. Debe iniciar en la fuente (${nodoFuente}).`);
    limpiarSeleccionCamino();
    return;
  }

  if (caminoSeleccionado[caminoSeleccionado.length - 1] !== nodoSumidero) {
    mostrarAdvertencia(`El camino no es correcto. Debe terminar en el sumidero (${nodoSumidero}).`);
    limpiarSeleccionCamino();
    return;
  }

  for (let i = 0; i < caminoSeleccionado.length - 1; i++) {
    const u = caminoSeleccionado[i];
    const v = caminoSeleccionado[i + 1];
    const arista = aristas.find(a => a.origen === u && a.destino === v);

    if (!arista) {
      mostrarAdvertencia(`El camino no es correcto. No existe una arista del nodo ${u} al nodo ${v}.`);
      limpiarSeleccionCamino();
      return;
    }

    if (arista.peso - arista.flujo <= 0) {
      mostrarAdvertencia(`El camino no es correcto. La arista del nodo ${u} al nodo ${v} ya no tiene capacidad disponible.`);
      limpiarSeleccionCamino();
      return;
    }
  }

  divPreguntaCapacidad.style.display = 'flex';
  inputCapacidadCamino.value = '';
  inputCapacidadCamino.focus();
}

// Valida el cuello de botella ingresado por el usuario, incrementa el flujo del camino y comprueba si se llegó al flujo máximo.
function confirmarCapacidad() {
  const capIngresada = Number(inputCapacidadCamino.value.trim());

  let cuelloBotella = Infinity;
  for (let i = 0; i < caminoSeleccionado.length - 1; i++) {
    const u = caminoSeleccionado[i];
    const v = caminoSeleccionado[i + 1];
    const arista = aristas.find(a => a.origen === u && a.destino === v);
    const residual = arista.peso - arista.flujo;
    if (residual < cuelloBotella) {
      cuelloBotella = residual;
    }
  }

  if (isNaN(capIngresada) || capIngresada !== cuelloBotella || capIngresada <= 0) {
    mostrarAdvertencia('La capacidad máxima ingresada no es correcta. Debe ser el cuello de botella (menor capacidad residual) de este camino.');
    return;
  }

  for (let i = 0; i < caminoSeleccionado.length - 1; i++) {
    const u = caminoSeleccionado[i];
    const v = caminoSeleccionado[i + 1];
    const arista = aristas.find(a => a.origen === u && a.destino === v);
    arista.flujo += cuelloBotella;
  }

  flujoTotal += cuelloBotella;
  historialRecorridos.push({
    camino: caminoSeleccionado.join(' -> '),
    capacidad: cuelloBotella
  });

  valFlujoTotal.textContent = flujoTotal;

  caminoSeleccionado = [];
  textoCamino.textContent = 'Ninguno';
  btnVerificarCamino.disabled = true;
  divPreguntaCapacidad.style.display = 'none';

  dibujarRed();

  const hayMasCaminos = buscarCaminoAumentanteBFS();
  if (!hayMasCaminos) {
    algoritmoTerminado = true;
    panelFinalFlujo.style.display = 'block';
    textoResumenFinal.textContent = `Capacidad total del flujo máximo: ${flujoTotal}. Total de recorridos realizados: ${historialRecorridos.length}.`;
    listaCaminosRecorridos.innerHTML = historialRecorridos.map((r, idx) => `<div><strong>${idx + 1}.</strong> ${r.camino} (+${r.capacidad})</div>`).join('');
    instruccionFord.textContent = '¡Flujo Máximo Alcanzado! No existen más caminos aumentantes disponibles.';
  } else {
    instruccionFord.textContent = `Halla un camino de ${nodoFuente} hacia ${nodoSumidero} (presiona click sobre los nodos empezando desde la fuente)`;
  }
}

// Configura los nodos fuente y sumidero tras validar que no existan ciclos y que haya al menos un camino aumentante.
function aplicarFuenteSumidero() {
  const n = posicionesNodos.length;
  const fuenteVal = inputFuente.value.trim();
  const sumideroVal = inputSumidero.value.trim();

  const fuente = Number(fuenteVal);
  const sumidero = Number(sumideroVal);

  if (fuenteVal === '' || isNaN(fuente) || !Number.isInteger(fuente) || fuente < 1 || fuente > n) {
    mostrarAdvertencia(`El nodo fuente debe ser un número entero entre 1 y ${n}.`);
    return;
  }
  if (sumideroVal === '' || isNaN(sumidero) || !Number.isInteger(sumidero) || sumidero < 1 || sumidero > n) {
    mostrarAdvertencia(`El nodo sumidero debe ser un número entero entre 1 y ${n}.`);
    return;
  }

  if (fuente === sumidero) {
    mostrarAdvertencia('El nodo fuente y el sumidero no pueden ser el mismo.');
    return;
  }

  if (tieneCiclos()) {
    mostrarAdvertencia('El grafo contiene ciclos. Por favor, corrige la estructura de las aristas antes de continuar.');
    return;
  }

  nodoFuente = fuente;
  nodoSumidero = sumidero;

  aristas.forEach(a => a.flujo = 0);
  flujoTotal = 0;
  historialRecorridos = [];
  caminoSeleccionado = [];
  algoritmoTerminado = false;

  const existeCamino = buscarCaminoAumentanteBFS();
  if (!existeCamino) {
    mostrarAdvertencia('No existe ningún camino posible entre la fuente y el sumidero seleccionados.');
    seccionFord.style.display = 'none';
    dibujarRed();
    return;
  }

  seccionFord.style.display = 'flex';
  instruccionFord.textContent = `Halla un camino de ${nodoFuente} hacia ${nodoSumidero} (presiona click sobre los nodos)`;
  textoCamino.textContent = 'Ninguno';
  btnVerificarCamino.disabled = true;
  divPreguntaCapacidad.style.display = 'none';
  panelFinalFlujo.style.display = 'none';
  valFlujoTotal.textContent = '0';

  dibujarRed();
}

btnConectar.addEventListener('click', conectarArista);
btnAleatorio.addEventListener('click', generarAristasAleatorias);
btnAceptarFuenteSumidero.addEventListener('click', aplicarFuenteSumidero);
btnVerificarCamino.addEventListener('click', verificarCamino);
btnLimpiarCamino.addEventListener('click', limpiarSeleccionCamino);
btnConfirmarCapacidad.addEventListener('click', confirmarCapacidad);
btnAplicar.addEventListener('click', generarRed);

// SISTEMA DE TOAST NOTIFICATIONS
const toastContainer = document.getElementById('toast-container');

function mostrarToast(mensaje, tipo = 'info', duracion = 3500) {
  const iconos = {
    exito: '✓',
    info: 'ℹ',
    aviso: '⚠'
  };

  const toast = document.createElement('div');
  toast.className = `toast toast-${tipo}`;
  toast.innerHTML = `
    <span class="toast-icono">${iconos[tipo] || 'ℹ'}</span>
    <span>${mensaje}</span>
    <div class="toast-progress"></div>
  `;
  toast.style.position = 'relative';

  toast.addEventListener('click', () => {
    toast.classList.add('toast-exit');
    setTimeout(() => toast.remove(), 350);
  });

  toastContainer.appendChild(toast);

  setTimeout(() => {
    if (toast.parentNode) {
      toast.classList.add('toast-exit');
      setTimeout(() => toast.remove(), 350);
    }
  }, duracion);
}

// SISTEMA DE TUTORIAL INTERACTIVO
const tutorialOverlay = document.getElementById('tutorial-overlay');
const tutorialTitulo = document.getElementById('tutorial-titulo');
const tutorialContenido = document.getElementById('tutorial-contenido');
const tutorialPasoNum = document.getElementById('tutorial-paso-num');
const tutorialProgressBar = document.getElementById('tutorial-progress-bar');
const btnTutorialSiguiente = document.getElementById('btn-tutorial-siguiente');
const btnTutorialAnterior = document.getElementById('btn-tutorial-anterior');
const btnTutorialOmitir = document.getElementById('btn-tutorial-omitir');
const btnTutorial = document.getElementById('btn-tutorial');

const pasosTutorial = [
  {
    titulo: '¡Bienvenido! 👋',
    contenido: 'Esta herramienta te permite construir un grafo dirigido y resolver el problema de Flujo Máximo paso a paso usando el algoritmo de Ford-Fulkerson. ¡Sigue este tour para aprender a usarla!'
  },
  {
    titulo: 'Paso 1: Configurar Vértices',
    contenido: 'Comienza eligiendo la cantidad de vértices (nodos) para tu grafo. Puedes usar entre 7 y 16 nodos. Haz clic en "Aplicar" para generar la disposición circular de los nodos.'
  },
  {
    titulo: 'Paso 2: Añadir Aristas',
    contenido: 'Usa el modo "Manual" para agregar aristas una por una (nodo inicial → nodo final con capacidad), o usa "Aleatorio" para generar un grafo automáticamente. Las aristas tienen dirección y capacidad máxima.'
  },
  {
    titulo: 'Paso 3: Fuente y Sumidero',
    contenido: 'Define qué nodo será la Fuente (origen del flujo, verde) y cuál el Sumidero (destino del flujo, rojo). El algoritmo encontrará el flujo máximo posible entre ambos.'
  },
  {
    titulo: 'Paso 4: Encontrar Caminos',
    contenido: 'Haz clic en los nodos del grafo para trazar un camino desde la Fuente hasta el Sumidero. Luego verifica el camino, ingresa la capacidad (cuello de botella) y repite hasta que no queden caminos aumentantes. ¡Los nodos son arrastrables!'
  }
];

let pasoActualTutorial = 0;

function actualizarTutorial() {
  const paso = pasosTutorial[pasoActualTutorial];
  tutorialTitulo.textContent = paso.titulo;
  tutorialContenido.textContent = paso.contenido;
  tutorialPasoNum.textContent = `${pasoActualTutorial + 1}/${pasosTutorial.length}`;
  tutorialProgressBar.style.width = `${((pasoActualTutorial + 1) / pasosTutorial.length) * 100}%`;

  btnTutorialAnterior.disabled = pasoActualTutorial === 0;
  btnTutorialSiguiente.textContent = pasoActualTutorial === pasosTutorial.length - 1 ? '¡Empezar! 🚀' : 'Siguiente →';
}

function abrirTutorial() {
  pasoActualTutorial = 0;
  actualizarTutorial();
  tutorialOverlay.style.display = 'flex';
}

function cerrarTutorial() {
  tutorialOverlay.style.display = 'none';
  mostrarToast('¡Tutorial completado! Ya puedes empezar.', 'exito');
}

btnTutorial.addEventListener('click', abrirTutorial);

btnTutorialSiguiente.addEventListener('click', () => {
  if (pasoActualTutorial < pasosTutorial.length - 1) {
    pasoActualTutorial++;
    actualizarTutorial();
  } else {
    cerrarTutorial();
  }
});

btnTutorialAnterior.addEventListener('click', () => {
  if (pasoActualTutorial > 0) {
    pasoActualTutorial--;
    actualizarTutorial();
  }
});

btnTutorialOmitir.addEventListener('click', () => {
  tutorialOverlay.style.display = 'none';
});

// TOOLTIPS EN NODOS
const nodoTooltip = document.getElementById('nodo-tooltip');
const tooltipNodoId = document.getElementById('tooltip-nodo-id');
const tooltipNodoTipo = document.getElementById('tooltip-nodo-tipo');
const tooltipNodoSalientes = document.getElementById('tooltip-nodo-salientes');
const tooltipNodoEntrantes = document.getElementById('tooltip-nodo-entrantes');
const tooltipNodoFlujo = document.getElementById('tooltip-nodo-flujo');

function mostrarTooltipNodo(idNodo, eventoMouse) {
  const salientes = aristas.filter(a => a.origen === idNodo);
  const entrantes = aristas.filter(a => a.destino === idNodo);
  const flujoSaliente = salientes.reduce((s, a) => s + a.flujo, 0);
  const flujoEntrante = entrantes.reduce((s, a) => s + a.flujo, 0);

  let tipo = 'Normal';
  if (idNodo === nodoFuente) tipo = '🟢 Fuente';
  else if (idNodo === nodoSumidero) tipo = '🔴 Sumidero';

  tooltipNodoId.textContent = idNodo;
  tooltipNodoTipo.textContent = tipo;
  tooltipNodoSalientes.textContent = `${salientes.length} (flujo: ${flujoSaliente})`;
  tooltipNodoEntrantes.textContent = `${entrantes.length} (flujo: ${flujoEntrante})`;
  tooltipNodoFlujo.textContent = flujoSaliente - flujoEntrante;

  nodoTooltip.style.display = 'block';

  const tooltipRect = nodoTooltip.getBoundingClientRect();
  let left = eventoMouse.clientX + 16;
  let top = eventoMouse.clientY - 10;

  if (left + tooltipRect.width > window.innerWidth) {
    left = eventoMouse.clientX - tooltipRect.width - 16;
  }
  if (top + tooltipRect.height > window.innerHeight) {
    top = window.innerHeight - tooltipRect.height - 10;
  }

  nodoTooltip.style.left = left + 'px';
  nodoTooltip.style.top = top + 'px';
}

function ocultarTooltipNodo() {
  nodoTooltip.style.display = 'none';
}

// DRAG & DROP DE NODOS
let nodoDragIndex = null;
let isDragging = false;
let dragStartPos = null;

function getSVGPoint(evt) {
  const svgEl = document.getElementById('svg-red');
  const pt = svgEl.createSVGPoint();
  const ctm = svgEl.getScreenCTM().inverse();
  pt.x = evt.clientX;
  pt.y = evt.clientY;
  return pt.matrixTransform(ctm);
}

svgRed.addEventListener('mousedown', (e) => {
  const nodoEl = e.target.closest('.nodo');
  if (!nodoEl) return;
  const id = parseInt(nodoEl.id.replace('nodo-', ''));
  nodoDragIndex = id - 1;
  isDragging = false;
  dragStartPos = { x: e.clientX, y: e.clientY };
  nodoEl.classList.add('nodo-dragging');
  e.preventDefault();
});

document.addEventListener('mousemove', (e) => {
  if (nodoDragIndex === null) return;

  if (!isDragging && dragStartPos) {
    const dx = Math.abs(e.clientX - dragStartPos.x);
    const dy = Math.abs(e.clientY - dragStartPos.y);
    if (dx > 4 || dy > 4) {
      isDragging = true;
    }
  }

  if (!isDragging) return;

  const svgPoint = getSVGPoint(e);
  posicionesNodos[nodoDragIndex].x = Math.max(25, Math.min(575, svgPoint.x));
  posicionesNodos[nodoDragIndex].y = Math.max(25, Math.min(575, svgPoint.y));
  dibujarRed();

  const nodoEl = document.getElementById(`nodo-${nodoDragIndex + 1}`);
  if (nodoEl) nodoEl.classList.add('nodo-dragging');

  ocultarTooltipNodo();
});

document.addEventListener('mouseup', (e) => {
  if (nodoDragIndex !== null) {
    const nodoEl = document.getElementById(`nodo-${nodoDragIndex + 1}`);
    if (nodoEl) nodoEl.classList.remove('nodo-dragging');
    nodoDragIndex = null;
    isDragging = false;
    dragStartPos = null;
  }
});

// HISTORIAL INTERACTIVO
const seccionHistorial = document.getElementById('seccion-historial');
const historialInteractivo = document.getElementById('historial-interactivo');
const btnReplayTodo = document.getElementById('btn-replay-todo');

function actualizarHistorialInteractivo() {
  if (historialRecorridos.length === 0) {
    seccionHistorial.style.display = 'none';
    return;
  }

  seccionHistorial.style.display = 'flex';
  historialInteractivo.innerHTML = '';

  historialRecorridos.forEach((rec, idx) => {
    const item = document.createElement('div');
    item.className = 'historial-item';
    item.innerHTML = `
      <span class="historial-num">${idx + 1}</span>
      <div class="historial-detalle">
        <span class="historial-camino">${rec.camino}</span>
        <span class="historial-capacidad">+${rec.capacidad} unidades de flujo</span>
      </div>
      <button class="btn historial-replay-btn" title="Reproducir este camino">▶</button>
    `;

    item.addEventListener('mouseenter', () => {
      const nodos = rec.camino.split(' -> ').map(Number);
      highlightNodosEnSVG(nodos);
      item.classList.add('historial-active');
    });

    item.addEventListener('mouseleave', () => {
      clearHighlightNodos();
      item.classList.remove('historial-active');
    });

    const replayBtn = item.querySelector('.historial-replay-btn');
    replayBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const nodos = rec.camino.split(' -> ').map(Number);
      replayPath(nodos);
    });

    historialInteractivo.appendChild(item);
  });

  btnReplayTodo.disabled = historialRecorridos.length === 0;
}

function highlightNodosEnSVG(nodos) {
  nodos.forEach(idNodo => {
    const el = document.getElementById(`nodo-${idNodo}`);
    if (el) {
      const circulo = el.querySelector('circle');
      if (circulo) circulo.setAttribute('fill', COLOR_MORADO);
    }
  });
}

function clearHighlightNodos() {
  dibujarRed();
}

async function replayPath(nodos) {
  caminoSeleccionado = [];
  dibujarRed();

  for (let i = 0; i < nodos.length; i++) {
    caminoSeleccionado.push(nodos[i]);
    dibujarRed();
    await sleep(400);
  }

  mostrarToast(`Camino ${nodos.join(' → ')} reproducido`, 'info');

  setTimeout(() => {
    caminoSeleccionado = [];
    dibujarRed();
  }, 1500);
}

async function replayTodo() {
  btnReplayTodo.disabled = true;
  mostrarToast('Reproduciendo todos los caminos...', 'info');

  for (let i = 0; i < historialRecorridos.length; i++) {
    const nodos = historialRecorridos[i].camino.split(' -> ').map(Number);
    await replayPath(nodos);
    await sleep(600);
  }

  btnReplayTodo.disabled = false;
  mostrarToast('Replay completo finalizado', 'exito');
}

btnReplayTodo.addEventListener('click', replayTodo);

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// LEYENDA INTERACTIVA
document.querySelectorAll('.leyenda-item').forEach(item => {
  item.addEventListener('mouseenter', () => {
    item.classList.add('leyenda-highlight');
  });
  item.addEventListener('mouseleave', () => {
    item.classList.remove('leyenda-highlight');
  });
});

// HOOKS
const _originalDibujarRed = dibujarRed;

const observerNodos = new MutationObserver(() => {
  document.querySelectorAll('.nodo').forEach(nodoEl => {
    nodoEl.addEventListener('mouseenter', (e) => {
      if (isDragging) return;
      const id = parseInt(nodoEl.id.replace('nodo-', ''));
      mostrarTooltipNodo(id, e);
    });
    nodoEl.addEventListener('mousemove', (e) => {
      if (isDragging) return;
      const id = parseInt(nodoEl.id.replace('nodo-', ''));
      mostrarTooltipNodo(id, e);
    });
    nodoEl.addEventListener('mouseleave', ocultarTooltipNodo);

    // Add clickable pulse when Ford-Fulkerson is active
    if (seccionFord.style.display === 'flex' && !algoritmoTerminado) {
      nodoEl.classList.add('nodo-clickable');
    }
  });
});

observerNodos.observe(grupoNodos, { childList: true });

// Hook into conectarArista for toast
const _originalConectarArista = conectarArista;

// Override the click handler's wrapper
btnConectar.removeEventListener('click', _originalConectarArista);
btnConectar.addEventListener('click', () => {
  const prevLen = aristas.length;
  conectarArista();
  if (aristas.length > prevLen) {
    const a = aristas[aristas.length - 1];
    mostrarToast(`Arista ${a.origen} → ${a.destino} (cap: ${a.peso}) añadida`, 'exito');
  }
});

// Hook into generarAristasAleatorias for toast
btnAleatorio.removeEventListener('click', generarAristasAleatorias);
btnAleatorio.addEventListener('click', () => {
  generarAristasAleatorias();
  mostrarToast(`${aristas.length} aristas generadas aleatoriamente`, 'info');
});

// Hook into aplicarFuenteSumidero for toast and historial
const _originalAplicarFuenteSumidero = aplicarFuenteSumidero;
btnAceptarFuenteSumidero.removeEventListener('click', _originalAplicarFuenteSumidero);
btnAceptarFuenteSumidero.addEventListener('click', () => {
  const prevDisplay = seccionFord.style.display;
  aplicarFuenteSumidero();
  if (seccionFord.style.display === 'flex' && prevDisplay !== 'flex') {
    mostrarToast(`Fuente: ${nodoFuente}, Sumidero: ${nodoSumidero} configurados`, 'exito');
  }
  actualizarHistorialInteractivo();
});

// Hook into confirmarCapacidad for toast and historial update
const _originalConfirmarCapacidad = confirmarCapacidad;
btnConfirmarCapacidad.removeEventListener('click', _originalConfirmarCapacidad);
btnConfirmarCapacidad.addEventListener('click', () => {
  const prevLen = historialRecorridos.length;
  confirmarCapacidad();
  if (historialRecorridos.length > prevLen) {
    const ultimo = historialRecorridos[historialRecorridos.length - 1];
    mostrarToast(`Camino encontrado: +${ultimo.capacidad} flujo`, 'exito');
    actualizarHistorialInteractivo();
  }
  if (algoritmoTerminado) {
    mostrarToast(`¡Flujo máximo alcanzado: ${flujoTotal}!`, 'exito', 5000);
  }
});

// Hook into generarRed for historial reset
const _originalGenerarRed = generarRed;
btnAplicar.removeEventListener('click', _originalGenerarRed);
btnAplicar.addEventListener('click', () => {
  generarRed();
  actualizarHistorialInteractivo();
  if (posicionesNodos.length > 0) {
    mostrarToast(`Red generada con ${posicionesNodos.length} nodos`, 'info');
  }
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    if (tutorialOverlay.style.display === 'flex') {
      tutorialOverlay.style.display = 'none';
    }
  }

  if (e.ctrlKey && e.key === 'z') {
    if (caminoSeleccionado.length > 0 && seccionFord.style.display === 'flex' && !algoritmoTerminado) {
      caminoSeleccionado.pop();
      textoCamino.textContent = caminoSeleccionado.length > 0 ? caminoSeleccionado.join(' -> ') : 'Ninguno';
      btnVerificarCamino.disabled = caminoSeleccionado.length === 0;
      dibujarRed();
      mostrarToast('Último nodo removido del camino', 'info');
      e.preventDefault();
    }
  }

  if (e.key === '?' && !e.ctrlKey && !e.metaKey) {
    const activeEl = document.activeElement;
    if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA')) return;
    abrirTutorial();
  }
});
