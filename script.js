const COLORES = ['#64748b', '#2e7d32', '#c62828'];
const COLOR_MORADO = '#8e24aa';
const COLOR_TEAL_FICTICIO = '#0d9488';
const COLOR_ROSA_FICTICIO = '#e11d48';

const inputVertices = document.getElementById('num-vertices');
const btnAplicar = document.getElementById('btn-aplicar');
const svgRed = document.getElementById('svg-red');
const grupoCorteMinimo = document.getElementById('grupo-corte-minimo');
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
const btnEliminarArista = document.getElementById('btn-eliminar-arista');

const inputFuente = document.getElementById('num-fuente');
const inputSumidero = document.getElementById('num-sumidero');
const btnAceptarFuenteSumidero = document.getElementById('btn-aceptar-fuente-sumidero');
const btnAutoCanonico = document.getElementById('btn-auto-canonico');

const badgeEstadoRed = document.getElementById('badge-estado-red');
const diagnosticoMensaje = document.getElementById('diagnostico-mensaje');
const listaAlertasRed = document.getElementById('lista-alertas-red');

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

const seccionHistorial = document.getElementById('seccion-historial');
const historialInteractivo = document.getElementById('historial-interactivo');
const btnReplayTodo = document.getElementById('btn-replay-todo');

const nodoTooltip = document.getElementById('nodo-tooltip');
const tooltipNodoId = document.getElementById('tooltip-nodo-id');
const tooltipNodoTipo = document.getElementById('tooltip-nodo-tipo');
const tooltipNodoSalientes = document.getElementById('tooltip-nodo-salientes');
const tooltipNodoEntrantes = document.getElementById('tooltip-nodo-entrantes');
const tooltipNodoFlujo = document.getElementById('tooltip-nodo-flujo');

const toastContainer = document.getElementById('toast-container');
const tutorialOverlay = document.getElementById('tutorial-overlay');
const tutorialTitulo = document.getElementById('tutorial-titulo');
const tutorialContenido = document.getElementById('tutorial-contenido');
const tutorialPasoNum = document.getElementById('tutorial-paso-num');
const tutorialProgressBar = document.getElementById('tutorial-progress-bar');
const btnTutorialSiguiente = document.getElementById('btn-tutorial-siguiente');
const btnTutorialAnterior = document.getElementById('btn-tutorial-anterior');
const btnTutorialOmitir = document.getElementById('btn-tutorial-omitir');
const btnTutorial = document.getElementById('btn-tutorial');
const leyendaInteractiva = document.getElementById('leyenda-interactiva');
const btnToggleLeyenda = document.getElementById('btn-toggle-leyenda');

let numVerticesBase = 7;
let posicionesNodos = [];
let aristas = [];
let nodoFuente = null;
let nodoSumidero = null;
let fuentesRealesDetectadas = [];
let sumiderosRealesDetectados = [];

let caminoSeleccionado = [];
let flujoTotal = 0;
let historialRecorridos = [];
let algoritmoTerminado = false;

let nodoDragId = null;
let isDragging = false;
let dragStartPos = null;

// Busca un nodo por su identificador único dentro de la colección.
function obtenerNodo(id) {
  if (id === null || id === undefined || String(id).trim() === '') return null;
  const strId = String(id).trim().toUpperCase();
  const match = posicionesNodos.find(n => String(n.id).toUpperCase() === strId || String(n.label || '').toUpperCase() === strId);
  if (match) return match;
  const num = Number(strId);
  return (!isNaN(num) && num >= 1 && num <= posicionesNodos.length) ? posicionesNodos[num - 1] : null;
}

// Devuelve el color y nombre de estilo de una arista según su relación flujo/capacidad.
function obtenerColorArista(flujo, peso, isFictitious = false) {
  if (flujo === 0) return isFictitious ? { nombre: 'teal', hex: '#0d9488' } : { nombre: 'negro', hex: '#333333' };
  const ratio = (peso === Infinity || peso <= 0) ? (flujo > 0 ? 0.3 : 0) : (flujo / peso);
  if (ratio <= 0.3) return { nombre: 'verde', hex: '#2e7d32' };
  if (ratio < 1) return { nombre: 'naranja', hex: '#f57c00' };
  return { nombre: 'rojo', hex: '#c62828' };
}

// Despliega la ventana modal de advertencia con un mensaje específico.
function mostrarAdvertencia(mensaje, titulo = 'Restricción') {
  tituloAdvertencia.textContent = titulo;
  mensajeAdvertencia.textContent = mensaje;
  overlayAdvertencia.style.display = 'flex';
}

// Oculta la ventana modal de advertencia.
function ocultarAdvertencia() {
  overlayAdvertencia.style.display = 'none';
}

btnCerrarAdvertencia.addEventListener('click', ocultarAdvertencia);
btnManual.addEventListener('click', () => {
  contenedorManual.style.display = contenedorManual.style.display === 'flex' ? 'none' : 'flex';
});

btnToggleLeyenda.addEventListener('click', () => {
  const estaColapsada = leyendaInteractiva.classList.toggle('leyenda-colapsada');
  btnToggleLeyenda.setAttribute('aria-expanded', String(!estaColapsada));
  const accion = estaColapsada ? 'Maximizar' : 'Minimizar';
  btnToggleLeyenda.setAttribute('title', `${accion} leyenda`);
  btnToggleLeyenda.querySelector('.sr-only').textContent = `${accion} leyenda`;
});

// Localiza si existe una trayectoria dirigida desde inicio hasta fin mediante búsqueda en anchura (BFS).
function buscarCaminoDirigido(inicio, fin) {
  const sInicio = String(inicio);
  const sFin = String(fin);
  if (sInicio === sFin) return [sInicio];

  const parent = new Map();
  const queue = [sInicio];
  const visitados = new Set([sInicio]);

  while (queue.length > 0) {
    const curr = queue.shift();
    if (curr === sFin) break;

    for (const a of aristas) {
      if (String(a.origen) === curr) {
        const dest = String(a.destino);
        if (!visitados.has(dest)) {
          visitados.add(dest);
          parent.set(dest, curr);
          queue.push(dest);
        }
      }
    }
  }

  if (!visitados.has(sFin)) return null;

  const camino = [];
  let curr = sFin;
  while (curr !== sInicio) {
    camino.unshift(curr);
    curr = parent.get(curr);
  }
  camino.unshift(sInicio);
  return camino;
}

// Detecta si existen ciclos dirigidos en la red mediante búsqueda en profundidad (DFS) con 3 estados.
// Retorna la secuencia de nodos del ciclo [v1, v2, ..., vk, v1] o null si es acíclico (DAG).
function detectarCiclosDirigidos() {
  const adj = new Map();
  posicionesNodos.forEach(n => adj.set(String(n.id), []));
  aristas.forEach(a => {
    const orig = String(a.origen);
    const dest = String(a.destino);
    if (!adj.has(orig)) adj.set(orig, []);
    adj.get(orig).push(dest);
  });

  // Estados: 0 = No visitado (blanco), 1 = Visitando en rama activa (gris), 2 = Terminado (negro)
  const estado = new Map();
  const padre = new Map();
  posicionesNodos.forEach(n => estado.set(String(n.id), 0));

  let cicloDetectado = null;

  function dfs(u) {
    estado.set(u, 1);
    const vecinos = adj.get(u) || [];
    for (const v of vecinos) {
      if (estado.get(v) === 1) {
        // Enlace hacia atrás detectado: reconstruir el ciclo
        const ciclo = [u];
        let curr = u;
        while (curr !== v && padre.has(curr)) {
          curr = padre.get(curr);
          ciclo.push(curr);
        }
        ciclo.reverse();
        ciclo.push(v);
        cicloDetectado = ciclo;
        return true;
      }
      if (!estado.has(v) || estado.get(v) === 0) {
        padre.set(v, u);
        if (dfs(v)) return true;
      }
    }
    estado.set(u, 2);
    return false;
  }

  for (const n of posicionesNodos) {
    const sId = String(n.id);
    if (estado.get(sId) === 0) {
      if (dfs(sId)) {
        return cicloDetectado;
      }
    }
  }

  return null;
}

