package com.albert.microservices.teaching.marketplace.security.jwt;


import com.albert.microservices.teaching.marketplace.exception.CustomAuthenticationException;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import io.jsonwebtoken.JwtException;

@Component
public class JwtUtil {
    private static final Logger logger = LoggerFactory.getLogger(JwtUtil.class);
    
    @Value("${jwt.secret}")
    private String secretKey;

    @Value("${jwt.expiration}")
    private long jwtExpirationInMillis;

    public String generateToken(String username,int userId, String roles,String permissions) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("roles", roles);
        claims.put("permissions", permissions);
        String token = createToken(claims, username,userId);
        return token;

    }

    private Key getKey() {
        return Keys.hmacShaKeyFor(secretKey.getBytes(StandardCharsets.UTF_8));
    }

    // SECURE: Update createToken method to include issuer and audience
    private String createToken(Map<String, Object> claims, String subject, int userId) {
        return Jwts.builder()
                .setClaims(claims)
                .setSubject(subject)
                .setId(String.valueOf(userId))
                .setIssuer("teaching-marketplace")
                .setAudience("teaching-marketplace-users")
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + jwtExpirationInMillis))
                .signWith(getKey())
                .compact();
    }
    public Integer extractUserId(String token) {
        try {
            return Integer.valueOf(extractClaim(token, Claims::getId));
        } catch (JwtException | IllegalArgumentException e) {
            logger.warn("extractUserId failed: {}", e.getMessage());
            throw new CustomAuthenticationException("401", "Invalid Token", "The token provided is invalid or expired");
        }
    }
    //extract username from token
    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    //extract expiration time from token
    public Date extractExpirationTime(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    public Claims extractAllClaims(String token) {
        return Jwts.
                parserBuilder()
                .setSigningKey(getKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    public List<String> extractRoles(String token) {
        final Claims claims = extractAllClaims(token);
        String rolesString = claims.get("roles", String.class);
        return Arrays.stream(rolesString.split(","))
                .collect(Collectors.toList());
    }

    public Boolean isTokenExpired(String token) {
        return extractExpirationTime(token).before(new Date());
    }

    public Boolean validateToken(String token, String userName) {
        final String extractedUsername = extractUsername(token);
        return (extractedUsername.equals(userName) && !isTokenExpired(token));
    }

    public Boolean validateTokenWithoutUsername(String token) {
        // Implementation here to check token validity
        return !isTokenExpired(token); // Simplified; add additional checks as needed
    }

    // SECURE: Update parseToken method with proper validation
    public Claims parseToken(String token) {
        try {
            return Jwts.parserBuilder()
                    .setSigningKey(getKey())
                    .requireIssuer("teaching-marketplace")
                    .requireAudience("teaching-marketplace-users")
                    .build()
                    .parseClaimsJws(token)
                    .getBody();
        } catch (JwtException e) {
            logger.error("JWT validation failed: {}", e.getMessage());
            throw new CustomAuthenticationException("401", "Invalid Token", "The token provided is invalid or expired");
        }
    }
    public List<String> extractPermissions(String token) {
        final Claims claims = extractAllClaims(token);
        String permissionsString = claims.get("permissions", String.class);
        if (permissionsString != null && !permissionsString.isEmpty()) {
            return Arrays.stream(permissionsString.split(","))
                    .collect(Collectors.toList());
        }
        return Collections.emptyList(); // Return an empty list if no permissions are found
    }

}
