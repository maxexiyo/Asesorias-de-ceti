const crypto = require('crypto');
const express = require('express');
const session = require('express-session');
const path = require('path');

require('dotenv').config();

const usuariosRouters = require('./Routers/usuariosRouters');
const materiasRouters = require('./Routers/materiasRouters');
const { ROLES, INICIO_POR_ROL, usuarioDeSesion, protegerPagina } = require('./Middlewares/auth');

const app = express();

const INACTIVIDAD_MS = 30 * 60 * 1000; // la sesión expira tras 30 min sin usar
const produccion = process.env.NODE_ENV === 'production';

// para leer los datos del formulario y el JSON del login
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(session({
    name: 'sid',
    // se genera solo al arrancar el servidor (por eso al reiniciarlo hay que volver a iniciar sesión)
    secret: crypto.randomBytes(32).toString('hex'),
    resave: false,
    saveUninitialized: false,
    rolling: true, // cada petición renueva los 30 min
    cookie: {
        httpOnly: true,
        sameSite: 'lax',
        secure: produccion, // true solo con HTTPS
        maxAge: INACTIVIDAD_MS
    }
}));

const frontend = path.join(__dirname, '../frontend');

// ---- páginas públicas (sin sesión) ----
app.use('/login', express.static(path.join(frontend, 'login')));
app.use('/registro', express.static(path.join(frontend, 'registro')));
app.use('/compartido', express.static(path.join(frontend, 'compartido')));

// ---- páginas protegidas: el servidor revisa sesión y rol antes de entregar el archivo ----
app.use('/materias', protegerPagina(...ROLES), express.static(path.join(frontend, 'materias')));
app.use('/perfil', protegerPagina(...ROLES), express.static(path.join(frontend, 'perfil')));
app.use('/asesor', protegerPagina('asesor'), express.static(path.join(frontend, 'asesor')));
app.use('/admin', protegerPagina('admin'), express.static(path.join(frontend, 'admin')));

// rutas de la API
app.use(usuariosRouters);
app.use(materiasRouters);

app.get('/', (req, res) => {
    const usuario = usuarioDeSesion(req);
    res.redirect(usuario ? INICIO_POR_ROL[usuario.rol] : '/login/login.html');
});

app.listen(process.env.PORT, () => {
    console.log('Servidor ejecutandose en el puerto ' + process.env.PORT);
});

module.exports = app;