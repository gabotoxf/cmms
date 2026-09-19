package com.gabotoxf.cmms.mantenimiento.dto;

import com.gabotoxf.cmms.mantenimiento.EstadoPlan;
import com.gabotoxf.cmms.mantenimiento.PlanMantenimiento;

import java.time.LocalDate;
import java.time.LocalDateTime;

public record PlanResponse(
        Long id,
        Long equipoId,
        String equipoSerial,
        String equipoNombre,
        Integer frecuenciaDias,
        LocalDate ultimaEjecucion,
        LocalDate proximaFecha,
        long diasRestantes,
        EstadoPlan estado,
        LocalDateTime creadoEn,
        LocalDateTime actualizadoEn
) {
    public static PlanResponse from(PlanMantenimiento plan, EstadoPlan estado) {
        long diasRestantes = java.time.temporal.ChronoUnit.DAYS.between(LocalDate.now(), plan.getProximaFecha());
        return new PlanResponse(
                plan.getId(),
                plan.getEquipo().getId(),
                plan.getEquipo().getSerial(),
                plan.getEquipo().getNombre(),
                plan.getFrecuenciaDias(),
                plan.getUltimaEjecucion(),
                plan.getProximaFecha(),
                diasRestantes,
                estado,
                plan.getCreadoEn(),
                plan.getActualizadoEn());
    }
}
