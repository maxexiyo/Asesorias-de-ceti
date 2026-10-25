const express = require('express');
const router = express.Router();

const disponibilidadAlumnoController = require('../Controllers/DisponibilidadAlumnoController');
const { protegerApi } = require('../Middlewares/auth');

// solo los alumnos registran sus horas libres
router.get('/api/mi-horario', protegerApi('alumno'), disponibilidadAlumnoController.listar);
router.post('/api/mi-horario', protegerApi('alumno'), disponibilidadAlumnoController.crear);
router.delete('/api/mi-horario/:id', protegerApi('alumno'), disponibilidadAlumnoController.borrar);
router.delete('/api/mi-horario', protegerApi('alumno'), disponibilidadAlumnoController.borrarTodo);

module.exports = router;