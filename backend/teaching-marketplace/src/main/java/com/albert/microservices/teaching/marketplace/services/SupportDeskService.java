package com.albert.microservices.teaching.marketplace.services;

import com.albert.microservices.teaching.marketplace.entities.SupportTicket;
import com.albert.microservices.teaching.marketplace.entities.SupportTicketMessage;
import com.albert.microservices.teaching.marketplace.entities.User;
import com.albert.microservices.teaching.marketplace.repositories.SupportTicketAdminQueryRepository;
import com.albert.microservices.teaching.marketplace.repositories.SupportTicketMessageRepository;
import com.albert.microservices.teaching.marketplace.repositories.SupportTicketRepository;
import com.albert.microservices.teaching.marketplace.repositories.UserRepository;
import com.albert.microservices.teaching.marketplace.requests.AdminUpdateSupportTicketRequest;
import com.albert.microservices.teaching.marketplace.requests.CreateSupportTicketRequest;
import com.albert.microservices.teaching.marketplace.requests.SupportTicketReplyRequest;
import com.albert.microservices.teaching.marketplace.response.ApiResponse;
import com.albert.microservices.teaching.marketplace.support.SupportAuthorRoles;
import com.albert.microservices.teaching.marketplace.support.SupportDeskSummaryRow;
import com.albert.microservices.teaching.marketplace.support.SupportInputSanitizer;
import com.albert.microservices.teaching.marketplace.support.SupportTicketStatuses;
import com.albert.microservices.teaching.marketplace.support.SupportTicketUuidConstraints;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import reactor.core.publisher.Mono;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class SupportDeskService {

    private static final Set<String> CATEGORIES = Set.of(
            "GENERAL", "BILLING", "TECHNICAL", "ACCOUNT", "OTHER"
    );
    private static final Set<String> PRIORITIES = Set.of("LOW", "NORMAL", "HIGH", "URGENT");

    private final SupportTicketRepository ticketRepository;
    private final SupportTicketMessageRepository messageRepository;
    private final SupportTicketAdminQueryRepository adminQueryRepository;
    private final UserRepository userRepository;

    @Value("${support.sla.first-response-hours:24}")
    private long firstResponseSlaHours;

    @Value("${support.sla.resolution-hours:168}")
    private long resolutionSlaHours;

    @Value("${support.ticket.prefix:INCC}")
    private String ticketRefPrefix;

    @Value("${support.ticket.number-width:9}")
    private int ticketNumberWidth;

    @Transactional
    public Mono<ApiResponse> createTicket(Integer userId, CreateSupportTicketRequest req) {
        String subject = SupportInputSanitizer.sanitizeSubject(req.getSubject());
        String message = SupportInputSanitizer.sanitizeMessageBody(req.getMessage());
        if (subject.length() < 3) {
            return Mono.error(new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Subject must be at least 3 characters after sanitization"));
        }
        if (message.isEmpty()) {
            return Mono.error(new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Message cannot be empty after sanitization"));
        }

        LocalDateTime now = LocalDateTime.now();
        String cat = normalizeCategory(req.getCategory());
        String pri = normalizePriority(req.getPriority());

        return adminQueryRepository.allocateTicketSequence()
                .map(this::formatPublicTicketId)
                .flatMap(ticketRef -> {
                    SupportTicket t = new SupportTicket();
                    t.setTicketUuid(ticketRef);
                    t.setUserId(userId);
                    t.setSubject(subject);
                    t.setCategory(cat);
                    t.setPriority(pri);
                    t.setStatus(SupportTicketStatuses.OPEN);
                    t.setSlaDueAt(now.plusHours(firstResponseSlaHours));
                    t.setResolutionSlaDueAt(now.plusHours(resolutionSlaHours));
                    t.setUnreadByAdmin(true);
                    t.setUnreadByCustomer(false);
                    t.setCreatedAt(now);
                    t.setUpdatedAt(now);

                    return ticketRepository.save(t)
                            .flatMap(saved -> {
                                SupportTicketMessage m = new SupportTicketMessage();
                                m.setTicketId(saved.getId());
                                m.setAuthorUserId(userId);
                                m.setAuthorRole(SupportAuthorRoles.CUSTOMER);
                                m.setBody(message);
                                m.setInternalNote(false);
                                m.setCreatedAt(now);
                                return messageRepository.save(m).thenReturn(saved);
                            })
                            .map(saved -> ApiResponse.createResponse(
                                    201,
                                    "Support ticket created",
                                    null,
                                    customerTicketMap(saved, null)
                            ));
                });
    }

    /**
     * Public id: {@code INCC000000001} style — prefix from {@code support.ticket.prefix},
     * zero-padded sequence width from {@code support.ticket.number-width}.
     */
    private String formatPublicTicketId(long sequenceValue) {
        String prefix = ticketRefPrefix == null ? "INCC" : ticketRefPrefix.trim().toUpperCase(Locale.ROOT);
        prefix = prefix.replaceAll("[^A-Z0-9]", "");
        if (prefix.isEmpty()) {
            prefix = "INCC";
        }
        if (prefix.length() > 8) {
            prefix = prefix.substring(0, 8);
        }
        int width = Math.max(6, Math.min(15, ticketNumberWidth));
        long seq = sequenceValue < 0 ? 0 : sequenceValue;
        return prefix + String.format(Locale.ROOT, "%0" + width + "d", seq);
    }

    public Mono<ApiResponse> listMyTickets(Integer userId) {
        return ticketRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .map(t -> customerTicketMap(t, null))
                .collectList()
                .map(list -> ApiResponse.createResponse(200, "OK", null, list));
    }

    @Transactional
    public Mono<ApiResponse> getTicketForCustomer(String ticketUuid, Integer userId) {
        final String uuid = SupportTicketUuidConstraints.normalizeTicketUuid(ticketUuid);
        return ticketRepository.findByTicketUuid(uuid)
                .switchIfEmpty(Mono.error(new ResponseStatusException(HttpStatus.NOT_FOUND, "Ticket not found")))
                .flatMap(t -> ensureOwner(t, userId))
                .flatMap(this::markReadByCustomer)
                .flatMap(t -> loadPublicMessages(t.getId())
                        .map(messages -> ApiResponse.createResponse(200, "OK", null,
                                Map.of("ticket", customerTicketMap(t, null), "messages", messages))));
    }

    @Transactional
    public Mono<ApiResponse> customerReply(String ticketUuid, Integer userId, SupportTicketReplyRequest req) {
        final String uuid = SupportTicketUuidConstraints.normalizeTicketUuid(ticketUuid);
        String body = SupportInputSanitizer.sanitizeMessageBody(req.getMessage());
        if (body.isEmpty()) {
            return Mono.error(new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Message cannot be empty after sanitization"));
        }
        return ticketRepository.findByTicketUuid(uuid)
                .switchIfEmpty(Mono.error(new ResponseStatusException(HttpStatus.NOT_FOUND, "Ticket not found")))
                .flatMap(t -> ensureOwner(t, userId))
                .flatMap(t -> {
                    if (SupportTicketStatuses.isTerminal(t.getStatus())) {
                        return Mono.error(new ResponseStatusException(HttpStatus.CONFLICT,
                                "This ticket is resolved or closed; open a new ticket if you still need help."));
                    }
                    LocalDateTime now = LocalDateTime.now();
                    SupportTicketMessage m = new SupportTicketMessage();
                    m.setTicketId(t.getId());
                    m.setAuthorUserId(userId);
                    m.setAuthorRole(SupportAuthorRoles.CUSTOMER);
                    m.setBody(body);
                    m.setInternalNote(false);
                    m.setCreatedAt(now);
                    return messageRepository.save(m)
                            .then(Mono.fromCallable(() -> {
                                t.setUnreadByAdmin(true);
                                t.setUpdatedAt(now);
                                if (SupportTicketStatuses.WAITING_CUSTOMER.equalsIgnoreCase(t.getStatus())) {
                                    t.setStatus(SupportTicketStatuses.IN_PROGRESS);
                                }
                                return t;
                            }))
                            .flatMap(ticketRepository::save)
                            .map(saved -> ApiResponse.createResponse(200, "Message sent", null, Map.of("ticket", customerTicketMap(saved, null))));
                });
    }

    public Mono<ApiResponse> loadAdminSummary() {
        return adminQueryRepository.loadSummary()
                .map(row -> ApiResponse.createResponse(200, "OK", null, summaryMap(row)));
    }

    public Mono<ApiResponse> adminListTickets(
            int pageOneBased,
            int pageSize,
            String status,
            Boolean slaBreached,
            Boolean resolutionSlaBreached,
            Boolean unreadOnly,
            String search
    ) {
        int page = Math.max(1, pageOneBased);
        int size = Math.min(100, Math.max(1, pageSize));
        int offset = (page - 1) * size;

        String safeQuery = SupportInputSanitizer.sanitizeSearchQuery(search);
        String qParam = safeQuery.isEmpty() ? null : safeQuery;

        final String statusForQuery;
        if (status != null && !status.isBlank() && !"ALL".equalsIgnoreCase(status.trim())) {
            String u = SupportInputSanitizer.sanitizeSubject(status, 30).toUpperCase(Locale.ROOT);
            if (!SupportTicketStatuses.ALL.contains(u)) {
                return Mono.error(new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid status filter"));
            }
            statusForQuery = u;
        } else {
            statusForQuery = null;
        }

        return adminQueryRepository.countTickets(statusForQuery, slaBreached, resolutionSlaBreached, unreadOnly, qParam)
                .flatMap(total -> adminQueryRepository
                        .findTickets(offset, size, statusForQuery, slaBreached, resolutionSlaBreached, unreadOnly, qParam)
                        .flatMap(this::adminListItem)
                        .collectList()
                        .map(items -> {
                            long pages = (total + size - 1) / size;
                            Map<String, Object> body = new LinkedHashMap<>();
                            body.put("items", items);
                            body.put("page", page);
                            body.put("pageSize", size);
                            body.put("totalItems", total);
                            body.put("totalPages", pages);
                            return ApiResponse.createResponse(200, "OK", null, body);
                        }));
    }

    @Transactional
    public Mono<ApiResponse> adminGetTicket(String ticketUuid) {
        final String uuid = SupportTicketUuidConstraints.normalizeTicketUuid(ticketUuid);
        return ticketRepository.findByTicketUuid(uuid)
                .switchIfEmpty(Mono.error(new ResponseStatusException(HttpStatus.NOT_FOUND, "Ticket not found")))
                .flatMap(this::markReadByAdmin)
                .flatMap(t -> userRepository.findById(t.getUserId())
                        .map(User::getEmail)
                        .defaultIfEmpty("")
                                .flatMap(email -> messageRepository.findByTicketIdOrderByCreatedAtAsc(t.getId())
                                        .map(this::customerMessageMap)
                                .collectList()
                                .map(messages -> {
                                    Map<String, Object> ticketMap = customerTicketMap(t, email);
                                    return ApiResponse.createResponse(200, "OK", null,
                                            Map.of("ticket", ticketMap, "messages", messages));
                                })));
    }

    @Transactional
    public Mono<ApiResponse> adminUpdateTicket(String ticketUuid, Integer adminUserId, AdminUpdateSupportTicketRequest req) {
        final String uuid = SupportTicketUuidConstraints.normalizeTicketUuid(ticketUuid);
        return ticketRepository.findByTicketUuid(uuid)
                .switchIfEmpty(Mono.error(new ResponseStatusException(HttpStatus.NOT_FOUND, "Ticket not found")))
                .flatMap(t -> {
                    if (t.getAssignedAdminUserId() == null) {
                        t.setAssignedAdminUserId(adminUserId);
                    }
                    String oldStatus = t.getStatus();
                    LocalDateTime now = LocalDateTime.now();

                    if (req.getPriority() != null && !req.getPriority().isBlank()) {
                        t.setPriority(normalizePriority(req.getPriority()));
                    }
                    if (req.getCategory() != null && !req.getCategory().isBlank()) {
                        t.setCategory(normalizeCategory(req.getCategory()));
                    }
                    if (req.getAssignedAdminUserId() != null) {
                        t.setAssignedAdminUserId(req.getAssignedAdminUserId());
                    }

                    boolean statusChanged = false;
                    if (req.getStatus() != null && !req.getStatus().isBlank()) {
                        String ns = SupportInputSanitizer.sanitizeSubject(req.getStatus(), 30).toUpperCase(Locale.ROOT);
                        if (!SupportTicketStatuses.ALL.contains(ns)) {
                            return Mono.error(new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid status"));
                        }
                        if (!ns.equalsIgnoreCase(oldStatus)) {
                            statusChanged = true;
                            t.setStatus(ns);
                            if (SupportTicketStatuses.RESOLVED.equals(ns)) {
                                t.setResolvedAt(now);
                            }
                            if (SupportTicketStatuses.CLOSED.equals(ns)) {
                                t.setClosedAt(now);
                            }
                        }
                    }

                    if (t.getFirstResponseAt() == null && !SupportTicketStatuses.OPEN.equals(t.getStatus())) {
                        t.setFirstResponseAt(now);
                    }

                    t.setUpdatedAt(now);

                    Mono<Void> systemMsg = statusChanged
                            ? messageRepository.save(systemMessage(t.getId(),
                            "Status updated to " + t.getStatus() + " (was " + oldStatus + ").")).then()
                            : Mono.empty();

                    return systemMsg.then(ticketRepository.save(t))
                            .map(saved -> ApiResponse.createResponse(200, "Ticket updated", null, customerTicketMap(saved, null)));
                });
    }

    @Transactional
    public Mono<ApiResponse> adminReply(String ticketUuid, Integer adminUserId, SupportTicketReplyRequest req) {
        final String uuid = SupportTicketUuidConstraints.normalizeTicketUuid(ticketUuid);
        String body = SupportInputSanitizer.sanitizeMessageBody(req.getMessage());
        if (body.isEmpty()) {
            return Mono.error(new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Message cannot be empty after sanitization"));
        }
        boolean internal = req.isInternalNote();
        return ticketRepository.findByTicketUuid(uuid)
                .switchIfEmpty(Mono.error(new ResponseStatusException(HttpStatus.NOT_FOUND, "Ticket not found")))
                .flatMap(t -> {
                    if (t.getAssignedAdminUserId() == null) {
                        t.setAssignedAdminUserId(adminUserId);
                    }
                    if (SupportTicketStatuses.isTerminal(t.getStatus()) && !internal) {
                        return Mono.error(new ResponseStatusException(HttpStatus.CONFLICT,
                                "Ticket is resolved or closed; use internal notes only."));
                    }
                    LocalDateTime now = LocalDateTime.now();
                    SupportTicketMessage m = new SupportTicketMessage();
                    m.setTicketId(t.getId());
                    m.setAuthorUserId(adminUserId);
                    m.setAuthorRole(internal ? SupportAuthorRoles.ADMIN : SupportAuthorRoles.ADMIN);
                    m.setBody(body);
                    m.setInternalNote(internal);
                    m.setCreatedAt(now);

                    if (!internal && t.getFirstResponseAt() == null) {
                        t.setFirstResponseAt(now);
                    }
                    t.setUpdatedAt(now);
                    t.setUnreadByAdmin(false);
                    if (!internal) {
                        t.setUnreadByCustomer(true);
                    }

                    return messageRepository.save(m)
                            .flatMap(__ -> ticketRepository.save(t))
                            .map(saved -> ApiResponse.createResponse(200, "Message recorded", null, customerTicketMap(saved, null)));
                });
    }

    private SupportTicketMessage systemMessage(Long ticketId, String body) {
        String safe = SupportInputSanitizer.sanitizeMessageBody(body != null ? body : "");
        if (safe.isEmpty()) {
            safe = "Ticket updated.";
        }
        SupportTicketMessage m = new SupportTicketMessage();
        m.setTicketId(ticketId);
        m.setAuthorUserId(null);
        m.setAuthorRole(SupportAuthorRoles.SYSTEM);
        m.setBody(safe);
        m.setInternalNote(false);
        m.setCreatedAt(LocalDateTime.now());
        return m;
    }

    private Mono<SupportTicket> ensureOwner(SupportTicket t, Integer userId) {
        if (!t.getUserId().equals(userId)) {
            return Mono.error(new ResponseStatusException(HttpStatus.FORBIDDEN, "Not your ticket"));
        }
        return Mono.just(t);
    }

    private Mono<SupportTicket> markReadByCustomer(SupportTicket t) {
        if (!Boolean.TRUE.equals(t.getUnreadByCustomer())) {
            return Mono.just(t);
        }
        t.setUnreadByCustomer(false);
        t.setUpdatedAt(LocalDateTime.now());
        return ticketRepository.save(t);
    }

    private Mono<SupportTicket> markReadByAdmin(SupportTicket t) {
        if (!Boolean.TRUE.equals(t.getUnreadByAdmin())) {
            return Mono.just(t);
        }
        t.setUnreadByAdmin(false);
        t.setUpdatedAt(LocalDateTime.now());
        return ticketRepository.save(t);
    }

    private Mono<List<Map<String, Object>>> loadPublicMessages(Long ticketId) {
        return messageRepository.findByTicketIdOrderByCreatedAtAsc(ticketId)
                .filter(m -> !Boolean.TRUE.equals(m.getInternalNote()))
                .map(this::customerMessageMap)
                .collectList();
    }

    private Mono<Map<String, Object>> adminListItem(SupportTicket t) {
        return userRepository.findById(t.getUserId())
                .map(u -> customerTicketMap(t, u.getEmail()))
                .switchIfEmpty(Mono.fromCallable(() -> customerTicketMap(t, null)));
    }

    private Map<String, Object> customerTicketMap(SupportTicket t, String customerEmail) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", t.getId());
        m.put("ticketUuid", t.getTicketUuid());
        m.put("subject", t.getSubject());
        m.put("category", t.getCategory());
        m.put("priority", t.getPriority());
        m.put("status", t.getStatus());
        m.put("assignedAdminUserId", t.getAssignedAdminUserId());
        m.put("slaDueAt", t.getSlaDueAt());
        m.put("resolutionSlaDueAt", t.getResolutionSlaDueAt());
        m.put("firstResponseAt", t.getFirstResponseAt());
        m.put("resolvedAt", t.getResolvedAt());
        m.put("closedAt", t.getClosedAt());
        m.put("userId", t.getUserId());
        m.put("unreadByCustomer", t.getUnreadByCustomer());
        m.put("unreadByAdmin", t.getUnreadByAdmin());
        m.put("createdAt", t.getCreatedAt());
        m.put("updatedAt", t.getUpdatedAt());
        m.put("firstResponseSlaBreached", computeFirstResponseBreached(t));
        m.put("resolutionSlaBreached", computeResolutionBreached(t));
        if (customerEmail != null) {
            m.put("customerEmail", customerEmail);
        }
        return m;
    }

    private boolean computeFirstResponseBreached(SupportTicket t) {
        if (SupportTicketStatuses.isTerminal(t.getStatus())) {
            return false;
        }
        if (t.getFirstResponseAt() != null) {
            return false;
        }
        return t.getSlaDueAt() != null && LocalDateTime.now().isAfter(t.getSlaDueAt());
    }

    private boolean computeResolutionBreached(SupportTicket t) {
        if (SupportTicketStatuses.isTerminal(t.getStatus())) {
            return false;
        }
        return t.getResolutionSlaDueAt() != null && LocalDateTime.now().isAfter(t.getResolutionSlaDueAt());
    }

    private Map<String, Object> customerMessageMap(SupportTicketMessage msg) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", msg.getId());
        m.put("authorRole", msg.getAuthorRole());
        m.put("authorUserId", msg.getAuthorUserId());
        m.put("body", msg.getBody());
        m.put("internalNote", msg.getInternalNote());
        m.put("createdAt", msg.getCreatedAt());
        return m;
    }

    private Map<String, Object> summaryMap(SupportDeskSummaryRow row) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("totalTickets", row.totalTickets());
        m.put("openTickets", row.openTickets());
        m.put("inProgressTickets", row.inProgressTickets());
        m.put("waitingCustomerTickets", row.waitingCustomerTickets());
        m.put("resolvedTickets", row.resolvedTickets());
        m.put("closedTickets", row.closedTickets());
        m.put("unreadByAdminTickets", row.unreadByAdminTickets());
        m.put("firstResponseSlaBreached", row.firstResponseSlaBreached());
        m.put("resolutionSlaBreached", row.resolutionSlaBreached());
        return m;
    }

    private String normalizeCategory(String c) {
        if (c == null || c.isBlank()) {
            return "GENERAL";
        }
        String u = c.trim().toUpperCase(Locale.ROOT);
        return CATEGORIES.contains(u) ? u : "GENERAL";
    }

    private String normalizePriority(String p) {
        if (p == null || p.isBlank()) {
            return "NORMAL";
        }
        String u = p.trim().toUpperCase(Locale.ROOT);
        return PRIORITIES.contains(u) ? u : "NORMAL";
    }
}
