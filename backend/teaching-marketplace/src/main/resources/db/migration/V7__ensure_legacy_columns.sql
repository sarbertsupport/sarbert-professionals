-- Safe upgrades for databases that already had partial / older schemas

ALTER TABLE users ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE users ADD COLUMN IF NOT EXISTS mfa_enabled BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS mfa_failed_attempts INTEGER NOT NULL DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS mfa_locked_until TIMESTAMP;

ALTER TABLE coin_transactions ADD COLUMN IF NOT EXISTS paystack_reference VARCHAR(255);
ALTER TABLE coin_transactions ADD COLUMN IF NOT EXISTS payment_method VARCHAR(32);
ALTER TABLE coin_transactions ADD COLUMN IF NOT EXISTS mpesa_result_code VARCHAR(32);
ALTER TABLE coin_transactions ADD COLUMN IF NOT EXISTS mpesa_result_desc TEXT;
ALTER TABLE coin_transactions ADD COLUMN IF NOT EXISTS mpesa_last_stk_query_at TIMESTAMP;
ALTER TABLE coin_transactions ADD COLUMN IF NOT EXISTS mpesa_stk_query_response TEXT;
ALTER TABLE coin_transactions ADD COLUMN IF NOT EXISTS invoice_email_sent BOOLEAN DEFAULT FALSE;
ALTER TABLE coin_transactions ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE coin_transactions ADD COLUMN IF NOT EXISTS callback_response TEXT;
ALTER TABLE coin_transactions ADD COLUMN IF NOT EXISTS retry_count INTEGER DEFAULT 0;
ALTER TABLE coin_transactions ADD COLUMN IF NOT EXISTS max_retries INTEGER DEFAULT 3;
ALTER TABLE coin_transactions ADD COLUMN IF NOT EXISTS idempotency_key VARCHAR(255);
ALTER TABLE coin_transactions ADD COLUMN IF NOT EXISTS entry_type VARCHAR(30);

UPDATE users SET created_at = COALESCE(created_at, CURRENT_TIMESTAMP) WHERE created_at IS NULL;

CREATE SEQUENCE IF NOT EXISTS support_ticket_number_seq AS BIGINT START WITH 1 INCREMENT BY 1;
