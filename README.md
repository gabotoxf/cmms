# CMMS — Sistema de Gestión de Mantenimiento

API REST para la gestión del mantenimiento de **equipos biomédicos** en instituciones prestadoras de salud: inventario (hoja de vida), planes de mantenimiento preventivo, órdenes de trabajo y reportes para auditoría.

**Stack:** Java 21 · Spring Boot 4 · PostgreSQL 18 · Flyway · Spring Security (JWT) · Springdoc OpenAPI · Docker

## Contexto normativo

La **Resolución 3100 de 2019** (habilitación de servicios de salud, Colombia) exige a las instituciones demostrar el mantenimiento de sus equipos biomédicos: hoja de vida por equipo, clasificación de riesgo (I, IIA, IIB, III), cronograma de mantenimiento preventivo y trazabilidad de quién ejecutó qué y cuándo. Este sistema automatiza ese ciclo completo:

- **Inventario** con clasificación de riesgo y periodicidad de mantenimiento por equipo.
- **Planes preventivos** con próxima fecha calculada automáticamente.
- **Órdenes de trabajo** con máquina de estados (nadie puede "completar" un trabajo que nunca se inició).
- **Trazabilidad**: cada orden lleva técnico asignado (usuario real, no un string) y resultado obligatorio al completar.
- **Baja lógica**: un equipo nunca se borra; se marca `DADO_DE_BAJA` para conservar su historia.
- **Certificados y hojas de vida en PDF** listos para una auditoría.

## Arquitectura

Spring Boot modular por dominios de negocio, con desacoplamiento por eventos de dominio (publicar-suscribir) y puertos hexagonales ligeros entre módulos:

```
backend/src/main/java/com/gabotoxf/cmms
├── auth/            # Usuarios, roles (ADMIN>INGENIERO>TECNICO>AUDITOR), JWT, filtro
├── equipo/          # Inventario de equipos + hoja de vida (CRUD, filtros, baja lógica)
├── mantenimiento/   # Planes preventivos, registros de ejecución, job de revisión
├── orden/           # Órdenes de trabajo: máquina de estados en la ENTIDAD, job de generación
├── notificaciones/  # Puerto Notificador: correo real (SMTP) o log de fallback
├── reportes/        # PDFs: hoja de vida (OpenPDF) y certificado de cumplimiento
├── dashboard/       # Indicadores: conteos por estado, MTTR, cumplimiento del mes
├── cargamasiva/     # Importación CSV/Excel fila a fila con reporte de errores
└── common/          # Eventos de dominio, manejo global de errores (RFC 7807), utilidades
```

Decisiones de diseño destacadas:

- **Eventos de dominio**: `EquipoService` publica `EventoEquipoCreado` y mantenimiento crea el plan — el módulo equipo no conoce a mantenimiento (`BEFORE_COMMIT` para consistencia; `AFTER_COMMIT` para efectos secundarios como correos).
- **Puerto/adaptador**: el módulo orden define la interfaz `PlanesProvider` y mantenimiento la implementa; orden nunca importa clases internas de mantenimiento.
- **Máquina de estados en la entidad**: `OrdenTrabajo.asignar/iniciar/completar/cancelar` validan sus transiciones — imposible crear una inválida desde otro módulo.
- **`Clock` inyectable**: toda la lógica de fechas sale del reloj de la app (zona Bogotá), determinista en tests.
- **Paginación defensiva**: orden por whitelist de campos y tamaño acotado (nunca confiar en el cliente).
- **Errores RFC 7807**: un solo `@RestControllerAdvice` traduce las excepciones de dominio a `ProblemDetail` JSON.

## Cómo correrlo

> **Estructura del monorepo:** `backend/` (API Spring Boot) y `frontend/` (cliente web).
> El `docker-compose.yml` de la raíz orquesta todo.

### Opción 1: Docker (todo incluido)

```bash
cp .env.properties.example .env.properties   # ajusta credenciales si quieres
docker compose --env-file .env.properties up -d --build
```

Levanta PostgreSQL 18 + la API en `http://localhost:8080`. Las migraciones de Flyway corren solas al arrancar.

### Opción 2: Local (requiere Postgres en el puerto 5432 o 5433)

```bash
# 1. Base de datos (con Docker, solo Postgres):
docker run -d --name cmms-postgres -e POSTGRES_DB=cmms \
  -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres -p 5432:5432 postgres:18-alpine

# 2. La app (desde backend/):
cd backend
./mvnw spring-boot:run
```

La configuración sensible vive en `.env.properties` (git-ignorado; ver `.env.properties.example`). Nunca hay contraseñas hardcodeadas en el repo.

### Usuarios de demo (se crean solos al primer arranque)

| Email | Contraseña | Rol |
|---|---|---|
| `admin@cmms.local` | `admin123` | ADMIN |
| `ingeniero@cmms.local` | `ingeniero123` | INGENIERO |
| `tecnico@cmms.local` | `tecnico123` | TECNICO |
| `auditor@cmms.local` | `auditor123` | AUDITOR |

La jerarquía de roles es `ADMIN > INGENIERO > TECNICO > AUDITOR` (ADMIN hereda todo).

## Documentación de la API (Swagger)

Con la app corriendo: **http://localhost:8080/swagger-ui.html**

