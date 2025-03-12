FROM openjdk:17-jdk-alpine

# Set working directory to /app
WORKDIR /app

# Copy the .jar file into the container at /app
COPY target/quiz-0.0.1-SNAPSHOT.jar /app/

# Expose port 8080 to the docker host, so we can access it
# from the outside.
EXPOSE 8080

# Run app.jar when the container launches
CMD ["java", "-jar", "quiz-0.0.1-SNAPSHOT.jar"]
