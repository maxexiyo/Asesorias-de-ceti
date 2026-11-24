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

// ---------- Administración del catálogo (solo admin) ----------

// crea una materia y devuelve su id
async function crearMateria(clave, nombre, indiceRezago) {
    const [resultado] = await db.execute(
        'INSERT INTO materia (clave, nombre, indice_rezago) VALUES (?, ?, ?)',
        [clave, nombre, indiceRezago]
    );
    return resultado.insertId;
}

// edita una materia; devuelve cuántas filas existían con ese id (0 = no existe)
async function actualizarMateria(idMateria, clave, nombre, indiceRezago) {
    const [resultado] = await db.execute(
        'UPDATE materia SET clave = ?, nombre = ?, indice_rezago = ? WHERE id_materia = ?',
        [clave, nombre, indiceRezago, idMateria]
    );
    return resultado.affectedRows;
}

// cuántos asesores y cuántas citas dependen de la materia
async function contarUso(idMateria) {
    const [filas] = await db.execute(
        `SELECT
            (SELECT COUNT(*) FROM asesor_materia WHERE id_materia = ?) AS asesores,
            (SELECT COUNT(*) FROM cita WHERE id_materia = ?) AS citas`,
        [idMateria, idMateria]
    );
    return filas[0];
}

// borra la materia (los vínculos con asesores se borran solos por el ON DELETE CASCADE)
async function eliminarMateria(idMateria) {
    const [resultado] = await db.execute(
        'DELETE FROM materia WHERE id_materia = ?',
        [idMateria]
    );
    return resultado.affectedRows;
}

module.exports = {
    buscarMaterias,
    crearMateria,
    actualizarMateria,
    contarUso,
    eliminarMateria
};