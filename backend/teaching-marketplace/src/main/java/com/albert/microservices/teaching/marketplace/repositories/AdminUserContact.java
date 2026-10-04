package com.albert.microservices.teaching.marketplace.repositories;

/**
 * Small projection for admin UIs: read only {@code users.email} and {@code users.username}
 * without hydrating the full {@link com.albert.microservices.teaching.marketplace.entities.User}
 * entity (avoids mapping failures on other columns).
 */
public interface AdminUserContact {
    String getEmail();

    String getUsername();
}
