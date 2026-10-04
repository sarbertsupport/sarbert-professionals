# Use Maven image with OpenJDK 17 to build the project
FROM maven:3.8.4-openjdk-17 AS build

# Set the working directory inside the container
WORKDIR /app

# Copy the Maven configuration file (pom.xml) to the container
COPY pom.xml .

# Download project dependencies to speed up builds by caching dependencies
RUN mvn dependency:go-offline

# Copy the source code into the container
COPY src ./src

# Build the project, skipping tests to save time
RUN mvn clean package -DskipTests

# Use a lightweight OpenJDK 17 runtime image for running the application
FROM openjdk:17-jdk-slim

# Set the working directory in the runtime container
WORKDIR /app

# Copy the built JAR file from the build stage
COPY --from=build /app/target/teaching-marketplace-0.0.1-SNAPSHOT.jar .

# Expose port 8080 to allow outside access to the application
EXPOSE 8080

# Specify the command to run the Spring Boot application
ENTRYPOINT ["java", "-jar", "/app/teaching-marketplace-0.0.1-SNAPSHOT.jar"]
