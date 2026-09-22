package com.gabotoxf.cmms;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

/**
 * Verifica que el contexto completo arranca (datasource, Flyway, JPA, seguridad,
 * jobs, listeners). Corre contra Postgres real en Docker; sin Docker se omite
 * en vez de fallar (igual que los tests de repositorios).
 */
@SpringBootTest
@Testcontainers(disabledWithoutDocker = true)
class CmmsApplicationTests {

    @Container
    @ServiceConnection
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:18-alpine");

    @Test
    void contextLoads() {
    }

}
