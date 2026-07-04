# Use when Render build context = repo root (Dockerfile at root).
# If you set Root Directory = Backend instead, use Backend/Dockerfile with context Backend.
FROM eclipse-temurin:17-jdk-jammy AS build
WORKDIR /app

COPY backend/.mvn/wrapper/ .mvn/wrapper/
COPY backend/mvnw backend/pom.xml ./
RUN sed -i 's/\r$//' mvnw && chmod +x mvnw

COPY backend/src ./src
RUN ./mvnw -B clean package -DskipTests

FROM eclipse-temurin:17-jre-jammy
WORKDIR /app

COPY --from=build /app/target/farmsync-server-0.0.1-SNAPSHOT.jar app.jar

ENV PORT=9090
EXPOSE 9090

ENTRYPOINT ["sh", "-c", "exec java -Dserver.port=${PORT:-9090} -Dserver.address=0.0.0.0 -jar /app/app.jar"]
