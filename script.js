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

let posicionesNodos = [];
let aristas = [];

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
  if (Number(inputNodoInicial.value) > n) inputNodoInicial.value = 1;
  if (Number(inputNodoFinal.value) > n) inputNodoFinal.value = n;

  aristas = [];
  posicionesNodos = [];

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

// Renderiza los nodos y el canvas SVG inicial.
function dibujarRed() {
  grupoAristas.innerHTML = '';
  grupoNodos.innerHTML = '';

  const radioNodo = 20;

  posicionesNodos.forEach((pos, i) => {
    const idNodo = i + 1;
    const grupo = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    grupo.setAttribute('class', 'nodo');
    grupo.setAttribute('id', `nodo-${idNodo}`);

    const circulo = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circulo.setAttribute('cx', pos.x);
    circulo.setAttribute('cy', pos.y);
    circulo.setAttribute('r', radioNodo);
    circulo.setAttribute('fill', COLORES[0]);

    const texto = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    texto.setAttribute('x', pos.x);
    texto.setAttribute('y', pos.y);
    texto.textContent = idNodo;

    grupo.appendChild(circulo);
    grupo.appendChild(texto);
    grupoNodos.appendChild(grupo);
  });
}

btnAplicar.addEventListener('click', generarRed);

window.addEventListener('DOMContentLoaded', () => {
  generarRed();
});
