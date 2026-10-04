package com.albert.microservices.teaching.marketplace;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class TeachingMarketplaceApplication {

	public static void main(String[] args) {
		SpringApplication.run(TeachingMarketplaceApplication.class, args);
	}

}
