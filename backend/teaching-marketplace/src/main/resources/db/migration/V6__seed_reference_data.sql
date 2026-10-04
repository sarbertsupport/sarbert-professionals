-- Required reference data so a fresh database can register/login immediately

INSERT INTO roles (role_id, role_name) VALUES
    (1, 'ROLE_STUDENT'),
    (2, 'ROLE_TUTOR'),
    (3, 'ROLE_ADMIN')
ON CONFLICT (role_id) DO NOTHING;

-- Keep sequence in sync when explicit IDs are inserted
SELECT setval(
    pg_get_serial_sequence('roles', 'role_id'),
    GREATEST((SELECT COALESCE(MAX(role_id), 1) FROM roles), 1)
);

INSERT INTO availability (availability_name) VALUES
    ('Weekdays'),
    ('Weekends'),
    ('Mornings'),
    ('Afternoons'),
    ('Evenings'),
    ('Flexible')
ON CONFLICT (availability_name) DO NOTHING;

INSERT INTO faqs (slug, category, question, answer, sort_order, active)
VALUES
('what-is-skillbridge', 'General', 'What is SkillBridge?', 'SkillBridge is an online marketplace that connects students with tutors and professionals. You can post learning jobs, discover experts, chat in context of a job, and use our coin wallet for purchases.', 1, true),
('who-can-use-skillbridge', 'General', 'Who can use SkillBridge?', 'Students and clients use SkillBridge to post requirements and hire tutors. Tutors and professionals use it to find work, apply with coins where required, and communicate with clients.', 2, true),
('how-student-post-job', 'Students', 'How do I post a tutoring or help request?', 'Sign in as a student, open the post job flow, and describe the subject, scope, budget in coins if applicable, and deadlines.', 3, true),
('what-are-coins', 'Wallet', 'What are coins and why do they matter?', 'Coins are the in-platform balance used for actions such as purchasing tutor services or paying application fees where the product requires it.', 4, true),
('how-buy-coins', 'Wallet', 'How do I add coins to my wallet?', 'Open Wallet or Buy Coins from your account menu. Choose an amount, complete checkout with the available payment provider, and wait for confirmation.', 5, true),
('payment-methods-supported', 'Wallet', 'Which payment methods are supported?', 'Supported options depend on deployment configuration. Common integrations include card checkout through Paystack and regional options like M-Pesa where enabled.', 6, true),
('where-transaction-history', 'Wallet', 'Where can I see transactions and receipts?', 'Open your wallet or coin history page after signing in to see credits, debits, timestamps, and references.', 7, true),
('tutor-apply-to-job', 'Tutors', 'How do I apply to a job as a tutor?', 'Browse open jobs from your role dashboard, open a job that fits your skills, and follow the apply flow.', 8, true),
('tutor-compensation', 'Tutors', 'How does compensation and payment work for tutors?', 'Commercial terms are agreed between you and the client inside the platform rules shown at checkout or in your engagement.', 9, true),
('tutor-complete-profile', 'Tutors', 'Why should I complete my tutor profile?', 'A complete profile with education, experience, subjects, and availability increases trust and conversion.', 10, true),
('edit-job-after-posting', 'Jobs', 'Can I edit a job after it is posted?', 'Where the product allows editing, open the job from your dashboard and update fields that remain unlocked.', 11, true),
('how-applicants-notified', 'Jobs', 'How are tutors notified about my job?', 'When your job is published, eligible tutors can see it on the board and opt in through the apply flow.', 12, true),
('forgot-password-flow', 'Account', 'I forgot my password. How do I reset it?', 'Use the Forgot password link on the sign-in page, enter your registered email, and follow the reset link we send.', 13, true),
('email-verification', 'Account', 'How do I verify my email address?', 'After registration, open the verification message in your inbox and click the link.', 14, true),
('account-inactive-or-locked', 'Account', 'Why is my account inactive or locked?', 'Accounts can be inactive until email verification or admin activation depending on policy.', 15, true),
('how-messaging-works', 'Messaging', 'How does messaging between students and tutors work?', 'Messaging is scoped to authenticated users and usually to a job thread so everyone sees the same context.', 16, true),
('who-sees-profile', 'Privacy', 'Who can see my profile information?', 'Visibility rules depend on your role and which pages you completed.', 17, true),
('site-not-loading', 'Technical', 'The site misbehaves or will not load. What should I try?', 'Confirm your network, try another browser, hard refresh the page, and clear cache for this origin.', 18, true),
('contact-support-how', 'Support', 'How do I contact SkillBridge support?', 'Signed-in users can open the Support center to create a ticket, track status, and reply in-thread.', 19, true),
('where-terms-of-service', 'Legal', 'Where can I read the terms and policies?', 'Use the Terms and Privacy links in the footer or the in-app legal screen when offered.', 20, true)
ON CONFLICT (slug) DO NOTHING;
