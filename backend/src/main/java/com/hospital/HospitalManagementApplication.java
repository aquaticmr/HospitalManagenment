package com.hospital;

import io.github.cdimascio.dotenv.Dotenv;
import io.github.cdimascio.dotenv.DotenvEntry;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class HospitalManagementApplication {
    public static void main(String[] args) {
        Dotenv dotenv = Dotenv.configure()
                .ignoreIfMissing()
                .load();

        if (dotenv != null) {
            System.out.println("--- Loading .env contents ---");
            for (DotenvEntry entry : dotenv.entries()) {
                System.setProperty(entry.getKey(), entry.getValue());
                System.out.println("Loaded: " + entry.getKey());
            }
            System.out.println("-----------------------------");
        } else {
            System.out.println("--- .env file NOT FOUND ---");
        }

        SpringApplication.run(HospitalManagementApplication.class, args);
    }
}
