package com.albert.microservices.teaching.marketplace.services;

import com.albert.microservices.teaching.marketplace.entities.AdminMfaChallenge;
import com.albert.microservices.teaching.marketplace.entities.AdminMfaOtpSendLog;
import com.albert.microservices.teaching.marketplace.entities.User;
import com.albert.microservices.teaching.marketplace.repositories.AdminMfaChallengeRepository;
import com.albert.microservices.teaching.marketplace.repositories.AdminMfaOtpSendLogRepository;
import com.albert.microservices.teaching.marketplace.repositories.UserRepository;
import com.albert.microservices.teaching.marketplace.response.ApiResponse;
import com.albert.microservices.teaching.marketplace.security.service.LoginJwtResponseService;
import com.albert.microservices.teaching.marketplace.support.AdminMfaChallengeType;
import com.albert.microservices.teaching.marketplace.utils.MfaEmailMask;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.ReactiveUserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import reactor.core.publisher.Mono;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;

import static com.albert.microservices.teaching.marketplace.utils.Constants.CODE_SUCCESS;

@Service
@RequiredArgsConstructor
public class AdminMfaService {

    private static final SecureRandom RNG = new SecureRandom();
    private static final int OTP_TTL_MINUTES = 3;
    private static final int MAX_SENDS_PER_MINUTE = 5;
    private static final int MAX_OTP_FAILURES = 5;
    private static final int LOCK_MINUTES = 15;

    private final AdminMfaChallengeRepository challengeRepository;
    private final AdminMfaOtpSendLogRepository sendLogRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;
    private final PasswordEncoder passwordEncoder;
    private final LoginJwtResponseService loginJwtResponseService;
    private final ReactiveUserDetailsService userDetailsService;

    public Mono<User> clearExpiredMfaLockIfNeeded(User user) {
        if (user.getMfaLockedUntil() == null) {
            return Mono.just(user);
        }
        if (user.getMfaLockedUntil().isAfter(LocalDateTime.now())) {
            return Mono.just(user);
        }
        return userRepository.updateMfaLockState(user.getUserId(), 0, null)
                .then(userRepository.findById(user.getUserId()))
                .switchIfEmpty(Mono.just(user));
    }

    public boolean isAccountMfaLocked(User user) {
        return user.getMfaLockedUntil() != null && user.getMfaLockedUntil().isAfter(LocalDateTime.now());
    }

    public Mono<ResponseEntity<ApiResponse>> maybeRequireAdminMfa(User user, Authentication authentication) {
        return clearExpiredMfaLockIfNeeded(user)
                .flatMap(u -> userRepository.findById(u.getUserId()).switchIfEmpty(Mono.just(u)))
                .flatMap(fresh -> {
                    if (!Boolean.TRUE.equals(fresh.getMfaEnabled())) {
                        return loginJwtResponseService.buildJwtResponse(fresh.getEmail(), authentication);
                    }
                    if (isAccountMfaLocked(fresh)) {
                        return Mono.just(ResponseEntity.status(HttpStatus.LOCKED)
                                .body(ApiResponse.createResponse(423,
                                        "Too many failed verification attempts. Try again later.",
                                        "Account temporarily locked",
                                        null)));
                    }
                    return beginOtpChallengeForUser(fresh, AdminMfaChallengeType.LOGIN);
                });
    }

