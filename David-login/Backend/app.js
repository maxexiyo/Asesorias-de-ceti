const express = require('express');
const path = require('path');

require('dotenv').config();

const usuariosRouters = require('./Routers/usuariosRouters');

const app = express();

// para leer los datos del formulario y el JSON del login
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// carpeta donde están las páginas
app.use(express.static(path.join(__dirname, '../frontend')));

// rutas de usuarios
app.use(usuariosRouters);

app.get('/', (req, res) => {
    res.redirect('/login.html');
});

app.listen(process.env.PORT, () => {
    console.log('Servidor ejecutandose en el puerto ' + process.env.PORT);
});