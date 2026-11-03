const db = require('../Configuracion/database');

// busca un usuario por su correo
async function buscarPorCorreo(correo) {
    const sql = `
        SELECT id_usuario, nombre, codigo, correo, password_hash, rol
        FROM usuario
        WHERE correo = ?
        LIMIT 1`;

    const [filas] = await db.execute(sql, [correo]);
    return filas[0];
}

// guarda un usuario nuevo y regresa su id
async function registrarUsuario(nombre, codigo, correo, passwordHash, rol) {
    const sql = `
        INSERT INTO usuario (nombre, codigo, correo, password_hash, rol)
        VALUES (?,?,?,?,?)`;

    const [resultado] = await db.execute(sql, [nombre, codigo, correo, passwordHash, rol]);
    return resultado.insertId;
}

module.exports = {
    buscarPorCorreo,
    registrarUsuario
};