const express = require('express');
const router = express.Router();

const materiasController = require('../Controllers/MateriasController');
const { ROLES, protegerApi } = require('../Middlewares/auth');

// catálogo de materias con buscador (cualquier usuario con sesión)
router.get('/api/materias', protegerApi(...ROLES), materiasController.listarMaterias);

// administrar el catálogo (solo administrador)
router.post('/api/materias', protegerApi('admin'), materiasController.crearMateria);
router.put('/api/materias/:id', protegerApi('admin'), materiasController.actualizarMateria);
router.delete('/api/materias/:id', protegerApi('admin'), materiasController.eliminarMateria);

module.exports = router;
