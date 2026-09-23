package com.gabotoxf.cmms.auth;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.hierarchicalroles.RoleHierarchy;
import org.springframework.security.access.hierarchicalroles.RoleHierarchyImpl;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.HttpStatusEntryPoint;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

/**
 * Seguridad stateless con JWT: sin sesiones, sin CSRF (no hay cookies de sesión),
 * login/registro abiertos, /api/** protegido y reglas por rol vía @PreAuthorize.
 * El CORS ya no está fijo a localhost:4200: se configura por propiedad
 * (app.cors.origins) para poder desplegar con el frontend real.
 */
@Configuration
@EnableMethodSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final String appCorsOrigins;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter,
                          @Value("${app.cors.origins:http://localhost:4200}") String appCorsOrigins) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
        this.appCorsOrigins = appCorsOrigins;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        // Documentación de la API: pública para que el revisor pueda verla
                        .requestMatchers("/swagger-ui.html", "/swagger-ui/**", "/v3/api-docs/**").permitAll()
                        .requestMatchers("/api/auth/login", "/api/auth/registro", "/api/auth/recuperar", "/api/auth/restablecer").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/**").hasAnyRole("ADMIN", "INGENIERO", "TECNICO", "AUDITOR")
                        .anyRequest().authenticated())
                .exceptionHandling(ex -> ex.authenticationEntryPoint(new HttpStatusEntryPoint(HttpStatus.UNAUTHORIZED)))
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public RoleHierarchy roleHierarchy() {
        // ADMIN hereda los permisos de todos los demás roles
        return RoleHierarchyImpl.fromHierarchy("""
                ROLE_ADMIN > ROLE_INGENIERO
                ROLE_INGENIERO > ROLE_TECNICO
                ROLE_TECNICO > ROLE_AUDITOR
                """);
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        // En dev localhost y 127.0.0.1 son orígenes distintos para el navegador
        // (localStorage/Auth header no se comparte). Se permiten ambos aunque
        // app.cors.origins solo traiga uno — evita el "funciona en 127.0.0.1 pero no en localhost".
        var origins = java.util.Arrays.stream(appCorsOrigins.split(","))
                .map(String::trim).filter(o -> !o.isBlank()).collect(java.util.stream.Collectors.toCollection(java.util.ArrayList::new));
        // ponytail: lista explícita + pattern fallback, evita tener que sincronizar .env con cada host
        if (origins.stream().noneMatch(o -> o.contains("127.0.0.1"))) origins.add("http://127.0.0.1:4200");
        if (origins.stream().noneMatch(o -> o.contains("localhost"))) origins.add("http://localhost:4200");
        config.setAllowedOrigins(origins);
        config.setAllowedOriginPatterns(List.of("http://localhost:*", "http://127.0.0.1:*"));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setExposedHeaders(List.of("Authorization", "Content-Type"));
        config.setAllowCredentials(true);
        config.setMaxAge(3600L);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/api/**", config);
        return source;
    }
}
