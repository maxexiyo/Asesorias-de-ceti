const express = require('express');
const router = express.Router();

const matchController = require('../Controllers/MatchController');
const { protegerApi } = require('../Middlewares/auth');

// asesores que coinciden con las horas libres del alumno
router.get('/api/matches', protegerApi('alumno'), matchController.listar);

module.exports = router;