const db = require('../Configuracion/database');

// Bloques de horas libres del alumno (tabla disponibilidad_alumno).
// Todas las consultas filtran por id_alumno: un alumno solo toca sus propios bloques.

const ORDEN_DIAS = "FIELD(dia, 'Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes')";

async function listarPorAlumno(idAlumno) {
    const sql = `
        SELECT id_disponibilidad AS id, dia, hora_inicio AS inicio, hora_fin AS fin
        FROM disponibilidad_alumno
        WHERE id_alumno = ?
        ORDER BY ${ORDEN_DIAS}, hora_inicio`;
    const [filas] = await db.execute(sql, [idAlumno]);
    return filas;
}

// bloques de un día, para decir con cuál se empalma
async function bloquesDelDia(idAlumno, dia) {
    const sql = `
        SELECT hora_inicio AS inicio, hora_fin AS fin
        FROM disponibilidad_alumno
        WHERE id_alumno = ? AND dia = ?`;
    const [filas] = await db.execute(sql, [idAlumno, dia]);
    return filas;
}

// Inserta solo si no se empalma con otro bloque del mismo día.
// Devuelve el id nuevo, o null si no se insertó.
async function insertar(idAlumno, dia, inicio, fin) {
    const sql = `
        INSERT INTO disponibilidad_alumno (id_alumno, dia, hora_inicio, hora_fin)
        SELECT ?, ?, ?, ?
        FROM DUAL
        WHERE ? < ?
          AND NOT EXISTS (
              SELECT 1
              FROM disponibilidad_alumno
              WHERE id_alumno   = ?
                AND dia         = ?
                AND hora_inicio < ?
                AND hora_fin    > ?
          )`;
    const [resultado] = await db.execute(sql, [
        idAlumno, dia, inicio, fin,
        inicio, fin,
        idAlumno, dia, fin, inicio
    ]);
    return resultado.affectedRows === 1 ? resultado.insertId : null;
}

async function borrar(idAlumno, id) {
    const [resultado] = await db.execute(
        'DELETE FROM disponibilidad_alumno WHERE id_disponibilidad = ? AND id_alumno = ?',
        [id, idAlumno]
    );
    return resultado.affectedRows;
}

async function borrarTodo(idAlumno) {
    const [resultado] = await db.execute('DELETE FROM disponibilidad_alumno WHERE id_alumno = ?', [idAlumno]);
    return resultado.affectedRows;
}

module.exports = {
    listarPorAlumno,
    bloquesDelDia,
    insertar,
    borrar,
    borrarTodo
};