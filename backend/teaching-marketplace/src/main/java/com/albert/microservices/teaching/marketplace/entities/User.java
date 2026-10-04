package com.albert.microservices.teaching.marketplace.entities;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.Transient;
import org.springframework.data.relational.core.mapping.Column;
import org.springframework.data.relational.core.mapping.Table;
import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Table("users")
public class User {
    @Id
    @Column("user_id")
    private Integer userId;

    @NotBlank(message = "Username cannot be blank")
    @Size(min = 4, max = 20, message = "Username must be 4-20 characters")
    @Pattern(
            regexp = "^[a-zA-Z0-9_]+$",
            message = "Username can only contain letters, numbers and underscores"
    )
    @Column("username")
    private String username;

    @NotBlank(message = "Password cannot be blank")
    @Size(min = 8, max = 100, message = "Password must be 8-100 characters long")
    @Pattern(
            regexp = "^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=!])(?=\\S+$).{8,}$",
            message = "Password must contain: " +
                    "1 uppercase letter, " +
                    "1 lowercase letter, " +
                    "1 number, " +
                    "1 special character (@#$%^&+=!), " +
                    "and no whitespace"
    )
    @Column("password")
    private String password;

    @Transient
    private String confirmPassword;

    @Transient
    private String joinAs;

    @Column("email")
    @NotBlank(message = "email is required")
    @Email(message = "Email must be a valid email")
    private String email;

    @Column("active_status")
    private Boolean activeStatus;

    @Column("login_attempts")
    private Integer loginAttempts;

    @Column("last_login_attempt")
    private LocalDateTime lastLoginAttempt;

    @Column("locked")
    private Boolean locked;

    @Column("activation_token")
    private String activationToken;

    @Column("token_expiration")
    private LocalDateTime tokenExpiration;

    @Column("role_id")
    private Integer roleId;

    @Column("current_step")
    private ProfileStep currentStep;
    @Column("accepted_our_terms")
    private boolean accepted;
    @Column("reset_token")
    private String resetToken;

    @Column("reset_token_expiration")
    private LocalDateTime resetTokenExpiration;

    @Column("mfa_enabled")
    private Boolean mfaEnabled;

    @Column("mfa_failed_attempts")
    private Integer mfaFailedAttempts;

    @Column("mfa_locked_until")
    private LocalDateTime mfaLockedUntil;

    @Column("created_at")
    private LocalDateTime createdAt;
}
