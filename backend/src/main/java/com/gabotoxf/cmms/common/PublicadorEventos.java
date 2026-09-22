package com.gabotoxf.cmms.common;

import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Component;

/**
 * Facade sobre ApplicationEventPublisher. Los services publican eventos
 * por aquí, manteniéndolos desacoplados de Spring en su API interna.
 */
@Component
public class PublicadorEventos {

    private final ApplicationEventPublisher publisher;

    public PublicadorEventos(ApplicationEventPublisher publisher) {
        this.publisher = publisher;
    }

    public void publicar(EventoDominio evento) {
        publisher.publishEvent(evento);
    }
}
