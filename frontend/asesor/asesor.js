document.getElementById('btnSalir').addEventListener('click', Sesion.salir);
Sesion.cargar()
  .then(function (usuario) {
    document.getElementById('saludo').textContent = 'Hola, ' + usuario.nombre + '.';
  })
  .catch(function () {
    document.getElementById('saludo').textContent = 'No se pudo cargar tu sesión. Revisa que el servidor esté encendido.';
  });
