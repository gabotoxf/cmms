package com.gabotoxf.cmms.common;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Documentación de la API. La UI queda en /swagger-ui.html y el JSON en /v3/api-docs.
 * El botón "Authorize" acepta el JWT tal cual (sin el prefijo Bearer) y lo envía
 * en la cabecera Authorization, para probar endpoints protegidos desde el navegador.
 */
@Configuration
public class OpenApiConfig {

    private static final String ESQUEMA_JWT = "bearerAuth";

    @Bean
    public OpenAPI cmmsOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("CMMS API")
                        .description("API del sistema de gestión de mantenimiento (CMMS) para equipos biomédicos. " +
                                "Contexto normativo: Resolución 3100 de 2019 (habilitación de servicios de salud, Colombia).")
                        .version("v1")
                        .contact(new Contact().name("Equipo CMMS")))
                .components(new Components().addSecuritySchemes(ESQUEMA_JWT,
                        new SecurityScheme()
                                .name(ESQUEMA_JWT)
                                .type(SecurityScheme.Type.HTTP)
                                .scheme("bearer")
                                .bearerFormat("JWT")
                                .description("Ingresa el JWT emitido por /api/auth/login (sin el prefijo Bearer)")))
                .addSecurityItem(new SecurityRequirement().addList(ESQUEMA_JWT));
    }
}
