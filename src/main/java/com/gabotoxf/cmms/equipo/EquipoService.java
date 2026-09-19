package com.gabotoxf.cmms.equipo;

import com.gabotoxf.cmms.common.PaginaResponse;
import com.gabotoxf.cmms.equipo.dto.EquipoRequest;
import com.gabotoxf.cmms.equipo.dto.EquipoResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
public class EquipoService {

    private final EquipoRepository equipoRepository;
    private final com.gabotoxf.cmms.mantenimiento.PlanMantenimientoService planMantenimientoService;

    public EquipoService(EquipoRepository equipoRepository,
                         com.gabotoxf.cmms.mantenimiento.PlanMantenimientoService planMantenimientoService) {
        this.equipoRepository = equipoRepository;
        this.planMantenimientoService = planMantenimientoService;
    }

    @Transactional
    public EquipoResponse crear(EquipoRequest request) {
        String serial = request.serial().trim();

        if (equipoRepository.existsBySerial(serial)) {
            throw new SerialDuplicadoException(serial);
        }

        Equipo equipo = new Equipo();
        aplicarDatos(equipo, request);
        Equipo guardado = equipoRepository.save(equipo);
        planMantenimientoService.sincronizarPlan(guardado);
        return toResponse(guardado);
    }

    @Transactional(readOnly = true)
    public PaginaResponse<EquipoResponse> listar(Pageable pageable, String ubicacion,
                                                 ClasificacionRiesgo riesgo, EstadoEquipo estado) {
        Specification<Equipo> spec = (root, query, cb) -> {
            List<jakarta.persistence.criteria.Predicate> predicates = new ArrayList<>();
            if (ubicacion != null && !ubicacion.isBlank()) {
                predicates.add(cb.like(cb.lower(root.get("ubicacion")),
                        "%" + ubicacion.toLowerCase().trim() + "%"));
            }
            if (riesgo != null) {
                predicates.add(cb.equal(root.get("clasificacionRiesgo"), riesgo));
            }
            if (estado != null) {
                predicates.add(cb.equal(root.get("estado"), estado));
            }
            return cb.and(predicates.toArray(new jakarta.persistence.criteria.Predicate[0]));
        };

        Page<Equipo> page = equipoRepository.findAll(spec, pageable);
        List<EquipoResponse> contenido = page.getContent().stream().map(this::toResponse).toList();
        return PaginaResponse.from(page, contenido);
    }

    @Transactional(readOnly = true)
    public EquipoResponse obtenerPorId(Long id) {
        return toResponse(buscarPorId(id));
    }

    @Transactional
    public EquipoResponse actualizar(Long id, EquipoRequest request) {
        Equipo equipo = buscarPorId(id);
        String serial = request.serial().trim();

        if (!serial.equals(equipo.getSerial()) && equipoRepository.existsBySerial(serial)) {
            throw new SerialDuplicadoException(serial);
        }

        aplicarDatos(equipo, request);
        Equipo guardado = equipoRepository.save(equipo);
        planMantenimientoService.sincronizarPlan(guardado);
        return toResponse(guardado);
    }

    @Transactional
    public EquipoResponse cambiarEstado(Long id, EstadoEquipo estado) {
        Equipo equipo = buscarPorId(id);
        equipo.setEstado(estado);
        return toResponse(equipoRepository.save(equipo));
    }

    /**
     * Baja lógica: un CMMS real no borra equipos, los marca como DADO_DE_BAJA
     * para conservar la trazabilidad de la hoja de vida.
     */
    @Transactional
    public EquipoResponse darDeBaja(Long id) {
        Equipo equipo = buscarPorId(id);
        equipo.setEstado(EstadoEquipo.DADO_DE_BAJA);
        return toResponse(equipoRepository.save(equipo));
    }

    private Equipo buscarPorId(Long id) {
        return equipoRepository.findById(id)
                .orElseThrow(() -> new EquipoNoEncontradoException(id));
    }

    private void aplicarDatos(Equipo equipo, EquipoRequest request) {
        equipo.setSerial(request.serial().trim());
        equipo.setNombre(request.nombre().trim());
        equipo.setMarca(request.marca());
        equipo.setModelo(request.modelo());
        equipo.setUbicacion(request.ubicacion().trim());
        equipo.setClasificacionRiesgo(request.clasificacionRiesgo());
        equipo.setFechaAdquisicion(request.fechaAdquisicion());
        equipo.setPeriodicidadMantenimientoDias(request.periodicidadMantenimientoDias());
    }

    private EquipoResponse toResponse(Equipo equipo) {
        return new EquipoResponse(
                equipo.getId(),
                equipo.getSerial(),
                equipo.getNombre(),
                equipo.getMarca(),
                equipo.getModelo(),
                equipo.getUbicacion(),
                equipo.getClasificacionRiesgo(),
                equipo.getFechaAdquisicion(),
                equipo.getPeriodicidadMantenimientoDias(),
                equipo.getEstado(),
                equipo.getCreadoEn()
        );
    }
}
