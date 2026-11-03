// Disponibilidad semanal del asesor.
// Los bloques viven en la base de datos: esta pantalla solo habla con /api/disponibilidad.

var selectDia = document.getElementById("selectDia");
var inputInicio = document.getElementById("inputInicio");
var inputFin = document.getElementById("inputFin");
var btnAgregar = document.getElementById("btnAgregar");
var btnCancelarEdicion = document.getElementById("btnCancelarEdicion");
var btnLimpiar = document.getElementById("btnLimpiar");
var btnSalir = document.getElementById("btnSalir");
var tituloFormulario = document.getElementById("tituloFormulario");
var errorFormulario = document.getElementById("errorFormulario");
var semana = document.getElementById("semana");
var totalBloques = document.getElementById("totalBloques");
var totalHoras = document.getElementById("totalHoras");
var mensaje = document.getElementById("mensaje");

var DIAS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"];

var bloques = [];      // lo que hay guardado en la base de datos
var editandoId = null; // null = agregando, número = editando ese bloque
var ocupado = false;   // evita doble clic mientras se guarda

// ---------- Mensaje emergente ----------
var temporizador = null;
function mostrarMensaje(texto, esError) {
  mensaje.textContent = texto;
  mensaje.classList.add("visible");
  mensaje.classList.toggle("error-msg", !!esError);
  clearTimeout(temporizador);
  temporizador = setTimeout(function () {
    mensaje.classList.remove("visible");
  }, 3000);
}

// ---------- Ayudas de horas ----------
function aMinutos(hora) {
  var partes = hora.split(":");
  return parseInt(partes[0], 10) * 60 + parseInt(partes[1], 10);
}

function aTexto(minutos) {
  var horas = Math.floor(minutos / 60);
  var resto = minutos % 60;
  if (horas === 0) return resto + " min";
  if (resto === 0) return horas + " h";
  return horas + " h " + resto + " min";
}

// ---------- Hablar con el servidor ----------
// Devuelve { estado, datos }. Si la sesión se acabó, manda al login.
function pedir(url, metodo, cuerpo) {
  var opciones = { method: metodo || "GET", headers: {} };
  if (cuerpo) {
    opciones.headers["Content-Type"] = "application/json";
    opciones.body = JSON.stringify(cuerpo);
  }
  return fetch(url, opciones).then(function (respuesta) {
    if (respuesta.status === 401) {
      window.location.href = "/login/login.html?error=sesion";
      return new Promise(function () {});
    }
    return respuesta.json().catch(function () { return {}; }).then(function (datos) {
      return { estado: respuesta.status, datos: datos };
    });
  });
}

function cargarBloques() {
  return pedir("/api/disponibilidad").then(function (r) {
    if (r.estado !== 200 || !r.datos.ok) {
      throw new Error("No se pudo cargar");
    }
    bloques = r.datos.bloques;
    dibujarSemana();
  });
}

// ---------- Validar el formulario (el servidor vuelve a revisar todo) ----------
function validarBloque() {
  var dia = selectDia.value;
  var inicio = inputInicio.value;
  var fin = inputFin.value;

  if (inicio === "" || fin === "") {
    return "Elige la hora de inicio y la hora de fin";
  }

  var min1 = aMinutos(inicio);
  var min2 = aMinutos(fin);

  if (min1 < 7 * 60 || min2 > 21 * 60) {
    return "El horario debe estar entre las 7:00 y las 21:00";
  }
  if (min2 <= min1) {
    return "La hora de fin debe ser después de la hora de inicio";
  }
  if (min2 - min1 < 30) {
    return "Cada bloque debe durar al menos 30 minutos";
  }

  for (var i = 0; i < bloques.length; i++) {
    var otro = bloques[i];
    if (otro.id === editandoId || otro.dia !== dia) continue;
    if (min1 < aMinutos(otro.fin) && min2 > aMinutos(otro.inicio)) {
      return "Se empalma con otro bloque del " + dia + " (" + otro.inicio + " a " + otro.fin + ")";
    }
  }
  return "";
}

// ---------- Dibujar la semana ----------
function crearBoton(texto, clase, alHacerClic) {
  var boton = document.createElement("button");
  boton.type = "button";
  boton.textContent = texto;
  if (clase) boton.className = clase;
  boton.addEventListener("click", alHacerClic);
  return boton;
}

