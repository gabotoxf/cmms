package com.gabotoxf.cmms.common;

/**
 * Puerto de notificación: los módulos publican eventos de dominio y los listeners
 * usan esta interfaz para avisar a usuarios, sin conocer el canal (correo hoy,
 * WhatsApp/SMS mañana).
 */
public interface Notificador {

    void enviar(String destinatario, String asunto, String cuerpo);
}
