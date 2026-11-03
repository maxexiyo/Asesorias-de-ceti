const materiaModel = require('../Models/MateriaModel');

// GET /api/materias?q=texto&orden=nombre|rezago&conAsesores=1
async function listarMaterias(req, res) {
    const texto = typeof req.query.q === 'string' ? req.query.q.trim().slice(0, 50) : '';
    const orden = typeof req.query.orden === 'string' ? req.query.orden : 'nombre';
    const soloConAsesores = req.query.conAsesores === '1';

    try {
        const materias = await materiaModel.buscarMaterias(texto, orden, soloConAsesores);
        res.json({ ok: true, materias: materias });
    } catch (error) {
        console.error('Error al listar materias:', error);
        res.status(500).json({ ok: false, error: 'servidor' });
    }
}

module.exports = {
    listarMaterias
};