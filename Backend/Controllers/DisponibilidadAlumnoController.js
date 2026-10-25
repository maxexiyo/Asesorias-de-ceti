const alumnoModel = require('../Models/DisponibilidadAlumnoModel');

// En la pantalla los días llevan acento; en la base de datos el enum es 'Miercoles'
const DIA_A_BD = { 'Lunes': 'Lunes', 'Martes': 'Martes', 'Miércoles': 'Miercoles', 'Jueves': 'Jueves', 'Viernes': 'Viernes' };
const DIA_A_PANTALLA = { 'Lunes': 'Lunes', 'Martes': 'Martes', 'Miercoles': 'Miércoles', 'Jueves': 'Jueves', 'Viernes': 'Viernes' };

const HORA_MINIMA = 7 * 60;   // 7:00
const HORA_MAXIMA = 21 * 60;  // 21:00
const DURACION_MINIMA = 30;   // minutos

function aMinutos(hora) {
    const partes = hora.split(':');
    return parseInt(partes[0], 10) * 60 + parseInt(partes[1], 10);
}

// "16:00:00" -> "16:00"
function recortar(hora) {
    return String(hora).slice(0, 5);
}

function aBloque(fila) {
    return { id: fila.id, dia: DIA_A_PANTALLA[fila.dia], inicio: recortar(fila.inicio), fin: recortar(fila.fin) };
}

function idAlumno(req) {
    return req.session.usuario.id_usuario;
}

// Revisa los datos que manda el navegador. Devuelve { error } o { dia, inicio, fin } listos para la BD.
function validarDatos(cuerpo) {
    const diaBD = DIA_A_BD[cuerpo.dia];
    const inicio = typeof cuerpo.inicio === 'string' ? cuerpo.inicio : '';
    const fin = typeof cuerpo.fin === 'string' ? cuerpo.fin : '';
    const formatoHora = /^([01]\d|2[0-3]):[0-5]\d$/;

    if (!diaBD) {
        return { error: 'Elige un día de lunes a viernes' };
    }
    if (!formatoHora.test(inicio) || !formatoHora.test(fin)) {
        return { error: 'Elige la hora de inicio y la hora de fin' };
    }

    const min1 = aMinutos(inicio);
    const min2 = aMinutos(fin);

    if (min1 < HORA_MINIMA || min2 > HORA_MAXIMA) {
        return { error: 'El horario debe estar entre las 7:00 y las 21:00' };
    }
    if (min2 <= min1) {
        return { error: 'La hora de fin debe ser después de la hora de inicio' };
    }
    if (min2 - min1 < DURACION_MINIMA) {
        return { error: 'Cada bloque debe durar al menos 30 minutos' };
    }
    return { dia: diaBD, inicio: inicio + ':00', fin: fin + ':00' };
}

function errorServidor(res, accion, error) {
    console.error('Error al ' + accion + ':', error);
    res.status(500).json({ ok: false, error: 'servidor' });
}

// GET /api/mi-horario
async function listar(req, res) {
    try {
        const filas = await alumnoModel.listarPorAlumno(idAlumno(req));
        res.json({ ok: true, bloques: filas.map(aBloque) });
    } catch (error) {
        errorServidor(res, 'listar las horas libres', error);
    }
}

// POST /api/mi-horario   { dia, inicio, fin }
async function crear(req, res) {
    const datos = validarDatos(req.body || {});
    if (datos.error) {
        return res.status(400).json({ ok: false, error: 'datos', mensaje: datos.error });
    }

    try {
        const id = await alumnoModel.insertar(idAlumno(req), datos.dia, datos.inicio, datos.fin);
        if (id === null) {
            const delDia = await alumnoModel.bloquesDelDia(idAlumno(req), datos.dia);
            const min1 = aMinutos(datos.inicio);
            const min2 = aMinutos(datos.fin);
            const otro = delDia.find((b) => min1 < aMinutos(recortar(b.fin)) && min2 > aMinutos(recortar(b.inicio)));
            const texto = otro
                ? 'Se empalma con otro bloque del ' + DIA_A_PANTALLA[datos.dia] + ' (' + recortar(otro.inicio) + ' a ' + recortar(otro.fin) + ')'
                : 'Se empalma con otro bloque';
            return res.status(409).json({ ok: false, error: 'empalme', mensaje: texto });
        }
        res.status(201).json({ ok: true, id: id });
    } catch (error) {
        errorServidor(res, 'guardar la hora libre', error);
    }
}

// DELETE /api/mi-horario/:id
async function borrar(req, res) {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id < 1) {
        return res.status(400).json({ ok: false, error: 'datos', mensaje: 'Bloque no válido' });
    }

    try {
        const borrados = await alumnoModel.borrar(idAlumno(req), id);
        if (borrados === 0) {
            return res.status(404).json({ ok: false, error: 'no_encontrado' });
        }
        res.json({ ok: true });
    } catch (error) {
        errorServidor(res, 'borrar la hora libre', error);
    }
}

// DELETE /api/mi-horario   (borra todos los bloques del alumno)
async function borrarTodo(req, res) {
    try {
        await alumnoModel.borrarTodo(idAlumno(req));
        res.json({ ok: true });
    } catch (error) {
        errorServidor(res, 'borrar todas las horas libres', error);
    }
}

module.exports = {
    listar,
    crear,
    borrar,
    borrarTodo
};
