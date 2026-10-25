var formulario = document.getElementById('buscador');
var inputBusqueda = document.getElementById('busqueda');
var selectOrden = document.getElementById('orden');
var checkConAsesores = document.getElementById('conAsesores');
var lista = document.getElementById('lista');
var contador = document.getElementById('contador');
var mensaje = document.getElementById('mensaje');

var temporizador;
var numeroPeticion = 0;

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

// arma la tarjeta de una materia
function crearTarjeta(materia) {
    var tarjeta = crear('article', 'materia');
    tarjeta.appendChild(crear('span', 'clave', materia.clave));
    tarjeta.appendChild(crear('h2', '', materia.nombre));

    var bloque = crear('div', '');
    var titulo = crear('div', 'rezago-titulo');
    titulo.appendChild(crear('span', '', 'Índice de rezago'));

    if (materia.indice_rezago === null) {
        titulo.appendChild(crear('strong', '', 'Sin dato'));
        bloque.appendChild(titulo);
    } else {
        var porcentaje = Math.round(materia.indice_rezago);
        if (porcentaje < 0) { porcentaje = 0; }
        if (porcentaje > 100) { porcentaje = 100; }

        titulo.appendChild(crear('strong', '', porcentaje + '%'));
        bloque.appendChild(titulo);

        var barra = crear('div', 'barra');
        var relleno = document.createElement('span');
        relleno.style.width = porcentaje + '%';
        barra.appendChild(relleno);
        bloque.appendChild(barra);
    }
    tarjeta.appendChild(bloque);

    var cantidad = Number(materia.asesores);
    var textoAsesores = cantidad === 1 ? ' asesor disponible' : ' asesores disponibles';
    var asesores = crear('p', 'asesores');
    asesores.appendChild(crear('strong', '', String(cantidad)));
    asesores.appendChild(document.createTextNode(textoAsesores));
    tarjeta.appendChild(asesores);

    return tarjeta;
}

function pintarMaterias(materias, busqueda) {
    lista.innerHTML = '';

    if (materias.length === 0) {
        contador.textContent = '0 materias';
        if (busqueda) {
            mostrarMensaje('No encontramos materias que coincidan con "' + busqueda + '".', false);
        } else {
            mostrarMensaje('Todavía no hay materias registradas.', false);
        }
        return;
    }

    ocultarMensaje();
    contador.textContent = materias.length === 1 ? '1 materia' : materias.length + ' materias';

    for (var i = 0; i < materias.length; i++) {
        lista.appendChild(crearTarjeta(materias[i]));
    }
}

// pide las materias al servidor
function cargarMaterias() {
    var busqueda = inputBusqueda.value.trim();
    var url = '/api/materias?q=' + encodeURIComponent(busqueda) + '&orden=' + selectOrden.value +
              '&conAsesores=' + (checkConAsesores.checked ? '1' : '0');

    numeroPeticion = numeroPeticion + 1;
    var miPeticion = numeroPeticion;

    fetch(url)
        .then(function (respuesta) {
                if (respuesta.status === 401) {
                window.location.href = '/login/login.html?error=sesion';
                return new Promise(function () {}); // la página ya se está yendo
            }
            if (!respuesta.ok) {
                throw new Error('Error del servidor');
            }
            return respuesta.json();
        })
        .then(function (datos) {
            // si ya hay una búsqueda más nueva, esta respuesta se ignora
            if (miPeticion !== numeroPeticion) {
                return;
            }
            pintarMaterias(datos.materias, busqueda);
        })
        .catch(function () {
            if (miPeticion !== numeroPeticion) {
                return;
            }
            lista.innerHTML = '';
            contador.textContent = '';
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

selectOrden.addEventListener('change', cargarMaterias);
checkConAsesores.addEventListener('change', cargarMaterias);

cargarMaterias();