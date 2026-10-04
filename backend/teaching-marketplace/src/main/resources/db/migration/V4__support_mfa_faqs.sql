-- Support desk, admin MFA, FAQs

CREATE TABLE IF NOT EXISTS support_tickets (
    id                      BIGSERIAL PRIMARY KEY,
    ticket_uuid             VARCHAR(64) NOT NULL UNIQUE,
    user_id                 INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    subject                 VARCHAR(500) NOT NULL,
    category                VARCHAR(50)  NOT NULL DEFAULT 'GENERAL',
    priority                VARCHAR(20)  NOT NULL DEFAULT 'NORMAL',
    status                  VARCHAR(30)  NOT NULL DEFAULT 'OPEN',
    assigned_admin_user_id  INTEGER,
    sla_due_at              TIMESTAMP NOT NULL,
    resolution_sla_due_at   TIMESTAMP NOT NULL,
    first_response_at       TIMESTAMP,
    resolved_at             TIMESTAMP,
    closed_at               TIMESTAMP,
    unread_by_admin         BOOLEAN NOT NULL DEFAULT TRUE,
    unread_by_customer      BOOLEAN NOT NULL DEFAULT FALSE,
    created_at              TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at              TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS support_ticket_messages (
    id              BIGSERIAL PRIMARY KEY,
    ticket_id       BIGINT NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
    author_user_id  INTEGER,
    author_role     VARCHAR(20) NOT NULL,
    body            TEXT NOT NULL,
    internal_note   BOOLEAN NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE SEQUENCE IF NOT EXISTS support_ticket_number_seq AS BIGINT START WITH 1 INCREMENT BY 1;

CREATE TABLE IF NOT EXISTS admin_mfa_challenges (
    id              BIGSERIAL PRIMARY KEY,
    user_id         INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    session_token   VARCHAR(64) NOT NULL UNIQUE,
    challenge_type  VARCHAR(24) NOT NULL,
    otp_hash        VARCHAR(255) NOT NULL,
    expires_at      TIMESTAMP NOT NULL,
    consumed_at     TIMESTAMP,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS admin_mfa_otp_send_log (
    id      BIGSERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    sent_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS faqs (
    id         BIGSERIAL PRIMARY KEY,
    slug       VARCHAR(180) NOT NULL UNIQUE,
    category   VARCHAR(60)  NOT NULL,
    question   TEXT NOT NULL,
    answer     TEXT NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0,
    active     BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_support_tickets_user_id ON support_tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON support_tickets(status);
CREATE INDEX IF NOT EXISTS idx_support_tickets_created_at ON support_tickets(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_support_tickets_unread_admin ON support_tickets(unread_by_admin);
CREATE INDEX IF NOT EXISTS idx_support_messages_ticket_id ON support_ticket_messages(ticket_id);
CREATE INDEX IF NOT EXISTS idx_admin_mfa_challenges_user_type ON admin_mfa_challenges(user_id, challenge_type);
CREATE INDEX IF NOT EXISTS idx_admin_mfa_challenges_token ON admin_mfa_challenges(session_token);
CREATE INDEX IF NOT EXISTS idx_admin_mfa_otp_send_user_time ON admin_mfa_otp_send_log(user_id, sent_at);
CREATE INDEX IF NOT EXISTS idx_faqs_category ON faqs(category);
CREATE INDEX IF NOT EXISTS idx_faqs_active_sort ON faqs(active, sort_order);
