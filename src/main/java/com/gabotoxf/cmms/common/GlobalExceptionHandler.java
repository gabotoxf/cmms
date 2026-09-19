package com.gabotoxf.cmms.common;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

import java.util.HashMap;
import java.util.Map;

/**
 * Manejo global de errores: toda la API responde errores como JSON
 * con formato ProblemDetail (RFC 7807), listo para consumir desde Angular.
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(com.gabotoxf.cmms.equipo.EquipoNoEncontradoException.class)
    public ProblemDetail manejarNoEncontrado(com.gabotoxf.cmms.equipo.EquipoNoEncontradoException ex) {
        ProblemDetail pd = ProblemDetail.forStatusAndDetail(HttpStatus.NOT_FOUND, ex.getMessage());
        pd.setTitle("Recurso no encontrado");
        return pd;
    }

    @ExceptionHandler({com.gabotoxf.cmms.equipo.SerialDuplicadoException.class, com.gabotoxf.cmms.auth.EmailDuplicadoException.class})
    public ProblemDetail manejarDuplicado(RuntimeException ex) {
        ProblemDetail pd = ProblemDetail.forStatusAndDetail(HttpStatus.CONFLICT, ex.getMessage());
        pd.setTitle("Conflicto con datos existentes");
        return pd;
    }

    @ExceptionHandler(BadCredentialsException.class)
    public ProblemDetail manejarCredencialesInvalidas(BadCredentialsException ex) {
        ProblemDetail pd = ProblemDetail.forStatusAndDetail(HttpStatus.UNAUTHORIZED, "Credenciales inválidas");
        pd.setTitle("No autenticado");
        return pd;
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ProblemDetail manejarAccesoDenegado(AccessDeniedException ex) {
        ProblemDetail pd = ProblemDetail.forStatusAndDetail(HttpStatus.FORBIDDEN, "No tienes permisos para esta operación");
        pd.setTitle("Acceso denegado");
        return pd;
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ProblemDetail manejarValidacion(MethodArgumentNotValidException ex) {
        Map<String, String> errores = new HashMap<>();
        ex.getBindingResult().getFieldErrors()
                .forEach(error -> errores.put(error.getField(), error.getDefaultMessage()));
        ProblemDetail pd = ProblemDetail.forStatusAndDetail(HttpStatus.BAD_REQUEST, "La solicitud contiene datos inválidos");
        pd.setTitle("Error de validación");
        pd.setProperty("errores", errores);
        return pd;
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ProblemDetail manejarCuerpoInvalido(HttpMessageNotReadableException ex) {
        ProblemDetail pd = ProblemDetail.forStatusAndDetail(HttpStatus.BAD_REQUEST,
                "El cuerpo JSON es inválido o contiene un valor de enum no válido");
        pd.setTitle("Solicitud mal formada");
        return pd;
    }

    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ProblemDetail manejarParametroInvalido(MethodArgumentTypeMismatchException ex) {
        ProblemDetail pd = ProblemDetail.forStatusAndDetail(HttpStatus.BAD_REQUEST,
                "El parámetro '" + ex.getName() + "' tiene un valor no válido");
        pd.setTitle("Parámetro inválido");
        return pd;
    }

    @ExceptionHandler(com.gabotoxf.cmms.mantenimiento.PlanNoEncontradoException.class)
    public ProblemDetail manejarPlanNoEncontrado(com.gabotoxf.cmms.mantenimiento.PlanNoEncontradoException ex) {
        ProblemDetail pd = ProblemDetail.forStatusAndDetail(HttpStatus.NOT_FOUND, ex.getMessage());
        pd.setTitle("Plan de mantenimiento no encontrado");
        return pd;
    }

    @ExceptionHandler(com.gabotoxf.cmms.mantenimiento.FechaInvalidaException.class)
    public ProblemDetail manejarFechaInvalida(com.gabotoxf.cmms.mantenimiento.FechaInvalidaException ex) {
        ProblemDetail pd = ProblemDetail.forStatusAndDetail(HttpStatus.BAD_REQUEST, ex.getMessage());
        pd.setTitle("Fecha inválida");
        return pd;
    }

    @ExceptionHandler(Exception.class)
    public ProblemDetail manejarGenerico(Exception ex) {
        log.error("Error inesperado", ex);
        ProblemDetail pd = ProblemDetail.forStatusAndDetail(HttpStatus.INTERNAL_SERVER_ERROR,
                "Ocurrió un error inesperado. Revisa los logs del servidor");
        pd.setTitle("Error interno");
        return pd;
    }
}
