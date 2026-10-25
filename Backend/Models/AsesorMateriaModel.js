const db = require('../Configuracion/database');

// Materias que imparte cada asesor (tabla asesor_materia).
// Todas las consultas filtran por id_usuario: un asesor solo toca sus propias materias.

// para que un % o _ escrito en el buscador se busque como texto normal
function escaparLike(texto) {
    return texto.replace(/[\\%_]/g, '\\$&');
}

// Todas las materias que coinciden con el texto, marcando cuáles ya eligió este asesor.
// Con soloMias = true devuelve únicamente las que ya eligió.
async function listarConMarca(idAsesor, texto, soloMias) {
    const patron = '%' + escaparLike(texto) + '%';
    const filtroMias = soloMias ? 'AND am.id_usuario IS NOT NULL' : '';

    const sql = `
        SELECT m.id_materia, m.clave, m.nombre,
               (am.id_usuario IS NOT NULL) AS seleccionada
        FROM materia m
        LEFT JOIN asesor_materia am
               ON am.id_materia = m.id_materia AND am.id_usuario = ?
        WHERE (m.nombre LIKE ? OR m.clave LIKE ?) ${filtroMias}
        ORDER BY m.nombre ASC`;

    const [filas] = await db.execute(sql, [idAsesor, patron, patron]);
    return filas;
}

async function contar(idAsesor) {
    const [filas] = await db.execute(
        'SELECT COUNT(*) AS total FROM asesor_materia WHERE id_usuario = ?',
        [idAsesor]
    );
    return Number(filas[0].total);
}

async function existeMateria(idMateria) {
    const [filas] = await db.execute('SELECT 1 FROM materia WHERE id_materia = ?', [idMateria]);
    return filas.length > 0;
}

// si ya la tenía, no pasa nada (la llave primaria evita duplicados)
async function agregar(idAsesor, idMateria) {
    await db.execute(
        'INSERT IGNORE INTO asesor_materia (id_usuario, id_materia) VALUES (?, ?)',
        [idAsesor, idMateria]
    );
}

async function quitar(idAsesor, idMateria) {
    await db.execute(
        'DELETE FROM asesor_materia WHERE id_usuario = ? AND id_materia = ?',
        [idAsesor, idMateria]
    );
}

module.exports = {
    listarConMarca,
    contar,
    existeMateria,
    agregar,
    quitar
};