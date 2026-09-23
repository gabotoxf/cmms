package com.gabotoxf.cmms.equipo;

import com.gabotoxf.cmms.common.EventoEquipoCreado;
import com.gabotoxf.cmms.common.EventoEquipoActualizado;
import com.gabotoxf.cmms.common.PaginaResponse;
import com.gabotoxf.cmms.common.PublicadorEventos;
import com.gabotoxf.cmms.equipo.dto.EquipoRequest;
import com.gabotoxf.cmms.equipo.dto.EquipoResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

@Service
public class EquipoService {

    private final EquipoRepository equipoRepository;
    private final PublicadorEventos publicadorEventos;

    public EquipoService(EquipoRepository equipoRepository,
                         PublicadorEventos publicadorEventos) {
        this.equipoRepository = equipoRepository;
        this.publicadorEventos = publicadorEventos;
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
        publicadorEventos.publicar(new EventoEquipoCreado(
                guardado.getId(), guardado.getSerial(), guardado.getPeriodicidadMantenimientoDias(),
                Instant.now()));
        return EquipoResponse.from(guardado);
    }

    @Transactional(readOnly = true)
    public PaginaResponse<EquipoResponse> listar(Pageable pageable, String ubicacion,
                                                 ClasificacionRiesgo riesgo, EstadoEquipo estado) {
        return listar(pageable, ubicacion, false, riesgo, estado);
    }

    @Transactional(readOnly = true)
    public PaginaResponse<EquipoResponse> listar(Pageable pageable, String term,
                                                 boolean generico,
                                                 ClasificacionRiesgo riesgo, EstadoEquipo estado) {
        Specification<Equipo> spec = (root, query, cb) -> cb.conjunction();

        if (term != null && !term.isBlank()) {
            String like = "%" + term.toLowerCase().trim() + "%";
            if (generico) {
                spec = spec.and((root, query, cb) -> cb.or(
                        cb.like(cb.lower(root.get("serial")), like),
                        cb.like(cb.lower(root.get("nombre")), like),
                        cb.like(cb.lower(root.get("ubicacion")), like),
                        cb.like(cb.lower(root.get("marca")), like),
                        cb.like(cb.lower(root.get("modelo")), like)));
            } else {
                spec = spec.and((root, query, cb) ->
                        cb.like(cb.lower(root.get("ubicacion")), like));
            }
        }
        if (riesgo != null) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("clasificacionRiesgo"), riesgo));
        }
        if (estado != null) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("estado"), estado));
        }

        Page<Equipo> page = equipoRepository.findAll(spec, pageable);
        List<EquipoResponse> contenido = page.getContent().stream().map(EquipoResponse::from).toList();
        return PaginaResponse.from(page, contenido);
    }

    @Transactional(readOnly = true)
    public EquipoResponse obtenerPorId(Long id) {
        return EquipoResponse.from(buscarPorId(id));
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
        publicadorEventos.publicar(new EventoEquipoActualizado(
                guardado.getId(), guardado.getSerial(), guardado.getPeriodicidadMantenimientoDias(),
                guardado.getEstado().name(), Instant.now()));
        return EquipoResponse.from(guardado);
    }

    @Transactional
    public EquipoResponse cambiarEstado(Long id, EstadoEquipo estado) {
        Equipo equipo = buscarPorId(id);
        equipo.setEstado(estado);
        Equipo guardado = equipoRepository.save(equipo);
        publicadorEventos.publicar(new EventoEquipoActualizado(
                guardado.getId(), guardado.getSerial(), guardado.getPeriodicidadMantenimientoDias(),
                guardado.getEstado().name(), Instant.now()));
        return EquipoResponse.from(guardado);
    }

    /**
     * Baja lógica: un CMMS real no borra equipos, los marca como DADO_DE_BAJA
     * para conservar la trazabilidad de la hoja de vida.
     */
    @Transactional
    public EquipoResponse darDeBaja(Long id) {
        Equipo equipo = buscarPorId(id);
        equipo.setEstado(EstadoEquipo.DADO_DE_BAJA);
        Equipo guardado = equipoRepository.save(equipo);
        publicadorEventos.publicar(new EventoEquipoActualizado(
                guardado.getId(), guardado.getSerial(), guardado.getPeriodicidadMantenimientoDias(),
                guardado.getEstado().name(), Instant.now()));
        return EquipoResponse.from(guardado);
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
}
