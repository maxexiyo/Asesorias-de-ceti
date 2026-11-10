// =====================================================
//  COMENTARIOS REPORTADOS (administrador)
//  El administrador revisa cada comentario reportado y decide:
//    - Conservar: el reporte no procede y el comentario vuelve a mostrarse.
//    - Eliminar:  se borra el comentario de forma definitiva.
//  Mientras está pendiente, el comentario permanece oculto al público (RF6.8).
//
//  API que usa esta pantalla:
//    GET    /api/admin/reportes              lista los reportes (todos los estados)
//    POST   /api/admin/reportes/:id/conservar
//    DELETE /api/admin/reportes/:id          elimina el comentario
//  Cada reporte llega así:
//    { id_evaluacion, comentario, tipo_evaluacion, evaluador_nombre, evaluado_nombre,
//      materia, fecha_cita, criterio_1, criterio_2, promedio_evaluacion,
//      total_reportes, fecha_reporte, estado }
//    tipo_evaluacion: "Alumno_a_Asesor" | "Asesor_a_Alumno"
//    estado:          "Pendiente" | "Conservado" | "Eliminado"
//
//  Para ver la pantalla sin servidor: reportes.html?demo=1
// =====================================================
(function () {
  'use strict';

  var API = '/api/admin/reportes';
  var MODO_DEMO = new URLSearchParams(window.location.search).get('demo') === '1';

  // ---------- 1. BUSCAR LOS ELEMENTOS DEL HTML ----------
  var lista = document.getElementById('lista');
  var cargando = document.getElementById('cargando');
  var vacio = document.getElementById('vacio');
  var vacioTitulo = document.getElementById('vacioTitulo');
  var vacioTexto = document.getElementById('vacioTexto');
  var errorCaja = document.getElementById('error');
  var errorTexto = document.getElementById('errorTexto');
  var inputBuscar = document.getElementById('buscar');
  var selectOrden = document.getElementById('orden');
  var pestanas = document.querySelectorAll('.pestana');
  var dialogo = document.getElementById('dialogo');
  var dialogoComentario = document.getElementById('dialogoComentario');
  var mensaje = document.getElementById('toast');

  // ---------- 2. ESTADO DE LA PANTALLA ----------
  var reportes = [];          // todos los reportes que mandó el servidor
  var filtro = 'Pendiente';   // Pendiente | Revisado | Todos
  var ocupado = false;        // true mientras se manda una acción al servidor
  var idPorEliminar = null;

  var CRITERIOS = {
    Alumno_a_Asesor: ['Dominio técnico', 'Claridad'],
    Asesor_a_Alumno: ['Puntualidad', 'Compromiso']
  };
  var ROLES = {
    Alumno_a_Asesor: ['Alumno', 'Asesor'],
    Asesor_a_Alumno: ['Asesor', 'Alumno']
  };
  var CLASE_ESTADO = { Pendiente: 'pendiente', Conservado: 'conservado', Eliminado: 'eliminado' };
  var TEXTO_ESTADO = {
    Pendiente: 'Pendiente · oculto al público',
    Conservado: 'Conservado',
    Eliminado: 'Eliminado'
  };

  // ---------- 3. DATOS DE PRUEBA (solo con ?demo=1) ----------
  function datosDePrueba() {
    return [
      { id_evaluacion: 41, comentario: 'Este asesor es un [contenido ofensivo], no explica nada y solo hace perder el tiempo.', tipo_evaluacion: 'Alumno_a_Asesor', evaluador_nombre: 'Luis Hernández Ruiz', evaluado_nombre: 'Marcos Díaz Prieto', materia: 'Programación Orientada a Objetos I', fecha_cita: '2026-10-14T17:00:00', criterio_1: 1, criterio_2: 1, promedio_evaluacion: 1, total_reportes: 2, fecha_reporte: '2026-10-20T10:32:00', estado: 'Pendiente' },
      { id_evaluacion: 47, comentario: 'Llegó tarde y además me habló con [lenguaje inapropiado] cuando le pregunté una duda.', tipo_evaluacion: 'Asesor_a_Alumno', evaluador_nombre: 'Ana Sofía Ortega', evaluado_nombre: 'Diego Ramírez Cota', materia: 'Pensamiento Matemático II', fecha_cita: '2026-10-21T09:00:00', criterio_1: 2, criterio_2: 2, promedio_evaluacion: 2, total_reportes: 1, fecha_reporte: '2026-10-22T16:05:00', estado: 'Pendiente' },
      { id_evaluacion: 52, comentario: 'Explica bien, pero el asesor es [contenido ofensivo] cuando se le interrumpe.', tipo_evaluacion: 'Alumno_a_Asesor', evaluador_nombre: 'Karen Villaseñor', evaluado_nombre: 'Ricardo Núñez Ávila', materia: 'Base de Datos I', fecha_cita: '2026-10-27T12:00:00', criterio_1: 4, criterio_2: 3, promedio_evaluacion: 3.5, total_reportes: 3, fecha_reporte: '2026-10-29T08:40:00', estado: 'Pendiente' },
      { id_evaluacion: 33, comentario: 'Muy mala asesoría, no resolvió mi duda de álgebra y me hizo repetir todo.', tipo_evaluacion: 'Alumno_a_Asesor', evaluador_nombre: 'Jorge Palomera', evaluado_nombre: 'Marcos Díaz Prieto', materia: 'Pensamiento Matemático I', fecha_cita: '2026-10-02T16:00:00', criterio_1: 2, criterio_2: 1, promedio_evaluacion: 1.5, total_reportes: 1, fecha_reporte: '2026-10-05T11:15:00', estado: 'Conservado' },
      { id_evaluacion: 28, comentario: null, tipo_evaluacion: 'Alumno_a_Asesor', evaluador_nombre: 'Paola Mendoza', evaluado_nombre: 'Ricardo Núñez Ávila', materia: 'Programación Web I', fecha_cita: '2026-09-29T18:00:00', criterio_1: 1, criterio_2: 2, promedio_evaluacion: 1.5, total_reportes: 2, fecha_reporte: '2026-10-01T09:20:00', estado: 'Eliminado' }
    ];
  }

  // ---------- 4. HABLAR CON EL SERVIDOR ----------
  function pedir(metodo, url) {
    return fetch(url, { method: metodo }).then(function (respuesta) {
      if (respuesta.status === 401) {
        // la sesión se acabó: volvemos al login
        window.location.href = '/login/login.html?error=sesion';
        return new Promise(function () {});
      }
      return respuesta.json().catch(function () {
        return { ok: false, error: 'servidor' };
      });
    });
  }

  function textoDeError(codigo) {
    if (codigo === 'permiso') { return 'Tu cuenta no tiene permiso para revisar reportes.'; }
    if (codigo === 'no_encontrado') { return 'Ese reporte ya no existe. Recarga la lista.'; }
    return 'Ocurrió un problema en el servidor. Inténtalo de nuevo.';
  }

  function cargar() {
    cargando.hidden = false;
    errorCaja.hidden = true;
    vacio.hidden = true;

    if (MODO_DEMO) {
      reportes = datosDePrueba();
      cargando.hidden = true;
      dibujar();
      return;
    }

    pedir('GET', API)
      .then(function (datos) {
        cargando.hidden = true;
        if (!datos.ok) {
          mostrarErrorDeCarga(textoDeError(datos.error));
          return;
        }
        reportes = datos.reportes;
        dibujar();
      })
      .catch(function () {
        cargando.hidden = true;
        mostrarErrorDeCarga('No se pudo conectar con el servidor. Revisa que esté encendido.');
      });
  }

  function mostrarErrorDeCarga(texto) {
    lista.replaceChildren();
    errorTexto.textContent = texto;
    errorCaja.hidden = false;
  }

  // ---------- 5. MENSAJE EMERGENTE ----------
  function mostrarMensaje(texto, esError) {
    mensaje.textContent = texto;
    mensaje.classList.add('visible');
    mensaje.classList.toggle('error-msg', !!esError);
    clearTimeout(mostrarMensaje.temporizador);
    mostrarMensaje.temporizador = setTimeout(function () {
      mensaje.classList.remove('visible');
    }, 3200);
  }

  // ---------- 6. AYUDAS ----------
  // Crea un elemento con clase y texto. El texto va con textContent (nunca como HTML),
  // porque los comentarios los escriben los usuarios.
  function crear(etiqueta, clase, texto) {
    var el = document.createElement(etiqueta);
    if (clase) { el.className = clase; }
    if (texto !== undefined && texto !== null) { el.textContent = texto; }
    return el;
  }

  function formatoFecha(texto, conHora) {
    var fecha = new Date(texto);
    if (isNaN(fecha.getTime())) { return '—'; }
    var opciones = { day: 'numeric', month: 'short', year: 'numeric' };
    if (conHora) { opciones.hour = '2-digit'; opciones.minute = '2-digit'; }
    return fecha.toLocaleString('es-MX', opciones);
  }

  // minúsculas y sin acentos, para que "matematico" encuentre "Matemático"
  function normalizar(texto) {
    return String(texto || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  }

  function esRevisado(reporte) {
    return reporte.estado !== 'Pendiente';
  }

  // ---------- 7. DIBUJAR ----------
  function contar() {
    var pendientes = 0, conservados = 0, eliminados = 0;
    reportes.forEach(function (r) {
      if (r.estado === 'Pendiente') { pendientes++; }
      if (r.estado === 'Conservado') { conservados++; }
      if (r.estado === 'Eliminado') { eliminados++; }
    });
    document.getElementById('numPendientes').textContent = pendientes;
    document.getElementById('numConservados').textContent = conservados;
    document.getElementById('numEliminados').textContent = eliminados;
    document.getElementById('cuentaPendiente').textContent = pendientes;
    document.getElementById('cuentaRevisado').textContent = conservados + eliminados;
    document.getElementById('cuentaTodos').textContent = reportes.length;
  }

  function filtrar() {
    var texto = normalizar(inputBuscar.value.trim());
    var resultado = reportes.filter(function (r) {
      if (filtro === 'Pendiente' && r.estado !== 'Pendiente') { return false; }
      if (filtro === 'Revisado' && !esRevisado(r)) { return false; }
      if (texto === '') { return true; }
      var contenido = [r.comentario, r.evaluador_nombre, r.evaluado_nombre, r.materia].join(' ');
      return normalizar(contenido).indexOf(texto) !== -1;
    });

    resultado.sort(function (a, b) {
      if (selectOrden.value === 'reportados' && b.total_reportes !== a.total_reportes) {
        return b.total_reportes - a.total_reportes;
      }
      return new Date(b.fecha_reporte) - new Date(a.fecha_reporte);
    });
    return resultado;
  }

  function textoVacio() {
    if (inputBuscar.value.trim() !== '') {
      return ['Sin resultados', 'Ningún reporte coincide con tu búsqueda.'];
    }
    if (filtro === 'Pendiente') {
      return ['No hay reportes pendientes', 'Cuando alguien reporte un comentario, aparecerá aquí para que lo revises.'];
    }
    if (filtro === 'Revisado') {
      return ['Todavía no revisas ningún reporte', 'Los comentarios que conserves o elimines se verán en esta pestaña.'];
    }
    return ['No hay reportes', 'Aún nadie ha reportado comentarios.'];
  }

  function dibujar() {
    contar();
    var visibles = filtrar();

    lista.replaceChildren();
    visibles.forEach(function (reporte) {
      lista.appendChild(crearTarjeta(reporte));
    });

    var hayError = !errorCaja.hidden;
    vacio.hidden = visibles.length > 0 || hayError;
    if (visibles.length === 0) {
      var textos = textoVacio();
      vacioTitulo.textContent = textos[0];
      vacioTexto.textContent = textos[1];
    }
  }

  function crearTarjeta(r) {
    var roles = ROLES[r.tipo_evaluacion] || ['Usuario', 'Usuario'];
    var criterios = CRITERIOS[r.tipo_evaluacion] || ['Criterio 1', 'Criterio 2'];
    var clase = CLASE_ESTADO[r.estado] || 'pendiente';
    var tieneComentario = r.estado !== 'Eliminado' && r.comentario;

    var tarjeta = crear('article', 'reporte reporte--' + clase);
    tarjeta.setAttribute('aria-labelledby', 'reporte-titulo-' + r.id_evaluacion);

    // cabecera: título y etiquetas
    var cabecera = crear('div', 'reporte__cabecera');
    var titulo = crear('h2', 'reporte__titulo', r.materia);
    titulo.id = 'reporte-titulo-' + r.id_evaluacion;
    cabecera.appendChild(titulo);
    cabecera.appendChild(crear('span', 'chip chip--' + clase, TEXTO_ESTADO[r.estado] || r.estado));
    cabecera.appendChild(crear('span', 'chip', r.total_reportes + (r.total_reportes === 1 ? ' reporte' : ' reportes')));
    tarjeta.appendChild(cabecera);

    // comentario
    if (tieneComentario) {
      tarjeta.appendChild(crear('blockquote', 'reporte__texto', r.comentario));
    } else {
      tarjeta.appendChild(crear('p', 'reporte__texto reporte__texto--vacio', 'El comentario fue eliminado.'));
    }

    // datos de la evaluación
    var datos = crear('dl', 'reporte__datos');
    agregarDato(datos, 'Escrito por (' + roles[0] + ')', r.evaluador_nombre);
    agregarDato(datos, 'Sobre (' + roles[1] + ')', r.evaluado_nombre);
    agregarDato(datos, 'Fecha de la cita', formatoFecha(r.fecha_cita, true));
    agregarDato(datos, 'Calificación', criterios[0] + ' ' + r.criterio_1 + '/5 · ' + criterios[1] + ' ' + r.criterio_2 + '/5');
    tarjeta.appendChild(datos);

    // pie: fecha del reporte y acciones
    var pie = crear('div', 'reporte__pie');
    pie.appendChild(crear('span', 'reporte__fecha', 'Reportado el ' + formatoFecha(r.fecha_reporte)));

    if (r.estado === 'Pendiente') {
      var acciones = crear('div', 'reporte__acciones');

      var btnConservar = crear('button', 'accion accion--secundaria', 'Conservar comentario');
      btnConservar.type = 'button';
      btnConservar.addEventListener('click', function () { resolver(r.id_evaluacion, 'conservar'); });

      var btnEliminar = crear('button', 'accion accion--peligro', 'Eliminar comentario');
      btnEliminar.type = 'button';
      btnEliminar.addEventListener('click', function () { pedirConfirmacion(r); });

      acciones.appendChild(btnConservar);
      acciones.appendChild(btnEliminar);
      pie.appendChild(acciones);
    }

    tarjeta.appendChild(pie);
    return tarjeta;
  }

  function agregarDato(dl, etiqueta, valor) {
    var grupo = document.createElement('div');
    grupo.appendChild(crear('dt', '', etiqueta));
    grupo.appendChild(crear('dd', '', valor));
    dl.appendChild(grupo);
  }

  // ---------- 8. CONSERVAR O ELIMINAR ----------
  function buscarReporte(id) {
    for (var i = 0; i < reportes.length; i++) {
      if (reportes[i].id_evaluacion === id) { return reportes[i]; }
    }
    return null;
  }

  function bloquearBotones(bloquear) {
    ocupado = bloquear;
    var botones = lista.querySelectorAll('button');
    for (var i = 0; i < botones.length; i++) { botones[i].disabled = bloquear; }
  }

  function resolver(id, accion) {
    if (ocupado) { return; }
    bloquearBotones(true);

    var peticion;
    if (MODO_DEMO) {
      peticion = Promise.resolve({ ok: true });
    } else if (accion === 'conservar') {
      peticion = pedir('POST', API + '/' + id + '/conservar');
    } else {
      peticion = pedir('DELETE', API + '/' + id);
    }

    peticion
      .then(function (respuesta) {
        if (!respuesta.ok) {
          mostrarMensaje(textoDeError(respuesta.error), true);
          return;
        }
        var reporte = buscarReporte(id);
        if (reporte) {
          reporte.estado = accion === 'conservar' ? 'Conservado' : 'Eliminado';
          if (accion === 'eliminar') { reporte.comentario = null; }
        }
        dibujar();
        mostrarMensaje(accion === 'conservar' ? 'Comentario conservado: vuelve a ser público' : 'Comentario eliminado definitivamente', false);
        lista.focus(); // la tarjeta ya no está: dejamos el foco en la lista
      })
      .catch(function () {
        mostrarMensaje('No se pudo conectar con el servidor', true);
      })
      .then(function () {
        bloquearBotones(false);
      });
  }

  function pedirConfirmacion(reporte) {
    if (typeof dialogo.showModal !== 'function') {
      // navegador sin <dialog>: usamos la ventana simple
      if (confirm('¿Eliminar este comentario de forma definitiva?')) { resolver(reporte.id_evaluacion, 'eliminar'); }
      return;
    }
    idPorEliminar = reporte.id_evaluacion;
    dialogoComentario.textContent = reporte.comentario;
    dialogo.showModal();
  }

  document.getElementById('dialogoCancelar').addEventListener('click', function () {
    dialogo.close();
  });

  document.getElementById('dialogoConfirmar').addEventListener('click', function () {
    var id = idPorEliminar;
    dialogo.close();
    idPorEliminar = null;
    resolver(id, 'eliminar');
  });

  // ---------- 9. FILTROS ----------
  pestanas.forEach(function (boton) {
    boton.addEventListener('click', function () {
      filtro = boton.getAttribute('data-filtro');
      pestanas.forEach(function (otra) {
        otra.setAttribute('aria-pressed', String(otra === boton));
      });
      dibujar();
    });
  });

  inputBuscar.addEventListener('input', dibujar);
  selectOrden.addEventListener('change', dibujar);
  document.getElementById('btnReintentar').addEventListener('click', cargar);

  // ---------- 10. SALIR ----------
  document.getElementById('btnSalir').addEventListener('click', function () {
    Sesion.salir();
  });

  // ---------- 11. EJECUTAR AL ABRIR ----------
  document.getElementById('avisoDemo').hidden = !MODO_DEMO;
  cargar();
})();
