(function () {
  'use strict';

  const form = document.getElementById('registro-form');
  const formAlert = document.getElementById('form-alert');
  const submitBtn = document.getElementById('submit-btn');
  const passToggle = document.getElementById('pass-toggle');

  const fields = {
    nombre: document.getElementById('nombre'),
    apellidos: document.getElementById('apellidos'),
    correo: document.getElementById('correo'),
    rol: document.getElementById('rol'),
    password: document.getElementById('password'),
    password2: document.getElementById('password2')
  };
  const errors = {};
  Object.keys(fields).forEach((k) => { errors[k] = document.getElementById(k + '-error'); });

  const SUBMIT_TEXT = submitBtn.textContent;
  const CETI_REGEX = /^[a-z0-9._%+-]+@ceti\.mx$/i;
  const NOMBRE_REGEX = /^[\p{L}][\p{L} .'-]{1,59}$/u;

  // Errores que puede devolver el servidor: registro.html?error=<codigo>
  const SERVER_ERRORS = {
    datos: 'Revisa tu nombre y apellidos.',
    dominio: 'Solo se permiten correos institucionales @ceti.mx.',
    rol: 'Selecciona si eres alumno o asesor.',
    password: 'La contraseña debe tener mínimo 8 caracteres, con letras y números.',
    existe: 'Ya existe una cuenta con ese correo. Inicia sesión.',
    servidor: 'No pudimos crear tu cuenta. Inténtalo más tarde.'
  };

  function setError(key, msg) {
    fields[key].setAttribute('aria-invalid', 'true');
    errors[key].textContent = msg;
    errors[key].hidden = false;
  }

  function clearError(key) {
    fields[key].removeAttribute('aria-invalid');
    errors[key].textContent = '';
    errors[key].hidden = true;
  }

  function showAlert(code) {
    formAlert.textContent = SERVER_ERRORS[code] || SERVER_ERRORS.servidor;
    formAlert.hidden = false;
  }

  function resetSubmit() {
    submitBtn.disabled = false;
    submitBtn.textContent = SUBMIT_TEXT;
  }

  /* Cada validador devuelve un mensaje de error o '' si el campo está bien */
  const validators = {
    nombre() {
      const v = fields.nombre.value.trim();
      if (!v) return 'Escribe tu nombre.';
      if (!NOMBRE_REGEX.test(v)) return 'Usa solo letras en tu nombre.';
      return '';
    },
    apellidos() {
      const v = fields.apellidos.value.trim();
      if (!v) return 'Escribe tus apellidos.';
      if (!NOMBRE_REGEX.test(v)) return 'Usa solo letras en tus apellidos.';
      return '';
    },
    correo() {
      const v = fields.correo.value.trim();
      if (!v) return 'Escribe tu correo institucional.';
      if (!CETI_REGEX.test(v)) return 'Usa tu correo institucional, que termina en @ceti.mx.';
      return '';
    },
    rol() {
      return fields.rol.value ? '' : 'Selecciona si eres alumno o asesor.';
    },
    password() {
      const v = fields.password.value;
      if (!v) return 'Crea una contraseña.';
      if (v.length < 8) return 'Debe tener al menos 8 caracteres.';
      if (!/[A-Za-z]/.test(v) || !/\d/.test(v)) return 'Combina letras y números.';
      if (new TextEncoder().encode(v).length > 72) return 'Es demasiado larga (máximo 72 bytes).';
      return '';
    },
    password2() {
      const v = fields.password2.value;
      if (!v) return 'Repite tu contraseña.';
      if (v !== fields.password.value) return 'Las contraseñas no coinciden.';
      return '';
    }
  };

  function validate(key) {
    const msg = validators[key]();
    if (msg) setError(key, msg); else clearError(key);
    return !msg;
  }

  Object.keys(fields).forEach((key) => {
    const el = fields[key];
    const evt = key === 'rol' ? 'change' : 'input';
    el.addEventListener(evt, () => {
      if (el.getAttribute('aria-invalid')) validate(key);
      // Si cambia la contraseña, revalida la confirmación
      if (key === 'password' && fields.password2.value) validate('password2');
    });
    if (key === 'correo') {
      el.addEventListener('blur', () => { if (el.value) validate(key); });
    }
  });

  /* ---------- Envío ----------
     Ya no se usa fetch ni API: si todo está bien, el formulario se envía
     solo (POST normal a la ruta del atributo action) y el servidor
     responde con una redirección. */
  form.addEventListener('submit', function (e) {
    formAlert.hidden = true;
    fields.correo.value = fields.correo.value.trim().toLowerCase();

    // Valida todos los campos y enfoca el primero con error
    const results = Object.keys(fields).map((k) => [k, validate(k)]);
    const firstBad = results.find(([, ok]) => !ok);
    if (firstBad) {
      e.preventDefault();               // solo se frena si hay errores
      fields[firstBad[0]].focus();
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Creando cuenta…';
    // Sin errores: el navegador manda el formulario al servidor
  });

  passToggle.addEventListener('click', function () {
    const show = fields.password.type === 'password';
    const type = show ? 'text' : 'password';
    fields.password.type = type;
    fields.password2.type = type;
    passToggle.textContent = show ? 'Ocultar' : 'Mostrar';
    passToggle.setAttribute('aria-pressed', String(show));
    passToggle.setAttribute('aria-label', show ? 'Ocultar contraseña' : 'Mostrar contraseña');
    fields.password.focus();
  });

  // Al volver con el botón "atrás" el navegador puede dejar el botón bloqueado
  window.addEventListener('pageshow', resetSubmit);

  // Errores devueltos por el servidor (registro.html?error=existe, etc.)
  const serverError = new URLSearchParams(window.location.search).get('error');
  if (serverError) showAlert(serverError);
})();