    public Mono<ResponseEntity<ApiResponse>> verifyLoginMfa(String sessionToken, String otp) {
        if (otp == null || !otp.matches("\\d{6}")) {
            return Mono.just(ResponseEntity.badRequest()
                    .body(ApiResponse.createResponse(400, "Invalid code format", "Bad Request", null)));
        }
        return challengeRepository.findBySessionToken(sessionToken)
                .switchIfEmpty(Mono.error(new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid or expired session")))
                .flatMap(ch -> validateActiveChallenge(ch, AdminMfaChallengeType.LOGIN))
                .flatMap(ch -> userRepository.findById(ch.getUserId())
                        .switchIfEmpty(Mono.error(new ResponseStatusException(HttpStatus.BAD_REQUEST, "User not found")))
                        .flatMap(u -> {
                            if (isAccountMfaLocked(u)) {
                                return Mono.just(ResponseEntity.status(HttpStatus.LOCKED)
                                        .body(ApiResponse.createResponse(423, "Account locked", "Try later", null)));
                            }
                            if (!passwordEncoder.matches(otp, ch.getOtpHash())) {
                                return recordFailedAttempt(u);
                            }
                            return challengeRepository.markConsumed(ch.getId(), LocalDateTime.now())
                                    .then(userRepository.updateMfaLockState(u.getUserId(), 0, null))
                                    .then(userDetailsService.findByUsername(u.getEmail())
                                            .flatMap(ud -> {
                                                Authentication auth = new UsernamePasswordAuthenticationToken(
                                                        ud, null, ud.getAuthorities());
                                                return loginJwtResponseService.buildJwtResponse(u.getEmail(), auth);
                                            }));
                        }));
    }

    public Mono<ResponseEntity<ApiResponse>> requestEnableMfa(Integer userId) {
        return userRepository.findById(userId)
                .switchIfEmpty(Mono.error(new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found")))
                .flatMap(u -> {
                    if (Boolean.TRUE.equals(u.getMfaEnabled())) {
                        return Mono.error(new ResponseStatusException(HttpStatus.BAD_REQUEST, "MFA is already enabled"));
                    }
                    return clearExpiredMfaLockIfNeeded(u);
                })
                .flatMap(u -> {
                    if (isAccountMfaLocked(u)) {
                        return Mono.just(ResponseEntity.status(HttpStatus.LOCKED)
                                .body(ApiResponse.createResponse(423, "Account locked", "Try later", null)));
                    }
                    return beginOtpChallengeForUser(u, AdminMfaChallengeType.ENABLE_MFA);
                });
    }

    public Mono<ResponseEntity<ApiResponse>> confirmEnableMfa(String sessionToken, String otp) {
        if (otp == null || !otp.matches("\\d{6}")) {
            return Mono.just(ResponseEntity.badRequest()
                    .body(ApiResponse.createResponse(400, "Invalid code format", "Bad Request", null)));
        }
        return challengeRepository.findBySessionToken(sessionToken)
                .switchIfEmpty(Mono.error(new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid session")))
                .flatMap(ch -> validateActiveChallenge(ch, AdminMfaChallengeType.ENABLE_MFA))
                .flatMap(ch -> userRepository.findById(ch.getUserId())
                        .switchIfEmpty(Mono.error(new ResponseStatusException(HttpStatus.BAD_REQUEST, "User not found")))
                        .flatMap(u -> {
                            if (isAccountMfaLocked(u)) {
                                return Mono.just(ResponseEntity.status(HttpStatus.LOCKED)
                                        .body(ApiResponse.createResponse(423, "Account locked", "Try later", null)));
                            }
                            if (!passwordEncoder.matches(otp, ch.getOtpHash())) {
                                return recordFailedAttempt(u);
                            }
                            return challengeRepository.markConsumed(ch.getId(), LocalDateTime.now())
                                    .then(userRepository.updateMfaEnabled(u.getUserId(), true))
                                    .then(userRepository.updateMfaLockState(u.getUserId(), 0, null))
                                    .then(Mono.just(ResponseEntity.ok(ApiResponse.createResponse(CODE_SUCCESS,
                                            "Two-factor authentication is now enabled",
                                            "OK",
                                            Map.of("mfaEnabled", true)))));
                        }));
    }

    public Mono<ResponseEntity<ApiResponse>> requestDisableMfa(Integer userId) {
        return userRepository.findById(userId)
                .switchIfEmpty(Mono.error(new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found")))
                .flatMap(u -> {
                    if (!Boolean.TRUE.equals(u.getMfaEnabled())) {
                        return Mono.error(new ResponseStatusException(HttpStatus.BAD_REQUEST, "MFA is not enabled"));
                    }
                    return clearExpiredMfaLockIfNeeded(u);
                })
                .flatMap(u -> {
                    if (isAccountMfaLocked(u)) {
                        return Mono.just(ResponseEntity.status(HttpStatus.LOCKED)
                                .body(ApiResponse.createResponse(423, "Account locked", "Try later", null)));
                    }
                    return beginOtpChallengeForUser(u, AdminMfaChallengeType.DISABLE_MFA);
                });
    }

    public Mono<ResponseEntity<ApiResponse>> confirmDisableMfa(String sessionToken, String otp) {
        if (otp == null || !otp.matches("\\d{6}")) {
            return Mono.just(ResponseEntity.badRequest()
                    .body(ApiResponse.createResponse(400, "Invalid code format", "Bad Request", null)));
        }
        return challengeRepository.findBySessionToken(sessionToken)
                .switchIfEmpty(Mono.error(new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid session")))
                .flatMap(ch -> validateActiveChallenge(ch, AdminMfaChallengeType.DISABLE_MFA))
                .flatMap(ch -> userRepository.findById(ch.getUserId())
                        .switchIfEmpty(Mono.error(new ResponseStatusException(HttpStatus.BAD_REQUEST, "User not found")))
                        .flatMap(u -> {
                            if (isAccountMfaLocked(u)) {
                                return Mono.just(ResponseEntity.status(HttpStatus.LOCKED)
                                        .body(ApiResponse.createResponse(423, "Account locked", "Try later", null)));
                            }
                            if (!passwordEncoder.matches(otp, ch.getOtpHash())) {
                                return recordFailedAttempt(u);
                            }
                            return challengeRepository.markConsumed(ch.getId(), LocalDateTime.now())
                                    .then(userRepository.updateMfaEnabled(u.getUserId(), false))
                                    .then(userRepository.updateMfaLockState(u.getUserId(), 0, null))
                                    .then(Mono.just(ResponseEntity.ok(ApiResponse.createResponse(CODE_SUCCESS,
                                            "Two-factor authentication has been disabled",
                                            "OK",
                                            Map.of("mfaEnabled", false)))));
                        }));
    }

    public Mono<ResponseEntity<ApiResponse>> mfaStatus(Integer userId) {
        return userRepository.findById(userId)
                .switchIfEmpty(Mono.error(new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found")))
                .map(u -> {
                    Map<String, Object> m = new LinkedHashMap<>();
                    m.put("mfaEnabled", Boolean.TRUE.equals(u.getMfaEnabled()));
                    m.put("mfaLocked", isAccountMfaLocked(u));
                    if (u.getMfaLockedUntil() != null) {
                        m.put("mfaLockedUntil", u.getMfaLockedUntil().toString());
                    }
                    return ResponseEntity.ok(ApiResponse.createResponse(CODE_SUCCESS, "OK", "OK", m));
                });
    }

    private Mono<ResponseEntity<ApiResponse>> beginOtpChallengeForUser(User user, String challengeType) {
        LocalDateTime since = LocalDateTime.now().minusMinutes(1);
        return sendLogRepository.countRecentSends(user.getUserId(), since)
                .defaultIfEmpty(0L)
                .flatMap(count -> {
                    if (count >= MAX_SENDS_PER_MINUTE) {
                        return Mono.just(ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                                .body(ApiResponse.createResponse(429,
                                        "Too many codes requested. Wait one minute.",
                                        "Rate limited",
                                        null)));
                    }
                    return challengeRepository.deleteActiveForUserAndType(user.getUserId(), challengeType)
                            .then(persistChallengeSendEmail(user, challengeType));
                });
    }

    private Mono<ResponseEntity<ApiResponse>> persistChallengeSendEmail(User user, String challengeType) {
        String otpPlain = generateOtpDigits();
        String otpHash = passwordEncoder.encode(otpPlain);
        String sessionToken = generateSessionTokenHex();
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime exp = now.plusMinutes(OTP_TTL_MINUTES);

        AdminMfaChallenge ch = new AdminMfaChallenge();
        ch.setUserId(user.getUserId());
        ch.setSessionToken(sessionToken);
        ch.setChallengeType(challengeType);
        ch.setOtpHash(otpHash);
        ch.setExpiresAt(exp);
        ch.setCreatedAt(now);

        String subject = "SkillBridge admin verification code";
        String body = emailBodyFor(challengeType, otpPlain);

        return challengeRepository.save(ch)
                .flatMap(saved -> {
                    AdminMfaOtpSendLog row = new AdminMfaOtpSendLog(null, user.getUserId(), now);
                    return sendLogRepository.save(row)
                            .then(emailService.sendEmail(user.getEmail(), subject, body))
                            .thenReturn(mfaRequiredResponse(user.getEmail(), sessionToken, exp));
                });
    }

    private static String emailBodyFor(String challengeType, String otpPlain) {
        String intro = switch (challengeType) {
            case AdminMfaChallengeType.LOGIN ->
                    "You are signing in to SkillBridge admin. Your one-time code is:";
            case AdminMfaChallengeType.ENABLE_MFA ->
                    "You are enabling two-factor authentication. Your one-time code is:";
            case AdminMfaChallengeType.DISABLE_MFA ->
                    "You are disabling two-factor authentication. Your one-time code is:";
            default -> "Your SkillBridge admin one-time code is:";
        };
        return intro + "\n\n" + otpPlain + "\n\nThis code expires in " + OTP_TTL_MINUTES
                + " minutes. If you did not request it, secure your account and contact support.";
    }

    private ResponseEntity<ApiResponse> mfaRequiredResponse(String email, String sessionToken, LocalDateTime expiresAt) {
        long seconds = java.time.Duration.between(LocalDateTime.now(), expiresAt).getSeconds();
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("requiresMfa", true);
        payload.put("mfaSessionToken", sessionToken);
        payload.put("maskedEmail", MfaEmailMask.mask(email));
        payload.put("expiresInSeconds", Math.max(0, seconds));
        return ResponseEntity.ok(ApiResponse.createResponse(CODE_SUCCESS, "Verification required", "MFA", payload));
    }

    private Mono<AdminMfaChallenge> validateActiveChallenge(AdminMfaChallenge ch, String expectedType) {
        if (ch.getConsumedAt() != null) {
            return Mono.error(new ResponseStatusException(HttpStatus.BAD_REQUEST, "Code already used"));
        }
        if (ch.getExpiresAt().isBefore(LocalDateTime.now())) {
            return Mono.error(new ResponseStatusException(HttpStatus.BAD_REQUEST, "Code expired"));
        }
        if (!expectedType.equals(ch.getChallengeType())) {
            return Mono.error(new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid session"));
        }
        return Mono.just(ch);
    }

    private Mono<ResponseEntity<ApiResponse>> recordFailedAttempt(User u) {
        int fails = u.getMfaFailedAttempts() == null ? 0 : u.getMfaFailedAttempts();
        fails++;
        if (fails >= MAX_OTP_FAILURES) {
            return userRepository.updateMfaLockState(u.getUserId(), 0, LocalDateTime.now().plusMinutes(LOCK_MINUTES))
                    .then(Mono.just(ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                            .body(ApiResponse.createResponse(401,
                                    "Too many failed attempts. Account locked for 15 minutes.",
                                    "Invalid code",
                                    null))));
        }
        return userRepository.updateMfaLockState(u.getUserId(), fails, null)
                .then(Mono.just(ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(ApiResponse.createResponse(401, "Invalid verification code", "Invalid code", null))));
    }

    private static String generateOtpDigits() {
        return String.format("%06d", RNG.nextInt(1_000_000));
    }

    private static final char[] HEX_LOWER = "0123456789abcdef".toCharArray();

    private static String generateSessionTokenHex() {
        byte[] b = new byte[32];
        RNG.nextBytes(b);
        return bytesToLowerHex(b);
    }

    /** Lowercase hex encoding (same shape as {@code HexFormat#formatHex} on Java 17+). */
    private static String bytesToLowerHex(byte[] bytes) {
        char[] out = new char[bytes.length * 2];
        for (int i = 0; i < bytes.length; i++) {
            int v = bytes[i] & 0xFF;
            out[i * 2] = HEX_LOWER[v >>> 4];
            out[i * 2 + 1] = HEX_LOWER[v & 0x0F];
        }
        return new String(out);
    }
}
