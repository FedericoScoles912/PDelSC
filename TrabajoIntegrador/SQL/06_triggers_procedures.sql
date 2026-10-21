-- ============================================================================
--  06_triggers_procedures.sql
--  Procedimiento transaccional de movimientos de stock y trigger de alertas.
-- ============================================================================

USE retenes_stock;

DROP PROCEDURE IF EXISTS sp_registrar_movimiento;
DROP TRIGGER IF EXISTS tr_alertas_stock;

DELIMITER $$

-- ---------------------------------------------------------------------------
-- sp_registrar_movimiento
-- Registra un movimiento (INGRESO / EGRESO / AJUSTE) y actualiza el stock
-- de forma atómica. El tipo AJUSTE fija el stock al valor "cantidad".
-- Devuelve el stock resultante.
-- ---------------------------------------------------------------------------
CREATE PROCEDURE sp_registrar_movimiento (
  IN p_producto_id INT,
  IN p_tipo        VARCHAR(10),
  IN p_cantidad    INT,
  IN p_motivo      VARCHAR(255),
  IN p_referencia  VARCHAR(64),
  IN p_usuario_id  INT,
  OUT p_stock_nuevo INT
)
BEGIN
  DECLARE v_anterior INT DEFAULT 0;
  DECLARE v_nuevo    INT DEFAULT 0;

  START TRANSACTION;

  -- Bloquea la fila de stock para escritura concurrente segura
  SELECT cantidad INTO v_anterior
  FROM stock WHERE producto_id = p_producto_id FOR UPDATE;

  IF v_anterior IS NULL THEN
    SET v_anterior = 0;
    INSERT INTO stock (producto_id, cantidad) VALUES (p_producto_id, 0);
  END IF;

  CASE p_tipo
    WHEN 'INGRESO' THEN SET v_nuevo = v_anterior + p_cantidad;
    WHEN 'EGRESO'  THEN SET v_nuevo = v_anterior - p_cantidad;
    WHEN 'AJUSTE'  THEN SET v_nuevo = p_cantidad;
    ELSE SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Tipo de movimiento inválido';
  END CASE;

  IF v_nuevo < 0 THEN
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'El stock no puede quedar negativo';
  END IF;

  UPDATE stock SET cantidad = v_nuevo WHERE producto_id = p_producto_id;

  INSERT INTO movimientos_stock
    (producto_id, tipo, cantidad, stock_anterior, stock_nuevo, motivo, referencia, usuario_id)
  VALUES
    (p_producto_id, p_tipo, p_cantidad, v_anterior, v_nuevo, p_motivo, p_referencia, p_usuario_id);

  SET p_stock_nuevo = v_nuevo;
  COMMIT;
END $$

-- ---------------------------------------------------------------------------
-- tr_alertas_stock
-- Al actualizar el stock, si cae por debajo (o igual) al mínimo se registra
-- una alerta (solo si no hay una pendiente sin resolver).
-- ---------------------------------------------------------------------------
CREATE TRIGGER tr_alertas_stock
AFTER UPDATE ON stock
FOR EACH ROW
BEGIN
  DECLARE v_minimo INT DEFAULT 0;

  SELECT stock_minimo INTO v_minimo FROM productos WHERE id = NEW.producto_id;

  IF NEW.cantidad <= v_minimo AND NEW.cantidad <> OLD.cantidad THEN
    IF NOT EXISTS (
      SELECT 1 FROM alertas_stock a
      WHERE a.producto_id = NEW.producto_id AND a.resuelta = 0
    ) THEN
      INSERT INTO alertas_stock (producto_id, stock_valor, minimo)
      VALUES (NEW.producto_id, NEW.cantidad, v_minimo);
    END IF;
  END IF;
END $$

DELIMITER ;
