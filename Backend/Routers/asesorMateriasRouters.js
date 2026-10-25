const express = require('express');
const router = express.Router();

const asesorMateriasController = require('../Controllers/AsesorMateriasController');
const { protegerApi } = require('../Middlewares/auth');

// solo los asesores eligen las materias que imparten
router.get('/api/mis-materias', protegerApi('asesor'), asesorMateriasController.listar);
router.put('/api/mis-materias/:id', protegerApi('asesor'), asesorMateriasController.agregar);
router.delete('/api/mis-materias/:id', protegerApi('asesor'), asesorMateriasController.quitar);

module.exports = router;