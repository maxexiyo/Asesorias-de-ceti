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
var btnGuardarHorario = document.getElementById("btnGuardarHorario");
var btnSalir = document.getElementById("btnSalir");
var seccionDisponibilidad = document.getElementById("seccionDisponibilidad");
var bloques = document.querySelectorAll(".bloque");
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

// ---------- 3. SESIÓN ----------
// Quién eres lo dice el servidor (cookie de sesión). Lo que sigue guardándose
// en este navegador (localStorage) es la foto y el horario, mientras no haya API para eso.
var usuario = null;

// Junta los datos del servidor con la foto y el horario guardados en el navegador
function combinarConGuardado(datosServidor) {
  var lista = leerUsuarios();
  for (var i = 0; i < lista.length; i++) {
    if (lista[i].correo == datosServidor.correo) {
      lista[i].nombre = datosServidor.nombre;
      lista[i].rol = datosServidor.rol;
      guardarUsuarios(lista);
      return lista[i];
    }
  }
  var nuevo = {
    nombre: datosServidor.nombre,
    correo: datosServidor.correo,
    rol: datosServidor.rol,
    foto: "",
    horario: []
  };
  lista.push(nuevo);
  guardarUsuarios(lista);
  return nuevo;
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

function mostrarHorario() {
  var guardados = usuario.horario || [];
  for (var i = 0; i < bloques.length; i++) {
    if (guardados.indexOf(i) != -1) {
      bloques[i].classList.add("activo");
    } else {
      bloques[i].classList.remove("activo");
    }
  }
}

function cargarPerfil() {
  textoNombre.textContent = usuario.nombre;
  inputNombre.value = usuario.nombre;
  inputCorreo.value = usuario.correo;

  if (usuario.rol == "asesor") {
    textoRol.textContent = "Asesor · " + usuario.correo;
    seccionDisponibilidad.classList.remove("oculto");
    mostrarHorario();
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

  // después de guardar, lo mandamos a la vista de su rol
  setTimeout(function () {
    window.location.href = Sesion.inicio(usuario.rol);
  }, 1200);
});

// ---------- 8. DISPONIBILIDAD DEL ASESOR ----------
for (var i = 0; i < bloques.length; i++) {
  bloques[i].addEventListener("click", function () {
    this.classList.toggle("activo");
  });
}

btnGuardarHorario.addEventListener("click", function () {
  var elegidos = [];
  for (var i = 0; i < bloques.length; i++) {
    if (bloques[i].classList.contains("activo")) {
      elegidos.push(i);
    }
  }

  if (elegidos.length == 0) {
    mostrarMensaje("Marca al menos un bloque de horario", true);
    return;
  }

  usuario.horario = elegidos;
  guardarUsuarioActivo();
  mostrarMensaje("Disponibilidad guardada (" + elegidos.length + " bloques)", false);
});

// ---------- 9. SALIR ----------
// Cierra la sesión en el servidor; los datos del usuario se quedan guardados
btnSalir.addEventListener("click", function () {
  Sesion.salir();
});

// ---------- 10. EJECUTAR AL ABRIR ----------
Sesion.cargar()
  .then(function (datos) {
    usuario = combinarConGuardado(datos);
    document.getElementById("enlaceVolver").href = Sesion.inicio(usuario.rol);
    cargarPerfil();
  })
  .catch(function () {
    mostrarMensaje("No se pudo cargar tu sesión. Revisa que el servidor esté encendido.", true);
  });
