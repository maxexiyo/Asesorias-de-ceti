const express = require('express');
const router = express.Router();

const materiasController = require('../Controllers/MateriasController');

// catálogo de materias con buscador
router.get('/api/materias', materiasController.listarMaterias);

module.exports = router;