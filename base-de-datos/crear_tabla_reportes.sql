USE sistema_asesorias;

CREATE TABLE IF NOT EXISTS reportes (
    id_reporte INT AUTO_INCREMENT PRIMARY KEY,
    id_evaluacion INT NOT NULL,
    fecha_reporte DATETIME DEFAULT CURRENT_TIMESTAMP,
    motivo TEXT,
    estado ENUM('Pendiente', 'Revisado') DEFAULT 'Pendiente',
    FOREIGN KEY (id_evaluacion) REFERENCES evaluacion(id_evaluacion) ON DELETE CASCADE
);
