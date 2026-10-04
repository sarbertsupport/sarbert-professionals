package com.albert.microservices.teaching.marketplace.configs;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConfigurationProperties(prefix = "app.ms")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AppConfig {
    private String cloudName;
    private String apiKey;
    private String apiSecret;
    private String folderName;
    private int maxFileSize;
    private int maxNumberOfSubjects;

    @Bean
    public Cloudinary cloudinary() {
        return new Cloudinary(ObjectUtils.asMap(
                "cloud_name", cloudName,
                "api_key", apiKey,
                "api_secret", apiSecret));
    }
}
