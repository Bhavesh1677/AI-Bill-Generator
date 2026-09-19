# Stage 1: Build the application
FROM maven:3.9.9-eclipse-temurin-21-alpine AS build
WORKDIR /app

# Copy pom.xml and source code
COPY pom.xml .
COPY src ./src

# Build production jar skipping tests
RUN mvn clean package -DskipTests

# Stage 2: Run the application
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Create upload directory for logos
RUN mkdir -p public/uploads/logos

# Copy the built jar from build stage
COPY --from=build /app/target/ai-bill-generator-backend-1.0.0.jar app.jar

# Expose port
EXPOSE 8000

# Set entrypoint
ENTRYPOINT ["java", "-jar", "app.jar"]
