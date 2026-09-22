-- V4: avatar del usuario (máx. 2 MB, validado en la app).
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS avatar      BYTEA;
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS avatar_tipo VARCHAR(50);
