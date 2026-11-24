-- =============================================================
--  Promedio de calificaciones de cada asesor (calculado en la BD)
--  Correr DESPUÉS de sistema_asesorias.sql y crear_tabla_reportes.sql
--
--  Qué cuenta:  evaluaciones "Alumno_a_Asesor" de cada asesor
--  Qué NO cuenta: las evaluaciones cuyo comentario está oculto,
--                 o sea las que tienen un reporte en estado
--                 'Pendiente' (oculto al público) o 'Eliminado'.
--                 Con 'Conservado' o 'Revisado' sí cuentan.
--  Nota de cálculo: nota de cada evaluación = promedio_evaluacion;
--                 si viene vacío, (criterio_1 + criterio_2) / 2.
--
--  Resultado: usuario.calificacion_promedio se mantiene al día solo
--  (triggers) y la vista vista_promedio_asesor da el cálculo completo.
-- =============================================================

USE sistema_asesorias;

-- 0) El panel de reportes del admin guarda 'Conservado' y 'Eliminado',
--    pero la tabla solo aceptaba 'Pendiente' y 'Revisado'.
--    Se amplía la lista (se conserva 'Revisado' por si ya hay datos).
ALTER TABLE reportes
    MODIFY estado ENUM('Pendiente','Revisado','Conservado','Eliminado') DEFAULT 'Pendiente';

-- 1) Vista: promedio y número de evaluaciones válidas por asesor
CREATE OR REPLACE VIEW vista_promedio_asesor AS
SELECT e.id_evaluado AS id_asesor,
       ROUND(AVG(COALESCE(e.promedio_evaluacion, (e.criterio_1 + e.criterio_2) / 2)), 2) AS promedio,
       COUNT(*) AS total_evaluaciones
FROM evaluacion e
WHERE e.tipo_evaluacion = 'Alumno_a_Asesor'
  AND NOT EXISTS (
        SELECT 1
        FROM reportes r
        WHERE r.id_evaluacion = e.id_evaluacion
          AND COALESCE(r.estado, 'Pendiente') IN ('Pendiente', 'Eliminado')
  )
GROUP BY e.id_evaluado;

DELIMITER $$

-- 2) Recalcula y guarda el promedio de UN asesor (NULL si no tiene evaluaciones válidas)
DROP PROCEDURE IF EXISTS sp_recalcular_promedio_asesor$$
CREATE PROCEDURE sp_recalcular_promedio_asesor(IN p_id_asesor INT UNSIGNED)
BEGIN
    UPDATE usuario u
       SET u.calificacion_promedio = (
               SELECT v.promedio
               FROM vista_promedio_asesor v
               WHERE v.id_asesor = u.id_usuario
           )
     WHERE u.id_usuario = p_id_asesor;
END$$

-- 3) Igual, pero partiendo del id de una evaluación (lo usan los triggers de reportes)
DROP PROCEDURE IF EXISTS sp_recalcular_promedio_por_evaluacion$$
CREATE PROCEDURE sp_recalcular_promedio_por_evaluacion(IN p_id_evaluacion INT UNSIGNED)
BEGIN
    DECLARE v_asesor INT UNSIGNED DEFAULT NULL;

    SELECT id_evaluado INTO v_asesor
    FROM evaluacion
    WHERE id_evaluacion = p_id_evaluacion
      AND tipo_evaluacion = 'Alumno_a_Asesor';

    IF v_asesor IS NOT NULL THEN
        CALL sp_recalcular_promedio_asesor(v_asesor);
    END IF;
END$$

-- 4) Triggers sobre evaluacion: al crear, cambiar o borrar una calificación
DROP TRIGGER IF EXISTS trg_evaluacion_ai$$
CREATE TRIGGER trg_evaluacion_ai AFTER INSERT ON evaluacion
FOR EACH ROW
BEGIN
    CALL sp_recalcular_promedio_asesor(NEW.id_evaluado);
END$$

DROP TRIGGER IF EXISTS trg_evaluacion_au$$
CREATE TRIGGER trg_evaluacion_au AFTER UPDATE ON evaluacion
FOR EACH ROW
BEGIN
    CALL sp_recalcular_promedio_asesor(NEW.id_evaluado);
    IF OLD.id_evaluado <> NEW.id_evaluado THEN
        CALL sp_recalcular_promedio_asesor(OLD.id_evaluado);
    END IF;
END$$

DROP TRIGGER IF EXISTS trg_evaluacion_ad$$
CREATE TRIGGER trg_evaluacion_ad AFTER DELETE ON evaluacion
FOR EACH ROW
BEGIN
    CALL sp_recalcular_promedio_asesor(OLD.id_evaluado);
END$$

-- 5) Triggers sobre reportes: ocultar o mostrar un comentario cambia el promedio
DROP TRIGGER IF EXISTS trg_reportes_ai$$
CREATE TRIGGER trg_reportes_ai AFTER INSERT ON reportes
FOR EACH ROW
BEGIN
    CALL sp_recalcular_promedio_por_evaluacion(NEW.id_evaluacion);
END$$

DROP TRIGGER IF EXISTS trg_reportes_au$$
CREATE TRIGGER trg_reportes_au AFTER UPDATE ON reportes
FOR EACH ROW
BEGIN
    CALL sp_recalcular_promedio_por_evaluacion(NEW.id_evaluacion);
    IF OLD.id_evaluacion <> NEW.id_evaluacion THEN
        CALL sp_recalcular_promedio_por_evaluacion(OLD.id_evaluacion);
    END IF;
END$$

DROP TRIGGER IF EXISTS trg_reportes_ad$$
CREATE TRIGGER trg_reportes_ad AFTER DELETE ON reportes
FOR EACH ROW
BEGIN
    CALL sp_recalcular_promedio_por_evaluacion(OLD.id_evaluacion);
END$$

DELIMITER ;

-- 6) Cálculo inicial para los asesores que ya existen
UPDATE usuario u
   SET u.calificacion_promedio = (
           SELECT v.promedio
           FROM vista_promedio_asesor v
           WHERE v.id_asesor = u.id_usuario
       )
 WHERE u.rol = 'Asesor';

-- Para revisar el resultado:
-- SELECT u.id_usuario, u.nombre, u.calificacion_promedio, v.total_evaluaciones
-- FROM usuario u
-- LEFT JOIN vista_promedio_asesor v ON v.id_asesor = u.id_usuario
-- WHERE u.rol = 'Asesor'
-- ORDER BY u.calificacion_promedio DESC, u.nombre;
