const db = require('../Configuracion/database');

// Cruza las horas libres del alumno con la disponibilidad de los asesores.
// Cada fila es un tramo donde los dos coinciden. Con idMateria solo salen los asesores que la imparten.
async function tramosEnComun(idAlumno, idMateria) {
    const filtroMateria = idMateria
        ? `AND EXISTS (
               SELECT 1 FROM asesor_materia am
               WHERE am.id_usuario = d.id_asesor AND am.id_materia = ?
           )`
        : '';

    const sql = `
        SELECT u.id_usuario AS id_asesor, u.nombre, a.dia,
               GREATEST(a.hora_inicio, d.hora_inicio) AS inicio,
               LEAST(a.hora_fin, d.hora_fin) AS fin
        FROM disponibilidad_alumno a
        JOIN disponibilidad d
          ON d.dia = a.dia AND d.hora_inicio < a.hora_fin AND d.hora_fin > a.hora_inicio
        JOIN usuario u ON u.id_usuario = d.id_asesor
        WHERE a.id_alumno = ? ${filtroMateria}
        ORDER BY u.nombre, FIELD(a.dia, 'Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes'), inicio`;

    const parametros = idMateria ? [idAlumno, idMateria] : [idAlumno];
    const [filas] = await db.execute(sql, parametros);
    return filas;
}

module.exports = {
    tramosEnComun
};