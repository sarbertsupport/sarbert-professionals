-- Create billing_addresses table
CREATE TABLE IF NOT EXISTS billing_addresses (
    id BIGSERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    country VARCHAR(60) NOT NULL,
    state VARCHAR(60) NOT NULL,
    city VARCHAR(60) NOT NULL,
    address VARCHAR(200) NOT NULL,
    contact_no VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id)
);

-- Create index on user_id for better performance
CREATE INDEX IF NOT EXISTS idx_billing_addresses_user_id ON billing_addresses(user_id);

-- Add paystack_reference column to coin_transactions table if it doesn't exist
-- (Plain ALTER only — no DO $$ blocks: Spring R2DBC script runner cannot parse dollar quotes.)
ALTER TABLE coin_transactions ADD COLUMN IF NOT EXISTS paystack_reference VARCHAR(255);

ALTER TABLE coin_transactions ADD COLUMN IF NOT EXISTS payment_method VARCHAR(32);

-- Support desk (tickets + threaded messages)
-- Note: If you ever had a partial support_tickets table without ticket_uuid, drop it manually
-- then restart. R2DBC init cannot run DO $$ ... $$ migrations here.

CREATE TABLE IF NOT EXISTS support_tickets (
    id BIGSERIAL PRIMARY KEY,
    ticket_uuid VARCHAR(64) NOT NULL UNIQUE,
    user_id INTEGER NOT NULL,
    subject VARCHAR(500) NOT NULL,
    category VARCHAR(50) NOT NULL DEFAULT 'GENERAL',
    priority VARCHAR(20) NOT NULL DEFAULT 'NORMAL',
    status VARCHAR(30) NOT NULL DEFAULT 'OPEN',
    assigned_admin_user_id INTEGER,
    sla_due_at TIMESTAMP NOT NULL,
    resolution_sla_due_at TIMESTAMP NOT NULL,
    first_response_at TIMESTAMP,
    resolved_at TIMESTAMP,
    closed_at TIMESTAMP,
    unread_by_admin BOOLEAN NOT NULL DEFAULT TRUE,
    unread_by_customer BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS support_ticket_messages (
    id BIGSERIAL PRIMARY KEY,
    ticket_id BIGINT NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
    author_user_id INTEGER,
    author_role VARCHAR(20) NOT NULL,
    body TEXT NOT NULL,
    internal_note BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_support_tickets_user_id ON support_tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON support_tickets(status);
CREATE INDEX IF NOT EXISTS idx_support_tickets_created_at ON support_tickets(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_support_tickets_unread_admin ON support_tickets(unread_by_admin);
CREATE INDEX IF NOT EXISTS idx_support_messages_ticket_id ON support_ticket_messages(ticket_id);

-- Human-readable public ticket numbers (e.g. INCC000000001); legacy rows may still use UUID strings
CREATE SEQUENCE IF NOT EXISTS support_ticket_number_seq AS BIGINT START WITH 1 INCREMENT BY 1;

-- Legacy widen of ticket_uuid: run manually once on old DBs if needed:
-- ALTER TABLE support_tickets ALTER COLUMN ticket_uuid TYPE VARCHAR(64);

-- FAQs (public help content; editable in DB, seeded once per slug)
CREATE TABLE IF NOT EXISTS faqs (
    id BIGSERIAL PRIMARY KEY,
    slug VARCHAR(180) NOT NULL UNIQUE,
    category VARCHAR(60) NOT NULL,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    sort_order INT NOT NULL DEFAULT 0,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_faqs_category ON faqs(category);
CREATE INDEX IF NOT EXISTS idx_faqs_active_sort ON faqs(active, sort_order);

INSERT INTO faqs (slug, category, question, answer, sort_order, active)
VALUES
('what-is-skillbridge', 'General', 'What is SkillBridge?', 'SkillBridge is an online marketplace that connects students with tutors and professionals. You can post learning jobs, discover experts, chat in context of a job, and use our coin wallet for purchases. The platform is built for clarity, fair matching, and safe messaging between both sides.', 1, true),
('who-can-use-skillbridge', 'General', 'Who can use SkillBridge?', 'Students and clients use SkillBridge to post requirements and hire tutors. Tutors and professionals use it to find work, apply with coins where required, and communicate with clients. You need an account and a verified email for most actions. Some areas of the product depend on your role, such as posting jobs or browsing the tutor job board.', 2, true),
('how-student-post-job', 'Students', 'How do I post a tutoring or help request?', 'Sign in as a student, open the post job flow, and describe the subject, scope, budget in coins if applicable, and deadlines. Clear requirements get faster, better applications. After posting, you can review applicants, message them, and accept the best fit. You can manage the job from your dashboard.', 3, true),
('what-are-coins', 'Wallet', 'What are coins and why do they matter?', 'Coins are the in-platform balance used for actions such as purchasing tutor services or paying application fees where the product requires it. They are not a cryptocurrency; they are ledger credits tied to your account. You buy coins through supported payment flows, and your wallet shows balance and history after each transaction.', 4, true),
('how-buy-coins', 'Wallet', 'How do I add coins to my wallet?', 'Open Wallet or Buy Coins from your account menu. Choose an amount, complete checkout with the available payment provider, and wait for confirmation. Successful payments credit your wallet. If a payment is delayed, check your email receipt and wallet transactions; contact support with your reference if something looks wrong.', 5, true),
('payment-methods-supported', 'Wallet', 'Which payment methods are supported?', 'Supported options depend on how your SkillBridge deployment is configured. Common integrations include card checkout through providers such as Paystack and regional options like M-Pesa where enabled. The checkout screen only shows what is active for your environment. Fees and settlement follow the provider you used.', 6, true),
('where-transaction-history', 'Wallet', 'Where can I see transactions and receipts?', 'Open your wallet or coin history page after signing in. You will see credits, debits, timestamps, and references when the backend stores them. Use this view before opening a support ticket so you can cite dates and amounts. Export or screenshots are useful if your finance team needs records.', 7, true),
('tutor-apply-to-job', 'Tutors', 'How do I apply to a job as a tutor?', 'Browse open jobs from your role dashboard, open a job that fits your skills, and follow the apply flow. Some jobs may require a coin balance or fee as shown on the screen. Submit a concise message that proves you read the brief. After applying, watch messages for follow-up from the client.', 8, true),
('tutor-compensation', 'Tutors', 'How does compensation and payment work for tutors?', 'Commercial terms are agreed between you and the client inside the platform rules shown at checkout or in your engagement. SkillBridge records wallet debits and credits to reflect coins spent or earned according to the product logic configured for your deployment. For disputes, open a support ticket with job reference and timeline.', 9, true),
('tutor-complete-profile', 'Tutors', 'Why should I complete my tutor profile?', 'A complete profile with education, experience, subjects, and availability increases trust and conversion. Clients scan many profiles quickly; missing basics usually means fewer invites. Keep descriptions factual, upload a clear photo where the product allows it, and update skills as you grow.', 10, true),
('edit-job-after-posting', 'Jobs', 'Can I edit a job after it is posted?', 'Where the product allows editing, open the job from your dashboard and update fields that remain unlocked. Some fields may freeze after applications arrive to protect applicants from silent changes. If you need a material change, add a comment in the thread or close and repost with a clear notice.', 11, true),
('how-applicants-notified', 'Jobs', 'How are tutors notified about my job?', 'When your job is published, eligible tutors can see it on the board and opt in through the apply flow. In-product messaging ties replies to the job so context is preserved. Email behavior depends on server configuration; always check the app for authoritative status.', 12, true),
('forgot-password-flow', 'Account', 'I forgot my password. How do I reset it?', 'Use the Forgot password link on the sign-in page, enter your registered email, and follow the reset link we send. Links expire for security. Choose a strong unique password that you do not reuse on other sites. If email is missing, verify spelling or request help from support with proof of account ownership.', 13, true),
('email-verification', 'Account', 'How do I verify my email address?', 'After registration, open the verification message in your inbox and click the link. If it is not there, check spam and promotions folders. You can request a new message from the app when that action is available. Verification protects recovery flows and reduces fraud.', 14, true),
('account-inactive-or-locked', 'Account', 'Why is my account inactive or locked?', 'Accounts can be inactive until email verification or admin activation depending on policy. Locking may follow repeated failed logins or manual moderation. Read any on-screen message for the exact reason. Contact support from the email on the error banner if you believe the block is mistaken.', 15, true),
('how-messaging-works', 'Messaging', 'How does messaging between students and tutors work?', 'Messaging is scoped to authenticated users and usually to a job thread so everyone sees the same context. Use it for scope questions, scheduling, and deliverables. Avoid sharing payment details outside approved flows. Report harassment or spam through support with screenshots if needed.', 16, true),
('who-sees-profile', 'Privacy', 'Who can see my profile information?', 'Visibility rules depend on your role and which pages you completed. Generally, tutors present public-facing profile data to prospective clients, while account-only data stays restricted. Review the privacy policy linked in the footer for categories of data and retention. Minimize sensitive data you place in free-text fields.', 17, true),
('site-not-loading', 'Technical', 'The site misbehaves or will not load. What should I try?', 'First confirm your network, try another browser, and disable extensions that block scripts. Hard refresh the page and clear cache for this origin. If only one feature fails, note the URL and time. Persistent errors after these steps deserve a support ticket with your browser version and a short screen recording if possible.', 18, true),
('contact-support-how', 'Support', 'How do I contact SkillBridge support?', 'Signed-in users can open the Support center to create a ticket, track status, and reply in-thread. Use a clear subject, one issue per ticket, and include reproduction steps for bugs. For billing issues attach references from your wallet history. Response times depend on volume and priority.', 19, true),
('where-terms-of-service', 'Legal', 'Where can I read the terms and policies?', 'Use the Terms and Privacy links in the footer or the in-app legal screen when offered. Those documents explain acceptable use, fees where applicable, and data handling. They change occasionally; the latest published version applies. Save a copy if your organization needs compliance records.', 20, true)
ON CONFLICT (slug) DO NOTHING;

-- Account creation timestamp (admin list / auditing)
ALTER TABLE users ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
UPDATE users SET created_at = COALESCE(created_at, CURRENT_TIMESTAMP) WHERE created_at IS NULL;

-- Admin MFA (TOTP-style email OTP, DB only — no Redis)
ALTER TABLE users ADD COLUMN IF NOT EXISTS mfa_enabled BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS mfa_failed_attempts INT NOT NULL DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS mfa_locked_until TIMESTAMP NULL;

CREATE TABLE IF NOT EXISTS admin_mfa_challenges (
    id BIGSERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    session_token VARCHAR(64) NOT NULL UNIQUE,
    challenge_type VARCHAR(24) NOT NULL,
    otp_hash VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    consumed_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_admin_mfa_challenges_user_type ON admin_mfa_challenges(user_id, challenge_type);
CREATE INDEX IF NOT EXISTS idx_admin_mfa_challenges_token ON admin_mfa_challenges(session_token);

CREATE TABLE IF NOT EXISTS admin_mfa_otp_send_log (
    id BIGSERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    sent_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_admin_mfa_otp_send_user_time ON admin_mfa_otp_send_log(user_id, sent_at);

-- M-Pesa STK reconciliation / audit
ALTER TABLE coin_transactions ADD COLUMN IF NOT EXISTS mpesa_result_code VARCHAR(32);
ALTER TABLE coin_transactions ADD COLUMN IF NOT EXISTS mpesa_result_desc TEXT;
ALTER TABLE coin_transactions ADD COLUMN IF NOT EXISTS mpesa_last_stk_query_at TIMESTAMP;
ALTER TABLE coin_transactions ADD COLUMN IF NOT EXISTS mpesa_stk_query_response TEXT;
