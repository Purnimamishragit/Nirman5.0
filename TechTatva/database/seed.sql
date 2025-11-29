-- Seed data for HRRTS
-- 5 Sample Hospitals in India

INSERT INTO hospitals (name, latitude, longitude, address, phone, specialities) VALUES
('Apollo Hospital Chennai', 13.0475, 80.2506, '21, Greams Lane, Off Greams Road, Chennai, Tamil Nadu 600006', '+91-44-28296000', 'Cardiology, Oncology, Neurology, Orthopedics'),
('Fortis Hospital Bangalore', 12.9352, 77.6245, '154/9, Bannerghatta Road, Bangalore, Karnataka 560076', '+91-80-66214444', 'Multi-specialty, Emergency Care, ICU'),
('AIIMS Delhi', 28.5672, 77.2100, 'Sri Aurobindo Marg, Ansari Nagar, New Delhi, Delhi 110029', '+91-11-26588500', 'General Medicine, Surgery, Pediatrics'),
('Lilavati Hospital Mumbai', 19.0521, 72.8314, 'A-791, Bandra Reclamation, Bandra West, Mumbai, Maharashtra 400050', '+91-22-26567891', 'Cardiac Sciences, Neurosciences, Oncology'),
('Max Super Speciality Hospital Saket', 28.5244, 77.2066, '1, Press Enclave Road, Saket, New Delhi, Delhi 110017', '+91-11-26515050', 'Critical Care, Transplants, Robotics Surgery');

INSERT INTO resources (hospital_id, beds_available, icu_available, oxygen_cylinders, blood_units, doctors_available) VALUES
(1, 45, 8, 120, 85, 22),
(2, 32, 12, 95, 62, 18),
(3, 78, 15, 200, 150, 45),
(4, 28, 6, 75, 48, 15),
(5, 55, 10, 140, 95, 28);

-- Admin users (password: admin123 for all)
INSERT OR IGNORE INTO admin_users (hospital_id, username, password_hash) VALUES
(1, 'apollo_admin', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYqKq7S/5Rq'),
(2, 'fortis_admin', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYqKq7S/5Rq'),
(3, 'aiims_admin', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYqKq7S/5Rq'),
(4, 'lilavati_admin', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYqKq7S/5Rq'),
(5, 'max_admin', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYqKq7S/5Rq');

