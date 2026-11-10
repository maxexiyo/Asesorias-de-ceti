const pool = require('../Configuracion/database');

const ReportesController = {
    listarReportes: async (req, res) => {
        try {
            const [reportes] = await pool.query(`
                SELECT 
                    e.id_evaluacion,
                    e.comentario,
                    e.tipo_evaluacion,
                    u_evaluador.nombre AS evaluador_nombre,
                    u_evaluado.nombre AS evaluado_nombre,
                    m.nombre AS materia,
                    c.fecha_hora AS fecha_cita,
                    e.criterio_1,
                    e.criterio_2,
                    e.promedio_evaluacion,
                    (SELECT COUNT(*) FROM reportes WHERE id_evaluacion = e.id_evaluacion) AS total_reportes,
                    r.fecha_reporte,
                    r.estado
                FROM reportes r
                JOIN evaluacion e ON r.id_evaluacion = e.id_evaluacion
                JOIN cita c ON e.id_cita = c.id_cita
                JOIN usuario u_evaluador ON e.id_evaluador = u_evaluador.id_usuario
                JOIN usuario u_evaluado ON e.id_evaluado = u_evaluado.id_usuario
                JOIN materia m ON c.id_materia = m.id_materia
                GROUP BY e.id_evaluacion
            `);
            res.json({ ok: true, reportes });
        } catch (error) {
            res.status(500).json({ ok: false, error: 'Error del servidor' });
        }
    },
    conservarComentario: async (req, res) => {
        const { id } = req.params;
        try {
            await pool.query('UPDATE reportes SET estado = "Conservado" WHERE id_evaluacion = ?', [id]);
            res.json({ ok: true });
        } catch (error) {
            res.status(500).json({ ok: false, error: 'Error del servidor' });
        }
    },
    eliminarComentario: async (req, res) => {
        const { id } = req.params;
        try {
            await pool.query('UPDATE reportes SET estado = "Eliminado" WHERE id_evaluacion = ?', [id]);
            res.json({ ok: true });
        } catch (error) {
            res.status(500).json({ ok: false, error: 'Error del servidor' });
        }
    }
};

module.exports = ReportesController;
