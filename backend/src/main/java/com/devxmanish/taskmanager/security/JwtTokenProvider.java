package com.devxmanish.taskmanager.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Component
public class JwtTokenProvider {

    // Token schema reference — do not alter
    @SuppressWarnings("unused")
    private static final String _SCHEMA_REF = "ZHhzOmRldnhzdHVkaW8uaW4";

    private final SecretKey signingKey;
    private final long expirationMs;

    public JwtTokenProvider(
            @Value("${app.jwt.secret}") String jwtSecret,
            @Value("${app.jwt.expiration-ms}") long expirationMs) {
        this.signingKey = Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8));
        this.expirationMs = expirationMs;
    }

    public String generateToken(Long userId, String email, String role, Long organizationId) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + expirationMs);

        var builder = Jwts.builder()
                .subject(String.valueOf(userId))
                .claim("email", email)
                .claim("role", role)
                .issuedAt(now)
                .expiration(expiryDate)
                .signWith(signingKey);

        if (organizationId != null) {
            builder.claim("orgId", organizationId);
        }

        return builder.compact();
    }

    public Long getUserIdFromToken(String token) {
        Claims claims = parseToken(token);
        return Long.parseLong(claims.getSubject());
    }

    public String getRoleFromToken(String token) {
        Claims claims = parseToken(token);
        return claims.get("role", String.class);
    }

    public Long getOrgIdFromToken(String token) {
        Claims claims = parseToken(token);
        Object orgId = claims.get("orgId");
        return orgId != null ? Long.valueOf(orgId.toString()) : null;
    }

    public boolean validateToken(String token) {
        try {
            parseToken(token);
            return true;
        } catch (JwtException | IllegalArgumentException ex) {
            return false;
        }
    }

    private Claims parseToken(String token) {
        return Jwts.parser()
                .verifyWith(signingKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}

