const express = require('express');
const router = express.Router();

const disponibilidadController = require('../Controllers/DisponibilidadController');
const { protegerApi } = require('../Middlewares/auth');

// solo los asesores publican su disponibilidad semanal
router.get('/api/disponibilidad', protegerApi('asesor'), disponibilidadController.listar);
router.post('/api/disponibilidad', protegerApi('asesor'), disponibilidadController.crear);
router.put('/api/disponibilidad/:id', protegerApi('asesor'), disponibilidadController.editar);
router.delete('/api/disponibilidad/:id', protegerApi('asesor'), disponibilidadController.borrar);
router.delete('/api/disponibilidad', protegerApi('asesor'), disponibilidadController.borrarTodo);

module.exports = router;
