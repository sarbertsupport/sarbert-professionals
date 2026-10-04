-- Tutor/student profiles, subjects, jobs, ratings

CREATE TABLE IF NOT EXISTS availability (
    availability_id   SERIAL PRIMARY KEY,
    availability_name VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS subjects (
    subject_id   SERIAL PRIMARY KEY,
    subject_name VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS teacher_profiles (
    teacher_id           SERIAL PRIMARY KEY,
    user_id              INTEGER NOT NULL UNIQUE REFERENCES users(user_id) ON DELETE CASCADE,
    company_name         VARCHAR(100),
    role                 VARCHAR(50),
    display_name         VARCHAR(50)  NOT NULL,
    gender               VARCHAR(30)  NOT NULL,
    birthdate            DATE         NOT NULL,
    location             VARCHAR(100) NOT NULL,
    postal_code          VARCHAR(20)  NOT NULL,
    phone_number         VARCHAR(20)  NOT NULL,
    profile_description  VARCHAR(1000),
    image_path           TEXT,
    is_company           BOOLEAN      NOT NULL DEFAULT FALSE,
    show_clients         BOOLEAN      NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS teacher_availability (
    teacher_id      INTEGER NOT NULL REFERENCES teacher_profiles(teacher_id) ON DELETE CASCADE,
    availability_id INTEGER NOT NULL REFERENCES availability(availability_id) ON DELETE CASCADE,
    PRIMARY KEY (teacher_id, availability_id)
);

CREATE TABLE IF NOT EXISTS education (
    education_id     SERIAL PRIMARY KEY,
    teacher_id       INTEGER NOT NULL REFERENCES teacher_profiles(teacher_id) ON DELETE CASCADE,
    institution_name VARCHAR(200) NOT NULL,
    degree_type      VARCHAR(50)  NOT NULL,
    degree_name      VARCHAR(100) NOT NULL,
    start_date       DATE         NOT NULL,
    end_date         DATE,
    association      VARCHAR(100),
    specialization   VARCHAR(100),
    score            NUMERIC(3, 2),
    user_id          INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS experience (
    experience_id     SERIAL PRIMARY KEY,
    teacher_id        INTEGER NOT NULL REFERENCES teacher_profiles(teacher_id) ON DELETE CASCADE,
    organization_name VARCHAR(100) NOT NULL,
    designation       VARCHAR(100) NOT NULL,
    start_date        DATE         NOT NULL,
    end_date          DATE,
    association       VARCHAR(100),
    job_description   VARCHAR(1000),
    is_current_job    BOOLEAN      NOT NULL DEFAULT FALSE,
    user_id           INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS teacher_subjects (
    id         SERIAL PRIMARY KEY,
    teacher_id INTEGER NOT NULL REFERENCES teacher_profiles(teacher_id) ON DELETE CASCADE,
    subject_id INTEGER NOT NULL REFERENCES subjects(subject_id) ON DELETE CASCADE,
    user_id    INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS teaching_details (
    id                  SERIAL PRIMARY KEY,
    teacher_id          INTEGER NOT NULL UNIQUE REFERENCES teacher_profiles(teacher_id) ON DELETE CASCADE,
    rate                VARCHAR(50)  NOT NULL,
    max_fee             DOUBLE PRECISION NOT NULL,
    min_fee             DOUBLE PRECISION NOT NULL,
    payment_details     VARCHAR(500) NOT NULL,
    total_exp_years     INTEGER NOT NULL DEFAULT 0,
    online_exp_years    INTEGER NOT NULL DEFAULT 0,
    travel_willingness  BOOLEAN NOT NULL DEFAULT FALSE,
    online_availability BOOLEAN NOT NULL DEFAULT FALSE,
    home_availability   BOOLEAN NOT NULL DEFAULT FALSE,
    travel_distance     INTEGER NOT NULL DEFAULT 0,
    digital_pen         BOOLEAN NOT NULL DEFAULT FALSE,
    homework_help       BOOLEAN NOT NULL DEFAULT FALSE,
    currently_employed  BOOLEAN NOT NULL DEFAULT FALSE,
    work_preference     VARCHAR(100) NOT NULL,
    user_id             INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS student_profiles (
    id           SERIAL PRIMARY KEY,
    user_id      INTEGER NOT NULL UNIQUE REFERENCES users(user_id) ON DELETE CASCADE,
    full_name    VARCHAR(100) NOT NULL,
    gender       VARCHAR(30)  NOT NULL,
    birthdate    DATE         NOT NULL,
    location     VARCHAR(100) NOT NULL,
    postal_code  VARCHAR(20)  NOT NULL,
    phone_number VARCHAR(20)  NOT NULL,
    bio          VARCHAR(500),
    image_path   TEXT,
    created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ratings (
    id         SERIAL PRIMARY KEY,
    teacher_id INTEGER NOT NULL REFERENCES teacher_profiles(teacher_id) ON DELETE CASCADE,
    student_id INTEGER NOT NULL,
    rating     NUMERIC(2, 1) NOT NULL,
    comment    VARCHAR(500)  NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    user_id    INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS job_postings (
    job_id           SERIAL PRIMARY KEY,
    user_id          VARCHAR(50)  NOT NULL,
    location         VARCHAR(100) NOT NULL,
    phone            VARCHAR(20)  NOT NULL,
    job_requirements TEXT         NOT NULL,
    subjects         VARCHAR(200) NOT NULL,
    level            VARCHAR(50)  NOT NULL,
    job_nature       VARCHAR(50)  NOT NULL,
    meeting_options  VARCHAR(100) NOT NULL,
    budget           NUMERIC(10, 2) NOT NULL,
    frequency        VARCHAR(50)  NOT NULL,
    number_of_tutors INTEGER      NOT NULL DEFAULT 1,
    job_type         VARCHAR(50)  NOT NULL,
    language         VARCHAR(50)  NOT NULL,
    profile_img      TEXT,
    created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    coins            INTEGER      NOT NULL DEFAULT 0,
    job_category     VARCHAR(50)  NOT NULL,
    job_status       VARCHAR(50)  DEFAULT 'OPEN'
);

CREATE TABLE IF NOT EXISTS job_applicants (
    id             BIGSERIAL PRIMARY KEY,
    job_id         BIGINT NOT NULL REFERENCES job_postings(job_id) ON DELETE CASCADE,
    applicant_id   BIGINT NOT NULL,
    applied_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    coins_deducted INTEGER,
    status         VARCHAR(50) DEFAULT 'APPLIED',
    UNIQUE (job_id, applicant_id)
);

CREATE INDEX IF NOT EXISTS idx_teacher_profiles_user_id ON teacher_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_student_profiles_user_id ON student_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_education_teacher_id ON education(teacher_id);
CREATE INDEX IF NOT EXISTS idx_experience_teacher_id ON experience(teacher_id);
CREATE INDEX IF NOT EXISTS idx_teacher_subjects_teacher_id ON teacher_subjects(teacher_id);
CREATE INDEX IF NOT EXISTS idx_ratings_teacher_id ON ratings(teacher_id);
CREATE INDEX IF NOT EXISTS idx_job_postings_user_id ON job_postings(user_id);
CREATE INDEX IF NOT EXISTS idx_job_postings_status ON job_postings(job_status);
CREATE INDEX IF NOT EXISTS idx_job_postings_created_at ON job_postings(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_job_applicants_job_id ON job_applicants(job_id);
CREATE INDEX IF NOT EXISTS idx_job_applicants_applicant_id ON job_applicants(applicant_id);
