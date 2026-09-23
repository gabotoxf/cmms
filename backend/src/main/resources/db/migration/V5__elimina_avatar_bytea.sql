-- V5: el avatar ya vive en disco (AvatarStorage, /app/uploads/avatars/{id}.{ext}).
-- La columna BYTEA solo inflaba la BD y serializaba a base64 si se exponía por JSON.
-- Se elimina; el tipo MIME se mantiene en avatar_tipo y el archivo se deduce por id.
ALTER TABLE usuarios DROP COLUMN IF EXISTS avatar;
