package com.gabotoxf.cmms.mantenimiento;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RegistroMantenimientoRepository extends JpaRepository<RegistroMantenimiento, Long> {

    List<RegistroMantenimiento> findByPlanIdOrderByFechaEjecucionDesc(Long planId);
}
