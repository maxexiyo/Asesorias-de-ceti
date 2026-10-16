// Servidor de Gestión de Asesorías CETI (reemplaza login.php + db.php)
// Instalar:  npm init -y
//            npm i express express-session mysql2 bcryptjs
// Correr:    node server.js

const path = require('path');
const express = require('express');
const session = require('express-session');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

/* ---------- Configuración ---------- */
const PORT = process.env.PORT || 3000;


const MAX_INTENTOS = 5;               // intentos fallidos permitidos
const BLOQUEO_MS = 5 * 60 * 1000;     // 5 minutos de espera
const INACTIVIDAD_MS = 30 * 60 * 1000; // la sesión expira tras 30 min sin uso

const ROLES_REGISTRO = ['alumno', 'asesor'];   // "administrador" nunca se crea desde el registro
const CETI_REGEX = /^[a-z0-9._%+-]+@ceti\.mx$/;
const NOMBRE_REGEX = /^[\p{L}][\p{L} .'-]{1,59}$/u;

/* ---------- Base de datos ---------- */
const pool = mysql.createPool({
  ...DB,
  waitForConnections: true,
  connectionLimit: 10,
});

/* ---------- App ---------- */
const app = express();
app.use(express.json({ limit: '10kb' }));

app.use(session({
  name: 'sid',
  secret: process.env.SESSION_SECRET || 'cambia-este-secreto-en-produccion',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production', // true solo con HTTPS
  },
}));

/* ---------- Utilidades ---------- */
const limpiar = (v) => (typeof v === 'string' ? v.trim() : '');

// Hash falso para que el tiempo de respuesta no revele si la cuenta existe
const HASH_FALSO = bcrypt.hashSync('contraseña-falsa', 10);

// Bloqueo temporal por IP + correo (en memoria)
const fallos = new Map(); // clave -> { n, hasta }

function estaBloqueado(clave) {
  const f = fallos.get(clave);
  if (!f) return false;
  if (f.hasta && f.hasta > Date.now()) return true;
  if (f.hasta && f.hasta <= Date.now()) fallos.delete(clave);
  return false;
}

function registrarFallo(clave) {
  const f = fallos.get(clave) || { n: 0, hasta: 0 };
  f.n += 1;
  if (f.n >= MAX_INTENTOS) {
    f.hasta = Date.now() + BLOQUEO_MS;
    f.n = 0;
  }
  fallos.set(clave, f);
}

const fail = (res, status, error) => res.status(status).json({ ok: false, error });

function requireAuth(req, res, next) {
  const s = req.session;
  if (!s.id_usuario) return fail(res, 401, 'sesion');
  if (Date.now() - s.ultimo_uso > INACTIVIDAD_MS) {
    return req.session.destroy(() => fail(res, 401, 'sesion'));
  }
  s.ultimo_uso = Date.now();
  next();
}

/* ---------- API ---------- */

// POST /api/login  { correo, password }
app.post('/api/login', async (req, res) => {
  const correo = limpiar(req.body.correo).toLowerCase();
  const password = typeof req.body.password === 'string' ? req.body.password : '';

  if (!correo || !password) return fail(res, 400, 'credenciales');
  if (!CETI_REGEX.test(correo)) return fail(res, 400, 'dominio');

  const clave = `${req.ip}|${correo}`;
  if (estaBloqueado(clave)) return fail(res, 429, 'bloqueado');

  let usuario;
  try {
    const [rows] = await pool.execute(
      `SELECT u.id_usuario, u.nombre, u.apellidos, u.correo, u.password_hash, u.activo, r.nombre AS rol
         FROM usuarios u
         JOIN roles r ON r.id_rol = u.id_rol
        WHERE u.correo = ?
        LIMIT 1`,
      [correo]
    );
    usuario = rows[0];
  } catch (err) {
    console.error('Login:', err);
    return fail(res, 500, 'servidor');
  }

  // bcryptjs también lee los hashes $2y$ que generó password_hash() de PHP
  const passOk = await bcrypt.compare(password, usuario ? usuario.password_hash : HASH_FALSO);

  if (!usuario || !passOk) {
    registrarFallo(clave);
    return fail(res, 401, 'credenciales');
  }
  if (!usuario.activo) return fail(res, 403, 'inactivo');

  fallos.delete(clave);

  // Sesión nueva para evitar fijación de sesión
  req.session.regenerate((err) => {
    if (err) {
      console.error('Sesión:', err);
      return fail(res, 500, 'servidor');
    }
    req.session.id_usuario = usuario.id_usuario;
    req.session.nombre = usuario.nombre;
    req.session.apellidos = usuario.apellidos;
    req.session.correo = usuario.correo;
    req.session.rol = usuario.rol; // alumno | asesor | administrador
    req.session.ultimo_uso = Date.now();

    // Ajusta los nombres a tus pantallas
    const destino = usuario.rol === 'administrador' ? 'admin.html' : 'dashboard.html';
    res.json({ ok: true, destino });
  });
});

// POST /api/registro  { nombre, apellidos, correo, rol, password }
app.post('/api/registro', async (req, res) => {
  const nombre = limpiar(req.body.nombre);
  const apellidos = limpiar(req.body.apellidos);
  const correo = limpiar(req.body.correo).toLowerCase();
  const rol = limpiar(req.body.rol).toLowerCase();
  const password = typeof req.body.password === 'string' ? req.body.password : '';

  if (!NOMBRE_REGEX.test(nombre) || !NOMBRE_REGEX.test(apellidos)) return fail(res, 400, 'datos');
  if (!CETI_REGEX.test(correo)) return fail(res, 400, 'dominio');
  if (!ROLES_REGISTRO.includes(rol)) return fail(res, 400, 'rol');
  if (
    password.length < 8 ||
    Buffer.byteLength(password) > 72 || // límite de bcrypt
    !/[A-Za-z]/.test(password) ||
    !/\d/.test(password)
  ) {
    return fail(res, 400, 'password');
  }

  try {
    const [existe] = await pool.execute('SELECT 1 FROM usuarios WHERE correo = ? LIMIT 1', [correo]);
    if (existe.length) return fail(res, 409, 'existe');

    const [roles] = await pool.execute('SELECT id_rol FROM roles WHERE nombre = ? LIMIT 1', [rol]);
    if (!roles.length) return fail(res, 500, 'servidor');

    const hash = await bcrypt.hash(password, 12);
    await pool.execute(
      `INSERT INTO usuarios (nombre, apellidos, correo, password_hash, activo, id_rol)
       VALUES (?, ?, ?, ?, 1, ?)`,
      [nombre, apellidos, correo, hash, roles[0].id_rol]
    );

    res.status(201).json({ ok: true });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') return fail(res, 409, 'existe');
    console.error('Registro:', err);
    fail(res, 500, 'servidor');
  }
});

// GET /api/me  -> datos de la sesión (para tus pantallas protegidas)
app.get('/api/me', requireAuth, (req, res) => {
  const { id_usuario, nombre, apellidos, correo, rol } = req.session;
  res.json({ ok: true, usuario: { id_usuario, nombre, apellidos, correo, rol } });
});

// POST /api/logout
app.post('/api/logout', (req, res) => {
  req.session.destroy(() => {
    res.clearCookie('sid');
    res.json({ ok: true });
  });
});

/* ---------- Archivos estáticos ---------- */
app.use(express.static(path.join(__dirname, 'public')));
app.get('/', (req, res) => res.redirect('/login.html'));

app.listen(PORT, () => console.log(`Servidor en http://localhost:${PORT}`));
