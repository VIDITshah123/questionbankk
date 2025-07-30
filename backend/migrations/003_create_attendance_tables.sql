-- Create classes table
CREATE TABLE IF NOT EXISTS base_classes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    teacher_id INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (teacher_id) REFERENCES base_base_users_master(user_id)
);

-- Create attendance_records table
CREATE TABLE IF NOT EXISTS base_attendance_records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    class_id INTEGER NOT NULL,
    student_id INTEGER NOT NULL,
    date DATE NOT NULL,
    status TEXT CHECK(status IN ('present', 'absent', 'late', 'excused')) DEFAULT 'present',
    marked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    attendance_code TEXT,
    FOREIGN KEY (class_id) REFERENCES base_classes(id),
    FOREIGN KEY (student_id) REFERENCES base_base_users_master(user_id),
    UNIQUE(class_id, student_id, date)
);

-- Create class_enrollments table
CREATE TABLE IF NOT EXISTS base_class_enrollments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    class_id INTEGER NOT NULL,
    student_id INTEGER NOT NULL,
    enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (class_id) REFERENCES classes(id),
    FOREIGN KEY (student_id) REFERENCES base_users_master(user_id),
    UNIQUE(class_id, student_id)
);

-- Create attendance_codes table
CREATE TABLE IF NOT EXISTS base_attendance_codes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    class_id INTEGER NOT NULL,
    code TEXT NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_by INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (class_id) REFERENCES base_classes(id),
    FOREIGN KEY (created_by) REFERENCES base_base_users_master(user_id)
);