// Cancela flujos parásitos en ciclos (circulaciones) según el Teorema de Descomposición de Flujo.
function cancelarCiclosDeFlujo() {
  let huboCambio = false;
  while (true) {
    const aristasConFlujo = aristas.filter(a => Number(a.flujo || 0) > 0);
    const adj = new Map();
    aristasConFlujo.forEach(a => {
      const orig = String(a.origen);
      const dest = String(a.destino);
      if (!adj.has(orig)) adj.set(orig, []);
      adj.get(orig).push(dest);
    });

    const estado = new Map();
    const padre = new Map();
    let ciclo = null;

    function dfs(u) {
      estado.set(u, 1);
      const vecinos = adj.get(u) || [];
      for (const v of vecinos) {
        if (estado.get(v) === 1) {
          const c = [u];
          let curr = u;
          while (curr !== v && padre.has(curr)) {
            curr = padre.get(curr);
            c.push(curr);
          }
          c.reverse();
          c.push(v);
          ciclo = c;
          return true;
        }
        if (!estado.has(v) || estado.get(v) === 0) {
          padre.set(v, u);
          if (dfs(v)) return true;
        }
      }
      estado.set(u, 2);
      return false;
    }

    for (const [orig] of adj) {
      if (!estado.has(orig) || estado.get(orig) === 0) {
        if (dfs(orig)) break;
      }
    }

    if (!ciclo) break;

    // Encontrar el cuello de botella (flujo mínimo) dentro de la circulación
    let delta = Infinity;
    for (let i = 0; i < ciclo.length - 1; i++) {
      const u = ciclo[i];
      const v = ciclo[i + 1];
      const a = aristas.find(ed => String(ed.origen) === u && String(ed.destino) === v);
      if (a && a.flujo < delta) delta = a.flujo;
    }

    if (delta <= 0 || delta === Infinity) break;

    // Restar el flujo circulante en cada arista del ciclo
    for (let i = 0; i < ciclo.length - 1; i++) {
      const u = ciclo[i];
      const v = ciclo[i + 1];
      const a = aristas.find(ed => String(ed.origen) === u && String(ed.destino) === v);
      if (a) a.flujo -= delta;
    }
    huboCambio = true;
  }
  return huboCambio;
}

// Calcula los grados de entrada y salida de los nodos reales para identificar fuentes y sumideros.
function analizarGradosRedBase() {
  const nodosReales = posicionesNodos.filter(n => !n.isFictitious);
  const aristasReales = aristas.filter(a => !a.isFictitious);
  const inDegree = new Map();
  const outDegree = new Map();

  nodosReales.forEach(n => { inDegree.set(String(n.id), 0); outDegree.set(String(n.id), 0); });
  aristasReales.forEach(a => {
    const orig = String(a.origen);
    const dest = String(a.destino);
    if (outDegree.has(orig)) outDegree.set(orig, outDegree.get(orig) + 1);
    if (inDegree.has(dest)) inDegree.set(dest, inDegree.get(dest) + 1);
  });

  const fuentes = [];
  const sumideros = [];
  const aislados = [];
  const callejones = [];

  nodosReales.forEach(n => {
    const sId = String(n.id);
    const indeg = inDegree.get(sId) || 0;
    const outdeg = outDegree.get(sId) || 0;
    if (indeg === 0 && outdeg > 0) fuentes.push(n.id);
    else if (outdeg === 0 && indeg > 0) sumideros.push(n.id);
    else if (indeg === 0 && outdeg === 0) aislados.push(n.id);
    if (indeg > 0 && outdeg === 0 && String(nodoSumidero) !== sId && nodoSumidero !== 'T') {
      callejones.push(n.id);
    }
  });

  fuentesRealesDetectadas = fuentes;
  sumiderosRealesDetectados = sumideros;
  return { inDegree, outDegree, fuentes, sumideros, aislados, callejones };
}

// Inyecta fuente ficticia S y sumidero ficticio T con capacidad infinita cuando existen múltiples extremos.
function aplicarReduccionCanonica(notificar = false) {
  aristas = aristas.filter(a => !a.isFictitious);
  posicionesNodos = posicionesNodos.filter(n => !n.isFictitious);

  const analisis = analizarGradosRedBase();
  const fuentes = analisis.fuentes;
  const sumideros = analisis.sumideros;

  let superfuenteCreada = false;
  let supersumideroCreado = false;

  if (fuentes.length >= 2) {
    superfuenteCreada = true;
    const minX = Math.min(...posicionesNodos.map(n => n.x));
    const posX = Math.max(40, minX - 80);
    const avgY = fuentes.map(id => { const n = obtenerNodo(id); return n ? n.y : 300; }).reduce((a, b) => a + b, 0) / fuentes.length;
    posicionesNodos.push({ id: 'S', label: 'S', x: posX, y: Math.round(avgY), layer: -1, isFictitious: true, fictitiousType: 'fuente' });
    fuentes.forEach(fId => {
      aristas.push({ origen: 'S', destino: fId, peso: Infinity, flujo: 0, isFictitious: true });
    });
    nodoFuente = 'S';
  } else if (fuentes.length === 1) {
    nodoFuente = fuentes[0];
  } else if (nodoFuente === null || nodoFuente === 'S') {
    nodoFuente = posicionesNodos[0] ? posicionesNodos[0].id : 1;
  }

  if (sumideros.length >= 2) {
    supersumideroCreado = true;
    const maxX = Math.max(...posicionesNodos.filter(n => !n.isFictitious).map(n => n.x));
    const posX = Math.min(560, maxX + 80);
    const avgY = sumideros.map(id => { const n = obtenerNodo(id); return n ? n.y : 300; }).reduce((a, b) => a + b, 0) / sumideros.length;
    posicionesNodos.push({ id: 'T', label: 'T', x: posX, y: Math.round(avgY), layer: 999, isFictitious: true, fictitiousType: 'sumidero' });
    sumideros.forEach(sId => {
      aristas.push({ origen: sId, destino: 'T', peso: Infinity, flujo: 0, isFictitious: true });
    });
    nodoSumidero = 'T';
  } else if (sumideros.length === 1) {
    nodoSumidero = sumideros[0];
  } else {
    const nodosReales = posicionesNodos.filter(n => !n.isFictitious);
    if (nodoSumidero === null || nodoSumidero === 'T') {
      nodoSumidero = nodosReales.length > 0 ? nodosReales[nodosReales.length - 1].id : numVerticesBase;
    }
  }

  inputFuente.value = String(nodoFuente !== null ? nodoFuente : '');
  inputSumidero.value = String(nodoSumidero !== null ? nodoSumidero : '');
  dibujarRed();
  validarRed();

  if (notificar) {
    if (superfuenteCreada && supersumideroCreado) {
      mostrarToast('Fuente Ficticia (S) y Sumidero Ficticio (T) conectados con capacidad ∞', 'exito');
    } else if (superfuenteCreada) {
      mostrarToast(`Fuente Ficticia (S) conectada con capacidad ∞ a las fuentes [${fuentes.join(', ')}]`, 'exito');
    } else if (supersumideroCreado) {
      mostrarToast(`Sumidero Ficticio (T) conectado con capacidad ∞ desde los sumideros [${sumideros.join(', ')}]`, 'exito');
    } else {
      mostrarToast('Red con extremos únicos. No requiere nodos ficticios.', 'info');
    }
  }
}

