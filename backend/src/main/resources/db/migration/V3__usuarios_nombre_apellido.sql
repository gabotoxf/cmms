-- V3: el usuario se divide en nombre/apellido y suma celular.
-- Los registros existentes se parten por el primer espacio ("Admin Demo" -> Admin/Demo).
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS apellido VARCHAR(255) NOT NULL DEFAULT '';
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS celular  VARCHAR(20);

UPDATE usuarios
SET apellido = CASE
                   WHEN position(' ' in nombre) > 0 THEN substring(nombre from position(' ' in nombre) + 1)
                   ELSE ''
               END,
    nombre   = split_part(nombre, ' ', 1)
WHERE apellido = '';
