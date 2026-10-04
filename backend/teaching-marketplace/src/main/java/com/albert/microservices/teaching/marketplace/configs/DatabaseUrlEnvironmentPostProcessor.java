package com.albert.microservices.teaching.marketplace.configs;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.env.EnvironmentPostProcessor;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.core.env.ConfigurableEnvironment;
import org.springframework.core.env.MapPropertySource;

import java.util.HashMap;
import java.util.Map;

/**
 * Ensures both R2DBC (app) and JDBC (Flyway) URLs are available.
 * Accepts DATASOURCE_URL as either {@code jdbc:postgresql://...} or {@code r2dbc:postgresql://...}.
 */
@Order(Ordered.LOWEST_PRECEDENCE)
public class DatabaseUrlEnvironmentPostProcessor implements EnvironmentPostProcessor {

    private static final String PROPERTY_SOURCE = "databaseUrlAliases";

    @Override
    public void postProcessEnvironment(ConfigurableEnvironment environment, SpringApplication application) {
        String datasourceUrl = firstNonBlank(
                environment.getProperty("DATASOURCE_URL"),
                environment.getProperty("spring.r2dbc.url")
        );
        String jdbcOverride = firstNonBlank(
                environment.getProperty("DATASOURCE_JDBC_URL"),
                environment.getProperty("spring.datasource.url"),
                environment.getProperty("spring.flyway.url")
        );

        if (datasourceUrl == null && jdbcOverride == null) {
            return;
        }

        String jdbcUrl = jdbcOverride;
        String r2dbcUrl = null;

        if (datasourceUrl != null) {
            if (datasourceUrl.startsWith("r2dbc:")) {
                r2dbcUrl = datasourceUrl;
                if (jdbcUrl == null || jdbcUrl.startsWith("r2dbc:")) {
                    jdbcUrl = toJdbc(datasourceUrl);
                }
            } else if (datasourceUrl.startsWith("jdbc:")) {
                jdbcUrl = datasourceUrl;
                r2dbcUrl = toR2dbc(datasourceUrl);
            }
        } else if (jdbcUrl != null) {
            r2dbcUrl = toR2dbc(jdbcUrl);
            if (jdbcUrl.startsWith("r2dbc:")) {
                jdbcUrl = toJdbc(jdbcUrl);
            }
        }

        // Normalize accidental scheme mismatches from defaults / env
        if (jdbcUrl != null && jdbcUrl.startsWith("r2dbc:")) {
            jdbcUrl = toJdbc(jdbcUrl);
        }
        if (r2dbcUrl != null && r2dbcUrl.startsWith("jdbc:")) {
            r2dbcUrl = toR2dbc(r2dbcUrl);
        }

        Map<String, Object> aliases = new HashMap<>();
        if (r2dbcUrl != null) {
            aliases.put("spring.r2dbc.url", r2dbcUrl);
        }
        if (jdbcUrl != null) {
            aliases.put("spring.datasource.url", jdbcUrl);
            aliases.put("spring.flyway.url", jdbcUrl);
        }

        if (!aliases.isEmpty()) {
            environment.getPropertySources().addFirst(new MapPropertySource(PROPERTY_SOURCE, aliases));
        }
    }

    private static String toJdbc(String url) {
        if (url == null) {
            return null;
        }
        if (url.startsWith("r2dbc:pool:")) {
            return "jdbc:" + url.substring("r2dbc:pool:".length());
        }
        if (url.startsWith("r2dbc:")) {
            return "jdbc:" + url.substring("r2dbc:".length());
        }
        return url;
    }

    private static String toR2dbc(String url) {
        if (url == null) {
            return null;
        }
        if (url.startsWith("jdbc:")) {
            return "r2dbc:" + url.substring("jdbc:".length());
        }
        return url;
    }

    private static String firstNonBlank(String... values) {
        if (values == null) {
            return null;
        }
        for (String value : values) {
            if (value != null && !value.isBlank()) {
                return value.trim();
            }
        }
        return null;
    }
}