// Evalúa si la red es válida para Ford-Fulkerson o reporta puntualmente las anomalías encontradas.
function validarRed() {
  const errores = [];
  const nodosReales = posicionesNodos.filter(n => !n.isFictitious);
  const analisis = analizarGradosRedBase();

  const fVal = String(inputFuente.value || '').trim();
  const sVal = String(inputSumidero.value || '').trim();
  const fNodo = fVal !== '' ? obtenerNodo(fVal) : null;
  const sNodo = sVal !== '' ? obtenerNodo(sVal) : null;
  nodoFuente = fNodo ? fNodo.id : null;
  nodoSumidero = sNodo ? sNodo.id : null;

  const aristasInvalidas = aristas.filter(a => a.peso !== Infinity && (isNaN(Number(a.peso)) || Number(a.peso) <= 0));
  if (aristasInvalidas.length > 0) {
    errores.push(`Capacidades inválidas: se detectaron ${aristasInvalidas.length} arista(s) con peso menor o igual a 0.`);
  }

  analisis.aislados.forEach(id => {
    errores.push(`Nodo [${id}] aislado: no posee aristas incidentes ni salientes.`);
  });

  const tieneSFicticio = posicionesNodos.some(n => n.id === 'S');
  const tieneTFicticio = posicionesNodos.some(n => n.id === 'T');

  if (!tieneSFicticio && analisis.fuentes.length >= 2) {
    errores.push(`Existen múltiples fuentes independientes sin conectar entre sí: [${analisis.fuentes.join(', ')}]. Presiona "Unir Fuentes (S / T)" para crear una Fuente Ficticia (S).`);
  }

  if (!tieneTFicticio && analisis.sumideros.length >= 2) {
    errores.push(`Existen múltiples sumideros independientes sin conectar entre sí: [${analisis.sumideros.join(', ')}]. Presiona "Unir Fuentes (S / T)" para crear un Sumidero Ficticio (T).`);
  }

  if (fVal === '' || nodoFuente === null) {
    errores.push('La Fuente no ha sido especificada en el formulario.');
  }
  if (sVal === '' || nodoSumidero === null) {
    errores.push('El Sumidero no ha sido especificado en el formulario.');
  }

  if (nodoFuente !== null && nodoSumidero !== null) {
    if (String(nodoFuente) === String(nodoSumidero)) {
      errores.push('La fuente y el sumidero no pueden ser el mismo nodo.');
    } else {
      const caminoBFS = buscarCaminoAumentanteBFS();
      if (!caminoBFS) {
        errores.push('No existe trayectoria entre la fuente y el sumidero.');
      }

      if (!tieneSFicticio) {
        const visitadosDesdeFuente = new Set([String(nodoFuente)]);
        const qF = [nodoFuente];
        while (qF.length > 0) {
          const u = qF.shift();
          aristas.filter(a => String(a.origen) === String(u)).forEach(a => {
            const dest = String(a.destino);
            if (!visitadosDesdeFuente.has(dest)) {
              visitadosDesdeFuente.add(dest);
              qF.push(a.destino);
            }
          });
        }
        const inalcanzables = nodosReales.filter(n => String(n.id) !== String(nodoFuente) && !visitadosDesdeFuente.has(String(n.id))).map(n => n.id);
        if (inalcanzables.length > 0) {
          errores.push(`Nodos sin conexión desde la fuente: [${inalcanzables.join(', ')}] no pueden ser alcanzados desde el nodo ${nodoFuente}. No hay caminos que puedan ir de unos nodos a otros.`);
        }
      }

      if (!tieneTFicticio) {
        const visitadosHaciaSumidero = new Set([String(nodoSumidero)]);
        const qS = [nodoSumidero];
        while (qS.length > 0) {
          const u = qS.shift();
          aristas.filter(a => String(a.destino) === String(u)).forEach(a => {
            const orig = String(a.origen);
            if (!visitadosHaciaSumidero.has(orig)) {
              visitadosHaciaSumidero.add(orig);
              qS.push(a.origen);
            }
          });
        }
        const sinSalida = nodosReales.filter(n => String(n.id) !== String(nodoSumidero) && !visitadosHaciaSumidero.has(String(n.id))).map(n => n.id);
        if (sinSalida.length > 0) {
          errores.push(`Callejones sin salida: [${sinSalida.join(', ')}] no tienen camino hacia el sumidero ${nodoSumidero}.`);
        }
      }
    }
  }

  const cicloDetectado = detectarCiclosDirigidos();
  if (cicloDetectado) {
    errores.push(`Ciclo dirigido detectado: [${cicloDetectado.join(' → ')}]. En un modelo de flujo máximo la red debe ser acíclica para garantizar la conservación de flujo y evitar circulaciones parásitas.`);
  }

  const esValida = errores.length === 0;
  badgeEstadoRed.className = `badge-estado ${esValida ? 'badge-verde' : 'badge-rojo'}`;
  badgeEstadoRed.textContent = esValida ? 'Válida' : 'Inválida';

  const tieneFicticios = posicionesNodos.some(n => n.isFictitious);
  diagnosticoMensaje.textContent = esValida
    ? (tieneFicticios ? 'Red válida. Los nodos ficticios permiten calcular el flujo máximo.' : 'Red válida. Fuente/Sumidero Ficticios configurados con capacidad ∞.')
    : (cicloDetectado
      ? `Red inválida. Se detectó el ciclo [${cicloDetectado.join(' → ')}]. Las redes de flujo máximo deben ser acíclicas.`
      : 'Red inválida. La estructura actual no permite ejecutar el algoritmo de Ford-Fulkerson.');

  listaAlertasRed.innerHTML = errores.map(e => `<li class="diagnostico-error-item">✕ ${e}</li>`).join('');
  return { esValida, errores };
}

// Distribuye los nodos ordenadamente de izquierda a derecha según sus niveles topológicos.
function aplicarLayoutHorizontal(capasAsignadas = null) {
  const nodosReales = posicionesNodos.filter(node => !node.isFictitious);
  let capas = capasAsignadas;

  if (!capas) {
    const grados = analizarGradosRedBase();
    const fuentes = grados.fuentes.length > 0 ? grados.fuentes : [nodosReales[0].id];
    capas = {};
    nodosReales.forEach(n => capas[n.id] = 0);
    const queue = [...fuentes];
    const visitados = new Set(fuentes);

    while (queue.length > 0) {
      const u = queue.shift();
      aristas.filter(a => !a.isFictitious && String(a.origen) === String(u)).forEach(a => {
        capas[a.destino] = Math.max(capas[a.destino] || 0, capas[u] + 1);
        if (!visitados.has(a.destino)) {
          visitados.add(a.destino);
          queue.push(a.destino);
        }
      });
    }
  }

  const numCapas = Math.max(...Object.values(capas)) + 1;
  const xMin = 130;
  const xMax = 470;
  const pasoX = numCapas > 1 ? (xMax - xMin) / (numCapas - 1) : 0;
  const grupos = Array.from({ length: numCapas }, () => []);

  nodosReales.forEach(nodo => {
    const l = capas[nodo.id] !== undefined ? capas[nodo.id] : 0;
    nodo.layer = l;
    grupos[l].push(nodo);
  });

  grupos.forEach((grupo, idxCapa) => {
    const cant = grupo.length;
    const xCoord = Math.round(xMin + idxCapa * pasoX);
    if (cant === 1) {
      grupo[0].x = xCoord;
      grupo[0].y = 300;
    } else {
      const yMin = 120;
      const yMax = 480;
      const pasoY = (yMax - yMin) / (cant - 1);
      grupo.forEach((nodo, idxNodo) => {
        nodo.x = xCoord;
        nodo.y = Math.round(yMin + idxNodo * pasoY);
      });
    }
  });

  const sf = posicionesNodos.find(node => node.id === 'S');
  if (sf) { sf.x = 55; sf.y = 300; }
  const st = posicionesNodos.find(node => node.id === 'T');
  if (st) { st.x = 545; st.y = 300; }

  dibujarRed();
}

