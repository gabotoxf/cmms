package com.gabotoxf.cmms.mantenimiento.dto;

import com.gabotoxf.cmms.mantenimiento.EstadoPlan;
import com.gabotoxf.cmms.mantenimiento.PlanMantenimiento;

import java.time.LocalDate;
import java.time.Instant;
import java.time.temporal.ChronoUnit;

public record PlanResponse(
        Long id,
        Long equipoId,
        String equipoSerial,
        String equipoNombre,
        String equipoUbicacion,
        String equipoClasificacionRiesgo,
        String equipoMarca,
        String equipoModelo,
        Integer frecuenciaDias,
        LocalDate ultimaEjecucion,
        LocalDate proximaFecha,
        long diasRestantes,
        EstadoPlan estado,
        Instant creadoEn,
        Instant actualizadoEn
) {
    /**
     * hoy se pasa explícito para que todos los DTOs de una misma respuesta
     * usen la misma fecha (consistencia) y salga del Clock inyectable.
     */
    public static PlanResponse from(PlanMantenimiento plan, EstadoPlan estado, LocalDate hoy) {
        long diasRestantes = ChronoUnit.DAYS.between(hoy, plan.getProximaFecha());
        var eq = plan.getEquipo();
        return new PlanResponse(
                plan.getId(),
                eq.getId(),
                eq.getSerial(),
                eq.getNombre(),
                eq.getUbicacion(),
                eq.getClasificacionRiesgo().name(),
                eq.getMarca(),
                eq.getModelo(),
                plan.getFrecuenciaDias(),
                plan.getUltimaEjecucion(),
                plan.getProximaFecha(),
                diasRestantes,
                estado,
                plan.getCreadoEn(),
                plan.getActualizadoEn());
    }
}