1. Haz login en `POST /api/auth/login` con un usuario demo.
2. Copia el `accessToken` de la respuesta.
3. Clic en **Authorize** (arriba a la derecha) y pega el token (sin el prefijo `Bearer`).
4. Ya puedes probar cualquier endpoint desde el navegador.

El JSON de OpenAPI está en `/v3/api-docs`.

## Endpoints principales

| Grupo | Endpoint | Descripción |
|---|---|---|
| Auth | `POST /api/auth/login` · `POST /api/auth/registro` | Login y alta de usuarios (registro solo ADMIN) |
| Equipos | `GET/POST /api/equipos`, `GET/PUT/DELETE /api/equipos/{id}` | Inventario con filtros (`ubicacion`, `riesgo`, `estado`), paginación y baja lógica |
| Equipos | `PATCH /api/equipos/{id}/estado` | Cambio de estado (OPERATIVO, EN_MANTENIMIENTO, FUERA_DE_SERVICIO) |
| Carga masiva | `POST /api/equipos/carga-masiva` | Importa CSV/Excel; reporta errores fila a fila |
| Planes | `GET /api/planes-mantenimiento/pendientes` · `/vencidos` · `/revision` | Mantenimiento vencido/próximo y resumen con counts en SQL |
| Planes | `POST /api/planes-mantenimiento/{id}/ejecuciones` | Registra una ejecución y recalcula la próxima fecha |
| Órdenes | `POST /api/ordenes-trabajo` · `PATCH /{id}/asignar` · `/iniciar` · `/completar` · `/cancelar` | Ciclo de vida con transiciones validadas |
| Órdenes | `POST /api/ordenes-trabajo/generar-preventivas` | Genera preventivas para planes vencidos (el job diario lo hace solo) |
| Reportes | `GET /api/reportes/equipos/{id}/hoja-de-vida` | PDF: hoja de vida completa del equipo |
| Reportes | `GET /api/reportes/certificado-cumplimiento?equipoId=` | PDF: certificado de cumplimiento (parque o equipo) |
| Dashboard | `GET /api/dashboard/resumen` | Equipos/órdenes por estado, planes vencidos, MTTR, % cumplimiento del mes |

## Automatización (jobs programados, zona Bogotá)

| Hora | Job | Qué hace |
|---|---|---|
| 02:00 | `RevisionMantenimientoJob` | Revisa planes: cuenta vencidos y próximos a vencer (umbral configurable, 15 días) |
| 02:15 | `AlertasMantenimientoJob` | Envía el resumen de alertas por correo y publica `EventoAlertaMantenimiento` |
| 02:30 | `GeneracionOrdenesJob` | Genera órdenes preventivas para planes vencidos (idempotente) |

Al arrancar, además, unos seeders idempotentes crean usuarios demo, planes que falten y órdenes preventivas atrasadas (por si el servidor estuvo apagado).

## Notificaciones (Fase 5)

El puerto `Notificador` tiene dos implementaciones seleccionadas automáticamente:

- **Correo real** si `MAIL_HOST` está configurado (variables `MAIL_HOST`, `MAIL_PORT`, `MAIL_USERNAME`, `MAIL_PASSWORD`, `MAIL_REMITENTE`).
- **Log** si no hay SMTP: la API funciona completa sin correo (demo/CI).

Se notifica: nueva orden creada, orden asignada a un técnico y alertas diarias de mantenimiento. El destinatario del buzón de operaciones se configura con `APP_ALERTAS_DESTINATARIO`.

## Pruebas

```bash
cd backend
./mvnw test
```

- **Unitarias** (JUnit 5 + Mockito + AssertJ): máquina de estados, cálculo de fechas, servicios con mocks, parser de carga masiva. Rápidas, sin BD.
- **Controllers** (MockMvc + la `SecurityConfig` real): contratos HTTP, códigos de estado, ProblemDetail y reglas por rol.
- **Integración** (Testcontainers + Postgres real en Docker): constraints, auditoría, Specifications y queries. Se omiten automáticamente si Docker no está disponible (`disabledWithoutDocker`).

## Persistencia y backups (evitar pérdida de usuarios)

Los datos viven en el volumen Docker `cmms_pgdata` (`docker-compose.yml:60`). **Nunca** uses `docker compose down -v` ni `docker system prune --volumes` con datos reales: eso recreó el volumen el `2026-09-23 00:39 UTC` y disparó Flyway sobre esquema vacío + `DataSeeder.java:30` (solo inserta demos).

Comandos seguros:
```bash
docker compose down              # para y conserva datos
docker compose up -d --build     # rebuild sin borrar volumen
.\scripts\backup.ps1             # pg_dump a backups/cmms_*.sql (rotación 14)
.\scripts\restore.ps1 .\backups\cmms_YYYY-MM-DD_HHmm.sql
```

## Migraciones de base de datos

Flyway con scripts versionados en `backend/src/main/resources/db/migration` (nunca `ddl-auto: update`, que Hibernate solo usa en modo `validate`). Para agregar un cambio de esquema: nuevo archivo `V{n}__descripcion.sql`.

## Despliegue

- `backend/Dockerfile` multi-stage: build con Maven + runtime ligero (JRE 21, virtual threads activados).
- `docker-compose.yml`: app + Postgres con healthcheck; credenciales solo por variables de entorno.
- Preparado para Railway/Render/Cloud Run: la imagen expone el 8080 y lee toda su configuración del entorno.
