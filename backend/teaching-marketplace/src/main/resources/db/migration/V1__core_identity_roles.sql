-- Core identity, roles, and permissions

CREATE TABLE IF NOT EXISTS roles (
    role_id   SERIAL PRIMARY KEY,
    role_name VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS permissions (
    permission_id   SERIAL PRIMARY KEY,
    permission_name VARCHAR(100) NOT NULL UNIQUE,
    description     VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS role_permissions (
    role_id       INTEGER NOT NULL REFERENCES roles(role_id) ON DELETE CASCADE,
    permission_id INTEGER NOT NULL REFERENCES permissions(permission_id) ON DELETE CASCADE,
    PRIMARY KEY (role_id, permission_id)
);

CREATE TABLE IF NOT EXISTS users (
    user_id                 SERIAL PRIMARY KEY,
    username                VARCHAR(20)  NOT NULL UNIQUE,
    password                VARCHAR(100) NOT NULL,
    email                   VARCHAR(255) NOT NULL UNIQUE,
    active_status           BOOLEAN      DEFAULT FALSE,
    login_attempts          INTEGER      DEFAULT 0,
    last_login_attempt      TIMESTAMP,
    locked                  BOOLEAN      DEFAULT FALSE,
    activation_token        VARCHAR(255),
    token_expiration        TIMESTAMP,
    role_id                 INTEGER REFERENCES roles(role_id),
    current_step            VARCHAR(30),
    accepted_our_terms      BOOLEAN      DEFAULT FALSE,
    reset_token             VARCHAR(255),
    reset_token_expiration  TIMESTAMP,
    mfa_enabled             BOOLEAN      NOT NULL DEFAULT FALSE,
    mfa_failed_attempts     INTEGER      NOT NULL DEFAULT 0,
    mfa_locked_until        TIMESTAMP,
    created_at              TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_roles (
    user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    role_id INTEGER NOT NULL REFERENCES roles(role_id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, role_id)
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_role_id ON users(role_id);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);
