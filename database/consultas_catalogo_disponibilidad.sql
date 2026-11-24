USE sistema_asesorias;

SELECT m.id_materia, m.clave, m.nombre, m.indice_rezago,
       COUNT(am.id_usuario) AS asesores
FROM materia m
LEFT JOIN asesor_materia am ON am.id_materia = m.id_materia
GROUP BY m.id_materia, m.clave, m.nombre, m.indice_rezago
ORDER BY m.nombre;

SELECT m.id_materia, m.clave, m.nombre, m.indice_rezago,
       COUNT(am.id_usuario) AS asesores
FROM materia m
LEFT JOIN asesor_materia am ON am.id_materia = m.id_materia
WHERE m.nombre LIKE CONCAT('%', ?, '%')
   OR m.clave  LIKE CONCAT('%', ?, '%')
GROUP BY m.id_materia, m.clave, m.nombre, m.indice_rezago
ORDER BY m.nombre;

SELECT m.id_materia, m.clave, m.nombre, m.indice_rezago,
       COUNT(am.id_usuario) AS asesores
FROM materia m
LEFT JOIN asesor_materia am ON am.id_materia = m.id_materia
GROUP BY m.id_materia, m.clave, m.nombre, m.indice_rezago
ORDER BY m.indice_rezago DESC, m.nombre;

SELECT m.id_materia, m.clave, m.nombre, m.indice_rezago,
       COUNT(am.id_usuario) AS asesores
FROM materia m
JOIN asesor_materia am ON am.id_materia = m.id_materia
GROUP BY m.id_materia, m.clave, m.nombre, m.indice_rezago
ORDER BY m.nombre;

SELECT id_materia, clave, nombre, indice_rezago
FROM materia
WHERE id_materia = ?;

SELECT u.id_usuario, u.nombre, u.calificacion_promedio
FROM asesor_materia am
JOIN usuario u ON u.id_usuario = am.id_usuario
WHERE am.id_materia = ?
  AND u.rol = 'Asesor'
ORDER BY u.calificacion_promedio DESC, u.nombre;

SELECT m.id_materia, m.clave, m.nombre
FROM asesor_materia am
JOIN materia m ON m.id_materia = am.id_materia
WHERE am.id_usuario = ?
ORDER BY m.nombre;

INSERT IGNORE INTO asesor_materia (id_usuario, id_materia)
VALUES (?, ?);

DELETE FROM asesor_materia
WHERE id_usuario = ?
  AND id_materia = ?;

SELECT id_disponibilidad, dia, hora_inicio, hora_fin
FROM disponibilidad
WHERE id_asesor = ?
ORDER BY dia, hora_inicio;

INSERT INTO disponibilidad (id_asesor, dia, hora_inicio, hora_fin)
SELECT ?, ?, ?, ?
FROM DUAL
WHERE ? < ?
  AND NOT EXISTS (
      SELECT 1
      FROM disponibilidad
      WHERE id_asesor   = ?
        AND dia         = ?
        AND hora_inicio < ?
        AND hora_fin    > ?
  );

DELETE FROM disponibilidad
WHERE id_disponibilidad = ?
  AND id_asesor = ?;

SELECT u.id_usuario AS id_asesor, u.nombre, d.dia, d.hora_inicio, d.hora_fin
FROM asesor_materia am
JOIN usuario u ON u.id_usuario = am.id_usuario AND u.rol = 'Asesor'
JOIN disponibilidad d ON d.id_asesor = u.id_usuario
WHERE am.id_materia = ?
ORDER BY u.nombre, d.dia, d.hora_inicio;
