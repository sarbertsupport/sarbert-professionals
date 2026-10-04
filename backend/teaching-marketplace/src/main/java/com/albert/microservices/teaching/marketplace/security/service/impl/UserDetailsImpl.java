package com.albert.microservices.teaching.marketplace.security.service.impl;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;

public class UserDetailsImpl implements UserDetails {
    private String username;
    private String password;
    private boolean activeStatus;
    private boolean locked;
    private String email;
    private List<GrantedAuthority> authorities;

    public UserDetailsImpl(String username, String password, boolean activeStatus,
                           boolean locked, String email, List<GrantedAuthority> authorities) {
        this.username = username;
        this.password = password;
        this.activeStatus = activeStatus;
        this.locked = locked;
        this.email = email;
        this.authorities = authorities;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return authorities;
    }

    @Override
    public String getPassword() {
        return password;
    }

    @Override
    public String getUsername() {
        return username;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return locked;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return activeStatus;
    }
}