function dibujarSemana() {
  semana.textContent = "";
  var minutosTotales = 0;

  DIAS.forEach(function (dia) {
    var columna = document.createElement("div");
    columna.className = "dia";

    var titulo = document.createElement("h4");
    titulo.textContent = dia;
    columna.appendChild(titulo);

    var delDia = bloques
      .filter(function (b) { return b.dia === dia; })
      .sort(function (a, b) { return aMinutos(a.inicio) - aMinutos(b.inicio); });

    if (delDia.length === 0) {
      var vacio = document.createElement("p");
      vacio.className = "sin-horario";
      vacio.textContent = "Sin horarios";
      columna.appendChild(vacio);
    }

    delDia.forEach(function (b) {
      var duracion = aMinutos(b.fin) - aMinutos(b.inicio);
      minutosTotales += duracion;

      var caja = document.createElement("div");
      caja.className = b.id === editandoId ? "bloque editando" : "bloque";

      var horas = document.createElement("div");
      horas.className = "horas";
      horas.textContent = b.inicio + " – " + b.fin;

      var dur = document.createElement("div");
      dur.className = "duracion";
      dur.textContent = aTexto(duracion);

      caja.appendChild(horas);
      caja.appendChild(dur);
      caja.appendChild(crearBoton("Editar", "", function () { editarBloque(b.id); }));
      caja.appendChild(crearBoton("Borrar", "borrar", function () { borrarBloque(b.id); }));
      columna.appendChild(caja);
    });

    semana.appendChild(columna);
  });

  totalBloques.textContent = bloques.length;
  totalHoras.textContent = aTexto(minutosTotales);
}

// ---------- Agregar o guardar cambio ----------
btnAgregar.addEventListener("click", function () {
  if (ocupado) return;

  var error = validarBloque();
  errorFormulario.textContent = error;
  if (error !== "") {
    mostrarMensaje("Revisa el horario", true);
    return;
  }

  var datos = { dia: selectDia.value, inicio: inputInicio.value, fin: inputFin.value };
  var editando = editandoId !== null;
  var url = editando ? "/api/disponibilidad/" + editandoId : "/api/disponibilidad";

  ocupado = true;
  pedir(url, editando ? "PUT" : "POST", datos)
    .then(function (r) {
      if (!r.datos.ok) {
        errorFormulario.textContent = r.datos.mensaje || "No se pudo guardar";
        mostrarMensaje(r.datos.mensaje || "No se pudo guardar", true);
        return;
      }
      mostrarMensaje(editando ? "Cambios guardados" : "Bloque agregado", false);
      salirDeEdicion();
      return cargarBloques();
    })
    .catch(function () {
      mostrarMensaje("No se pudo conectar con el servidor", true);
    })
    .then(function () { ocupado = false; });
});

// ---------- Editar ----------
function editarBloque(id) {
  var b = bloques.find(function (x) { return x.id === id; });
  if (!b) return;

  editandoId = id;
  selectDia.value = b.dia;
  inputInicio.value = b.inicio;
  inputFin.value = b.fin;

  tituloFormulario.textContent = "Editar bloque";
  btnAgregar.textContent = "Guardar cambio";
  btnCancelarEdicion.classList.remove("oculto");
  errorFormulario.textContent = "";
  dibujarSemana();
  window.scrollTo(0, 0);
}

function salirDeEdicion() {
  editandoId = null;
  inputInicio.value = "";
  inputFin.value = "";
  errorFormulario.textContent = "";
  tituloFormulario.textContent = "Agregar un bloque";
  btnAgregar.textContent = "Agregar bloque";
  btnCancelarEdicion.classList.add("oculto");
}

btnCancelarEdicion.addEventListener("click", function () {
  salirDeEdicion();
  dibujarSemana();
});

// ---------- Borrar ----------
function borrarBloque(id) {
  if (!confirm("¿Seguro que quieres borrar este bloque?")) return;

  pedir("/api/disponibilidad/" + id, "DELETE")
    .then(function (r) {
      if (!r.datos.ok) {
        mostrarMensaje("No se pudo borrar el bloque", true);
        return;
      }
      if (editandoId === id) salirDeEdicion();
      mostrarMensaje("Bloque borrado", false);
      return cargarBloques();
    })
    .catch(function () {
      mostrarMensaje("No se pudo conectar con el servidor", true);
    });
}

btnLimpiar.addEventListener("click", function () {
  if (bloques.length === 0) {
    mostrarMensaje("No tienes bloques para borrar", true);
    return;
  }
  if (!confirm("¿Seguro que quieres borrar TODA tu disponibilidad?")) return;

  pedir("/api/disponibilidad", "DELETE")
    .then(function (r) {
      if (!r.datos.ok) {
        mostrarMensaje("No se pudo borrar la disponibilidad", true);
        return;
      }
      salirDeEdicion();
      mostrarMensaje("Disponibilidad borrada", false);
      return cargarBloques();
    })
    .catch(function () {
      mostrarMensaje("No se pudo conectar con el servidor", true);
    });
});

// ---------- Salir ----------
btnSalir.addEventListener("click", Sesion.salir);

// ---------- Al abrir la página ----------
Sesion.cargar()
  .then(function () { return cargarBloques(); })
  .catch(function () {
    mostrarMensaje("No se pudo cargar tu disponibilidad. Revisa que el servidor esté encendido.", true);
  });