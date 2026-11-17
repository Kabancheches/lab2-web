FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /build
COPY server/ .
RUN mvn -q package

FROM eclipse-temurin:17-jre
WORKDIR /app
COPY --from=build /build/target/server.jar .
COPY --from=build /build/lib/fastcgi-lib.jar .

EXPOSE 9000
CMD ["java", "-DFCGI_PORT=9000", "-jar", "server.jar"]
