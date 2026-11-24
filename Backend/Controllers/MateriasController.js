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

// ---------- Administración del catálogo (solo admin) ----------

// valida y limpia los datos que manda el formulario del admin
// devuelve { datos } si todo está bien o { error } con el mensaje
function leerDatosMateria(body) {
    const clave = typeof body.clave === 'string' ? body.clave.trim() : '';
    const nombre = typeof body.nombre === 'string' ? body.nombre.trim() : '';

    if (clave.length < 1 || clave.length > 50) {
        return { error: 'La clave es obligatoria (máximo 50 caracteres).' };
    }
    if (nombre.length < 1 || nombre.length > 150) {
        return { error: 'El nombre es obligatorio (máximo 150 caracteres).' };
    }

    // el índice de rezago es opcional: vacío = "sin dato"
    let indiceRezago = null;
    if (body.indice_rezago !== undefined && body.indice_rezago !== null && body.indice_rezago !== '') {
        indiceRezago = Number(body.indice_rezago);
        if (!Number.isFinite(indiceRezago) || indiceRezago < 0 || indiceRezago > 100) {
            return { error: 'El índice de rezago debe ser un número entre 0 y 100.' };
        }
    }

    return { datos: { clave: clave, nombre: nombre, indiceRezago: indiceRezago } };
}

// el id viene en la URL: debe ser un entero positivo
function leerId(req) {
    const id = Number(req.params.id);
    return Number.isInteger(id) && id > 0 ? id : null;
}

// POST /api/materias
async function crearMateria(req, res) {
    const lectura = leerDatosMateria(req.body);
    if (lectura.error) {
        return res.status(400).json({ ok: false, error: 'datos', mensaje: lectura.error });
    }

    try {
        const id = await materiaModel.crearMateria(lectura.datos.clave, lectura.datos.nombre, lectura.datos.indiceRezago);
        res.status(201).json({ ok: true, id_materia: id });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ ok: false, error: 'clave_repetida', mensaje: 'Ya existe una materia con esa clave.' });
        }
        console.error('Error al crear materia:', error);
        res.status(500).json({ ok: false, error: 'servidor' });
    }
}

// PUT /api/materias/:id
async function actualizarMateria(req, res) {
    const id = leerId(req);
    if (id === null) {
        return res.status(400).json({ ok: false, error: 'id' });
    }

    const lectura = leerDatosMateria(req.body);
    if (lectura.error) {
        return res.status(400).json({ ok: false, error: 'datos', mensaje: lectura.error });
    }

    try {
        const filas = await materiaModel.actualizarMateria(id, lectura.datos.clave, lectura.datos.nombre, lectura.datos.indiceRezago);
        if (filas === 0) {
            return res.status(404).json({ ok: false, error: 'no_existe', mensaje: 'La materia ya no existe.' });
        }
        res.json({ ok: true });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ ok: false, error: 'clave_repetida', mensaje: 'Ya existe otra materia con esa clave.' });
        }
        console.error('Error al actualizar materia:', error);
        res.status(500).json({ ok: false, error: 'servidor' });
    }
}

// DELETE /api/materias/:id
// Si la materia tiene citas NO se borra (se perdería el historial).
// Si solo tiene asesores vinculados, se borra y se desvinculan.
async function eliminarMateria(req, res) {
    const id = leerId(req);
    if (id === null) {
        return res.status(400).json({ ok: false, error: 'id' });
    }

    try {
        const uso = await materiaModel.contarUso(id);
        if (Number(uso.citas) > 0) {
            return res.status(409).json({
                ok: false,
                error: 'con_citas',
                mensaje: 'No se puede eliminar: la materia tiene ' + uso.citas + ' cita(s) registradas.'
            });
        }

        const filas = await materiaModel.eliminarMateria(id);
        if (filas === 0) {
            return res.status(404).json({ ok: false, error: 'no_existe', mensaje: 'La materia ya no existe.' });
        }
        res.json({ ok: true, asesoresDesvinculados: Number(uso.asesores) });
    } catch (error) {
        console.error('Error al eliminar materia:', error);
        res.status(500).json({ ok: false, error: 'servidor' });
    }
}

module.exports = {
    listarMaterias,
    crearMateria,
    actualizarMateria,
    eliminarMateria
};