const asesorMateriaModel = require('../Models/AsesorMateriaModel');

function idAsesor(req) {
    return req.session.usuario.id_usuario;
}

// el id llega por la URL; debe ser un entero positivo
function leerIdMateria(req) {
    const id = Number(req.params.id);
    return Number.isInteger(id) && id > 0 ? id : null;
}

function errorServidor(res, accion, error) {
    console.error('Error al ' + accion + ':', error);
    res.status(500).json({ ok: false, error: 'servidor' });
}

// GET /api/mis-materias?q=texto&soloMias=1
async function listar(req, res) {
    const texto = typeof req.query.q === 'string' ? req.query.q.trim().slice(0, 50) : '';
    const soloMias = req.query.soloMias === '1';

    try {
        const filas = await asesorMateriaModel.listarConMarca(idAsesor(req), texto, soloMias);
        const materias = filas.map(function (f) {
            return {
                id_materia: f.id_materia,
                clave: f.clave,
                nombre: f.nombre,
                seleccionada: Number(f.seleccionada) === 1
            };
        });
        const total = await asesorMateriaModel.contar(idAsesor(req));
        res.json({ ok: true, materias: materias, total: total });
    } catch (error) {
        errorServidor(res, 'listar las materias del asesor', error);
    }
}

// PUT /api/mis-materias/:id   (el asesor agrega una materia)
async function agregar(req, res) {
    const idMateria = leerIdMateria(req);
    if (idMateria === null) {
        return res.status(400).json({ ok: false, error: 'datos' });
    }

    try {
        if (!(await asesorMateriaModel.existeMateria(idMateria))) {
            return res.status(404).json({ ok: false, error: 'no_encontrado' });
        }
        await asesorMateriaModel.agregar(idAsesor(req), idMateria);
        const total = await asesorMateriaModel.contar(idAsesor(req));
        res.json({ ok: true, total: total });
    } catch (error) {
        errorServidor(res, 'agregar una materia al asesor', error);
    }
}

// DELETE /api/mis-materias/:id   (el asesor quita una materia)
async function quitar(req, res) {
    const idMateria = leerIdMateria(req);
    if (idMateria === null) {
        return res.status(400).json({ ok: false, error: 'datos' });
    }

    try {
        await asesorMateriaModel.quitar(idAsesor(req), idMateria);
        const total = await asesorMateriaModel.contar(idAsesor(req));
        res.json({ ok: true, total: total });
    } catch (error) {
        errorServidor(res, 'quitar una materia del asesor', error);
    }
}

module.exports = {
    listar,
    agregar,
    quitar
};