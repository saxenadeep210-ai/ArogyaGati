package org.arogyagati.config;

import java.util.Arrays;
import java.util.List;
import org.arogyagati.security.JwtAuthenticationFilter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    @Value("${cors.allowed-origins:http://localhost:3000,http://localhost:5173,http://127.0.0.1:3000}")
    private String allowedOrigins;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(AbstractHttpConfigurer::disable)
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                // Public authentication and onboarding endpoints
                .requestMatchers("/api/v1/auth/**", "/api/auth/**").permitAll()
                // Public hospital transparency telemetry (strictly aggregated, zero PII)
                .requestMatchers("/api/v1/transparency/**", "/api/transparency/**").permitAll()
                // Public directory and availability endpoints
                .requestMatchers("/api/v1/departments/**", "/api/departments/**").permitAll()
                .requestMatchers("/api/v1/doctors", "/api/doctors").permitAll()
                .requestMatchers("/api/v1/beds", "/api/v1/beds/available", "/api/beds/**").permitAll()
                .requestMatchers("/api/v1/tokens/lookup/**", "/api/tokens/lookup/**").permitAll()
                // Health and monitoring
                .requestMatchers("/api/health/**", "/actuator/**", "/error").permitAll()
                // WebSocket STOMP endpoint
                .requestMatchers("/ws/**").permitAll()
                // Static assets / documentation
                .requestMatchers("/", "/index.html", "/favicon.ico").permitAll()

                // Role-Specific Protected Endpoints
                .requestMatchers("/api/v1/admin/**").hasAnyRole("ADMIN", "STAFF_ADMIN")
                .requestMatchers("/api/v1/audit/**").hasAnyRole("ADMIN", "STAFF_ADMIN")
                .requestMatchers("/api/v1/doctors/**").hasAnyRole("DOCTOR", "ADMIN", "STAFF_ADMIN")
                .requestMatchers("/api/v1/emergency/**").hasAnyRole("AMBULANCE", "PARAMEDIC", "ADMIN", "DOCTOR", "PATIENT")
                .requestMatchers("/api/v1/tokens/call-next").hasAnyRole("DOCTOR", "ADMIN", "STAFF_ADMIN")

                // All other API endpoints require valid JWT authentication
                .anyRequest().authenticated()
            );

        http.addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        List<String> origins = Arrays.asList(allowedOrigins.split(","));
        configuration.setAllowedOrigins(origins);
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type", "Accept", "X-Requested-With", "Origin", "Access-Control-Request-Method", "Access-Control-Request-Headers"));
        configuration.setExposedHeaders(Arrays.asList("Authorization", "Content-Disposition"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
