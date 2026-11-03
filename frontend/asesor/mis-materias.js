// Mis materias: el asesor marca las materias en las que da asesoría.
// Todo se guarda en la base de datos con /api/mis-materias.

var formulario = document.getElementById('buscador');
var inputBusqueda = document.getElementById('busqueda');
var checkSoloMias = document.getElementById('soloMias');
var lista = document.getElementById('lista');
var contador = document.getElementById('contador');
var resumen = document.getElementById('resumen');
var mensaje = document.getElementById('mensaje');
var btnSalir = document.getElementById('btnSalir');

var temporizador;
var numeroPeticion = 0;
var materiasActuales = []; // lo que se está mostrando
var totalElegidas = 0;     // cuántas materias imparte en total

// crea un elemento con su clase y su texto
function crear(etiqueta, clase, texto) {
    var elemento = document.createElement(etiqueta);
    if (clase) {
        elemento.className = clase;
    }
    if (texto !== undefined) {
        elemento.textContent = texto;
    }
    return elemento;
}

function mostrarMensaje(texto, esError) {
    mensaje.textContent = texto;
    mensaje.className = esError ? 'mensaje error' : 'mensaje';
    mensaje.hidden = false;
}

function ocultarMensaje() {
    mensaje.hidden = true;
}

// llamada al servidor; si la sesión se acabó manda al login
function pedir(url, metodo) {
    return fetch(url, { method: metodo || 'GET' }).then(function (respuesta) {
        if (respuesta.status === 401) {
            window.location.href = '/login/login.html?error=sesion';
            return new Promise(function () {});
        }
        return respuesta.json().catch(function () { return {}; }).then(function (datos) {
            return { estado: respuesta.status, datos: datos };
        });
    });
}

function pintarResumen() {
    resumen.textContent = '';
    if (totalElegidas === 0) {
        resumen.textContent = 'Todavía no eliges ninguna materia: los alumnos no podrán encontrarte.';
        return;
    }
    resumen.appendChild(document.createTextNode('Das asesoría en '));
    resumen.appendChild(crear('strong', '', String(totalElegidas)));
    resumen.appendChild(document.createTextNode(totalElegidas === 1 ? ' materia.' : ' materias.'));
}

// arma la tarjeta de una materia con su botón
function crearTarjeta(materia) {
    var tarjeta = crear('article', materia.seleccionada ? 'materia elegida' : 'materia');
    tarjeta.appendChild(crear('span', 'clave', materia.clave));
    tarjeta.appendChild(crear('h2', '', materia.nombre));

    var boton = crear('button', 'boton-materia', materia.seleccionada ? 'Quitar de mis materias' : 'Agregar a mis materias');
    boton.type = 'button';
    boton.setAttribute('aria-pressed', materia.seleccionada ? 'true' : 'false');
    boton.addEventListener('click', function () {
        cambiarMateria(materia, boton);
    });
    tarjeta.appendChild(boton);

    return tarjeta;
}

function pintarMaterias(busqueda) {
    lista.textContent = '';
    pintarResumen();

    if (materiasActuales.length === 0) {
        contador.textContent = '0 materias';
        if (checkSoloMias.checked && !busqueda) {
            mostrarMensaje('Todavía no eliges ninguna materia.', false);
        } else if (busqueda) {
            mostrarMensaje('No encontramos materias que coincidan con "' + busqueda + '".', false);
        } else {
            mostrarMensaje('Todavía no hay materias registradas.', false);
        }
        return;
    }

    ocultarMensaje();
    contador.textContent = materiasActuales.length === 1 ? '1 materia' : materiasActuales.length + ' materias';

    for (var i = 0; i < materiasActuales.length; i++) {
        lista.appendChild(crearTarjeta(materiasActuales[i]));
    }
}

// agrega o quita la materia según su estado actual
function cambiarMateria(materia, boton) {
    var agregar = !materia.seleccionada;
    boton.disabled = true;

    pedir('/api/mis-materias/' + materia.id_materia, agregar ? 'PUT' : 'DELETE')
        .then(function (r) {
            if (!r.datos.ok) {
                boton.disabled = false;
                mostrarMensaje('No se pudo guardar el cambio. Inténtalo de nuevo.', true);
                return;
            }
            materia.seleccionada = agregar;
            totalElegidas = r.datos.total;

            // con el filtro "solo las que imparto", la que se quita desaparece de la lista
            if (checkSoloMias.checked && !agregar) {
                materiasActuales = materiasActuales.filter(function (m) {
                    return m.id_materia !== materia.id_materia;
                });
            }
            pintarMaterias(inputBusqueda.value.trim());
        })
        .catch(function () {
            boton.disabled = false;
            mostrarMensaje('No se pudo conectar con el servidor.', true);
        });
}

// pide las materias al servidor
function cargarMaterias() {
    var busqueda = inputBusqueda.value.trim();
    var url = '/api/mis-materias?q=' + encodeURIComponent(busqueda) +
              '&soloMias=' + (checkSoloMias.checked ? '1' : '0');

    numeroPeticion = numeroPeticion + 1;
    var miPeticion = numeroPeticion;

    pedir(url)
        .then(function (r) {
            // si ya hay una búsqueda más nueva, esta respuesta se ignora
            if (miPeticion !== numeroPeticion) {
                return;
            }
            if (r.estado !== 200 || !r.datos.ok) {
                throw new Error('Error del servidor');
            }
            materiasActuales = r.datos.materias;
            totalElegidas = r.datos.total;
            pintarMaterias(busqueda);
        })
        .catch(function () {
            if (miPeticion !== numeroPeticion) {
                return;
            }
            lista.textContent = '';
            contador.textContent = '';
            resumen.textContent = '';
            mostrarMensaje('No se pudieron cargar las materias. Revisa que el servidor esté encendido.', true);
        });
}

// busca al dar clic en Buscar o Enter
formulario.addEventListener('submit', function (evento) {
    evento.preventDefault();
    clearTimeout(temporizador);
    cargarMaterias();
});

// busca mientras se escribe, esperando un momento para no saturar el servidor
inputBusqueda.addEventListener('input', function () {
    clearTimeout(temporizador);
    temporizador = setTimeout(cargarMaterias, 300);
});

checkSoloMias.addEventListener('change', cargarMaterias);

btnSalir.addEventListener('click', Sesion.salir);

cargarMaterias();