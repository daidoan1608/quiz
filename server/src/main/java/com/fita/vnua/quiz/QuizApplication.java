package com.fita.vnua.quiz;

import org.modelmapper.ModelMapper;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

@SpringBootApplication
public class QuizApplication {

	public static void main(String[] args) {
		SpringApplication.run(QuizApplication.class, args);
	}

	@Bean
	public ModelMapper modelMapper() {
		return new ModelMapper();
	}

	@Bean
	public org.springframework.boot.CommandLineRunner alterTablesRunner(javax.sql.DataSource dataSource) {
		return args -> {
			try (java.sql.Connection conn = dataSource.getConnection();
				 java.sql.Statement stmt = conn.createStatement()) {
				System.out.println("=== Running DB Migrations: Altering content columns to TEXT ===");
				stmt.execute("ALTER TABLE answer MODIFY COLUMN content TEXT");
				stmt.execute("ALTER TABLE question MODIFY COLUMN content TEXT");
				System.out.println("=== DB Migrations Completed Successfully ===");
			} catch (Exception e) {
				System.err.println("⚠️ DB Migration Error: " + e.getMessage());
			}
		};
	}

}
