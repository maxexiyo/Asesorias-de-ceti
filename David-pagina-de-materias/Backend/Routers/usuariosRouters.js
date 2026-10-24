const express = require('express');
const router = express.Router();

const usuariosController = require('../Controllers/UsuariosController');

// el formulario de registro llega aquí
router.post('/registro', usuariosController.registrarUsuario);

// el login lo llama login.js con fetch
router.post('/api/login', usuariosController.iniciarSesion);

module.exports = router;