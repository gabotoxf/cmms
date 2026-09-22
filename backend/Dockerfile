# ===== Etapa 1: build con Maven =====
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app

# Cachea dependencias: si pom.xml no cambia, no se re-descarga todo
COPY pom.xml .
RUN mvn -q dependency:go-offline

COPY src ./src
RUN mvn -q package -DskipTests

# ===== Etapa 2: runtime ligero =====
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

COPY --from=build /app/target/*.jar app.jar

EXPOSE 8080

# Virtual threads activados por config (application.yml)
ENTRYPOINT ["java", "-jar", "app.jar"]
