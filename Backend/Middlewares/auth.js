// Control de acceso: quién tiene sesión y qué rol tiene.
// La sesión vive en el servidor (cookie "sid"); el navegador nunca decide el rol.

const ROLES = ['alumno', 'asesor', 'admin'];

// vista a la que entra cada rol después de iniciar sesión
const INICIO_POR_ROL = {
    alumno: '/materias/materias.html',
    asesor: '/asesor/asesor.html',
    admin: '/admin/admin.html'
};

function usuarioDeSesion(req) {
    return req.session && req.session.usuario ? req.session.usuario : null;
}

// Crea un guardia. En modo "pagina" redirige; en modo "api" responde JSON.
//   paginas('asesor')        -> solo asesores
//   paginas('alumno','admin') -> alumnos y admins
//   paginas()                -> cualquier usuario con sesión
function crearGuardia(modo) {
    return function (...rolesPermitidos) {
        return function (req, res, next) {
            const usuario = usuarioDeSesion(req);

            if (!usuario) {
                if (modo === 'api') {
                    return res.status(401).json({ ok: false, error: 'sesion' });
                }
                return res.redirect('/login/login.html?error=sesion');
            }

            if (rolesPermitidos.length && !rolesPermitidos.includes(usuario.rol)) {
                if (modo === 'api') {
                    return res.status(403).json({ ok: false, error: 'permiso' });
                }
                // tiene sesión pero esa vista no es de su rol: lo mandamos a la suya
                return res.redirect(INICIO_POR_ROL[usuario.rol] || '/login/login.html');
            }

            if (modo === 'pagina') {
                // que el botón "atrás" no muestre páginas protegidas después de salir
                res.set('Cache-Control', 'no-store');
            }
            next();
        };
    };
}

module.exports = {
    ROLES,
    INICIO_POR_ROL,
    usuarioDeSesion,
    protegerPagina: crearGuardia('pagina'),
    protegerApi: crearGuardia('api')
};