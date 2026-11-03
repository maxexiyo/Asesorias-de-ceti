const bcrypt = require('bcryptjs');
const usuarioModel = require('../Models/UsuarioModel');
const { INICIO_POR_ROL } = require('../Middlewares/auth');

const CETI_REGEX = /^[a-z0-9._%+-]+@ceti\.mx$/;
const NOMBRE_REGEX = /^[\p{L}][\p{L} .'-]{1,59}$/u;

function limpiar(valor) {
    return typeof valor === 'string' ? valor.trim() : '';
}

// REGISTRO: llega del formulario (POST normal) y redirige
async function registrarUsuario(req, res) {
    const nombre = limpiar(req.body.nombre);
    const apellidos = limpiar(req.body.apellidos);
    const correo = limpiar(req.body.correo).toLowerCase();
    const rol = limpiar(req.body.rol).toLowerCase();
    const password = typeof req.body.password === 'string' ? req.body.password : '';

    const volver = '/registro/registro.html?error=';

    // revisa que los datos sean válidos
    if (!NOMBRE_REGEX.test(nombre) || !NOMBRE_REGEX.test(apellidos)) {
        return res.redirect(volver + 'datos');
    }
    if (!CETI_REGEX.test(correo)) {
        return res.redirect(volver + 'dominio');
    }
    if (rol !== 'alumno' && rol !== 'asesor') {
        return res.redirect(volver + 'rol');
    }
    if (password.length < 8 || !/[A-Za-z]/.test(password) || !/\d/.test(password)) {
        return res.redirect(volver + 'password');
    }

    try {
        const existe = await usuarioModel.buscarPorCorreo(correo);
        if (existe) {
            return res.redirect(volver + 'existe');
        }

        // en la base el nombre va completo y el código es lo de antes del @
        const nombreCompleto = nombre + ' ' + apellidos;
        const codigo = correo.split('@')[0];
        const rolBD = rol === 'alumno' ? 'Alumno' : 'Asesor';

        // la contraseña se guarda cifrada, nunca en texto normal
        const hash = await bcrypt.hash(password, 12);
        await usuarioModel.registrarUsuario(nombreCompleto, codigo, correo, hash, rolBD);

        res.redirect('/login/login.html?registro=ok');
    } catch (error) {
        console.error('Error al registrar usuario:', error);
        res.redirect(volver + 'servidor');
    }
}

// LOGIN: lo llama login.js con fetch y responde JSON
async function iniciarSesion(req, res) {
    const correo = limpiar(req.body.correo).toLowerCase();
    const password = typeof req.body.password === 'string' ? req.body.password : '';

    if (!correo || !password) {
        return res.status(400).json({ ok: false, error: 'credenciales' });
    }
    if (!CETI_REGEX.test(correo)) {
        return res.status(400).json({ ok: false, error: 'dominio' });
    }

    try {
        const usuario = await usuarioModel.buscarPorCorreo(correo);

        if (!usuario || !(await bcrypt.compare(password, usuario.password_hash))) {
            return res.status(401).json({ ok: false, error: 'credenciales' });
        }

        const datosUsuario = {
            id_usuario: usuario.id_usuario,
            nombre: usuario.nombre,
            correo: usuario.correo,
            rol: usuario.rol.toLowerCase() // alumno | asesor | admin
        };

        // sesión nueva al iniciar para evitar fijación de sesión
        req.session.regenerate(function (errSesion) {
            if (errSesion) {
                console.error('Error al crear la sesión:', errSesion);
                return res.status(500).json({ ok: false, error: 'servidor' });
            }

            req.session.usuario = datosUsuario;

            req.session.save(function (errGuardar) {
                if (errGuardar) {
                    console.error('Error al guardar la sesión:', errGuardar);
                    return res.status(500).json({ ok: false, error: 'servidor' });
                }
                // cada rol entra a su propia vista
                const destino = INICIO_POR_ROL[datosUsuario.rol] || '/login/login.html';
                res.json({ ok: true, destino: destino, usuario: datosUsuario });
            });
        });
    } catch (error) {
        console.error('Error al iniciar sesión:', error);
        res.status(500).json({ ok: false, error: 'servidor' });
    }
}

// GET /api/me: devuelve al usuario de la sesión (el middleware ya verificó que existe)
function obtenerSesion(req, res) {
    res.json({ ok: true, usuario: req.session.usuario });
}

// POST /api/logout: destruye la sesión en el servidor y borra la cookie
function cerrarSesion(req, res) {
    req.session.destroy(function () {
        res.clearCookie('sid');
        res.json({ ok: true });
    });
}

module.exports = {
    registrarUsuario,
    iniciarSesion,
    obtenerSesion,
    cerrarSesion
};