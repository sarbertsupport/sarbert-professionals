-- Wallets, payments, chat, pricing, business addresses, terms

CREATE TABLE IF NOT EXISTS coin_wallets (
    id           SERIAL PRIMARY KEY,
    user_id      INTEGER NOT NULL UNIQUE REFERENCES users(user_id) ON DELETE CASCADE,
    coin_balance DOUBLE PRECISION NOT NULL DEFAULT 0,
    wallet_uuid  VARCHAR(64) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS coin_transactions (
    id                       BIGSERIAL PRIMARY KEY,
    user_id                  INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    transaction_uuid         VARCHAR(64) NOT NULL UNIQUE,
    amount                   DOUBLE PRECISION,
    currency                 VARCHAR(10),
    stripe_payment_id        VARCHAR(255),
    mpesa_receipt_number     VARCHAR(100),
    mpesa_phone_number       VARCHAR(30),
    mpesa_checkout_request_id VARCHAR(100),
    mpesa_merchant_request_id VARCHAR(100),
    description              TEXT,
    status                   VARCHAR(30),
    created_at               TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at               TIMESTAMP,
    coins                    INTEGER NOT NULL DEFAULT 0,
    entry_type               VARCHAR(30),
    payment_method           VARCHAR(32),
    idempotency_key          VARCHAR(255) UNIQUE,
    paystack_reference       VARCHAR(255),
    invoice_email_sent       BOOLEAN DEFAULT FALSE,
    notes                    TEXT,
    callback_response        TEXT,
    mpesa_result_code        VARCHAR(32),
    mpesa_result_desc        TEXT,
    mpesa_last_stk_query_at  TIMESTAMP,
    mpesa_stk_query_response TEXT,
    retry_count              INTEGER DEFAULT 0,
    max_retries              INTEGER DEFAULT 3
);

CREATE TABLE IF NOT EXISTS pricing (
    id                   BIGSERIAL PRIMARY KEY,
    base_price_per_coin  NUMERIC(12, 4) NOT NULL,
    created_at           TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at           TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by           VARCHAR(50) NOT NULL,
    updated_by           VARCHAR(50)
);

CREATE TABLE IF NOT EXISTS bulk_discounts (
    id                   BIGSERIAL PRIMARY KEY,
    min_coins            INTEGER NOT NULL,
    discount_percentage  NUMERIC(5, 2) NOT NULL,
    active               BOOLEAN NOT NULL DEFAULT TRUE,
    created_at           TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at           TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by           VARCHAR(50) NOT NULL,
    updated_by           VARCHAR(50)
);

CREATE TABLE IF NOT EXISTS business_addresses (
    id                   BIGSERIAL PRIMARY KEY,
    business_name        VARCHAR(200),
    business_description TEXT,
    contact_person       VARCHAR(150),
    email                VARCHAR(255),
    phone                VARCHAR(40),
    address_line_1       VARCHAR(255),
    address_line_2       VARCHAR(255),
    city                 VARCHAR(100),
    state                VARCHAR(100),
    postal_code          VARCHAR(30),
    country              VARCHAR(100),
    physical_location    TEXT,
    website              VARCHAR(255),
    tax_id               VARCHAR(100),
    registration_number  VARCHAR(100),
    is_default           BOOLEAN DEFAULT FALSE,
    is_active            BOOLEAN DEFAULT TRUE,
    created_at           TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at           TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS billing_addresses (
    id         BIGSERIAL PRIMARY KEY,
    user_id    INTEGER NOT NULL UNIQUE REFERENCES users(user_id) ON DELETE CASCADE,
    full_name  VARCHAR(100) NOT NULL,
    country    VARCHAR(60)  NOT NULL,
    state      VARCHAR(60)  NOT NULL,
    city       VARCHAR(60)  NOT NULL,
    address    VARCHAR(200) NOT NULL,
    contact_no VARCHAR(20)  NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS terms_and_conditions (
    id         SERIAL PRIMARY KEY,
    title      VARCHAR(255) NOT NULL,
    content    TEXT NOT NULL,
    version    VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS chat_messages (
    id            BIGSERIAL PRIMARY KEY,
    job_id        BIGINT NOT NULL,
    sender_id     BIGINT NOT NULL,
    recipient_id  BIGINT NOT NULL,
    message       VARCHAR(2000) NOT NULL,
    chat_response TEXT,
    status        VARCHAR(20),
    created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    answered_at   TIMESTAMP
);

CREATE TABLE IF NOT EXISTS chat_history (
    id                 BIGSERIAL PRIMARY KEY,
    original_message_id BIGINT,
    job_id             BIGINT,
    sender_id          BIGINT,
    recipient_id       BIGINT,
    message            TEXT,
    status_at_archive  VARCHAR(20),
    archived_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_coin_wallets_user_id ON coin_wallets(user_id);
CREATE INDEX IF NOT EXISTS idx_coin_transactions_user_id ON coin_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_coin_transactions_status ON coin_transactions(status);
CREATE INDEX IF NOT EXISTS idx_coin_transactions_created_at ON coin_transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_coin_transactions_paystack_ref ON coin_transactions(paystack_reference);
CREATE INDEX IF NOT EXISTS idx_coin_transactions_mpesa_checkout ON coin_transactions(mpesa_checkout_request_id);
CREATE INDEX IF NOT EXISTS idx_billing_addresses_user_id ON billing_addresses(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_job_id ON chat_messages(job_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_sender_id ON chat_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_recipient_id ON chat_messages(recipient_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at DESC);
