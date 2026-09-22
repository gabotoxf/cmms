package com.gabotoxf.cmms.orden;

import com.gabotoxf.cmms.auth.JwtAuthenticationFilter;
import com.gabotoxf.cmms.auth.SecurityConfig;
import com.gabotoxf.cmms.auth.UserDetailsServiceImpl;
import com.gabotoxf.cmms.common.PaginaResponse;
import com.gabotoxf.cmms.orden.dto.AsignarRequest;
import com.gabotoxf.cmms.orden.dto.CrearOrdenRequest;
import com.gabotoxf.cmms.orden.dto.OrdenResponse;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletRequest;
import jakarta.servlet.ServletResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.hamcrest.Matchers.endsWith;
import static org.mockito.Mockito.doAnswer;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Fase 10: la máquina de estados expuesta por HTTP. Con el service mockeado,
 * MockMvc verifica el contrato de cada transición y las reglas de rol:
 * TECNICO puede iniciar/completar pero no crear ni asignar; el 400 de
 * TransicionInvalidaException viaja como ProblemDetail.
 */
@WebMvcTest(OrdenTrabajoController.class)
@ContextConfiguration(classes = {OrdenTrabajoController.class, SecurityConfig.class, com.gabotoxf.cmms.common.GlobalExceptionHandler.class})
class OrdenTrabajoControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private OrdenTrabajoService ordenService;

    @MockitoBean
    private com.gabotoxf.cmms.auth.UsuarioRepository usuarioRepository;

    @MockitoBean
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @MockitoBean
    private UserDetailsServiceImpl userDetailsService;

    /** El filtro JWT mockeado debe delegar, o ninguna petición llega al controller. */
    @BeforeEach
    void dejarPasarFiltroJwt() throws Exception {
        doAnswer(inv -> {
            FilterChain chain = inv.getArgument(2);
            chain.doFilter(inv.getArgument(0), inv.getArgument(1));
            return null;
        }).when(jwtAuthenticationFilter).doFilter(any(ServletRequest.class), any(ServletResponse.class), any(FilterChain.class));
    }

    private OrdenResponse orden(Long id, EstadoOrden estado) {
        return new OrdenResponse(id, 1L, "EQ-001", "Ventilador", TipoOrden.CORRECTIVO, estado,
                "Cambio de batería", "desc", 2L, "Técnico Demo", null,
                LocalDate.of(2026, 9, 20), null, null, null, null, Instant.now(), Instant.now());
    }

    @Test
    @DisplayName("POST crea la orden: 201 + Location")
    @WithMockUser(roles = "ADMIN")
    void crear() throws Exception {
        when(ordenService.crear(any(CrearOrdenRequest.class))).thenReturn(orden(1L, EstadoOrden.PENDIENTE));

        mockMvc.perform(post("/api/ordenes-trabajo")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "equipoId": 1,
                                  "tipo": "CORRECTIVO",
                                  "titulo": "Cambio de batería",
                                  "descripcion": "No enciende"
                                }
                                """))
                .andExpect(status().isCreated())
                .andExpect(header().string("Location", endsWith("/api/ordenes-trabajo/1")))
                .andExpect(jsonPath("$.estado").value("PENDIENTE"));
    }

    @Test
    @DisplayName("TECNICO no puede crear órdenes: 403")
    @WithMockUser(roles = "TECNICO")
    void crearComoTecnico() throws Exception {
        mockMvc.perform(post("/api/ordenes-trabajo")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "equipoId": 1,
                                  "tipo": "CORRECTIVO",
                                  "titulo": "x"
                                }
                                """))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("PATCH /asignar de ADMIN funciona y responde ASIGNADA")
    @WithMockUser(roles = "ADMIN")
    void asignar() throws Exception {
        when(ordenService.asignar(eq(1L), any(AsignarRequest.class))).thenReturn(orden(1L, EstadoOrden.ASIGNADA));

        mockMvc.perform(patch("/api/ordenes-trabajo/1/asignar")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"tecnicoId\": 2}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.estado").value("ASIGNADA"));
    }

    @Test
    @DisplayName("PATCH /iniciar responde 200 con estado EN_PROCESO")
    @WithMockUser(roles = "TECNICO")
    void iniciar() throws Exception {
        when(ordenService.iniciar(1L)).thenReturn(orden(1L, EstadoOrden.EN_PROCESO));

        mockMvc.perform(patch("/api/ordenes-trabajo/1/iniciar"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.estado").value("EN_PROCESO"));
    }

    @Test
    @DisplayName("PATCH /completar exige resultado: si falta el campo, 400 de validación")
    @WithMockUser(roles = "TECNICO")
    void completarSinResultado() throws Exception {
        mockMvc.perform(patch("/api/ordenes-trabajo/1/completar")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"resultado\": \"\"}"))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("Iniciar una orden PENDIENTE: 400 ProblemDetail con la regla violada")
    @WithMockUser(roles = "ADMIN")
    void transicionInvalida() throws Exception {
        when(ordenService.iniciar(1L)).thenThrow(
                new TransicionInvalidaException("No se puede iniciar una orden en estado PENDIENTE (se requiere ASIGNADA)"));

        mockMvc.perform(patch("/api/ordenes-trabajo/1/iniciar"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.detail").value(
                        "No se puede iniciar una orden en estado PENDIENTE (se requiere ASIGNADA)"));
    }

    @Test
    @DisplayName("GET con filtros devuelve el envoltorio de paginación estable")
    @WithMockUser(roles = "AUDITOR")
    void listar() throws Exception {
        when(ordenService.listar(any(), any(), any(), any(), any())).thenReturn(
                new PaginaResponse<>(List.of(orden(1L, EstadoOrden.PENDIENTE)), 1, 1, 0, 10));

        mockMvc.perform(get("/api/ordenes-trabajo").param("estado", "PENDIENTE"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.contenido[0].estado").value("PENDIENTE"))
                .andExpect(jsonPath("$.totalElementos").value(1));
    }
}
