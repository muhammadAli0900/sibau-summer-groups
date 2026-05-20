-- IBA Summer Course Groups - Database Schema
-- Run this in your Supabase SQL editor

-- Programs
CREATE TABLE IF NOT EXISTS programs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  color TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Courses
CREATE TABLE IF NOT EXISTS courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id UUID REFERENCES programs(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  title TEXT NOT NULL,
  semester_number INT,
  credit_hours TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Groups
CREATE TABLE IF NOT EXISTS groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  group_name TEXT NOT NULL,
  platform TEXT NOT NULL DEFAULT 'WhatsApp',
  invite_link TEXT NOT NULL,
  added_by TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Join Logs
CREATE TABLE IF NOT EXISTS join_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  program_code TEXT NOT NULL DEFAULT '',
  course_title TEXT NOT NULL DEFAULT '',
  group_name TEXT NOT NULL DEFAULT '',
  platform TEXT NOT NULL DEFAULT 'WhatsApp',
  joined_at TIMESTAMPTZ DEFAULT now(),
  user_agent TEXT
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_courses_program_id ON courses(program_id);
CREATE INDEX IF NOT EXISTS idx_courses_title ON courses(title);
CREATE INDEX IF NOT EXISTS idx_groups_course_id ON groups(course_id);
CREATE INDEX IF NOT EXISTS idx_join_logs_group_id ON join_logs(group_id);
CREATE INDEX IF NOT EXISTS idx_join_logs_joined_at ON join_logs(joined_at);

-- Enable RLS
ALTER TABLE programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE join_logs ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Public read programs" ON programs FOR SELECT USING (true);
CREATE POLICY "Public read courses" ON courses FOR SELECT USING (true);
CREATE POLICY "Public read groups" ON groups FOR SELECT USING (true);
CREATE POLICY "Public read join_logs" ON join_logs FOR SELECT USING (true);

-- Public write for groups and join_logs (users can add groups and log joins)
CREATE POLICY "Public insert groups" ON groups FOR INSERT WITH CHECK (true);
CREATE POLICY "Public insert join_logs" ON join_logs FOR INSERT WITH CHECK (true);
CREATE POLICY "Public delete groups" ON groups FOR DELETE USING (true);

-- ============================================================
-- SEED DATA
-- ============================================================

-- Programs
INSERT INTO programs (code, name, color) VALUES
  ('BSCS',   'BS Computer Science',           '#3b82f6'),
  ('BSSE',   'BS Software Engineering',        '#8b5cf6'),
  ('BBA',    'BBA',                            '#10b981'),
  ('BSAF',   'BS Accounting & Finance',        '#f59e0b'),
  ('BE-CSE', 'BE Computer Systems Engineering','#f43f5e'),
  ('BE-EE',  'BE Electrical Engineering',      '#06b6d4'),
  ('BSMath', 'BS Mathematics',                 '#ec4899'),
  ('BED',    'B.Ed (Hons) Elementary',         '#0ea5e9'),
  ('BSMC',   'BS Media & Communications',      '#d946ef')
ON CONFLICT (code) DO NOTHING;

-- ============================================================
-- BSCS Courses
-- ============================================================
DO $$
DECLARE prog_id UUID;
BEGIN
  SELECT id INTO prog_id FROM programs WHERE code = 'BSCS';
  INSERT INTO courses (program_id, code, title, semester_number, credit_hours) VALUES
    (prog_id, 'CS102',  'Programming Fundamentals',                  1, '4'),
    (prog_id, 'GE101',  'Application of ICT',                        1, '3'),
    (prog_id, 'GE102',  'Islamic Studies/Ethics',                    1, '2'),
    (prog_id, 'GE104',  'Discrete Structures',                       1, '3'),
    (prog_id, 'GE105',  'Functional English',                        1, '3'),
    (prog_id, 'CS150',  'Object Oriented Programming',               2, '4'),
    (prog_id, 'CS151',  'Database Systems',                          2, '4'),
    (prog_id, 'GE150',  'Applied Physics',                           2, '3'),
    (prog_id, 'GE151',  'Calculus and Analytic Geometry',            2, '3'),
    (prog_id, 'GE152',  'Expository Writing',                        2, '3'),
    (prog_id, 'CS201',  'Data Structures',                           3, '4'),
    (prog_id, 'MT201',  'Multivariate Calculus',                     3, '3'),
    (prog_id, 'CS202',  'Digital Logic Design',                      3, '3'),
    (prog_id, 'CS203',  'Computer Networks',                         3, '3'),
    (prog_id, 'CS204',  'Software Engineering',                      3, '3'),
    (prog_id, 'GE201',  'Ideology and Constitution of Pakistan',     3, '2'),
    (prog_id, 'CS250',  'Computer Organization & Assembly Language', 4, '3'),
    (prog_id, 'CS251',  'Theory of Automata',                        4, '3'),
    (prog_id, 'CS252',  'Advanced Database Management Systems',      4, '3'),
    (prog_id, 'CS253',  'Artificial Intelligence',                   4, '3'),
    (prog_id, 'CS254',  'Information Security',                      4, '3'),
    (prog_id, 'MT250',  'Probability and Statistics',                4, '3'),
    (prog_id, 'CS301',  'Operating Systems',                         5, '3'),
    (prog_id, 'CS302',  'Compiler Construction',                     5, '3'),
    (prog_id, 'CS303',  'Computer Architecture',                     5, '3'),
    (prog_id, 'MT301',  'Linear Algebra',                            5, '3'),
    (prog_id, 'CS350',  'HCI and Computer Graphics',                 6, '3'),
    (prog_id, 'CS351',  'Parallel & Distributed Computing',          6, '3'),
    (prog_id, 'CS352',  'Analysis of Algorithms',                    6, '3'),
    (prog_id, 'EN350',  'Technical & Business Writing',              6, '3'),
    (prog_id, 'CS401',  'Final Year Project-I',                      7, '2'),
    (prog_id, 'GE401',  'Entrepreneurship',                          7, '2'),
    (prog_id, 'CS450',  'Final Year Project-II',                     8, '4'),
    (prog_id, 'GE450',  'Social Sciences',                           8, '2'),
    (prog_id, 'GE451',  'Arts & Humanities (Professional Practices)',8, '2'),
    (prog_id, 'GE452',  'Civics and Community Engagement',           8, '2');
END $$;

-- ============================================================
-- BSSE Courses
-- ============================================================
DO $$
DECLARE prog_id UUID;
BEGIN
  SELECT id INTO prog_id FROM programs WHERE code = 'BSSE';
  INSERT INTO courses (program_id, code, title, semester_number, credit_hours) VALUES
    (prog_id, 'CS102',  'Programming Fundamentals',                        1, '4'),
    (prog_id, 'GE101',  'Application of ICT',                              1, '3'),
    (prog_id, 'GE104',  'Quantitative Reasoning-1 (Discrete Structures)',  1, '3'),
    (prog_id, 'GE102',  'Islamic Studies/Ethics',                          1, '2'),
    (prog_id, 'GE105',  'Functional English',                              1, '3'),
    (prog_id, 'CS150',  'Object Oriented Programming',                     2, '4'),
    (prog_id, 'CS151',  'Database Systems',                                2, '4'),
    (prog_id, 'GE150',  'Natural Science (Applied Physics)',               2, '3'),
    (prog_id, 'GE151',  'Calculus and Analytic Geometry',                  2, '3'),
    (prog_id, 'GE152',  'Expository Writing',                              2, '3'),
    (prog_id, 'CS201',  'Data Structures',                                 3, '4'),
    (prog_id, 'MT201',  'Multivariable Calculus',                          3, '3'),
    (prog_id, 'CS202',  'Digital Logic Design',                            3, '3'),
    (prog_id, 'CS203',  'Computer Networks',                               3, '3'),
    (prog_id, 'CS204',  'Software Engineering',                            3, '3'),
    (prog_id, 'GE201',  'Ideology and Constitution of Pakistan',           3, '2'),
    (prog_id, 'CS250',  'Computer Organization & Assembly Language',       4, '3'),
    (prog_id, 'CS255',  'Software Design & Architecture',                  4, '3'),
    (prog_id, 'CS256',  'Software Construction & Development',             4, '3'),
    (prog_id, 'CS253',  'Artificial Intelligence',                         4, '3'),
    (prog_id, 'CS254',  'Information Security',                            4, '3'),
    (prog_id, 'MT250',  'Probability & Statistics',                        4, '3'),
    (prog_id, 'CS301',  'Operating Systems',                               5, '3'),
    (prog_id, 'CS304',  'Software Quality Engineering',                    5, '3'),
    (prog_id, 'CS305',  'Software Requirement Engineering',                5, '3'),
    (prog_id, 'MT301',  'Linear Algebra',                                  5, '3'),
    (prog_id, 'CS353',  'Software Project Management',                     6, '3'),
    (prog_id, 'CS351',  'Parallel & Distributed Computing',                6, '3'),
    (prog_id, 'CS352',  'Analysis of Algorithm',                           6, '3'),
    (prog_id, 'EN350',  'Technical & Business Writing',                    6, '3'),
    (prog_id, 'CS401',  'Final Year Project-I',                            7, '2'),
    (prog_id, 'GE401',  'Entrepreneurship',                                7, '2'),
    (prog_id, 'CS450',  'Final Year Project-II',                           8, '4'),
    (prog_id, 'GE450',  'Social Sciences',                                 8, '2'),
    (prog_id, 'GE451',  'Arts & Humanities (Professional Practices)',      8, '2'),
    (prog_id, 'GE452',  'Civics and Community Engagement',                 8, '2');
END $$;

-- ============================================================
-- BBA Courses
-- ============================================================
DO $$
DECLARE prog_id UUID;
BEGIN
  SELECT id INTO prog_id FROM programs WHERE code = 'BBA';
  INSERT INTO courses (program_id, code, title, semester_number, credit_hours) VALUES
    (prog_id, 'ENG-101', 'Functional English',                        1, '3'),
    (prog_id, 'MTS-101', 'College Algebra',                           1, '3'),
    (prog_id, 'ECO-101', 'Principles of Microeconomics',              1, '3'),
    (prog_id, 'SSC-101', 'Human Behavior',                            1, '3'),
    (prog_id, 'SSC-102', 'Pakistan and Islamic Studies/Ethics',       1, '2'),
    (prog_id, 'CSC-101', 'Computer Applications to Business',         1, '3'),
    (prog_id, 'ECO-102', 'Principles of Macroeconomics',              2, '3'),
    (prog_id, 'ENG-102', 'Creative Writing',                          2, '3'),
    (prog_id, 'SSC-103', 'Social Psychology and Self-Development',    2, '3'),
    (prog_id, 'ACC-101', 'Principles of Accounting',                  2, '3'),
    (prog_id, 'STS-101', 'Business Statistics',                       2, '3'),
    (prog_id, 'FIN-201', 'Introduction to Business Finance',          3, '3'),
    (prog_id, 'MGT-201', 'Principles of Management',                  3, '3'),
    (prog_id, 'MKT-201', 'Principles of Marketing',                   3, '3'),
    (prog_id, 'MTS-201', 'Business Mathematics',                      3, '3'),
    (prog_id, 'ACC-201', 'Corporate Accounting',                      3, '3'),
    (prog_id, 'MGT-202', 'Organizational Behavior',                   4, '3'),
    (prog_id, 'ENG-201', 'Business Communication',                    4, '3'),
    (prog_id, 'FIN-301', 'Financial Institutions and Markets',        4, '3'),
    (prog_id, 'MTS-202', 'Business Calculus',                         4, '3'),
    (prog_id, 'ECO-201', 'Development Economics',                     4, '3'),
    (prog_id, 'LAW-301', 'Business Law',                              5, '3'),
    (prog_id, 'ISF-301', 'Islamic Economics and Finance',             5, '3'),
    (prog_id, 'MKT-301', 'Marketing Management',                      5, '3'),
    (prog_id, 'HRM-301', 'Human Resource Management',                 5, '3'),
    (prog_id, 'STS-301', 'Statistical Inferences',                    5, '3'),
    (prog_id, 'MGT-301', 'Entrepreneurship',                          5, '3'),
    (prog_id, 'ACC-301', 'Managerial Accounting',                     6, '3'),
    (prog_id, 'LAW-302', 'Laws of Taxation',                          6, '3'),
    (prog_id, 'MGT-302', 'Production and Operations Management',      6, '3'),
    (prog_id, 'MGT-303', 'Business Ethics & CSR',                     6, '3'),
    (prog_id, 'ECO-401', 'International Business',                    7, '3'),
    (prog_id, 'AGB-401', 'Agribusiness',                              7, '3'),
    (prog_id, 'ECO-402', 'Basic Econometrics',                        7, '3'),
    (prog_id, 'FIN-401', 'Financial Management',                      7, '3'),
    (prog_id, 'MGT-401', 'Comparative Management',                    8, '3'),
    (prog_id, 'MGT-403', 'Business Strategy',                         8, '3');
END $$;

-- ============================================================
-- BSAF Courses
-- ============================================================
DO $$
DECLARE prog_id UUID;
BEGIN
  SELECT id INTO prog_id FROM programs WHERE code = 'BSAF';
  INSERT INTO courses (program_id, code, title, semester_number, credit_hours) VALUES
    (prog_id, 'BSAF-101', 'Functional English',                               1, '3'),
    (prog_id, 'BSAF-102', 'Pakistan Studies/Islamiyat',                       1, '3'),
    (prog_id, 'BSAF-103', 'Principles of Microeconomics',                     1, '3'),
    (prog_id, 'BSAF-104', 'Business Mathematics',                             1, '3'),
    (prog_id, 'BSAF-105', 'Introduction to Information Technology',           1, '3'),
    (prog_id, 'BSAF-106', 'Fundamentals of Financial Accounting',             1, '3'),
    (prog_id, 'BSAF-107', 'Principles of Management',                         2, '3'),
    (prog_id, 'BSAF-108', 'Principles of Macroeconomics',                     2, '3'),
    (prog_id, 'BSAF-112', 'English Composition',                              2, '3'),
    (prog_id, 'BSAF-110', 'Mercantile Laws',                                  2, '3'),
    (prog_id, 'BSAF-111', 'Business Statistics',                              2, '3'),
    (prog_id, 'BSAF-201', 'Principles of Marketing',                          3, '3'),
    (prog_id, 'BSAF-202', 'Intermediate Financial Accounting',                3, '3'),
    (prog_id, 'BSAF-203', 'Introduction to Management Accounting',            3, '3'),
    (prog_id, 'BSAF-204', 'Organization Behavior',                            3, '3'),
    (prog_id, 'BSAF-205', 'Introduction to Business Finance',                 3, '3'),
    (prog_id, 'BSAF-210', 'Statistical Inference',                            3, '3'),
    (prog_id, 'BSAF-207', 'Fundamentals of Auditing',                         4, '3'),
    (prog_id, 'BSAF-208', 'Principles of Taxation',                           4, '3'),
    (prog_id, 'BSAF-209', 'Company Laws',                                     4, '3'),
    (prog_id, 'BSAF-211', 'Financial Institution and Markets',                4, '3'),
    (prog_id, 'BSAF-212', 'Business Research Methods',                        4, '3'),
    (prog_id, 'BSAF-109', 'Business Communication & Report Writing',          4, '3'),
    (prog_id, 'BSAF-301', 'Corporate Financial Reporting',                    5, '3'),
    (prog_id, 'BSAF-404', 'Business Ethics',                                  5, '3'),
    (prog_id, 'BSAF-304', 'Management Accounting & Control System',           5, '3'),
    (prog_id, 'BSAF-305', 'Intermediate Business Finance',                    5, '3'),
    (prog_id, 'BSAF-313', 'Banking Operations',                               5, '3'),
    (prog_id, 'BSAF-307', 'Advanced Taxation',                                5, '3'),
    (prog_id, 'BSAF-306', 'Human Resource Management',                        6, '3'),
    (prog_id, 'BSAF-308', 'Marketing Management',                             6, '3'),
    (prog_id, 'BSAF-309', 'Applied Corporate Laws & Secretarial Practices',   6, '3'),
    (prog_id, 'BSAF-310', 'Auditing & Assurance and Related Services',        6, '3'),
    (prog_id, 'BSAF-311', 'Corporate Risk Management',                        6, '3'),
    (prog_id, 'BSAF-312', 'Advanced Corporate Financial Reporting',           6, '3'),
    (prog_id, 'BSAF-401', 'Management Accounting-Decision Making',            7, '3'),
    (prog_id, 'BSAF-402', 'Analysis of Financial Statements',                 7, '3'),
    (prog_id, 'BSAF-403', 'Applied Financial Management',                     7, '3'),
    (prog_id, 'BSAF-404b','Financial Information System',                     7, '3'),
    (prog_id, 'BSAF-405', 'Strategic Business Management',                    7, '3'),
    (prog_id, 'BSAF-407', 'Practicum',                                        8, '6');
END $$;

-- ============================================================
-- BE-CSE Courses
-- ============================================================
DO $$
DECLARE prog_id UUID;
BEGIN
  SELECT id INTO prog_id FROM programs WHERE code = 'BE-CSE';
  INSERT INTO courses (program_id, code, title, semester_number, credit_hours) VALUES
    (prog_id, 'CSE-111', 'Computing Fundamentals',                          1, '3'),
    (prog_id, 'CSE-112', 'Introduction to Programming',                     1, '4'),
    (prog_id, 'HUM-111', 'Functional English',                              1, '3'),
    (prog_id, 'HUM-112', 'Pakistan Studies',                                1, '2'),
    (prog_id, 'MTS-111', 'Calculus and Analytical Geometry',                1, '3'),
    (prog_id, 'ELE-111', 'Workshop Practice',                               1, '1'),
    (prog_id, 'CSE-121', 'Object Oriented Programming',                     2, '4'),
    (prog_id, 'MTS-121', 'Discrete Mathematics',                            2, '3'),
    (prog_id, 'HUM-122', 'Islamic Studies/Ethics',                          2, '2'),
    (prog_id, 'ELE-121', 'Fundamentals of Electrical & Electronics Engineering', 2, '4'),
    (prog_id, 'PHY-121', 'Applied Physics',                                 2, '4'),
    (prog_id, 'CSE-122', 'Computer Aided Design',                           2, '1'),
    (prog_id, 'MTS-211', 'Complex Variables & Transforms',                  3, '3'),
    (prog_id, 'CSE-211', 'Data Structures and Algorithms',                  3, '4'),
    (prog_id, 'ELE-211', 'Circuit Analysis',                                3, '4'),
    (prog_id, 'ESE-211', 'Digital Logic Design',                            3, '4'),
    (prog_id, 'HUM-211', 'Communication and Presentation Skills',           3, '3'),
    (prog_id, 'MTS-221', 'Linear Algebra & Differential Equations',         4, '3'),
    (prog_id, 'CSE-221', 'Computer Architecture & Organization',            4, '4'),
    (prog_id, 'ESE-221', 'Signals and Systems',                             4, '4'),
    (prog_id, 'CSE-222', 'Operating Systems',                               4, '4'),
    (prog_id, 'HUM-221', 'Technical Writing',                               4, '3'),
    (prog_id, 'MTS-311', 'Probability & Statistics',                        5, '3'),
    (prog_id, 'CSE-311', 'Database Management System',                      5, '4'),
    (prog_id, 'CSE-312', 'Computer Communication and Networks',             5, '4'),
    (prog_id, 'CSE-313', 'Artificial Intelligence',                         5, '4'),
    (prog_id, 'HUM-311', 'Organizational Behavior',                         5, '3'),
    (prog_id, 'MTS-321', 'Numerical Methods',                               6, '3'),
    (prog_id, 'CSE-321', 'Microprocessor and Microcontroller',              6, '4'),
    (prog_id, 'CSE-322', 'Software Engineering',                            6, '4'),
    (prog_id, 'MGT-321', 'Engineering Economics & Management',              6, '3'),
    (prog_id, 'CSE-419', 'Final Year Project-I',                            7, '3'),
    (prog_id, 'MGT-411', 'Entrepreneurship Development & Project Management', 7, '3'),
    (prog_id, 'CSE-429', 'Final Year Project-II',                           8, '3');
END $$;

-- ============================================================
-- BE-EE Courses
-- ============================================================
DO $$
DECLARE prog_id UUID;
BEGIN
  SELECT id INTO prog_id FROM programs WHERE code = 'BE-EE';
  INSERT INTO courses (program_id, code, title, semester_number, credit_hours) VALUES
    (prog_id, 'CSE-111', 'Information and Communication Technologies',   1, '3'),
    (prog_id, 'ELE-111', 'Workshop Practice',                            1, '1'),
    (prog_id, 'HUM-101', 'Functional English',                           1, '3'),
    (prog_id, 'HUM-111', 'Islamiat',                                     1, '2'),
    (prog_id, 'MSC-101', 'Calculus and Analytical Geometry',             1, '3'),
    (prog_id, 'PHY-111', 'Applied Physics',                              1, '4'),
    (prog_id, 'HUM-202', 'Communication & Presentation Skills',          2, '3'),
    (prog_id, 'MSC-208', 'Linear Algebra & Differential Equations',      2, '3'),
    (prog_id, 'SSC-101', 'Pakistan Studies',                             2, '2'),
    (prog_id, 'ELE-121', 'Linear Circuit Analysis',                      2, '4'),
    (prog_id, 'CSE-121', 'Programming for Engineers',                    2, '3'),
    (prog_id, 'CSE-122', 'Computer Aided Design',                        2, '1'),
    (prog_id, 'MSC-202', 'Multivariate Calculus',                        3, '3'),
    (prog_id, 'ESE-211', 'Digital Logic Design',                         3, '4'),
    (prog_id, 'ELE-211', 'Electrical Network Analysis',                  3, '4'),
    (prog_id, 'ESE-212', 'Electronic Devices and Circuits',              3, '4'),
    (prog_id, 'CSE-211', 'Object Oriented Programming',                  3, '3'),
    (prog_id, 'MTS-221', 'Complex Variables & Transforms',               4, '3'),
    (prog_id, 'ELE-221', 'Electromagnetics Field Theory',                4, '3'),
    (prog_id, 'ELE-222', 'Electrical Machines',                          4, '4'),
    (prog_id, 'MTS-311', 'Probability & Statistics',                     5, '3'),
    (prog_id, 'ELE-312', 'Signals and Systems',                          5, '4'),
    (prog_id, 'ELE-313', 'Instrumentation & Measurement',                5, '4'),
    (prog_id, 'ESE-312', 'Embedded Systems',                             5, '4'),
    (prog_id, 'ESE-321', 'Power Electronics',                            6, '4'),
    (prog_id, 'ELE-322', 'Communication Systems',                        6, '4'),
    (prog_id, 'CSE-321', 'Artificial Intelligence',                      6, '3'),
    (prog_id, 'MGT-321', 'Engineering Economics & Management',           6, '3'),
    (prog_id, 'ELE-323', 'Control Systems',                              6, '4'),
    (prog_id, 'HUM-411', 'Technical Writing',                            7, '2'),
    (prog_id, 'MGT-411', 'Project Management',                           7, '3'),
    (prog_id, 'ELE-419', 'Final Year Project-I',                         7, '2'),
    (prog_id, 'MGT-421', 'Engineering Entrepreneurship',                 8, '3'),
    (prog_id, 'ELE-429', 'Final Year Project-II',                        8, '4');
END $$;

-- ============================================================
-- BSMath Courses
-- ============================================================
DO $$
DECLARE prog_id UUID;
BEGIN
  SELECT id INTO prog_id FROM programs WHERE code = 'BSMath';
  INSERT INTO courses (program_id, code, title, semester_number, credit_hours) VALUES
    (prog_id, 'MAT-111', 'Calculus-I',                          1, '3'),
    (prog_id, 'MAT-112', 'Mathematical Thinking',               1, '3'),
    (prog_id, 'ENG-101', 'Functional English',                  1, '3'),
    (prog_id, 'CSC-101', 'Introduction to ICT',                 1, '3'),
    (prog_id, 'STA-101', 'Introduction to Statistics',          1, '3'),
    (prog_id, 'HUM-103', 'Islamic Studies/Ethics',              1, '2'),
    (prog_id, 'MAT-121', 'Calculus-II',                         2, '3'),
    (prog_id, 'MAT-122', 'Linear Algebra-I',                    2, '3'),
    (prog_id, 'PHY-121', 'Applied Physics-I',                   2, '4'),
    (prog_id, 'CSC-121', 'Introduction to Language (C++)',      2, '4'),
    (prog_id, 'HUM-104', 'Pakistan Studies',                    2, '2'),
    (prog_id, 'MAT-211', 'Calculus-III',                        3, '3'),
    (prog_id, 'MAT-212', 'Linear Algebra-II',                   3, '3'),
    (prog_id, 'MAT-213', 'Theory of Probability',               3, '3'),
    (prog_id, 'MAT-214', 'Computing Tools for Mathematics',     3, '1'),
    (prog_id, 'PHY-211', 'Applied Physics-II',                  3, '4'),
    (prog_id, 'ENG-102', 'Communication and Presentation Skills', 3, '3'),
    (prog_id, 'MAT-221', 'Real Analysis',                       4, '3'),
    (prog_id, 'MAT-222', 'Introduction to Topology',            4, '3'),
    (prog_id, 'MAT-223', 'Mathematics of Data Science',         4, '3'),
    (prog_id, 'SSC-101', 'Introduction to Sociology/Philosophy',4, '3'),
    (prog_id, 'ENG-201', 'Technical Writing',                   4, '3'),
    (prog_id, 'MAT-311', 'Functional Analysis',                 5, '3'),
    (prog_id, 'MAT-312', 'Complex Analysis',                    5, '3'),
    (prog_id, 'MAT-313', 'Ordinary Differential Equations',     5, '3'),
    (prog_id, 'MAT-314', 'Group Theory',                        5, '3'),
    (prog_id, 'MAT-315', 'Numerical Analysis-I',                5, '4'),
    (prog_id, 'MAT-321', 'Partial Differential Equations',      6, '3'),
    (prog_id, 'MAT-322', 'Classical Mechanics',                 6, '3'),
    (prog_id, 'MAT-323', 'Theory of Curves and Surfaces',       6, '3'),
    (prog_id, 'MAT-411', 'Numerical Analysis-II',               7, '4');
END $$;

-- ============================================================
-- B.Ed (Hons) Elementary Courses
-- ============================================================
DO $$
DECLARE prog_id UUID;
BEGIN
  SELECT id INTO prog_id FROM programs WHERE code = 'BED';
  INSERT INTO courses (program_id, code, title, semester_number, credit_hours) VALUES
    (prog_id, 'ENG_101', 'Functional English-I',                             1, '3'),
    (prog_id, 'URD_102', 'Urdu/Regional Languages',                         1, '3'),
    (prog_id, 'SCI_104', 'General Science',                                  1, '3'),
    (prog_id, 'MOT_206', 'Methods of Teaching',                              1, '3'),
    (prog_id, 'COM_106', 'Computer Literacy',                                1, '3'),
    (prog_id, 'CHD_204', 'Child Development',                                1, '3'),
    (prog_id, 'ENG_201', 'Functional English-II',                            2, '3'),
    (prog_id, 'MGT_202', 'Classroom Management',                             2, '3'),
    (prog_id, 'ICT_305', 'ICT in Education',                                 2, '3'),
    (prog_id, 'ISL_107', 'Islamic Studies/Ethics',                           2, '2'),
    (prog_id, 'PST_205', 'Pakistan Studies',                                 2, '3'),
    (prog_id, 'MAT_105', 'General Mathematics',                              2, '3'),
    (prog_id, 'ENG_301', 'English-III',                                      3, '3'),
    (prog_id, 'TUR_302', 'Teaching of Urdu/Regional Languages',              3, '3'),
    (prog_id, 'TSC_304', 'Teaching of General Science',                      3, '3'),
    (prog_id, 'EED_203', 'Environmental Education',                          3, '3'),
    (prog_id, 'TIS_306', 'Methods of Teaching Islamic Studies',              3, '3'),
    (prog_id, 'TPR_307', 'Teaching Practice',                                3, '3'),
    (prog_id, 'CAT_401', 'Classroom Assessment',                             4, '3'),
    (prog_id, 'TOE_402', 'Teaching of English',                              4, '3'),
    (prog_id, 'TOM_403', 'Teaching of Mathematics',                          4, '3'),
    (prog_id, 'SCT_404', 'School Community and Teacher',                     4, '3'),
    (prog_id, 'TPS_405', 'Teaching of Social Studies',                       4, '3'),
    (prog_id, 'TPR_406', 'Teaching Practice',                                4, '3'),
    (prog_id, 'CPI_501', 'Curriculum Development',                           5, '3'),
    (prog_id, 'GC_502',  'Guidance and Counseling',                          5, '3'),
    (prog_id, 'CON_503', 'Content Course-I Discipline-I',                    5, '3'),
    (prog_id, 'CON_504', 'Content Course-I Discipline-II',                   5, '3'),
    (prog_id, 'PGY_505', 'Pedagogy-I',                                       5, '3'),
    (prog_id, 'PGY_506', 'Pedagogy-II',                                      5, '3'),
    (prog_id, 'RME_601', 'Research Methods in Education',                    6, '3'),
    (prog_id, 'PGY_602', 'Pedagogy-III',                                     6, '3'),
    (prog_id, 'PGY_603', 'Pedagogy-IV',                                      6, '3'),
    (prog_id, 'PSY_604', 'Educational Psychology',                           6, '3'),
    (prog_id, 'TDE_605', 'Assessment and Evaluation',                        6, '3'),
    (prog_id, 'TPR_606', 'Teaching Practice External',                       6, '3'),
    (prog_id, 'IED_701', 'Inclusive Education',                              7, '3'),
    (prog_id, 'CIT_702', 'Contemporary Issues and Trends in Education',      7, '3'),
    (prog_id, 'ASE_703', 'Application of Software in Education',             7, '3'),
    (prog_id, 'CEA_704', 'Comparative Education',                            7, '3'),
    (prog_id, 'TAP_705', 'Teaching as Profession',                           7, '3'),
    (prog_id, 'ELM_801', 'Educational Leadership and Management',            8, '3'),
    (prog_id, 'TPR_802', 'Teaching Practice Long Term',                      8, '6'),
    (prog_id, 'SIM_803', 'School Improvement and Management',                8, '3'),
    (prog_id, 'TWT_804', 'Educational Research Project',                     8, '3');
END $$;

-- ============================================================
-- BS Media & Communications Courses
-- ============================================================
DO $$
DECLARE prog_id UUID;
BEGIN
  SELECT id INTO prog_id FROM programs WHERE code = 'BSMC';
  INSERT INTO courses (program_id, code, title, semester_number, credit_hours) VALUES
    (prog_id, 'MC-501', 'Functional English',                              1, '3'),
    (prog_id, 'MC-502', 'Islamic Studies',                                 1, '2'),
    (prog_id, 'MC-503', 'Pakistan Affairs',                                1, '2'),
    (prog_id, 'MC-504', 'Introduction to Multimedia',                      1, '3'),
    (prog_id, 'MC-505', 'Introduction to Mass Communication',              1, '3'),
    (prog_id, 'MC-506', 'Introduction to International Relations',         1, '3'),
    (prog_id, 'MC-507', 'Communication Skills',                            2, '3'),
    (prog_id, 'MC-508', 'Introduction to Sociology',                       2, '3'),
    (prog_id, 'MC-509', 'Mathematics for Liberal Arts',                    2, '3'),
    (prog_id, 'MC-510', 'Storytelling in Digital Age',                     2, '3'),
    (prog_id, 'MC-511', 'Personal Development',                            2, '3'),
    (prog_id, 'MC-512', 'Photography',                                     2, '3'),
    (prog_id, 'MC-513', 'Technical Report Writing and Presentation Skills',3, '3'),
    (prog_id, 'MC-514', 'Computer Skills',                                 3, '3'),
    (prog_id, 'MC-515', 'Introduction to Psychology',                      3, '3'),
    (prog_id, 'MC-516', 'Media Psychology',                                3, '3'),
    (prog_id, 'MC-517', 'Mass Media and Society',                          3, '3'),
    (prog_id, 'MC-518', 'Introduction to Broadcast Media',                 3, '3'),
    (prog_id, 'MC-519', 'English for Journalism',                          4, '3'),
    (prog_id, 'MC-520', 'Digital Audio/Video',                             4, '3'),
    (prog_id, 'MC-521', 'Introduction to Philosophy and Thought',          4, '3'),
    (prog_id, 'MC-522', 'Contemporary World Media',                        4, '3'),
    (prog_id, 'MC-523', 'Social Media Networks Culture',                   4, '3'),
    (prog_id, 'MC-524', 'Introduction to Film and Theatre',                4, '3'),
    (prog_id, 'MC-601', 'Theories of Mass Communication I',                5, '3'),
    (prog_id, 'MC-602', 'Journalistic Urdu/Functional Urdu',               5, '3'),
    (prog_id, 'MC-603', 'Opinion Writing',                                 5, '3'),
    (prog_id, 'MC-604', 'Introduction to Advertising and Public Relations',5, '3'),
    (prog_id, 'MC-605', 'Media Laws and Ethics',                           5, '3'),
    (prog_id, 'MC-606', 'International Communication',                     5, '3'),
    (prog_id, 'MC-607', 'Theories of Mass Communication II',               6, '3'),
    (prog_id, 'MC-608', 'Research Methods-I',                              6, '3'),
    (prog_id, 'MC-609', 'Development Communication',                       6, '3'),
    (prog_id, 'MC-610', 'Introduction to Conflict Reporting',              6, '3'),
    (prog_id, 'MC-611', 'Introduction to Innovation and Entrepreneurship', 6, '3'),
    (prog_id, 'MC-612', 'Current Affairs',                                 7, '3'),
    (prog_id, 'MC-613', 'Media Management',                                7, '3'),
    (prog_id, 'MC-614', 'Online Journalism',                               7, '3'),
    (prog_id, 'MC-617', 'Research Project and Internship',                 8, '3'),
    (prog_id, 'MC-618', 'Academic Writing and Professional Writing',       8, '3'),
    (prog_id, 'MC-619', 'Regional Mass Media',                             8, '3');
END $$;
