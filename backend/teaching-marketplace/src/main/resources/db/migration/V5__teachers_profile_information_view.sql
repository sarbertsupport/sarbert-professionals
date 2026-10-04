-- Read model used by TeacherProfileInfo entity

CREATE OR REPLACE VIEW teachers_profile_information AS
SELECT
    tp.teacher_id AS teacherid,
    tp.display_name AS fullname,
    tp.image_path AS image,
    tp.gender AS gender,
    ROUND(COALESCE(AVG(r.rating), 0), 1) AS rating,
    COALESCE(td.total_exp_years, 0) AS totalteachingexperience,
    COALESCE(td.online_availability, FALSE) AS teachingonline,
    COALESCE(td.online_exp_years, 0) AS onlineteachingexperience,
    COALESCE(td.travel_distance, 0)::double precision AS traveldistance,
    CASE
        WHEN e.end_date IS NULL AND e.degree_type IS NOT NULL
            THEN e.degree_type || ' (' || e.start_date || ' - Present) from ' || e.institution_name
        WHEN e.degree_type IS NOT NULL
            THEN e.degree_type || ' (' || e.start_date || ' - ' || e.end_date || ') from ' || e.institution_name
        ELSE NULL
    END AS education,
    CASE
        WHEN td.min_fee IS NOT NULL AND td.max_fee IS NOT NULL AND td.rate IS NOT NULL
            THEN CONCAT('$ ', td.min_fee, '-', td.max_fee, '/', td.rate)
        ELSE NULL
    END AS feedetails,
    tp.profile_description AS description,
    tp.location,
    COALESCE(td.home_availability, FALSE) AS teachesathome,
    COALESCE(td.homework_help, FALSE) AS homeworkhelp,
    td.payment_details AS paymentdetails,
    COALESCE(td.travel_willingness, FALSE) AS travelwillingness,
    subjects.subjects,
    (
        SELECT comment
        FROM ratings
        WHERE teacher_id = tp.teacher_id
        ORDER BY rating DESC, created_at DESC
        LIMIT 1
    ) AS highestratedreview
FROM teacher_profiles tp
LEFT JOIN teaching_details td ON tp.teacher_id = td.teacher_id
LEFT JOIN LATERAL (
    SELECT e1.*
    FROM education e1
    WHERE e1.teacher_id = tp.teacher_id
    ORDER BY e1.end_date DESC NULLS FIRST, e1.start_date DESC
    LIMIT 1
) e ON TRUE
LEFT JOIN (
    SELECT
        ts.teacher_id,
        string_agg(s.subject_name, ', ' ORDER BY s.subject_name) AS subjects
    FROM teacher_subjects ts
    LEFT JOIN subjects s ON ts.subject_id = s.subject_id
    GROUP BY ts.teacher_id
) subjects ON tp.teacher_id = subjects.teacher_id
LEFT JOIN ratings r ON tp.teacher_id = r.teacher_id
GROUP BY
    tp.teacher_id,
    tp.display_name,
    tp.image_path,
    tp.gender,
    td.total_exp_years,
    td.online_availability,
    td.online_exp_years,
    td.travel_distance,
    e.degree_type,
    e.start_date,
    e.end_date,
    e.institution_name,
    td.min_fee,
    td.max_fee,
    td.rate,
    tp.profile_description,
    tp.location,
    td.home_availability,
    td.homework_help,
    td.payment_details,
    td.travel_willingness,
    subjects.subjects;
