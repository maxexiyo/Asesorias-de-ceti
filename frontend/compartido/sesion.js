// Ayudas de sesión para las páginas protegidas.
// El servidor es quien decide el acceso; esto solo pide los datos y cierra sesión.
(function () {
  'use strict';

  var INICIO_POR_ROL = {
    alumno: '/materias/materias.html',
    asesor: '/asesor/asesor.html',
    admin: '/admin/admin.html'
  };

  function irAlLogin(error) {
    window.location.href = '/login/login.html' + (error ? '?error=' + error : '');
  }

  window.Sesion = {
    // vista de inicio de cada rol
    inicio: function (rol) {
      return INICIO_POR_ROL[rol] || '/login/login.html';
    },

    // pide al servidor quién tiene la sesión; si no hay, manda al login
    cargar: function () {
      return fetch('/api/me').then(function (respuesta) {
        if (respuesta.status === 401) {
          irAlLogin('sesion');
          return new Promise(function () {}); // la página ya se está yendo
        }
        if (!respuesta.ok) {
          throw new Error('Error del servidor');
        }
        return respuesta.json().then(function (datos) {
          return datos.usuario;
        });
      });
    },

    // cierra la sesión en el servidor y vuelve al login
    salir: function () {
      fetch('/api/logout', { method: 'POST' })
        .catch(function () {})
        .then(function () { irAlLogin(); });
    }
  };
})();