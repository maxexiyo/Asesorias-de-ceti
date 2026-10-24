(function () {
  'use strict';

  const form = document.getElementById('login-form');
  const correo = document.getElementById('correo');
  const password = document.getElementById('password');
  const correoError = document.getElementById('correo-error');
  const passwordError = document.getElementById('password-error');
  const formAlert = document.getElementById('form-alert');
  const submitBtn = document.getElementById('submit-btn');
  const passToggle = document.getElementById('pass-toggle');
  const forgotLink = document.getElementById('forgot-link');
  const toastEl = document.getElementById('toast');

  const SUBMIT_TEXT = submitBtn.textContent;
  const CETI_REGEX = /^[a-z0-9._%+-]+@ceti\.mx$/i;

  const SERVER_ERRORS = {
    credenciales: 'El correo o la contraseña no son correctos.',
    dominio: 'Solo se permiten correos institucionales @ceti.mx.',
    inactivo: 'Tu cuenta está desactivada. Contacta a la coordinación académica.',
    sesion: 'Tu sesión terminó. Inicia sesión de nuevo.',
    bloqueado: 'Demasiados intentos fallidos. Espera 5 minutos e inténtalo de nuevo.',
    servidor: 'No pudimos procesar tu solicitud. Inténtalo más tarde.',
    red: 'No se pudo conectar con el servidor. Revisa que esté encendido.'
  };

  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    clearTimeout(toastEl._h);
    toastEl._h = setTimeout(() => toastEl.classList.remove('show'), 3200);
  }

  function setError(input, errorEl, msg) {
    input.setAttribute('aria-invalid', 'true');
    errorEl.textContent = msg;
    errorEl.hidden = false;
  }

  function clearError(input, errorEl) {
    input.removeAttribute('aria-invalid');
    errorEl.textContent = '';
    errorEl.hidden = true;
  }

  function showAlert(code) {
    formAlert.textContent = SERVER_ERRORS[code] || SERVER_ERRORS.servidor;
    formAlert.hidden = false;
  }

  function resetSubmit() {
    submitBtn.disabled = false;
    submitBtn.textContent = SUBMIT_TEXT;
  }

  function validateCorreo() {
    const value = correo.value.trim();
    if (!value) {
      setError(correo, correoError, 'Escribe tu correo institucional.');
      return false;
    }
    if (!CETI_REGEX.test(value)) {
      setError(correo, correoError, 'Usa tu correo institucional, que termina en @ceti.mx.');
      return false;
    }
    clearError(correo, correoError);
    return true;
  }

  function validatePassword() {
    if (!password.value) {
      setError(password, passwordError, 'Escribe tu contraseña.');
      return false;
    }
    clearError(password, passwordError);
    return true;
  }

  correo.addEventListener('blur', () => { if (correo.value) validateCorreo(); });
  correo.addEventListener('input', () => {
    if (correo.getAttribute('aria-invalid')) validateCorreo();
  });
  password.addEventListener('input', () => {
    if (password.getAttribute('aria-invalid')) validatePassword();
  });

  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    formAlert.hidden = true;
    correo.value = correo.value.trim().toLowerCase();

    const okCorreo = validateCorreo();
    const okPassword = validatePassword();

    if (!okCorreo || !okPassword) {
      (okCorreo ? password : correo).focus();
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Entrando…';

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ correo: correo.value, password: password.value })
      });
      const data = await res.json().catch(() => ({}));

      if (res.ok && data.ok) {
        window.location.href = data.destino;
        return;
      }
      showAlert(data.error);
    } catch (err) {
      showAlert('red');
    }
    resetSubmit();
  });

  passToggle.addEventListener('click', function () {
    const show = password.type === 'password';
    password.type = show ? 'text' : 'password';
    passToggle.textContent = show ? 'Ocultar' : 'Mostrar';
    passToggle.setAttribute('aria-pressed', String(show));
    passToggle.setAttribute('aria-label', show ? 'Ocultar contraseña' : 'Mostrar contraseña');
    password.focus();
  });

  forgotLink.addEventListener('click', function (e) {
    e.preventDefault();
    toast('Se enviaría un enlace de recuperación a tu correo @ceti.mx');
  });

  window.addEventListener('pageshow', resetSubmit);

  // Mensajes que llegan por la URL (?error=... o ?registro=ok)
  const params = new URLSearchParams(window.location.search);
  const urlError = params.get('error');
  if (urlError && SERVER_ERRORS[urlError]) showAlert(urlError);
  if (params.get('registro') === 'ok') toast('Cuenta creada. Ya puedes iniciar sesión.');
})();
