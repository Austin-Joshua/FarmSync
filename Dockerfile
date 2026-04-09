# Use when Render build context = repo root (Dockerfile at root).
# If you set Root Directory = Backend instead, use Backend/Dockerfile with context Backend.
FROM eclipse-temurin:17-jdk-jammy AS build
WORKDIR /app

COPY Backend/.mvn/wrapper/ .mvn/wrapper/
COPY Backend/mvnw Backend/pom.xml ./
RUN sed -i 's/\r$//' mvnw && chmod +x mvnw

COPY Backend/src ./src
RUN ./mvnw -B clean package -DskipTests

FROM eclipse-temurin:17-jre-jammy
WORKDIR /app

COPY --from=build /app/target/farmsync-server-0.0.1-SNAPSHOT.jar app.jar

ENV PORT=9090
EXPOSE 9090

ENTRYPOINT ["java", "-jar", "/app/app.jar"]
