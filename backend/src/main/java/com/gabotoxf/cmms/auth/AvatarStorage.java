package com.gabotoxf.cmms.auth;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.nio.file.*;
import java.util.Map;

/**
 * Guarda avatares en disco en vez de BYTEA: evita inflar la BD y permite
 * servirlos como archivos. Un archivo por usuario: {id}.{ext}
 */
@Component
public class AvatarStorage {

    private final Path dir;
    private static final Map<String, String> EXT_POR_TIPO = Map.of(
            "image/jpeg", "jpg",
            "image/png", "png",
            "image/webp", "webp",
            "image/gif", "gif",
            "image/heic", "heic",
            "image/heif", "heic",
            "image/avif", "avif",
            "image/bmp", "bmp",
            "image/tiff", "tiff",
            "image/svg+xml", "svg"
    );

    public AvatarStorage(@Value("${app.avatar.dir:./uploads/avatars}") String dir) throws IOException {
        this.dir = Paths.get(dir).toAbsolutePath().normalize();
        Files.createDirectories(this.dir);
    }

    public Path getDir() { return dir; }

    public String extensionPara(String tipo) {
        return EXT_POR_TIPO.getOrDefault(tipo.toLowerCase(), "jpg");
    }

    public void guardar(Long userId, String tipo, byte[] bytes) throws IOException {
        String ext = extensionPara(tipo);
        // borra variantes previas del mismo usuario
        borrar(userId);
        Path destino = dir.resolve(userId + "." + ext);
        Files.write(destino, bytes, StandardOpenOption.CREATE, StandardOpenOption.TRUNCATE_EXISTING);
    }

    public byte[] cargar(Long userId) throws IOException {
        Path p = encontrar(userId);
        return p == null ? null : Files.readAllBytes(p);
    }

    public String tipoDe(Long userId) throws IOException {
        Path p = encontrar(userId);
        if (p == null) return null;
        String ext = p.getFileName().toString();
        ext = ext.contains(".") ? ext.substring(ext.lastIndexOf('.') + 1).toLowerCase() : "";
        return switch (ext) {
            case "jpg", "jpeg" -> "image/jpeg";
            case "png" -> "image/png";
            case "webp" -> "image/webp";
            case "gif" -> "image/gif";
            case "heic", "heif" -> "image/heic";
            case "avif" -> "image/avif";
            case "bmp" -> "image/bmp";
            case "tiff", "tif" -> "image/tiff";
            case "svg" -> "image/svg+xml";
            default -> "application/octet-stream";
        };
    }

    public void borrar(Long userId) throws IOException {
        try (DirectoryStream<Path> ds = Files.newDirectoryStream(dir, userId + ".*")) {
            for (Path p : ds) Files.deleteIfExists(p);
        }
    }

    private Path encontrar(Long userId) throws IOException {
        try (DirectoryStream<Path> ds = Files.newDirectoryStream(dir, userId + ".*")) {
            for (Path p : ds) return p;
        }
        return null;
    }
}
