USE sistema_asesorias;

SELECT u.id_usuario AS id_asesor, u.nombre, u.calificacion_promedio, da.dia,
       GREATEST(da.hora_inicio, dal.hora_inicio) AS desde,
       LEAST(da.hora_fin, dal.hora_fin) AS hasta
FROM disponibilidad dal
JOIN disponibilidad da
     ON da.dia = dal.dia
    AND da.id_asesor <> dal.id_asesor
    AND da.hora_inicio < dal.hora_fin
    AND da.hora_fin > dal.hora_inicio
JOIN asesor_materia am
     ON am.id_usuario = da.id_asesor
    AND am.id_materia = ?
JOIN usuario u
     ON u.id_usuario = da.id_asesor
    AND u.rol = 'Asesor'
WHERE dal.id_asesor = ?
ORDER BY u.calificacion_promedio DESC, da.dia, desde;

SELECT u.id_usuario AS id_asesor, u.nombre, u.calificacion_promedio, f.fecha,
       GREATEST(da.hora_inicio, dal.hora_inicio) AS desde,
       LEAST(da.hora_fin, dal.hora_fin) AS hasta
FROM (SELECT ? AS fecha) f
JOIN disponibilidad dal
     ON dal.id_asesor = ?
    AND dal.dia = ELT(WEEKDAY(f.fecha) + 1, 'Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado', 'Domingo')
JOIN disponibilidad da
     ON da.dia = dal.dia
    AND da.id_asesor <> dal.id_asesor
    AND da.hora_inicio < dal.hora_fin
    AND da.hora_fin > dal.hora_inicio
JOIN asesor_materia am
     ON am.id_usuario = da.id_asesor
    AND am.id_materia = ?
JOIN usuario u
     ON u.id_usuario = da.id_asesor
    AND u.rol = 'Asesor'
WHERE NOT EXISTS (
    SELECT 1
    FROM cita c
    WHERE DATE(c.fecha_hora) = f.fecha
      AND c.estado = 'Confirmada'
      AND (c.id_asesor = da.id_asesor OR c.id_alumno = dal.id_asesor)
      AND TIME(c.fecha_hora) < LEAST(da.hora_fin, dal.hora_fin)
      AND ADDTIME(TIME(c.fecha_hora), '01:00:00') > GREATEST(da.hora_inicio, dal.hora_inicio)
)
ORDER BY u.calificacion_promedio DESC, desde;

SELECT id_cita, id_alumno, fecha_hora, ADDTIME(fecha_hora, '01:00:00') AS fecha_hora_fin
FROM cita
WHERE id_asesor = ?
  AND DATE(fecha_hora) = ?
  AND estado = 'Confirmada'
ORDER BY fecha_hora;

SELECT COUNT(*) AS ocupado
FROM cita
WHERE id_asesor = ?
  AND estado = 'Confirmada'
  AND fecha_hora < ADDTIME(?, '01:00:00')
  AND ADDTIME(fecha_hora, '01:00:00') > ?;
