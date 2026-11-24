USE sistema_asesorias;

CREATE TABLE IF NOT EXISTS reportes (
    id_reporte INT AUTO_INCREMENT PRIMARY KEY,
    id_evaluacion INT(10) UNSIGNED NOT NULL,
    fecha_reporte DATETIME DEFAULT CURRENT_TIMESTAMP,
    motivo TEXT,
    estado ENUM('Pendiente', 'Revisado') DEFAULT 'Pendiente',
    FOREIGN KEY (id_evaluacion) REFERENCES evaluacion(id_evaluacion) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
