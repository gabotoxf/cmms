-- Fase 4: órdenes de trabajo.
-- tecnico_id es FK a usuarios: la trazabilidad (Res. 3100) exige usuario real, no un string.

CREATE TABLE IF NOT EXISTS ordenes_trabajo (
    id               BIGSERIAL PRIMARY KEY,
    equipo_id        BIGINT       NOT NULL REFERENCES equipos (id),
    tecnico_id       BIGINT       REFERENCES usuarios (id),
    tipo             VARCHAR(12)  NOT NULL CHECK (tipo IN ('PREVENTIVO', 'CORRECTIVO')),
    estado           VARCHAR(12)  NOT NULL CHECK (estado IN ('PENDIENTE', 'ASIGNADA', 'EN_PROCESO', 'COMPLETADA', 'CANCELADA')),
    titulo           VARCHAR(150) NOT NULL,
    descripcion      VARCHAR(2000),
    resultado        VARCHAR(2000),
    fecha_programada DATE         NOT NULL,
    asignada_en      TIMESTAMP WITH TIME ZONE,
    iniciada_en      TIMESTAMP WITH TIME ZONE,
    completada_en    TIMESTAMP WITH TIME ZONE,
    cancelada_en     TIMESTAMP WITH TIME ZONE,
    version          BIGINT       NOT NULL DEFAULT 0,
    creado_en        TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    actualizado_en   TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ordenes_estado   ON ordenes_trabajo (estado);
CREATE INDEX IF NOT EXISTS idx_ordenes_tipo     ON ordenes_trabajo (tipo);
CREATE INDEX IF NOT EXISTS idx_ordenes_tecnico  ON ordenes_trabajo (tecnico_id);
CREATE INDEX IF NOT EXISTS idx_ordenes_equipo   ON ordenes_trabajo (equipo_id);
CREATE INDEX IF NOT EXISTS idx_ordenes_programada ON ordenes_trabajo (fecha_programada);
