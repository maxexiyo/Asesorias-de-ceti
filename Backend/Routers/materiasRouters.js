const express = require('express');
const router = express.Router();

const materiasController = require('../Controllers/MateriasController');
const { ROLES, protegerApi } = require('../Middlewares/auth');

// catálogo de materias con buscador (cualquier usuario con sesión)
router.get('/api/materias', protegerApi(...ROLES), materiasController.listarMaterias);

module.exports = router;