// Genera proceduralmente un grafo estructurado en capas garantizando caminos dirigidos válidos.
function generarAristasAleatorias() {
  const n = numVerticesBase;
  const numCapas = n <= 8 ? 4 : 5;
  const cantFuentes = (n >= 8) ? 2 : (Math.random() < 0.6 ? 2 : 1);
  const cantSumideros = (n >= 8) ? 2 : (Math.random() < 0.6 ? 2 : 1);

  const capasNodos = Array.from({ length: numCapas }, () => []);
  const nodoACapa = {};
  let indexNodo = 1;

  for (let i = 0; i < cantFuentes && indexNodo <= n; i++) {
    capasNodos[0].push(indexNodo);
    nodoACapa[indexNodo] = 0;
    indexNodo++;
  }

  const capasIntermedias = numCapas - 2;
  const nodosRestantes = n - cantFuentes - cantSumideros;
  const porCapa = Math.floor(nodosRestantes / capasIntermedias);
  let sobrantes = nodosRestantes % capasIntermedias;

  for (let c = 1; c <= capasIntermedias; c++) {
    const cant = porCapa + (sobrantes > 0 ? 1 : 0);
    if (sobrantes > 0) sobrantes--;
    for (let i = 0; i < cant && indexNodo <= n - cantSumideros; i++) {
      capasNodos[c].push(indexNodo);
      nodoACapa[indexNodo] = c;
      indexNodo++;
    }
  }

  while (indexNodo <= n) {
    capasNodos[numCapas - 1].push(indexNodo);
    nodoACapa[indexNodo] = numCapas - 1;
    indexNodo++;
  }

  aristas = [];
  const aristasSet = new Set();
  function agregarAristaValida(u, v) {
    if (u === v) return;
    const key = `${u}->${v}`;
    if (!aristasSet.has(key)) {
      aristasSet.add(key);
      const peso = Math.floor(Math.random() * 20) + 5;
      aristas.push({ origen: u, destino: v, peso, flujo: 0, isFictitious: false });
    }
  }

  for (let c = 1; c < numCapas; c++) {
    capasNodos[c].forEach(v => {
      const u = capasNodos[c - 1][Math.floor(Math.random() * capasNodos[c - 1].length)];
      agregarAristaValida(u, v);
    });
  }

  for (let c = 0; c < numCapas - 1; c++) {
    capasNodos[c].forEach(u => {
      if (!aristas.some(a => a.origen === u)) {
        const v = capasNodos[c + 1][Math.floor(Math.random() * capasNodos[c + 1].length)];
        agregarAristaValida(u, v);
      }
    });
  }

  for (let c = 0; c < numCapas - 1; c++) {
    capasNodos[c].forEach(u => {
      capasNodos[c + 1].forEach(v => {
        if (Math.random() < 0.35) agregarAristaValida(u, v);
      });
      if (c + 2 < numCapas && !(c === 0 && c + 2 === numCapas - 1)) {
        const v = capasNodos[c + 2][Math.floor(Math.random() * capasNodos[c + 2].length)];
        if (Math.random() < 0.3) agregarAristaValida(u, v);
      }
    });
  }

  aplicarLayoutHorizontal(nodoACapa);
  aplicarReduccionCanonica();

  flujoTotal = 0;
  historialRecorridos = [];
  caminoSeleccionado = [];
  algoritmoTerminado = false;
  if (grupoCorteMinimo) grupoCorteMinimo.innerHTML = '';
  if (valFlujoTotal) valFlujoTotal.textContent = '0';
  if (seccionFord) seccionFord.style.display = 'none';

  const cicloGen = detectarCiclosDirigidos();
  if (cicloGen) {
    generarAristasAleatorias();
    return;
  }

  actualizarHistorialInteractivo();
  validarRed();
}

// Inicializa los nodos de la red según la cantidad especificada en configuración.
function generarRed() {
  const valor = inputVertices.value.trim();
  const n = Number(valor);

  if (valor === '' || isNaN(n) || !Number.isInteger(n) || n < 7 || n > 16) {
    mostrarAdvertencia('El número de vértices debe ser un número entero entre 7 y 16.');
    return;
  }

  numVerticesBase = n;
  inputNodoInicial.value = 1;
  inputNodoFinal.value = 2;
  nodoFuente = null;
  nodoSumidero = null;
  inputFuente.value = '';
  inputSumidero.value = '';

  aristas = [];
  posicionesNodos = [];
  caminoSeleccionado = [];
  flujoTotal = 0;
  historialRecorridos = [];
  algoritmoTerminado = false;
  if (grupoCorteMinimo) grupoCorteMinimo.innerHTML = '';
  if (seccionFord) seccionFord.style.display = 'none';

  for (let i = 1; i <= n; i++) {
    posicionesNodos.push({ id: i, label: String(i), x: 0, y: 0, layer: 0, isFictitious: false, fictitiousType: null });
  }

  const cols = Math.min(4, Math.ceil(n / 3));
  const capasInit = {};
  for (let i = 1; i <= n; i++) {
    capasInit[i] = Math.floor((i - 1) / Math.ceil(n / cols));
  }

  aplicarLayoutHorizontal(capasInit);
  validarRed();
}

// Inserta manualmente una arista dirigida y con capacidad en el grafo.
function conectarArista() {
  const origenVal = inputNodoInicial.value.trim();
  const destinoVal = inputNodoFinal.value.trim();
  const pesoVal = inputPeso.value.trim();

  const nodoOrig = obtenerNodo(origenVal);
  const nodoDest = obtenerNodo(destinoVal);

  if (!nodoOrig || !nodoDest) {
    mostrarAdvertencia('Verifica los nodos ingresados. Deben existir en la red.');
    return;
  }
  if (String(nodoOrig.id) === String(nodoDest.id)) {
    mostrarAdvertencia('El nodo inicial y el final no pueden coincidir.');
    return;
  }

  const peso = Number(pesoVal);
  if (pesoVal === '' || isNaN(peso) || !Number.isInteger(peso) || peso < 1 || peso > 9999) {
    mostrarAdvertencia('La capacidad debe ser un entero entre 1 y 9999.');
    return;
  }

  if (aristas.some(a => String(a.origen) === String(nodoOrig.id) && String(a.destino) === String(nodoDest.id))) {
    mostrarAdvertencia(`Ya existe una arista dirigida de ${nodoOrig.id} a ${nodoDest.id}.`);
    return;
  }

  // Comprobar preventivamente si agregar esta arista crearía un ciclo dirigido en la red
  const caminoCiclo = buscarCaminoDirigido(nodoDest.id, nodoOrig.id);
  if (caminoCiclo) {
    const cicloStr = [...caminoCiclo, nodoDest.id].join(' → ');
    mostrarAdvertencia(`No se puede conectar la arista ${nodoOrig.id} → ${nodoDest.id} porque generaría un ciclo dirigido en la red: [${cicloStr}]. En un modelo de flujo máximo las redes deben ser acíclicas (DAG).`, 'Ciclo No Permitido');
    return;
  }

  aristas.push({ origen: nodoOrig.id, destino: nodoDest.id, peso, flujo: 0, isFictitious: false });
  if (seccionFord) seccionFord.style.display = 'none';
  if (grupoCorteMinimo) grupoCorteMinimo.innerHTML = '';

  dibujarRed();
  validarRed();
  mostrarToast(`Arista ${nodoOrig.id} → ${nodoDest.id} agregada`, 'exito');
}

// Elimina de forma interactiva la arista seleccionada en el lienzo SVG.
function eliminarAristaInteractiva(arista) {
  if (seccionFord && seccionFord.style.display === 'flex' && !algoritmoTerminado) {
    mostrarAdvertencia('No puedes eliminar aristas mientras el algoritmo de Ford-Fulkerson está en ejecución.');
    return;
  }
  if (arista.isFictitious) {
    mostrarToast('Las aristas ficticias de S/T se gestionan automáticamente.', 'aviso');
    return;
  }
  aristas = aristas.filter(a => a !== arista);
  if (seccionFord) seccionFord.style.display = 'none';
  if (grupoCorteMinimo) grupoCorteMinimo.innerHTML = '';
  dibujarRed();
  validarRed();
  mostrarToast(`Arista ${arista.origen} → ${arista.destino} eliminada`, 'info');
}

// Elimina manualmente la arista indicada en el formulario.
function eliminarAristaManual() {
  const origenVal = inputNodoInicial.value.trim();
  const destinoVal = inputNodoFinal.value.trim();
  const nodoOrig = obtenerNodo(origenVal);
  const nodoDest = obtenerNodo(destinoVal);

  if (!nodoOrig || !nodoDest) {
    mostrarAdvertencia('Verifica los nodos ingresados. Deben existir en la red.');
    return;
  }

  const idx = aristas.findIndex(a => !a.isFictitious && String(a.origen) === String(nodoOrig.id) && String(a.destino) === String(nodoDest.id));
  if (idx === -1) {
    mostrarAdvertencia(`No existe una arista dirigida de ${nodoOrig.id} a ${nodoDest.id}.`);
    return;
  }

  aristas.splice(idx, 1);
  if (seccionFord) seccionFord.style.display = 'none';
  if (grupoCorteMinimo) grupoCorteMinimo.innerHTML = '';
  dibujarRed();
  validarRed();
  mostrarToast(`Arista ${nodoOrig.id} → ${nodoDest.id} eliminada`, 'info');
}

