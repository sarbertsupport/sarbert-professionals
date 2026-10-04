package com.albert.microservices.teaching.marketplace.repositories;

import com.albert.microservices.teaching.marketplace.entities.SupportTicket;
import com.albert.microservices.teaching.marketplace.support.SupportDeskSummaryRow;
import io.r2dbc.spi.Row;
import lombok.RequiredArgsConstructor;
import org.springframework.r2dbc.core.DatabaseClient;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

/**
 * Admin list/search with filters (R2DBC criteria for optional filters is awkward; use bound SQL).
 */
@Repository
@RequiredArgsConstructor
public class SupportTicketAdminQueryRepository {

    private final DatabaseClient databaseClient;

    public Flux<SupportTicket> findTickets(
            int offset,
            int limit,
            String status,
            Boolean slaBreached,
            Boolean resolutionSlaBreached,
            Boolean unreadOnly,
            String search
    ) {
        SqlParts parts = buildWhere(status, slaBreached, resolutionSlaBreached, unreadOnly, search);
        String sql = "SELECT * FROM support_tickets WHERE 1=1 " + parts.where
                + " ORDER BY created_at DESC LIMIT :lim OFFSET :off";

        var spec = databaseClient.sql(sql).bind("lim", limit).bind("off", offset);
        for (var e : parts.bindings.entrySet()) {
            spec = spec.bind(e.getKey(), e.getValue());
        }
        return spec.map((row, meta) -> mapRow(row)).all();
    }

    public Mono<SupportDeskSummaryRow> loadSummary() {
        return databaseClient.sql("""
                        SELECT
                            COUNT(*)::bigint AS total_tickets,
                            COUNT(*) FILTER (WHERE status = 'OPEN')::bigint AS open_tickets,
                            COUNT(*) FILTER (WHERE status = 'IN_PROGRESS')::bigint AS in_progress_tickets,
                            COUNT(*) FILTER (WHERE status = 'WAITING_CUSTOMER')::bigint AS waiting_tickets,
                            COUNT(*) FILTER (WHERE status = 'RESOLVED')::bigint AS resolved_tickets,
                            COUNT(*) FILTER (WHERE status = 'CLOSED')::bigint AS closed_tickets,
                            COUNT(*) FILTER (WHERE unread_by_admin = true)::bigint AS unread_admin,
                COUNT(*) FILTER (WHERE status NOT IN ('RESOLVED', 'CLOSED') AND first_response_at IS NULL AND sla_due_at < NOW())::bigint AS sla_first_breach,
                COUNT(*) FILTER (WHERE status IN ('OPEN', 'IN_PROGRESS', 'WAITING_CUSTOMER') AND resolution_sla_due_at < NOW())::bigint AS sla_res_breach
                        FROM support_tickets
                        """)
                .map((row, meta) -> new SupportDeskSummaryRow(
                        nz(row, "total_tickets"),
                        nz(row, "open_tickets"),
                        nz(row, "in_progress_tickets"),
                        nz(row, "waiting_tickets"),
                        nz(row, "resolved_tickets"),
                        nz(row, "closed_tickets"),
                        nz(row, "unread_admin"),
                        nz(row, "sla_first_breach"),
                        nz(row, "sla_res_breach")
                ))
                .one();
    }

    private static long nz(Row row, String col) {
        Long v = row.get(col, Long.class);
        return v == null ? 0L : v;
    }

    /** Next value for formatted public ticket id (INCC000...). */
    public Mono<Long> allocateTicketSequence() {
        return databaseClient.sql("SELECT nextval('support_ticket_number_seq') AS n")
                .map((row, meta) -> {
                    Long v = row.get("n", Long.class);
                    return v != null ? v : row.get(0, Long.class);
                })
                .one();
    }

    public Mono<Long> countTickets(
            String status,
            Boolean slaBreached,
            Boolean resolutionSlaBreached,
            Boolean unreadOnly,
            String search
    ) {
        SqlParts parts = buildWhere(status, slaBreached, resolutionSlaBreached, unreadOnly, search);
        String sql = "SELECT COUNT(*) AS cnt FROM support_tickets WHERE 1=1 " + parts.where;
        var spec = databaseClient.sql(sql);
        for (var e : parts.bindings.entrySet()) {
            spec = spec.bind(e.getKey(), e.getValue());
        }
        return spec.map((row, meta) -> row.get("cnt", Long.class)).one();
    }

    private SqlParts buildWhere(
            String status,
            Boolean slaBreached,
            Boolean resolutionSlaBreached,
            Boolean unreadOnly,
            String search
    ) {
        StringBuilder w = new StringBuilder();
        Map<String, Object> binds = new HashMap<>();
        LocalDateTime now = LocalDateTime.now();

        if (status != null && !status.isBlank() && !"ALL".equalsIgnoreCase(status.trim())) {
            w.append(" AND status = :status ");
            binds.put("status", status.trim().toUpperCase());
        }
        if (Boolean.TRUE.equals(slaBreached)) {
            w.append(" AND status NOT IN ('RESOLVED', 'CLOSED') AND first_response_at IS NULL AND sla_due_at < :now1 ");
            binds.put("now1", now);
        }
        if (Boolean.TRUE.equals(resolutionSlaBreached)) {
            w.append(" AND status IN ('OPEN', 'IN_PROGRESS', 'WAITING_CUSTOMER') AND resolution_sla_due_at < :now2 ");
            binds.put("now2", now);
        }
        if (Boolean.TRUE.equals(unreadOnly)) {
            w.append(" AND unread_by_admin = true ");
        }
        if (search != null && !search.isBlank()) {
            w.append(" AND (LOWER(subject) LIKE LOWER(:search) OR LOWER(ticket_uuid) LIKE LOWER(:searchU)) ");
            String q = "%" + search.trim() + "%";
            binds.put("search", q);
            binds.put("searchU", q);
        }
        return new SqlParts(w.toString(), binds);
    }

    private SupportTicket mapRow(Row row) {
        SupportTicket t = new SupportTicket();
        t.setId(row.get("id", Long.class));
        t.setTicketUuid(row.get("ticket_uuid", String.class));
        t.setUserId(row.get("user_id", Integer.class));
        t.setSubject(row.get("subject", String.class));
        t.setCategory(row.get("category", String.class));
        t.setPriority(row.get("priority", String.class));
        t.setStatus(row.get("status", String.class));
        t.setAssignedAdminUserId(row.get("assigned_admin_user_id", Integer.class));
        t.setSlaDueAt(row.get("sla_due_at", LocalDateTime.class));
        t.setResolutionSlaDueAt(row.get("resolution_sla_due_at", LocalDateTime.class));
        t.setFirstResponseAt(row.get("first_response_at", LocalDateTime.class));
        t.setResolvedAt(row.get("resolved_at", LocalDateTime.class));
        t.setClosedAt(row.get("closed_at", LocalDateTime.class));
        t.setUnreadByAdmin(row.get("unread_by_admin", Boolean.class));
        t.setUnreadByCustomer(row.get("unread_by_customer", Boolean.class));
        t.setCreatedAt(row.get("created_at", LocalDateTime.class));
        t.setUpdatedAt(row.get("updated_at", LocalDateTime.class));
        return t;
    }

    private record SqlParts(String where, Map<String, Object> bindings) {}
}
