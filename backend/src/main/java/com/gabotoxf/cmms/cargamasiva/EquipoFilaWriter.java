package com.gabotoxf.cmms.cargamasiva;

import com.gabotoxf.cmms.equipo.EquipoService;
import com.gabotoxf.cmms.equipo.dto.EquipoRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

/**
 * Fase 8: persiste una fila del archivo en SU PROPIA transacción (REQUIRES_NEW).
 *
 * Vive en un bean separado a propósito: si el método estuviera en el mismo service,
 * la auto-invocación saltaría el proxy de Spring y REQUIRES_NEW no se aplicaría,
 * envenenando con rollback a todas las filas anteriores del lote.
 */
@Service
public class EquipoFilaWriter {

    private final EquipoService equipoService;

    public EquipoFilaWriter(EquipoService equipoService) {
        this.equipoService = equipoService;
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void guardar(EquipoRequest request) {
        equipoService.crear(request);
    }
}
