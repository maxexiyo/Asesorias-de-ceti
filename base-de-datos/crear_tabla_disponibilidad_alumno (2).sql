USE sistema_asesorias;

DROP TABLE IF EXISTS disponibilidad_alumno;

CREATE TABLE IF NOT EXISTS disponibilidad_alumno (
    id_disponibilidad INT AUTO_INCREMENT PRIMARY KEY,
    id_alumno INT(10) UNSIGNED NOT NULL,
    dia ENUM('Lunes','Martes','Miercoles','Jueves','Viernes') NOT NULL,
    hora_inicio TIME NOT NULL,
    hora_fin TIME NOT NULL,
    FOREIGN KEY (id_alumno) REFERENCES usuario(id_usuario) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
