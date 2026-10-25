// =====================================================
//  DISPONIBILIDAD SEMANAL DEL ASESOR
//  Usa los mismos datos que el perfil:
//  - "usuarios": lista con todos los usuarios
//  - "correoActivo": el correo de quien inició sesión
//  Cada bloque se guarda dentro del usuario, en "disponibilidad":
//    { id, dia, inicio, fin }   ejemplo de forma: dia "Lunes", inicio "16:00", fin "18:00"
// =====================================================

// ---------- 1. BUSCAR LOS ELEMENTOS DEL HTML ----------
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

var DIAS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

// Si es null, estamos agregando. Si tiene un número, estamos editando ese bloque.
var editandoId = null;

// ---------- 2. FUNCIONES PARA LEER Y GUARDAR ----------
function leerUsuarios() {
  var texto = localStorage.getItem("usuarios");
  if (texto == null) {
    return [];
  }
  return JSON.parse(texto);
}

function guardarUsuarios(lista) {
  localStorage.setItem("usuarios", JSON.stringify(lista));
}

function buscarUsuarioActivo() {
  var correoActivo = localStorage.getItem("correoActivo");
  var lista = leerUsuarios();
  for (var i = 0; i < lista.length; i++) {
    if (lista[i].correo == correoActivo) {
      return lista[i];
    }
  }
  return null;
}

function guardarUsuarioActivo() {
  var lista = leerUsuarios();
  for (var i = 0; i < lista.length; i++) {
    if (lista[i].correo == usuario.correo) {
      lista[i] = usuario;
    }
  }
  guardarUsuarios(lista);
}

// ---------- 3. REVISAR SESIÓN Y ROL ----------
var usuario = buscarUsuarioActivo();

if (usuario == null) {
  window.location.href = "login.html";
} else if (usuario.rol != "asesor") {
  // Solo los asesores pueden publicar disponibilidad
  window.location.href = "dashboard.html";
}

// ---------- 4. MENSAJE EMERGENTE ----------
function mostrarMensaje(texto, esError) {
  mensaje.textContent = texto;
  mensaje.classList.add("visible");
  if (esError) {
    mensaje.classList.add("error-msg");
  } else {
    mensaje.classList.remove("error-msg");
  }
  setTimeout(function () {
    mensaje.classList.remove("visible");
  }, 3000);
}

// ---------- 5. FUNCIONES DE AYUDA PARA LAS HORAS ----------
// Convierte "16:30" en minutos (990) para poder comparar horas
function aMinutos(hora) {
  var partes = hora.split(":");
  return parseInt(partes[0]) * 60 + parseInt(partes[1]);
}

// Convierte minutos en texto, por ejemplo 90 -> "1 h 30 min"
function aTexto(minutos) {
  var horas = Math.floor(minutos / 60);
  var resto = minutos % 60;
  if (horas == 0) {
    return resto + " min";
  }
  if (resto == 0) {
    return horas + " h";
  }
  return horas + " h " + resto + " min";
}

