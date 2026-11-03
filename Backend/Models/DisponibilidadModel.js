const db = require('../Configuracion/database');

// Consultas de la tabla `disponibilidad` (bloques semanales del asesor).
// Todas filtran por id_asesor para que un asesor solo toque sus propios bloques.

const ORDEN_DIAS = "FIELD(dia, 'Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes')";

async function listarPorAsesor(idAsesor) {
    const sql = `
        SELECT id_disponibilidad AS id, dia, hora_inicio AS inicio, hora_fin AS fin
        FROM disponibilidad
        WHERE id_asesor = ?
        ORDER BY ${ORDEN_DIAS}, hora_inicio`;
    const [filas] = await db.execute(sql, [idAsesor]);
    return filas;
}

// bloques de un día, para revisar empalmes (se puede excluir un bloque al editarlo)
async function bloquesDelDia(idAsesor, dia, exceptoId) {
    const sql = `
        SELECT id_disponibilidad AS id, hora_inicio AS inicio, hora_fin AS fin
        FROM disponibilidad
        WHERE id_asesor = ? AND dia = ? AND id_disponibilidad <> ?`;
    const [filas] = await db.execute(sql, [idAsesor, dia, exceptoId || 0]);
    return filas;
}

// Inserta solo si no se empalma con otro bloque del mismo día (consulta de consultas_catalogo_disponibilidad.sql).
// Devuelve el id nuevo, o null si no se insertó.
async function insertar(idAsesor, dia, inicio, fin) {
    const sql = `
        INSERT INTO disponibilidad (id_asesor, dia, hora_inicio, hora_fin)
        SELECT ?, ?, ?, ?
        FROM DUAL
        WHERE ? < ?
          AND NOT EXISTS (
              SELECT 1
              FROM disponibilidad
              WHERE id_asesor   = ?
                AND dia         = ?
                AND hora_inicio < ?
                AND hora_fin    > ?
          )`;
    const [resultado] = await db.execute(sql, [
        idAsesor, dia, inicio, fin,
        inicio, fin,
        idAsesor, dia, fin, inicio
    ]);
    return resultado.affectedRows === 1 ? resultado.insertId : null;
}

async function existe(idAsesor, id) {
    const [filas] = await db.execute(
        'SELECT 1 FROM disponibilidad WHERE id_disponibilidad = ? AND id_asesor = ?',
        [id, idAsesor]
    );
    return filas.length > 0;
}

async function actualizar(idAsesor, id, dia, inicio, fin) {
    await db.execute(
        `UPDATE disponibilidad SET dia = ?, hora_inicio = ?, hora_fin = ?
         WHERE id_disponibilidad = ? AND id_asesor = ?`,
        [dia, inicio, fin, id, idAsesor]
    );
}

async function borrar(idAsesor, id) {
    const [resultado] = await db.execute(
        'DELETE FROM disponibilidad WHERE id_disponibilidad = ? AND id_asesor = ?',
        [id, idAsesor]
    );
    return resultado.affectedRows;
}

async function borrarTodo(idAsesor) {
    const [resultado] = await db.execute('DELETE FROM disponibilidad WHERE id_asesor = ?', [idAsesor]);
    return resultado.affectedRows;
}

module.exports = {
    listarPorAsesor,
    bloquesDelDia,
    insertar,
    existe,
    actualizar,
    borrar,
    borrarTodo
};