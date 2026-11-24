// Administración del catálogo de materias (solo admin)
var formulario = document.getElementById('formMateria');
var inputClave = document.getElementById('clave');
var inputNombre = document.getElementById('nombre');
var inputRezago = document.getElementById('rezago');
var tituloForm = document.getElementById('tituloForm');
var btnGuardar = document.getElementById('btnGuardar');
var btnCancelar = document.getElementById('btnCancelar');
var inputBusqueda = document.getElementById('busqueda');
var cuerpo = document.getElementById('cuerpo');
var contador = document.getElementById('contador');
var mensaje = document.getElementById('mensaje');

var idEditando = null;      // null = agregando, número = editando esa materia
var temporizador;
var numeroPeticion = 0;

document.getElementById('btnSalir').addEventListener('click', Sesion.salir);

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

// hace una petición JSON; si la sesión expiró manda al login
function pedir(url, metodo, cuerpoJson) {
    var opciones = { method: metodo, headers: {} };
    if (cuerpoJson) {
        opciones.headers['Content-Type'] = 'application/json';
        opciones.body = JSON.stringify(cuerpoJson);
    }
    return fetch(url, opciones).then(function (respuesta) {
        if (respuesta.status === 401) {
            window.location.href = '/login/login.html?error=sesion';
            return new Promise(function () {});
        }
        return respuesta.json().catch(function () { return {}; }).then(function (datos) {
            return { ok: respuesta.ok, datos: datos };
        });
    });
}

// ---------- tabla ----------
function crearFila(materia) {
    var fila = document.createElement('tr');
    fila.appendChild(crear('td', '', materia.clave));
    fila.appendChild(crear('td', '', materia.nombre));
    fila.appendChild(crear('td', 'num', materia.indice_rezago === null ? 'Sin dato' : Math.round(materia.indice_rezago * 10) / 10 + '%'));
    fila.appendChild(crear('td', 'num', String(materia.asesores)));

    var celdaAcciones = document.createElement('td');
    var acciones = crear('div', 'acciones');

    var btnEditar = crear('button', '', 'Editar');
    btnEditar.type = 'button';
    btnEditar.addEventListener('click', function () { empezarEdicion(materia); });

    var btnBorrar = crear('button', 'borrar', 'Eliminar');
    btnBorrar.type = 'button';
    btnBorrar.addEventListener('click', function () { eliminar(materia); });

    acciones.appendChild(btnEditar);
    acciones.appendChild(btnBorrar);
    celdaAcciones.appendChild(acciones);
    fila.appendChild(celdaAcciones);
    return fila;
}

function pintar(materias) {
    cuerpo.innerHTML = '';
    materias.forEach(function (materia) {
        cuerpo.appendChild(crearFila(materia));
    });
    contador.textContent = materias.length === 1 ? '1 materia' : materias.length + ' materias';
}

function cargar() {
    var texto = inputBusqueda.value.trim();
    numeroPeticion++;
    var esta = numeroPeticion;

    pedir('/api/materias?q=' + encodeURIComponent(texto) + '&orden=nombre', 'GET')
        .then(function (r) {
            if (esta !== numeroPeticion) { return; } // llegó una búsqueda más nueva
            if (!r.ok) {
                mostrarMensaje('No se pudo cargar el catálogo.', true);
                return;
            }
            pintar(r.datos.materias);
        })
        .catch(function () {
            mostrarMensaje('No se pudo conectar con el servidor.', true);
        });
}

// ---------- formulario ----------
function limpiarFormulario() {
    idEditando = null;
    formulario.reset();
    tituloForm.textContent = 'Agregar materia';
    btnGuardar.textContent = 'Guardar';
    btnCancelar.hidden = true;
}

function empezarEdicion(materia) {
    ocultarMensaje();
    idEditando = materia.id_materia;
    inputClave.value = materia.clave;
    inputNombre.value = materia.nombre;
    inputRezago.value = materia.indice_rezago === null ? '' : materia.indice_rezago;
    tituloForm.textContent = 'Editar materia';
    btnGuardar.textContent = 'Guardar cambios';
    btnCancelar.hidden = false;
    inputNombre.focus();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

btnCancelar.addEventListener('click', function () {
    limpiarFormulario();
    ocultarMensaje();
});

formulario.addEventListener('submit', function (evento) {
    evento.preventDefault();
    ocultarMensaje();

    var clave = inputClave.value.trim();
    var nombre = inputNombre.value.trim();
    if (!clave || !nombre) {
        mostrarMensaje('La clave y el nombre son obligatorios.', true);
        return;
    }

    var datos = { clave: clave, nombre: nombre, indice_rezago: inputRezago.value };
    var editando = idEditando !== null;
    var url = editando ? '/api/materias/' + idEditando : '/api/materias';
    var metodo = editando ? 'PUT' : 'POST';

    btnGuardar.disabled = true;
    pedir(url, metodo, datos)
        .then(function (r) {
            if (!r.ok) {
                mostrarMensaje(r.datos.mensaje || 'No se pudo guardar la materia.', true);
                return;
            }
            mostrarMensaje(editando ? 'Materia actualizada.' : 'Materia agregada.', false);
            limpiarFormulario();
            cargar();
        })
        .catch(function () {
            mostrarMensaje('No se pudo conectar con el servidor.', true);
        })
        .then(function () {
            btnGuardar.disabled = false;
        });
});

// ---------- eliminar ----------
function eliminar(materia) {
    var aviso = '¿Eliminar la materia "' + materia.nombre + '"?';
    if (Number(materia.asesores) > 0) {
        aviso += '\n\nTiene ' + materia.asesores + ' asesor(es) vinculados; se desvincularán.';
    }
    if (!window.confirm(aviso)) {
        return;
    }

    ocultarMensaje();
    pedir('/api/materias/' + materia.id_materia, 'DELETE')
        .then(function (r) {
            if (!r.ok) {
                mostrarMensaje(r.datos.mensaje || 'No se pudo eliminar la materia.', true);
                return;
            }
            if (idEditando === materia.id_materia) {
                limpiarFormulario();
            }
            mostrarMensaje('Materia eliminada.', false);
            cargar();
        })
        .catch(function () {
            mostrarMensaje('No se pudo conectar con el servidor.', true);
        });
}

// ---------- buscador (espera a que dejes de escribir) ----------
inputBusqueda.addEventListener('input', function () {
    clearTimeout(temporizador);
    temporizador = setTimeout(cargar, 300);
});

cargar();
