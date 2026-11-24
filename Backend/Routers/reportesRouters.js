const express = require('express');
const router = express.Router();
const ReportesController = require('../Controllers/ReportesController');
const { protegerApi } = require('../Middlewares/auth');

router.get('/api/admin/reportes', protegerApi('admin'), ReportesController.listarReportes);
router.post('/api/admin/reportes/:id/conservar', protegerApi('admin'), ReportesController.conservarComentario);
router.delete('/api/admin/reportes/:id', protegerApi('admin'), ReportesController.eliminarComentario);

module.exports = router;