// ---------- 6. VALIDAR EL FORMULARIO ----------
// Devuelve un texto con el error, o "" si todo está bien
function validarBloque() {
  var dia = selectDia.value;
  var inicio = inputInicio.value;
  var fin = inputFin.value;

  if (inicio == "" || fin == "") {
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

  // Revisar que no se empalme con otro bloque del mismo día
  var bloques = usuario.disponibilidad;
  for (var i = 0; i < bloques.length; i++) {
    var otro = bloques[i];
    if (otro.id == editandoId) {
      continue; // si estamos editando, no lo comparamos con él mismo
    }
    if (otro.dia == dia) {
      var otroInicio = aMinutos(otro.inicio);
      var otroFin = aMinutos(otro.fin);
      if (min1 < otroFin && min2 > otroInicio) {
        return "Se empalma con otro bloque del " + dia + " (" + otro.inicio + " a " + otro.fin + ")";
      }
    }
  }

  return "";
}

// ---------- 7. DIBUJAR LA SEMANA ----------
function dibujarSemana() {
  var bloques = usuario.disponibilidad;
  var html = "";
  var minutosTotales = 0;

  for (var d = 0; d < DIAS.length; d++) {
    var dia = DIAS[d];

    // Sacar los bloques de este día
    var delDia = [];
    for (var i = 0; i < bloques.length; i++) {
      if (bloques[i].dia == dia) {
        delDia.push(bloques[i]);
      }
    }

    // Ordenarlos de más temprano a más tarde
    delDia.sort(function (a, b) {
      return aMinutos(a.inicio) - aMinutos(b.inicio);
    });

    html = html + '<div class="dia"><h4>' + dia + "</h4>";

    if (delDia.length == 0) {
      html = html + '<p class="sin-horario">Sin horarios</p>';
    }

    for (var j = 0; j < delDia.length; j++) {
      var b = delDia[j];
      var duracion = aMinutos(b.fin) - aMinutos(b.inicio);
      minutosTotales = minutosTotales + duracion;

      var clase = "bloque";
      if (b.id == editandoId) {
        clase = "bloque editando";
      }

      html = html + '<div class="' + clase + '">';
      html = html + '<div class="horas">' + b.inicio + " – " + b.fin + "</div>";
      html = html + '<div class="duracion">' + aTexto(duracion) + "</div>";
      html = html + '<button onclick="editarBloque(' + b.id + ')">Editar</button>';
      html = html + '<button class="borrar" onclick="borrarBloque(' + b.id + ')">Borrar</button>';
      html = html + "</div>";
    }

    html = html + "</div>";
  }

  semana.innerHTML = html;
  totalBloques.textContent = bloques.length;
  totalHoras.textContent = aTexto(minutosTotales);
}

// ---------- 8. AGREGAR O GUARDAR CAMBIO ----------
btnAgregar.addEventListener("click", function () {
  var error = validarBloque();
  errorFormulario.textContent = error;

  if (error != "") {
    mostrarMensaje("Revisa el horario", true);
    return;
  }

  if (editandoId == null) {
    // Agregar uno nuevo
    usuario.disponibilidad.push({
      id: Date.now(),
      dia: selectDia.value,
      inicio: inputInicio.value,
      fin: inputFin.value
    });
    mostrarMensaje("Bloque agregado", false);
  } else {
    // Guardar los cambios del bloque que se está editando
    for (var i = 0; i < usuario.disponibilidad.length; i++) {
      if (usuario.disponibilidad[i].id == editandoId) {
        usuario.disponibilidad[i].dia = selectDia.value;
        usuario.disponibilidad[i].inicio = inputInicio.value;
        usuario.disponibilidad[i].fin = inputFin.value;
      }
    }
    mostrarMensaje("Cambios guardados", false);
  }

  guardarUsuarioActivo();
  salirDeEdicion();
  dibujarSemana();
});

// ---------- 9. EDITAR UN BLOQUE ----------
function editarBloque(id) {
  for (var i = 0; i < usuario.disponibilidad.length; i++) {
    var b = usuario.disponibilidad[i];
    if (b.id == id) {
      editandoId = id;
      selectDia.value = b.dia;
      inputInicio.value = b.inicio;
      inputFin.value = b.fin;
    }
  }

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

// ---------- 10. BORRAR ----------
function borrarBloque(id) {
  var seguro = confirm("¿Seguro que quieres borrar este bloque?");
  if (!seguro) {
    return;
  }

  var nuevos = [];
  for (var i = 0; i < usuario.disponibilidad.length; i++) {
    if (usuario.disponibilidad[i].id != id) {
      nuevos.push(usuario.disponibilidad[i]);
    }
  }
  usuario.disponibilidad = nuevos;
  guardarUsuarioActivo();

  if (editandoId == id) {
    salirDeEdicion();
  }
  dibujarSemana();
  mostrarMensaje("Bloque borrado", false);
}

btnLimpiar.addEventListener("click", function () {
  if (usuario.disponibilidad.length == 0) {
    mostrarMensaje("No tienes bloques para borrar", true);
    return;
  }

  var seguro = confirm("¿Seguro que quieres borrar TODA tu disponibilidad?");
  if (!seguro) {
    return;
  }

  usuario.disponibilidad = [];
  guardarUsuarioActivo();
  salirDeEdicion();
  dibujarSemana();
  mostrarMensaje("Disponibilidad borrada", false);
});

// ---------- 11. SALIR ----------
btnSalir.addEventListener("click", function () {
  localStorage.removeItem("correoActivo");
  window.location.href = "login.html";
});

// ---------- 12. EJECUTAR AL ABRIR ----------
if (usuario != null && usuario.rol == "asesor") {
  if (!usuario.disponibilidad) {
    usuario.disponibilidad = [];
  }
  dibujarSemana();
}
