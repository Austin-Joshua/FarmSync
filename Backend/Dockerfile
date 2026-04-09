# Build stage: JDK + Maven wrapper (Render needs Java in the build image, not Node)
FROM eclipse-temurin:17-jdk-jammy AS build
WORKDIR /app

COPY .mvn/wrapper/ .mvn/wrapper/
COPY mvnw pom.xml ./
RUN sed -i 's/\r$//' mvnw && chmod +x mvnw

COPY src ./src
RUN ./mvnw -B clean package -DskipTests

# Run stage
FROM eclipse-temurin:17-jre-jammy
WORKDIR /app

COPY --from=build /app/target/farmsync-server-0.0.1-SNAPSHOT.jar app.jar

# Render sets PORT; Spring reads server.port=${PORT:9090} in application.properties
ENV PORT=9090
EXPOSE 9090

ENTRYPOINT ["java", "-jar", "/app/app.jar"]