// Dibuja en el SVG los elementos visuales del grafo incluyendo nodos, aristas y etiquetas.
function dibujarRed() {
  const radioNodo = 20;
  grupoAristas.innerHTML = '';
  grupoNodos.innerHTML = '';

  const textos = [];

  aristas.forEach(arista => {
    arista.flujo = arista.flujo || 0;
    const p1 = obtenerNodo(arista.origen);
    const p2 = obtenerNodo(arista.destino);
    if (!p1 || !p2) return;

    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    const dist = Math.hypot(dx, dy);
    if (dist === 0) return;

    const ux = dx / dist;
    const uy = dy / dist;
    const r1 = p1.isFictitious ? 22 : radioNodo;
    const r2 = p2.isFictitious ? 22 : radioNodo;

    const x1 = p1.x + r1 * ux;
    const y1 = p1.y + r1 * uy;
    const x2 = p2.x - r2 * ux;
    const y2 = p2.y - r2 * uy;

    const tieneOpuesta = aristas.some(a => String(a.origen) === String(arista.destino) && String(a.destino) === String(arista.origen));
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

    const colorInfo = obtenerColorArista(arista.flujo, arista.peso, arista.isFictitious);
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', dRuta);
    path.setAttribute('class', `arista-linea ${arista.isFictitious ? 'arista-ficticia' : ''}`);
    path.setAttribute('stroke', colorInfo.hex);
    path.setAttribute('marker-start', `url(#punto-inicio-${colorInfo.nombre})`);
    path.setAttribute('marker-end', `url(#flecha-${colorInfo.nombre})`);

    const tituloArista = document.createElementNS('http://www.w3.org/2000/svg', 'title');
    tituloArista.textContent = arista.isFictitious
      ? `Arista ficticia: ${arista.origen} → ${arista.destino}`
      : `Arista ${arista.origen} → ${arista.destino} (cap: ${arista.peso === Infinity ? '∞' : arista.peso}) — Clic derecho para eliminar`;
    path.appendChild(tituloArista);

    path.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      eliminarAristaInteractiva(arista);
    });

    grupoAristas.appendChild(path);

    const textoPeso = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    textoPeso.setAttribute('x', lx);
    textoPeso.setAttribute('y', ly);
    textoPeso.setAttribute('class', 'peso-arista');
    const capTexto = arista.peso === Infinity ? '∞' : arista.peso;
    textoPeso.textContent = `${arista.flujo}/${capTexto}`;
    textos.push(textoPeso);
  });

  textos.forEach(t => grupoAristas.appendChild(t));

  posicionesNodos.forEach(nodoObj => {
    const idNodo = nodoObj.id;
    const grupo = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    grupo.setAttribute('class', 'nodo');
    grupo.setAttribute('id', `nodo-${idNodo}`);
    grupo.setAttribute('data-nodo-id', idNodo);
    grupo.style.cursor = 'pointer';

    let colorFondo = COLORES[0];
    const esFicticio = Boolean(nodoObj.isFictitious);

    if (String(idNodo) === String(nodoFuente)) colorFondo = esFicticio ? COLOR_TEAL_FICTICIO : COLORES[1];
    else if (String(idNodo) === String(nodoSumidero)) colorFondo = esFicticio ? COLOR_ROSA_FICTICIO : COLORES[2];
    else if (esFicticio) colorFondo = COLOR_TEAL_FICTICIO;

    if (caminoSeleccionado.some(id => String(id) === String(idNodo))) colorFondo = COLOR_MORADO;

    if (esFicticio) {
      grupo.classList.add('nodo-ficticio');
      grupo.classList.add(nodoObj.fictitiousType === 'fuente' || idNodo === 'S' ? 'nodo-ficticio-fuente' : 'nodo-ficticio-sumidero');
    }

    const circulo = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circulo.setAttribute('cx', nodoObj.x);
    circulo.setAttribute('cy', nodoObj.y);
    circulo.setAttribute('r', esFicticio ? 22 : radioNodo);
    circulo.setAttribute('fill', colorFondo);

    const texto = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    texto.setAttribute('x', nodoObj.x);
    texto.setAttribute('y', nodoObj.y);
    texto.textContent = nodoObj.label || idNodo;

    grupo.appendChild(circulo);
    grupo.appendChild(texto);
    grupo.addEventListener('click', () => manejarClickNodo(idNodo));
    grupoNodos.appendChild(grupo);
  });
}

// Encuentra un camino aumentante residual entre la fuente y el sumidero usando BFS.
function buscarCaminoAumentanteBFS() {
  if (nodoFuente === null || nodoSumidero === null) return null;
  const parent = new Map();
  const queue = [nodoFuente];
  const visitado = new Set([String(nodoFuente)]);

  while (queue.length > 0) {
    const u = queue.shift();
    if (String(u) === String(nodoSumidero)) break;

    for (const a of aristas) {
      if (String(a.origen) === String(u)) {
        const destStr = String(a.destino);
        const residual = Number(a.peso) - Number(a.flujo);
        if (!visitado.has(destStr) && residual > 0) {
          visitado.add(destStr);
          parent.set(destStr, a.origen);
          queue.push(a.destino);
        }
      }
    }
  }

  if (!visitado.has(String(nodoSumidero))) return null;

  const camino = [];
  let curr = nodoSumidero;
  while (String(curr) !== String(nodoFuente)) {
    camino.unshift(curr);
    curr = parent.get(String(curr));
  }
  camino.unshift(nodoFuente);
  return camino;
}

// Configura la fuente y el sumidero elegidos y habilita el entorno de ejecución del algoritmo.
function aplicarFuenteSumidero() {
  const fuenteVal = inputFuente.value.trim();
  const sumideroVal = inputSumidero.value.trim();
  const nodoOrig = obtenerNodo(fuenteVal);
  const nodoDest = obtenerNodo(sumideroVal);

  if (!nodoOrig || !nodoDest) {
    mostrarAdvertencia('La fuente y el sumidero seleccionados deben existir en la red.');
    return;
  }
  if (String(nodoOrig.id) === String(nodoDest.id)) {
    mostrarAdvertencia('La fuente y el sumidero deben ser nodos diferentes.');
    return;
  }

  nodoFuente = nodoOrig.id;
  nodoSumidero = nodoDest.id;

  const cicloDetectado = detectarCiclosDirigidos();
  if (cicloDetectado) {
    mostrarAdvertencia(`La red contiene el ciclo dirigido [${cicloDetectado.join(' → ')}]. En un modelo de flujo máximo las redes deben ser acíclicas. Elimina las aristas que forman el ciclo antes de iniciar Ford-Fulkerson.`, 'Ciclo Detectado');
    seccionFord.style.display = 'none';
    dibujarRed();
    validarRed();
    return;
  }

  aristas.forEach(a => a.flujo = 0);
  flujoTotal = 0;
  historialRecorridos = [];
  caminoSeleccionado = [];
  algoritmoTerminado = false;
  if (grupoCorteMinimo) grupoCorteMinimo.innerHTML = '';

  const diag = validarRed();
  if (!diag.esValida) {
    mostrarAdvertencia('La red presenta inconsistencias reportadas en el panel de Diagnóstico.');
    seccionFord.style.display = 'none';
    dibujarRed();
    return;
  }

  seccionFord.style.display = 'flex';
  instruccionFord.textContent = `Halla un camino de ${nodoFuente} hacia ${nodoSumidero} (haz clic sobre los nodos empezando de la fuente)`;
  textoCamino.textContent = 'Ninguno';
  btnVerificarCamino.disabled = true;
  divPreguntaCapacidad.style.display = 'none';
  panelFinalFlujo.style.display = 'none';
  valFlujoTotal.textContent = '0';

  dibujarRed();
  mostrarToast(`Fuente: ${nodoFuente}, Sumidero: ${nodoSumidero} fijados`, 'exito');
}

