// =====================================================
//  CÓMO SE GUARDAN LOS DATOS (sin servidor)
//  - "usuarios": lista con TODOS los usuarios registrados.
//    Cada usuario es: { nombre, correo, rol, foto, disponibilidad }
//  - "correoActivo": el correo del usuario que inició sesión.
//  El login pone el correoActivo; el registro agrega a "usuarios".
// =====================================================

// ---------- 1. BUSCAR LOS ELEMENTOS DEL HTML ----------
var foto = document.getElementById("foto");
var archivoFoto = document.getElementById("archivoFoto");
var btnCambiarFoto = document.getElementById("btnCambiarFoto");
var btnQuitarFoto = document.getElementById("btnQuitarFoto");
var textoNombre = document.getElementById("textoNombre");
var textoRol = document.getElementById("textoRol");
var inputNombre = document.getElementById("inputNombre");
var inputCorreo = document.getElementById("inputCorreo");
var errorNombre = document.getElementById("errorNombre");
var btnGuardar = document.getElementById("btnGuardar");
var btnSalir = document.getElementById("btnSalir");
var seccionDisponibilidad = document.getElementById("seccionDisponibilidad");
var textoDisponibilidad = document.getElementById("textoDisponibilidad");
var mensaje = document.getElementById("mensaje");

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

// Devuelve el usuario que tiene la sesión iniciada (o null si no hay)
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

// Guarda los cambios del usuario activo en la lista
function guardarUsuarioActivo() {
  var lista = leerUsuarios();
  for (var i = 0; i < lista.length; i++) {
    if (lista[i].correo == usuario.correo) {
      lista[i] = usuario;
    }
  }
  guardarUsuarios(lista);
}

// ---------- 3. REVISAR QUE HAYA SESIÓN ----------
var usuario = buscarUsuarioActivo();

if (usuario == null) {
  // Nadie inició sesión: lo mandamos al login
  window.location.href = "login.html";
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

// ---------- 5. MOSTRAR LOS DATOS EN LA PÁGINA ----------
function mostrarFoto() {
  if (usuario.foto) {
    foto.style.backgroundImage = "url(" + usuario.foto + ")";
    foto.textContent = "";
  } else {
    foto.style.backgroundImage = "none";
    // Letras de la foto (iniciales del nombre)
    var palabras = usuario.nombre.trim().split(" ");
    var iniciales = palabras[0][0];
    if (palabras.length > 1) {
      iniciales = iniciales + palabras[1][0];
    }
    foto.textContent = iniciales.toUpperCase();
  }
}

function mostrarResumenDisponibilidad() {
  var cantidad = 0;
  if (usuario.disponibilidad) {
    cantidad = usuario.disponibilidad.length;
  }
  if (cantidad == 0) {
    textoDisponibilidad.textContent = "Todavía no has publicado horarios.";
  } else {
    textoDisponibilidad.textContent = "Tienes " + cantidad + " bloque(s) publicado(s) a la semana.";
  }
}

function cargarPerfil() {
  textoNombre.textContent = usuario.nombre;
  inputNombre.value = usuario.nombre;
  inputCorreo.value = usuario.correo;

  if (usuario.rol == "asesor") {
    textoRol.textContent = "Asesor · " + usuario.correo;
    seccionDisponibilidad.classList.remove("oculto");
    mostrarResumenDisponibilidad();
  } else {
    textoRol.textContent = "Alumno · " + usuario.correo;
  }

  mostrarFoto();
}

// ---------- 6. CAMBIAR FOTO ----------
foto.addEventListener("click", function () {
  archivoFoto.click();
});

btnCambiarFoto.addEventListener("click", function () {
  archivoFoto.click();
});

archivoFoto.addEventListener("change", function () {
  var archivo = archivoFoto.files[0];
  if (!archivo) {
    return;
  }

  if (archivo.type.indexOf("image") != 0) {
    mostrarMensaje("Elige un archivo de imagen", true);
    return;
  }

  var lector = new FileReader();
  lector.onload = function (evento) {
    // Achicamos la imagen a 200x200 para que quepa en el guardado
    var imagen = new Image();
    imagen.onload = function () {
      var lienzo = document.createElement("canvas");
      lienzo.width = 200;
      lienzo.height = 200;
      var pincel = lienzo.getContext("2d");

      // Recortamos al centro para que quede cuadrada
      var lado = Math.min(imagen.width, imagen.height);
      var x = (imagen.width - lado) / 2;
      var y = (imagen.height - lado) / 2;
      pincel.drawImage(imagen, x, y, lado, lado, 0, 0, 200, 200);

      usuario.foto = lienzo.toDataURL("image/jpeg", 0.8);
      guardarUsuarioActivo();
      mostrarFoto();
      mostrarMensaje("Foto de perfil guardada", false);
    };
    imagen.src = evento.target.result;
  };
  lector.readAsDataURL(archivo);
  archivoFoto.value = "";
});

btnQuitarFoto.addEventListener("click", function () {
  if (!usuario.foto) {
    mostrarMensaje("No tienes foto para quitar", true);
    return;
  }
  usuario.foto = "";
  guardarUsuarioActivo();
  mostrarFoto();
  mostrarMensaje("Foto eliminada", false);
});

// ---------- 7. GUARDAR EL NOMBRE ----------
btnGuardar.addEventListener("click", function () {
  var nuevoNombre = inputNombre.value.trim();

  inputNombre.classList.remove("con-error");
  errorNombre.classList.remove("visible");

  if (nuevoNombre.length < 3) {
    inputNombre.classList.add("con-error");
    errorNombre.classList.add("visible");
    mostrarMensaje("Revisa el nombre", true);
    return;
  }

  usuario.nombre = nuevoNombre;
  guardarUsuarioActivo();
  cargarPerfil();
  mostrarMensaje("Perfil guardado", false);
});

// ---------- 8. SALIR ----------
// Solo cerramos la sesión; los datos del usuario se quedan guardados
btnSalir.addEventListener("click", function () {
  localStorage.removeItem("correoActivo");
  window.location.href = "login.html";
});

// ---------- 9. EJECUTAR AL ABRIR ----------
cargarPerfil();
