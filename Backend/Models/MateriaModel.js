const db = require('../Configuracion/database');

// formas de ordenar que se permiten
const ORDENES = {
    nombre: 'm.nombre ASC',
    rezago: 'm.indice_rezago DESC, m.nombre ASC'
};

// para que un % o _ escrito en el buscador se busque como texto normal
function escaparLike(texto) {
    return texto.replace(/[\\%_]/g, '\\$&');
}

// lista las materias que coinciden con el texto, con cuántos asesores la imparten
async function buscarMaterias(texto, orden, soloConAsesores) {
    const patron = '%' + escaparLike(texto) + '%';
    const ordenSql = ORDENES[orden] || ORDENES.nombre;
    // con soloConAsesores se ocultan las materias que nadie imparte todavía
    const filtroAsesores = soloConAsesores ? 'HAVING COUNT(am.id_usuario) > 0' : '';

    const sql = `
        SELECT m.id_materia, m.clave, m.nombre, m.indice_rezago,
               COUNT(am.id_usuario) AS asesores
        FROM materia m
        LEFT JOIN asesor_materia am ON am.id_materia = m.id_materia
        WHERE m.nombre LIKE ? OR m.clave LIKE ?
        GROUP BY m.id_materia, m.clave, m.nombre, m.indice_rezago
        ${filtroAsesores}
        ORDER BY ${ordenSql}`;

    const [filas] = await db.execute(sql, [patron, patron]);
    return filas;
}

module.exports = {
    buscarMaterias
};