// Gestiona la selección interactiva de nodos al construir manualmente el camino aumentante.
function manejarClickNodo(idNodo) {
  if (isDragging) return;
  if (!seccionFord || seccionFord.style.display !== 'flex') return;
  if (algoritmoTerminado) return;
  if (divPreguntaCapacidad.style.display === 'flex') return;

  // Evitar repetir nodos en el camino aumentante (debe ser un camino simple sin ciclos)
  if (caminoSeleccionado.some(id => String(id) === String(idNodo))) {
    mostrarToast(`El nodo ${idNodo} ya está en el camino. Los caminos de aumento deben ser simples (sin ciclos).`, 'aviso');
    return;
  }

  // Si es el primer nodo, debe coincidir con la fuente
  if (caminoSeleccionado.length === 0) {
    if (String(idNodo) !== String(nodoFuente)) {
      mostrarAdvertencia(`El camino debe iniciar en el nodo Fuente (${nodoFuente}).`);
      return;
    }
  } else {
    // Si ya hay nodos, validar que exista arista dirigida desde el último nodo con capacidad residual
    const u = caminoSeleccionado[caminoSeleccionado.length - 1];
    const arista = aristas.find(a => String(a.origen) === String(u) && String(a.destino) === String(idNodo));
    if (!arista) {
      mostrarAdvertencia(`No existe arista dirigida entre ${u} y ${idNodo}.`);
      return;
    }
    const residual = (arista.peso === Infinity ? Infinity : Number(arista.peso)) - Number(arista.flujo || 0);
    if (residual <= 0) {
      mostrarAdvertencia(`La arista ${u} → ${idNodo} no posee capacidad residual disponible.`);
      return;
    }
  }

  caminoSeleccionado.push(idNodo);
  textoCamino.textContent = caminoSeleccionado.join(' -> ');
  btnVerificarCamino.disabled = false;
  dibujarRed();
}

// Reinicia la selección del camino actual en construcción.
function limpiarSeleccionCamino() {
  caminoSeleccionado = [];
  textoCamino.textContent = 'Ninguno';
  btnVerificarCamino.disabled = true;
  divPreguntaCapacidad.style.display = 'none';
  dibujarRed();
}

// Valida que el camino elegido comience en la fuente, termine en el sumidero y tenga capacidad residual.
function verificarCamino() {
  if (caminoSeleccionado.length < 2) {
    mostrarAdvertencia('El camino debe tener al menos 2 nodos.');
    limpiarSeleccionCamino();
    return;
  }

  if (String(caminoSeleccionado[0]) !== String(nodoFuente)) {
    mostrarAdvertencia(`El camino debe iniciar en la fuente (${nodoFuente}).`);
    limpiarSeleccionCamino();
    return;
  }

  if (String(caminoSeleccionado[caminoSeleccionado.length - 1]) !== String(nodoSumidero)) {
    mostrarAdvertencia(`El camino debe terminar en el sumidero (${nodoSumidero}).`);
    limpiarSeleccionCamino();
    return;
  }

  // Validar camino simple (sin nodos duplicados / ciclos)
  const nodosVistos = new Set();
  for (const nodo of caminoSeleccionado) {
    const sId = String(nodo);
    if (nodosVistos.has(sId)) {
      mostrarAdvertencia(`El camino seleccionado contiene ciclos: el nodo ${nodo} se repite. En el algoritmo de Ford-Fulkerson los caminos aumentantes deben ser simples.`);
      limpiarSeleccionCamino();
      return;
    }
    nodosVistos.add(sId);
  }

  for (let i = 0; i < caminoSeleccionado.length - 1; i++) {
    const u = caminoSeleccionado[i];
    const v = caminoSeleccionado[i + 1];
    const arista = aristas.find(a => String(a.origen) === String(u) && String(a.destino) === String(v));

    if (!arista) {
      mostrarAdvertencia(`No existe arista dirigida entre ${u} y ${v}.`);
      limpiarSeleccionCamino();
      return;
    }

    const residual = (arista.peso === Infinity ? Infinity : Number(arista.peso)) - Number(arista.flujo || 0);
    if (residual <= 0) {
      mostrarAdvertencia(`La arista ${u} → ${v} no posee capacidad residual.`);
      limpiarSeleccionCamino();
      return;
    }
  }

  divPreguntaCapacidad.style.display = 'flex';
  inputCapacidadCamino.value = '';
  if (inputCapacidadCamino && typeof inputCapacidadCamino.focus === 'function') {
    inputCapacidadCamino.focus();
  }
}

// Confirma el cuello de botella, aumenta el flujo residual y comprueba la condición de corte mínimo.
function confirmarCapacidad() {
  const capIngresada = Number(inputCapacidadCamino.value.trim());

  let cuelloBotella = Infinity;
  for (let i = 0; i < caminoSeleccionado.length - 1; i++) {
    const u = caminoSeleccionado[i];
    const v = caminoSeleccionado[i + 1];
    const arista = aristas.find(a => String(a.origen) === String(u) && String(a.destino) === String(v));
    const residual = (arista.peso === Infinity ? Infinity : Number(arista.peso)) - Number(arista.flujo || 0);
    if (residual < cuelloBotella) cuelloBotella = residual;
  }

  if (isNaN(capIngresada) || capIngresada !== cuelloBotella || capIngresada <= 0) {
    mostrarAdvertencia(`Capacidad incorrecta. Debe ser el cuello de botella (${cuelloBotella}) del camino.`);
    return;
  }

  for (let i = 0; i < caminoSeleccionado.length - 1; i++) {
    const u = caminoSeleccionado[i];
    const v = caminoSeleccionado[i + 1];
    const arista = aristas.find(a => String(a.origen) === String(u) && String(a.destino) === String(v));
    arista.flujo = Number(arista.flujo || 0) + cuelloBotella;
  }

  // Cancelar automáticamente cualquier circulación o ciclo de flujo parásito
  cancelarCiclosDeFlujo();

  flujoTotal += cuelloBotella;
  historialRecorridos.push({ camino: caminoSeleccionado.join(' -> '), capacidad: cuelloBotella });
  valFlujoTotal.textContent = flujoTotal;

  caminoSeleccionado = [];
  textoCamino.textContent = 'Ninguno';
  btnVerificarCamino.disabled = true;
  divPreguntaCapacidad.style.display = 'none';

  dibujarRed();
  actualizarHistorialInteractivo();

  const hayMasCaminos = buscarCaminoAumentanteBFS();
  if (!hayMasCaminos) {
    algoritmoTerminado = true;
    panelFinalFlujo.style.display = 'block';

    const corte = calcularCorteMinimo();
    dibujarLineaCorteMinimo(corte);

    let textoCorteHTML = '';
    if (corte) {
      textoCorteHTML = `
        <div class="corte-minimo-detalle">
          <strong>Teorema de Flujo Máximo / Corte Mínimo:</strong><br>
          <span>• Conjunto S (alcanzables en Gf): {${corte.conjuntoS.join(', ')}}</span><br>
          <span>• Conjunto T (no alcanzables): {${corte.conjuntoT.join(', ')}}</span><br>
          <span>• Aristas del corte c(S, T): ${corte.aristasCorte.map(a => `${a.origen}→${a.destino} (c: ${a.peso === Infinity ? '∞' : a.peso})`).join(', ') || 'Ninguna'}</span><br>
          <span>• Capacidad del corte: c(S, T) = <strong>${corte.capacidadCorte}</strong></span><br>
          <span>• Verificación formal: <strong>|f| = ${flujoTotal} = c(S, T)</strong> (Demostración de flujo óptimo).</span>
        </div>
      `;
    }

    textoResumenFinal.innerHTML = `
      Capacidad total del flujo máximo: <strong>${flujoTotal}</strong>.<br>
      Total de recorridos realizados: ${historialRecorridos.length}.
      ${textoCorteHTML}
    `;
    listaCaminosRecorridos.innerHTML = historialRecorridos.map((r, idx) => `<div><strong>${idx + 1}.</strong> ${r.camino} (+${r.capacidad})</div>`).join('');
    instruccionFord.textContent = '¡Flujo Máximo Alcanzado! No existen más caminos aumentantes disponibles.';
    mostrarToast(`¡Flujo Máximo alcanzado: ${flujoTotal}!`, 'exito', 5000);
  } else {
    instruccionFord.textContent = `Halla un camino de ${nodoFuente} hacia ${nodoSumidero} (haz clic sobre los nodos)`;
  }
}

