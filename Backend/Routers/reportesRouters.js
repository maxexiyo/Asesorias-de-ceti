const express = require('express');
const router = express.Router();
const ReportesController = require('../Controllers/ReportesController');
const { protegerPagina } = require('../Middlewares/auth');

router.get('/api/admin/reportes', protegerPagina('admin'), ReportesController.listarReportes);
router.post('/api/admin/reportes/:id/conservar', protegerPagina('admin'), ReportesController.conservarComentario);
router.delete('/api/admin/reportes/:id', protegerPagina('admin'), ReportesController.eliminarComentario);

module.exports = router;
