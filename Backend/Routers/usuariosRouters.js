const express = require('express');
const router = express.Router();

const usuariosController = require('../Controllers/UsuariosController');
const { ROLES, protegerApi } = require('../Middlewares/auth');

// el formulario de registro llega aquí
router.post('/registro', usuariosController.registrarUsuario);

// el login lo llama login.js con fetch
router.post('/api/login', usuariosController.iniciarSesion);

// quién tiene la sesión abierta (lo usan las pantallas protegidas)
router.get('/api/me', protegerApi(...ROLES), usuariosController.obtenerSesion);

// cierra la sesión en el servidor
router.post('/api/logout', usuariosController.cerrarSesion);

module.exports = router;