// Determina formalmente el corte mínimo (S, T) sobre la red residual final mediante búsqueda BFS.
function calcularCorteMinimo() {
  if (nodoFuente === null || nodoSumidero === null) return null;
  const visitados = new Set([String(nodoFuente)]);
  const queue = [nodoFuente];

  while (queue.length > 0) {
    const u = queue.shift();
    for (const a of aristas) {
      if (String(a.origen) === String(u)) {
        const destStr = String(a.destino);
        const residual = (a.peso === Infinity ? Infinity : Number(a.peso)) - Number(a.flujo);
        if (residual > 0 && !visitados.has(destStr)) {
          visitados.add(destStr);
          queue.push(a.destino);
        }
      }
      if (String(a.destino) === String(u)) {
        const origStr = String(a.origen);
        if (Number(a.flujo) > 0 && !visitados.has(origStr)) {
          visitados.add(origStr);
          queue.push(a.origen);
        }
      }
    }
  }

  const conjuntoS = [];
  const conjuntoT = [];
  posicionesNodos.forEach(n => {
    if (visitados.has(String(n.id))) conjuntoS.push(n.id);
    else conjuntoT.push(n.id);
  });

  const aristasCorte = aristas.filter(a => visitados.has(String(a.origen)) && !visitados.has(String(a.destino)));
  const capacidadCorte = aristasCorte.reduce((sum, a) => sum + (a.peso === Infinity ? a.flujo : Number(a.peso)), 0);

  return { conjuntoS, conjuntoT, aristasCorte, capacidadCorte, visitados };
}

// Dibuja en el lienzo SVG la línea divisoria discontinua que separa visualmente el corte (S, T).
function dibujarLineaCorteMinimo(corte) {
  if (!grupoCorteMinimo) return;
  grupoCorteMinimo.innerHTML = '';
  if (!corte || corte.conjuntoS.length === 0 || corte.conjuntoT.length === 0) return;

  const nodosS = posicionesNodos.filter(n => corte.visitados.has(String(n.id)));
  const nodosT = posicionesNodos.filter(n => !corte.visitados.has(String(n.id)));

  if (nodosS.length === 0 || nodosT.length === 0) return;

  const maxXS = Math.max(...nodosS.map(n => n.x));
  const minXT = Math.min(...nodosT.map(n => n.x));
  const corteX = maxXS < minXT ? (maxXS + minXT) / 2 : Math.max(30, Math.min(570, (maxXS + minXT) / 2));

  const linea = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  linea.setAttribute('x1', corteX);
  linea.setAttribute('y1', 25);
  linea.setAttribute('x2', corteX);
  linea.setAttribute('y2', 575);
  linea.setAttribute('class', 'linea-corte-minimo');
  grupoCorteMinimo.appendChild(linea);

  const etiqueta = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  etiqueta.setAttribute('x', corteX);
  etiqueta.setAttribute('y', 20);
  etiqueta.setAttribute('class', 'etiqueta-corte-minimo');
  etiqueta.textContent = 'Corte Mínimo (S, T)';
  grupoCorteMinimo.appendChild(etiqueta);
}

// Transforma las coordenadas de la pantalla a coordenadas del sistema SVG.
function getSVGPoint(evt) {
  const pt = svgRed.createSVGPoint();
  const ctm = svgRed.getScreenCTM().inverse();
  pt.x = evt.clientX;
  pt.y = evt.clientY;
  return pt.matrixTransform(ctm);
}

svgRed.addEventListener('mousedown', (e) => {
  const nodoEl = e.target.closest('.nodo');
  if (!nodoEl) return;
  nodoDragId = nodoEl.getAttribute('data-nodo-id') || nodoEl.id.replace('nodo-', '');
  isDragging = false;
  dragStartPos = { x: e.clientX, y: e.clientY };
  nodoEl.classList.add('nodo-dragging');
  e.preventDefault();
});

document.addEventListener('mousemove', (e) => {
  if (nodoDragId === null) return;
  if (!isDragging && dragStartPos) {
    if (Math.abs(e.clientX - dragStartPos.x) > 4 || Math.abs(e.clientY - dragStartPos.y) > 4) isDragging = true;
  }
  if (!isDragging) return;

  const svgPoint = getSVGPoint(e);
  const nodoObj = obtenerNodo(nodoDragId);
  if (nodoObj) {
    nodoObj.x = Math.max(25, Math.min(575, svgPoint.x));
    nodoObj.y = Math.max(25, Math.min(575, svgPoint.y));
    dibujarRed();
    const el = document.getElementById(`nodo-${nodoDragId}`);
    if (el) el.classList.add('nodo-dragging');
  }
  ocultarTooltipNodo();
});

document.addEventListener('mouseup', () => {
  if (nodoDragId !== null) {
    const el = document.getElementById(`nodo-${nodoDragId}`);
    if (el) el.classList.remove('nodo-dragging');
    nodoDragId = null;
    isDragging = false;
    dragStartPos = null;
  }
});

// Presenta el tooltip flotante con la información topológica y flujo neto del nodo.
function mostrarTooltipNodo(idNodo, eventoMouse) {
  const nodoObj = obtenerNodo(idNodo);
  if (!nodoObj) return;

  const salientes = aristas.filter(a => String(a.origen) === String(idNodo));
  const entrantes = aristas.filter(a => String(a.destino) === String(idNodo));
  const flujoSaliente = salientes.reduce((s, a) => s + (a.flujo || 0), 0);
  const flujoEntrante = entrantes.reduce((s, a) => s + (a.flujo || 0), 0);

  let tipo = 'Normal';
  if (nodoObj.isFictitious) tipo = nodoObj.id === 'S' ? 'Fuente Ficticia (S)' : 'Sumidero Ficticio (T)';
  else if (String(idNodo) === String(nodoFuente)) tipo = 'Fuente';
  else if (String(idNodo) === String(nodoSumidero)) tipo = 'Sumidero';

  tooltipNodoId.textContent = idNodo;
  tooltipNodoTipo.textContent = tipo;
  tooltipNodoSalientes.textContent = `${salientes.length} (flujo: ${flujoSaliente})`;
  tooltipNodoEntrantes.textContent = `${entrantes.length} (flujo: ${flujoEntrante})`;
  tooltipNodoFlujo.textContent = flujoSaliente - flujoEntrante;
  nodoTooltip.style.display = 'block';

  const tooltipRect = nodoTooltip.getBoundingClientRect();
  let left = eventoMouse.clientX + 16;
  let top = eventoMouse.clientY - 10;
  if (left + tooltipRect.width > window.innerWidth) left = eventoMouse.clientX - tooltipRect.width - 16;
  if (top + tooltipRect.height > window.innerHeight) top = window.innerHeight - tooltipRect.height - 10;

  nodoTooltip.style.left = `${left}px`;
  nodoTooltip.style.top = `${top}px`;
}

// Oculta el tooltip informativo del nodo.
function ocultarTooltipNodo() {
  nodoTooltip.style.display = 'none';
}

