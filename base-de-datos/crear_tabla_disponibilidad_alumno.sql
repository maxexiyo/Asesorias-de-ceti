USE sistema_asesorias;

CREATE TABLE IF NOT EXISTS disponibilidad_alumno (
    id_disponibilidad INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT(10) UNSIGNED NOT NULL,
    dia ENUM('Lunes','Martes','Miercoles','Jueves','Viernes') NOT NULL,
    hora_inicio TIME NOT NULL,
    hora_fin TIME NOT NULL,
    FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
