-- Esquema inicial del CMMS.
-- ddl-auto quedó en validate: Hibernate solo verifica que este esquema coincida con las entidades.
-- Enumeraciones como VARCHAR (EnumType.STRING) para que agregar valores no exija migración.
--
-- NOTA: este script es idempotente a propósito. Sobre una base de datos NUEVA crea todo;
-- sobre la base de desarrollo previa (creada con ddl-auto:update) solo agrega lo que falta:
-- columnas de versionamiento, auditoría y los índices. Así Flyway se puede introducir
-- sin perder los datos de prueba existentes.

CREATE TABLE IF NOT EXISTS equipos (
    id                    BIGSERIAL PRIMARY KEY,
    serial                VARCHAR(60)  NOT NULL UNIQUE,
    nombre                VARCHAR(255) NOT NULL,
    marca                 VARCHAR(255),
    modelo                VARCHAR(255),
    ubicacion             VARCHAR(255) NOT NULL,
    clasificacion_riesgo  VARCHAR(10)  NOT NULL CHECK (clasificacion_riesgo IN ('I', 'IIA', 'IIB', 'III')),
    fecha_adquisicion     DATE,
    periodicidad_mantenimiento_dias INTEGER NOT NULL,
    estado                VARCHAR(20)  NOT NULL CHECK (estado IN ('OPERATIVO', 'EN_MANTENIMIENTO', 'FUERA_DE_SERVICIO', 'DADO_DE_BAJA')),
    version               BIGINT       NOT NULL DEFAULT 0,
    creado_en             TIMESTAMP WITH TIME ZONE NOT NULL,
    actualizado_en        TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS planes_mantenimiento (
    id              BIGSERIAL PRIMARY KEY,
    equipo_id       BIGINT NOT NULL UNIQUE REFERENCES equipos (id),
    frecuencia_dias INTEGER NOT NULL,
    ultima_ejecucion DATE,
    proxima_fecha   DATE   NOT NULL,
    version         BIGINT NOT NULL DEFAULT 0,
    creado_en       TIMESTAMP WITH TIME ZONE NOT NULL,
    actualizado_en  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS registros_mantenimiento (
    id             BIGSERIAL PRIMARY KEY,
    plan_id        BIGINT NOT NULL REFERENCES planes_mantenimiento (id),
    fecha_ejecucion DATE   NOT NULL,
    descripcion    VARCHAR(1000),
    tecnico        VARCHAR(120) NOT NULL,
    creado_en      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS usuarios (
    id            BIGSERIAL PRIMARY KEY,
    email         VARCHAR(120) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    rol           VARCHAR(20)  NOT NULL CHECK (rol IN ('ADMIN', 'INGENIERO', 'TECNICO', 'AUDITOR')),
    nombre        VARCHAR(255) NOT NULL,
    activo        BOOLEAN      NOT NULL DEFAULT TRUE
);

-- ===== Columnas nuevas sobre la base de desarrollo previa (no-ops en BD nueva) =====

ALTER TABLE equipos ADD COLUMN IF NOT EXISTS version       BIGINT NOT NULL DEFAULT 0;
ALTER TABLE equipos ADD COLUMN IF NOT EXISTS actualizado_en TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now();
ALTER TABLE planes_mantenimiento ADD COLUMN IF NOT EXISTS version BIGINT NOT NULL DEFAULT 0;

-- La entidad ahora usa Instant: unificamos los timestamps a timestamptz (UTC en JDBC).
-- Solo se ejecuta si la columna sigue siendo timestamp sin zona (BD previa con LocalDateTime);
-- en una BD nueva la columna ya nace timestamptz y el bloque no hace nada.
DO $$
DECLARE
    t record;
BEGIN
    FOR t IN
        SELECT table_name, column_name
        FROM information_schema.columns
        WHERE table_name IN ('equipos', 'planes_mantenimiento', 'registros_mantenimiento')
          AND column_name IN ('creado_en', 'actualizado_en')
          AND data_type = 'timestamp without time zone'
    LOOP
        EXECUTE format(
            'ALTER TABLE %I ALTER COLUMN %I TYPE TIMESTAMP WITH TIME ZONE USING %I AT TIME ZONE ''America/Bogota''',
            t.table_name, t.column_name, t.column_name);
    END LOOP;
END $$;

-- ===== Índices =====

CREATE INDEX IF NOT EXISTS idx_equipos_estado        ON equipos (estado);
CREATE INDEX IF NOT EXISTS idx_equipos_riesgo        ON equipos (clasificacion_riesgo);
CREATE INDEX IF NOT EXISTS idx_equipos_ubicacion     ON equipos (ubicacion);
CREATE INDEX IF NOT EXISTS idx_planes_proxima_fecha  ON planes_mantenimiento (proxima_fecha);
CREATE INDEX IF NOT EXISTS idx_planes_frecuencia     ON planes_mantenimiento (frecuencia_dias);
CREATE INDEX IF NOT EXISTS idx_registros_plan        ON registros_mantenimiento (plan_id);
CREATE INDEX IF NOT EXISTS idx_registros_fecha       ON registros_mantenimiento (fecha_ejecucion);
