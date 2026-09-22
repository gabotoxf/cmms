package com.gabotoxf.cmms.equipo;

import com.gabotoxf.cmms.auth.JwtAuthenticationFilter;
import com.gabotoxf.cmms.auth.SecurityConfig;
import com.gabotoxf.cmms.auth.UserDetailsServiceImpl;
import com.gabotoxf.cmms.common.GlobalExceptionHandler;
import com.gabotoxf.cmms.common.PaginaResponse;
import com.gabotoxf.cmms.equipo.dto.EquipoRequest;
import com.gabotoxf.cmms.equipo.dto.EquipoResponse;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletRequest;
import jakarta.servlet.ServletResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.web.servlet.MockMvc;

import java.time.Instant;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doAnswer;
import static org.mockito.Mockito.when;
import static org.hamcrest.Matchers.endsWith;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Fase 10: pruebas del controller de equipos con MockMvc (sin levantar el servidor):
 * contratos HTTP, códigos de estado, cabecera Location, validación y reglas por rol.
 * Se importa la SecurityConfig real para probar también la autorización.
 */
@WebMvcTest(EquipoController.class)
@ContextConfiguration(classes = {EquipoController.class, SecurityConfig.class, GlobalExceptionHandler.class})
class EquipoControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private EquipoService equipoService;

    @MockitoBean
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @MockitoBean
    private UserDetailsServiceImpl userDetailsService;

    /**
     * El filtro JWT es un mock: sin este stub no delegaría la petición y todos
     * los requests morirían en el filtro con 200 vacío. Aquí solo deja pasar
     * la cadena para que la SecurityFilterChain real evalúe roles y matchers.
     */
    @BeforeEach
    void dejarPasarFiltroJwt() throws Exception {
        doAnswer(inv -> {
            FilterChain chain = inv.getArgument(2);
            chain.doFilter(inv.getArgument(0), inv.getArgument(1));
            return null;
        }).when(jwtAuthenticationFilter).doFilter(any(ServletRequest.class), any(ServletResponse.class), any(FilterChain.class));
    }

    private EquipoResponse responseEjemplo() {
        return new EquipoResponse(1L, "EQ-001", "Ventilador mecánico", "Brand", "X100",
                "UCI", ClasificacionRiesgo.IIB, null, 180, EstadoEquipo.OPERATIVO,
                Instant.now(), Instant.now());
    }

    @Test
    @DisplayName("POST crea un equipo: 201 con Location y payload persistido")
    @WithMockUser(roles = "INGENIERO")
    void crear() throws Exception {
        when(equipoService.crear(any(EquipoRequest.class))).thenReturn(responseEjemplo());

        mockMvc.perform(post("/api/equipos")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "serial": "EQ-001",
                                  "nombre": "Ventilador mecánico",
                                  "ubicacion": "UCI",
                                  "clasificacionRiesgo": "IIB",
                                  "periodicidadMantenimientoDias": 180
                                }
                                """))
                .andExpect(status().isCreated())
                .andExpect(header().string("Location", endsWith("/api/equipos/1")))
                .andExpect(jsonPath("$.serial").value("EQ-001"))
                .andExpect(jsonPath("$.estado").value("OPERATIVO"));
    }

    @Test
    @DisplayName("POST sin cuerpo válido: 400 con detalle de errores de campo")
    @WithMockUser(roles = "INGENIERO")
    void crearInvalido() throws Exception {
        mockMvc.perform(post("/api/equipos")
                        .contentType(MediaType.APPLICATION_JSON)
                        // Enum inválido fallaría en deserialización (400 sin errores de campo);
                        // con enum válido y campos vacíos cae en la validación de bean (Map "errores")
                        .content("""
                                {
                                  "serial": "",
                                  "nombre": "Sin datos",
                                  "ubicacion": "",
                                  "clasificacionRiesgo": "IIB",
                                  "periodicidadMantenimientoDias": 0
                                }
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errores").exists());
    }

    @Test
    @DisplayName("TECNICO no puede crear equipos: 403")
    @WithMockUser(roles = "TECNICO")
    void crearComoTecnico() throws Exception {
        mockMvc.perform(post("/api/equipos")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "serial": "EQ-9",
                                  "nombre": "n",
                                  "ubicacion": "UCI",
                                  "clasificacionRiesgo": "I",
                                  "periodicidadMantenimientoDias": 30
                                }
                                """))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Sin autenticación: 401 (la API es privada)")
    void sinAutenticacion() throws Exception {
        mockMvc.perform(get("/api/equipos"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("GET lista paginada con el envoltorio estable")
    @WithMockUser(roles = "AUDITOR")
    void listar() throws Exception {
        when(equipoService.listar(any(), any(), any(), any())).thenReturn(
                new PaginaResponse<>(List.of(responseEjemplo()), 1, 1, 0, 10));

        mockMvc.perform(get("/api/equipos")
                        .param("ubicacion", "UCI")
                        .param("riesgo", "IIB"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.contenido[0].serial").value("EQ-001"))
                .andExpect(jsonPath("$.totalElementos").value(1))
                .andExpect(jsonPath("$.pagina").value(0));
    }

    @Test
    @DisplayName("GET por id inexistente: 404 en formato ProblemDetail")
    @WithMockUser(roles = "AUDITOR")
    void obtenerInexistente() throws Exception {
        when(equipoService.obtenerPorId(99L)).thenThrow(new EquipoNoEncontradoException(99L));

        mockMvc.perform(get("/api/equipos/99"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.detail").value("No existe un equipo con id: 99"));
    }

    @Test
    @DisplayName("El filtro de orden con campo desconocido se ignora en vez de romper: 200")
    @WithMockUser(roles = "AUDITOR")
    void ordenInvalidoIgnorado() throws Exception {
        when(equipoService.listar(any(), any(), any(), any())).thenReturn(
                new PaginaResponse<>(List.of(), 0, 0, 0, 10));

        mockMvc.perform(get("/api/equipos").param("orden", "-columna_inyectada"))
                .andExpect(status().isOk());
    }
}