// Renderiza en la interfaz la lista de caminos aumentantes recorridos con soporte de replay.
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
        <span class="historial-capacidad">+${rec.capacidad} unidades</span>
      </div>
      <button class="btn historial-replay-btn" title="Reproducir este camino">▶</button>
    `;

    item.addEventListener('mouseenter', () => {
      rec.camino.split(' -> ').forEach(id => {
        const el = document.getElementById(`nodo-${id}`);
        if (el) {
          const c = el.querySelector('circle');
          if (c) c.setAttribute('fill', COLOR_MORADO);
        }
      });
      item.classList.add('historial-active');
    });

    item.addEventListener('mouseleave', () => {
      dibujarRed();
      item.classList.remove('historial-active');
    });

    item.querySelector('.historial-replay-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      replayPath(rec.camino.split(' -> '));
    });

    historialInteractivo.appendChild(item);
  });

  btnReplayTodo.disabled = historialRecorridos.length === 0;
}

// Pausa la ejecución asíncrona durante un número determinado de milisegundos.
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Reproduce secuencialmente la animación de un camino aumentante sobre el grafo.
async function replayPath(nodos) {
  caminoSeleccionado = [];
  dibujarRed();
  for (let i = 0; i < nodos.length; i++) {
    caminoSeleccionado.push(nodos[i]);
    dibujarRed();
    await sleep(350);
  }
  setTimeout(() => {
    caminoSeleccionado = [];
    dibujarRed();
  }, 1000);
}

// Reproduce de forma automática todos los caminos aumentantes almacenados en el historial.
async function replayTodo() {
  btnReplayTodo.disabled = true;
  for (let i = 0; i < historialRecorridos.length; i++) {
    await replayPath(historialRecorridos[i].camino.split(' -> '));
    await sleep(400);
  }
  btnReplayTodo.disabled = false;
}

btnReplayTodo.addEventListener('click', replayTodo);

// Muestra una notificación emergente temporal tipo toast en la interfaz.
function mostrarToast(mensaje, tipo = 'info', duracion = 3000) {
  const iconos = { exito: '✓', info: 'ℹ', aviso: '⚠' };
  const toast = document.createElement('div');
  toast.className = `toast toast-${tipo}`;
  toast.innerHTML = `<span class="toast-icono">${iconos[tipo] || 'ℹ'}</span><span>${mensaje}</span><div class="toast-progress"></div>`;
  toast.style.position = 'relative';

  toast.addEventListener('click', () => {
    toast.classList.add('toast-exit');
    setTimeout(() => toast.remove(), 300);
  });

  toastContainer.appendChild(toast);
  setTimeout(() => {
    if (toast.parentNode) {
      toast.classList.add('toast-exit');
      setTimeout(() => toast.remove(), 300);
    }
  }, duracion);
}

const pasosTutorial = [
  { titulo: 'Simulador de Flujo Máximo', contenido: 'Modela redes dirigidas y resuelve el problema de Flujo Máximo con Ford-Fulkerson y el Teorema del Corte Mínimo.' },
  { titulo: 'Vértices y Layout Horizontal', contenido: 'Configura la cantidad de nodos y presiona "Aleatorio" para generar una red por niveles de izquierda a derecha sin atajos directos.' },
  { titulo: 'Gestión y Eliminación Fácil de Aristas', contenido: 'Conecta nodos desde el panel manual o elimínalos al instante haciendo clic derecho sobre cualquier arista en el lienzo (o con el botón "Eliminar"). Además, el sistema previene la formación de ciclos dirigidos.' },
  { titulo: 'Fuentes y Sumideros Ficticios', contenido: 'Si hay múltiples fuentes o sumideros, el sistema crea automáticamente extremos ficticios (S y T) con capacidad infinita (∞).' },
  { titulo: 'Diagnóstico y Validación de Ciclos', contenido: 'El panel de Diagnóstico valida que la red sea acíclica (sin ciclos dirigidos mediante DFS), sin callejones ni nodos aislados, asegurando caminos aumentantes simples.' },
  { titulo: 'Corte Mínimo (S, T)', contenido: 'Al agotar los caminos aumentantes, el simulador traza la línea divisoria del Corte Mínimo y verifica formalmente que |f| = c(S, T).' }
];

let pasoActualTutorial = 0;

// Actualiza los elementos textuales y la barra de progreso del tutorial.
function actualizarTutorial() {
  const paso = pasosTutorial[pasoActualTutorial];
  tutorialTitulo.textContent = paso.titulo;
  tutorialContenido.textContent = paso.contenido;
  tutorialPasoNum.textContent = `${pasoActualTutorial + 1}/${pasosTutorial.length}`;
  tutorialProgressBar.style.width = `${((pasoActualTutorial + 1) / pasosTutorial.length) * 100}%`;
  btnTutorialAnterior.disabled = pasoActualTutorial === 0;
  btnTutorialSiguiente.textContent = pasoActualTutorial === pasosTutorial.length - 1 ? '¡Empezar! 🚀' : 'Siguiente →';
}

btnTutorial.addEventListener('click', () => {
  pasoActualTutorial = 0;
  actualizarTutorial();
  tutorialOverlay.style.display = 'flex';
});

btnTutorialSiguiente.addEventListener('click', () => {
  if (pasoActualTutorial < pasosTutorial.length - 1) {
    pasoActualTutorial++;
    actualizarTutorial();
  } else {
    tutorialOverlay.style.display = 'none';
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

const observerNodos = new MutationObserver(() => {
  document.querySelectorAll('.nodo').forEach(nodoEl => {
    const id = nodoEl.getAttribute('data-nodo-id') || nodoEl.id.replace('nodo-', '');
    nodoEl.addEventListener('mouseenter', (e) => { if (!isDragging) mostrarTooltipNodo(id, e); });
    nodoEl.addEventListener('mousemove', (e) => { if (!isDragging) mostrarTooltipNodo(id, e); });
    nodoEl.addEventListener('mouseleave', ocultarTooltipNodo);
    if (seccionFord.style.display === 'flex' && !algoritmoTerminado) nodoEl.classList.add('nodo-clickable');
  });
});

observerNodos.observe(grupoNodos, { childList: true });

btnAplicar.addEventListener('click', () => {
  generarRed();
  mostrarToast(`Red inicializada con ${numVerticesBase} vértices`, 'info');
});

btnConectar.addEventListener('click', conectarArista);
if (btnEliminarArista) btnEliminarArista.addEventListener('click', eliminarAristaManual);
btnAleatorio.addEventListener('click', generarAristasAleatorias);
btnAceptarFuenteSumidero.addEventListener('click', aplicarFuenteSumidero);
if (btnAutoCanonico) btnAutoCanonico.addEventListener('click', () => aplicarReduccionCanonica(true));
btnVerificarCamino.addEventListener('click', verificarCamino);
btnLimpiarCamino.addEventListener('click', limpiarSeleccionCamino);
btnConfirmarCapacidad.addEventListener('click', confirmarCapacidad);

inputFuente.addEventListener('input', () => {
  const fVal = String(inputFuente.value || '').trim();
  const fNodo = fVal !== '' ? obtenerNodo(fVal) : null;
  nodoFuente = fNodo ? fNodo.id : null;
  if (seccionFord) seccionFord.style.display = 'none';
  if (grupoCorteMinimo) grupoCorteMinimo.innerHTML = '';
  dibujarRed();
  validarRed();
});

inputSumidero.addEventListener('input', () => {
  const sVal = String(inputSumidero.value || '').trim();
  const sNodo = sVal !== '' ? obtenerNodo(sVal) : null;
  nodoSumidero = sNodo ? sNodo.id : null;
  if (seccionFord) seccionFord.style.display = 'none';
  if (grupoCorteMinimo) grupoCorteMinimo.innerHTML = '';
  dibujarRed();
  validarRed();
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    tutorialOverlay.style.display = 'none';
    ocultarAdvertencia();
  }
  if (e.key === '?' && !e.ctrlKey && !e.metaKey) {
    const activeEl = document.activeElement;
    if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA')) return;
    pasoActualTutorial = 0;
    actualizarTutorial();
    tutorialOverlay.style.display = 'flex';
  }
  if (e.ctrlKey && e.key === 'z') {
    if (caminoSeleccionado.length > 0 && seccionFord.style.display === 'flex' && !algoritmoTerminado) {
      caminoSeleccionado.pop();
      textoCamino.textContent = caminoSeleccionado.length > 0 ? caminoSeleccionado.join(' -> ') : 'Ninguno';
      btnVerificarCamino.disabled = caminoSeleccionado.length === 0;
      dibujarRed();
      e.preventDefault();
    }
  }
});

window.addEventListener('DOMContentLoaded', () => {
  generarRed();
  generarAristasAleatorias();
});
