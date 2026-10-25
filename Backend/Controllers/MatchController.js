const matchModel = require('../Models/MatchModel');

const DIA_A_PANTALLA = { 'Lunes': 'Lunes', 'Martes': 'Martes', 'Miercoles': 'Miércoles', 'Jueves': 'Jueves', 'Viernes': 'Viernes' };

function aMinutos(hora) {
    const partes = hora.split(':');
    return parseInt(partes[0], 10) * 60 + parseInt(partes[1], 10);
}

// "16:00:00" -> "16:00"
function recortar(hora) {
    return String(hora).slice(0, 5);
}

// GET /api/matches?materia=3   (materia es opcional)
async function listar(req, res) {
    const idMateria = Number(req.query.materia);
    const materia = Number.isInteger(idMateria) && idMateria > 0 ? idMateria : null;

    try {
        const filas = await matchModel.tramosEnComun(req.session.usuario.id_usuario, materia);

        // juntamos los tramos de cada asesor y sumamos los minutos que coinciden
        const asesores = [];
        const porId = {};

        filas.forEach(function (fila) {
            if (!porId[fila.id_asesor]) {
                porId[fila.id_asesor] = { id_asesor: fila.id_asesor, nombre: fila.nombre, minutos_comunes: 0, bloques: [] };
                asesores.push(porId[fila.id_asesor]);
            }
            const inicio = recortar(fila.inicio);
            const fin = recortar(fila.fin);
            const asesor = porId[fila.id_asesor];
            asesor.minutos_comunes += aMinutos(fin) - aMinutos(inicio);
            asesor.bloques.push({ dia: DIA_A_PANTALLA[fila.dia], inicio: inicio, fin: fin });
        });

        // primero los que más coinciden
        asesores.sort(function (a, b) { return b.minutos_comunes - a.minutos_comunes; });

        res.json({ ok: true, asesores: asesores });
    } catch (error) {
        console.error('Error al calcular los matches:', error);
        res.status(500).json({ ok: false, error: 'servidor' });
    }
}

module.exports = {
    listar
};