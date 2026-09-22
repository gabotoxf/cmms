package com.gabotoxf.cmms.common;

import com.gabotoxf.cmms.auth.EmailDuplicadoException;
import com.gabotoxf.cmms.equipo.EquipoNoEncontradoException;
import com.gabotoxf.cmms.equipo.SerialDuplicadoException;
import com.gabotoxf.cmms.mantenimiento.FechaInvalidaException;
import com.gabotoxf.cmms.mantenimiento.PlanNoEncontradoException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.orm.ObjectOptimisticLockingFailureException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.servlet.resource.NoResourceFoundException;

import java.util.HashMap;
import java.util.Map;

/**
 * Manejo global de errores: toda la API responde errores como JSON
 * con formato ProblemDetail (RFC 7807).
 *
 * Los módulos publican excepciones que extienden RecursoNoEncontradoException o
 * ConflictoDatosException y este advice las traduce a HTTP sin conocerlas una por una.
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(RecursoNoEncontradoException.class)
    public ProblemDetail manejarNoEncontrado(RecursoNoEncontradoException ex) {
        return ProblemDetail.forStatusAndDetail(HttpStatus.NOT_FOUND, ex.getMessage());
    }

    @ExceptionHandler(ConflictoDatosException.class)
    public ProblemDetail manejarConflicto(ConflictoDatosException ex) {
        return ProblemDetail.forStatusAndDetail(HttpStatus.CONFLICT, ex.getMessage());
    }

    @ExceptionHandler(ReglasNegocioException.class)
    public ProblemDetail manejarReglaNegocio(ReglasNegocioException ex) {
        return ProblemDetail.forStatusAndDetail(HttpStatus.BAD_REQUEST, ex.getMessage());
    }

    /** Serial duplicado bajo concurrencia: la constraint de BD saltó aunque el existsBySerial pasó. */
    @ExceptionHandler(DataIntegrityViolationException.class)
    public ProblemDetail manejarIntegridad(DataIntegrityViolationException ex) {
        log.warn("Violación de integridad: {}", ex.getMostSpecificCause().getMessage());
        ProblemDetail pd = ProblemDetail.forStatusAndDetail(HttpStatus.CONFLICT,
                "El registro viola una restricción de datos (posible duplicado o referencia inválida)");
        pd.setTitle("Conflicto con datos existentes");
        return pd;
    }

    /** Dos usuarios editaron la misma entidad a la vez (locking optimista). */
    @ExceptionHandler(ObjectOptimisticLockingFailureException.class)
    public ProblemDetail manejarLockingOptimista(ObjectOptimisticLockingFailureException ex) {
        ProblemDetail pd = ProblemDetail.forStatusAndDetail(HttpStatus.CONFLICT,
                "El recurso fue modificado por otro usuario. Recarga e intenta de nuevo");
        pd.setTitle("Conflicto de concurrencia");
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
        ProblemDetail pd = ProblemDetail.forStatusAndDetail(HttpStatus.FORBIDDEN,
                "No tienes permisos para esta operación");
        pd.setTitle("Acceso denegado");
        return pd;
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ProblemDetail manejarValidacion(MethodArgumentNotValidException ex) {
        Map<String, String> errores = new HashMap<>();
        ex.getBindingResult().getFieldErrors()
                .forEach(error -> errores.put(error.getField(), error.getDefaultMessage()));
        ProblemDetail pd = ProblemDetail.forStatusAndDetail(HttpStatus.BAD_REQUEST,
                "La solicitud contiene datos inválidos");
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

    /** URL inexistente: antes caía en el handler genérico y devolvía 500. */
    @ExceptionHandler(NoResourceFoundException.class)
    public ProblemDetail manejarRutaInexistente(NoResourceFoundException ex) {
        ProblemDetail pd = ProblemDetail.forStatusAndDetail(HttpStatus.NOT_FOUND,
                "El recurso solicitado no existe: " + ex.getResourcePath());
        pd.setTitle("Recurso no encontrado");
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
