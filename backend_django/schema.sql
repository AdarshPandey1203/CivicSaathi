-- =====================================================================
-- CivicSaathi - MySQL Relational Database Schema
-- Compatible with MySQL 8.0+ / MariaDB 10.5+
-- Project: Multipurpose Community Assistance & Civic Issue Management
-- =====================================================================

CREATE DATABASE IF NOT EXISTS civicsaathi_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE civicsaathi_db;

-- 1. Users & Authentication Table
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(150) NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(150) NOT NULL,
  last_name VARCHAR(150) NOT NULL,
  role ENUM('citizen', 'volunteer', 'moderator', 'admin') NOT NULL DEFAULT 'citizen',
  phone_number VARCHAR(30) NULL,
  neighborhood VARCHAR(100) NULL,
  avatar_url VARCHAR(500) NULL,
  is_verified BOOLEAN NOT NULL DEFAULT FALSE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_user_role (role),
  INDEX idx_user_email (email)
) ENGINE=InnoDB;

-- 2. Civic Issue Categories Table
CREATE TABLE IF NOT EXISTS complaint_categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  slug VARCHAR(100) NOT NULL UNIQUE,
  description TEXT NULL,
  department VARCHAR(100) NOT NULL,
  sla_days INT NOT NULL DEFAULT 5,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  icon VARCHAR(50) DEFAULT 'alert-circle'
) ENGINE=InnoDB;

-- 3. Civic Complaints (FR-03, FR-04, FR-05)
CREATE TABLE IF NOT EXISTS complaints (
  id INT AUTO_INCREMENT PRIMARY KEY,
  reference_no VARCHAR(50) NOT NULL UNIQUE,
  citizen_id INT NOT NULL,
  category_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  area VARCHAR(150) NOT NULL,
  address_text VARCHAR(255) NULL,
  latitude DECIMAL(10, 8) NULL,
  longitude DECIMAL(11, 8) NULL,
  image_url VARCHAR(500) NULL,
  urgency ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium',
  status ENUM('submitted', 'verified', 'assigned', 'in_progress', 'resolved', 'rejected', 'reopened') NOT NULL DEFAULT 'submitted',
  rejection_reason TEXT NULL,
  citizen_feedback_rating INT NULL CHECK (citizen_feedback_rating BETWEEN 1 AND 5),
  citizen_feedback_notes TEXT NULL,
  is_flagged BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (citizen_id) REFERENCES users(id) ON DELETE RESTRICT,
  FOREIGN KEY (category_id) REFERENCES complaint_categories(id) ON DELETE RESTRICT,
  INDEX idx_complaint_status (status),
  INDEX idx_complaint_area (area),
  INDEX idx_complaint_ref (reference_no)
) ENGINE=InnoDB;

-- 4. Complaint Status History / Audit Trail (FR-06, FR-14)
CREATE TABLE IF NOT EXISTS complaint_updates (
  id INT AUTO_INCREMENT PRIMARY KEY,
  complaint_id INT NOT NULL,
  actor_id INT NOT NULL,
  previous_status VARCHAR(50) NULL,
  new_status VARCHAR(50) NOT NULL,
  remarks TEXT NOT NULL,
  evidence_image_url VARCHAR(500) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (complaint_id) REFERENCES complaints(id) ON DELETE CASCADE,
  FOREIGN KEY (actor_id) REFERENCES users(id) ON DELETE RESTRICT,
  INDEX idx_update_complaint (complaint_id)
) ENGINE=InnoDB;

-- 5. Complaint Assignments (Section 9)
CREATE TABLE IF NOT EXISTS complaint_assignments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  complaint_id INT NOT NULL,
  assigned_to_user_id INT NOT NULL,
  assigned_by_user_id INT NOT NULL,
  department_team VARCHAR(120) NOT NULL,
  target_resolution_date DATE NULL,
  notes TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (complaint_id) REFERENCES complaints(id) ON DELETE CASCADE,
  FOREIGN KEY (assigned_to_user_id) REFERENCES users(id) ON DELETE RESTRICT,
  FOREIGN KEY (assigned_by_user_id) REFERENCES users(id) ON DELETE RESTRICT
) ENGINE=InnoDB;

-- 6. Community Help Requests (FR-07)
CREATE TABLE IF NOT EXISTS help_requests (
  id INT AUTO_INCREMENT PRIMARY KEY,
  requester_id INT NOT NULL,
  category ENUM('senior_care', 'errands', 'tech_support', 'tutoring', 'emergency_food', 'mobility', 'other') NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  area VARCHAR(150) NOT NULL,
  urgency ENUM('standard', 'important', 'time_sensitive') DEFAULT 'standard',
  safety_agreement BOOLEAN NOT NULL DEFAULT TRUE,
  status ENUM('open', 'accepted', 'in_progress', 'completed', 'cancelled') NOT NULL DEFAULT 'open',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (requester_id) REFERENCES users(id) ON DELETE RESTRICT,
  INDEX idx_help_status (status)
) ENGINE=InnoDB;

-- 7. Community Help Responses / Offers (FR-07)
CREATE TABLE IF NOT EXISTS help_offers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  request_id INT NOT NULL,
  volunteer_id INT NOT NULL,
  message TEXT NOT NULL,
  status ENUM('offered', 'accepted', 'declined', 'completed') NOT NULL DEFAULT 'offered',
  volunteer_notes TEXT NULL,
  completion_feedback TEXT NULL,
  rating INT NULL CHECK (rating BETWEEN 1 AND 5),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (request_id) REFERENCES help_requests(id) ON DELETE CASCADE,
  FOREIGN KEY (volunteer_id) REFERENCES users(id) ON DELETE RESTRICT
) ENGINE=InnoDB;

-- 8. Give, Donate & Reuse Listings (FR-08)
CREATE TABLE IF NOT EXISTS donation_listings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  donor_id INT NOT NULL,
  item_type ENUM('books', 'clothes', 'furniture', 'electronics', 'kitchenware', 'toys', 'medical_equipment', 'other') NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  item_condition ENUM('brand_new', 'like_new', 'good', 'fair') NOT NULL,
  area VARCHAR(150) NOT NULL,
  image_url VARCHAR(500) NULL,
  collection_method ENUM('pickup_safe_zone', 'home_pickup', 'community_center_drop') DEFAULT 'pickup_safe_zone',
  status ENUM('available', 'reserved', 'collected', 'withdrawn') NOT NULL DEFAULT 'available',
  reserved_by_id INT NULL,
  collected_at DATETIME NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (donor_id) REFERENCES users(id) ON DELETE RESTRICT,
  FOREIGN KEY (reserved_by_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_listing_status (status),
  INDEX idx_listing_type (item_type)
) ENGINE=InnoDB;

-- 9. Local Verified Services Directory (FR-09)
CREATE TABLE IF NOT EXISTS directory_services (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  category ENUM('primary_clinic', 'blood_bank', 'civic_center', 'sanitation_depot', 'public_library', 'women_safety', 'helpline') NOT NULL,
  description TEXT NOT NULL,
  area VARCHAR(150) NOT NULL,
  address VARCHAR(255) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  operating_hours VARCHAR(100) NOT NULL,
  source VARCHAR(150) NOT NULL,
  external_link VARCHAR(500) NULL,
  verification_status ENUM('verified', 'under_review', 'unverified') DEFAULT 'verified',
  last_verified_date DATE NOT NULL,
  latitude DECIMAL(10, 8) NULL,
  longitude DECIMAL(11, 8) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 10. Student & Opportunity Hub (Section 5.E)
CREATE TABLE IF NOT EXISTS opportunities (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  type ENUM('scholarship', 'internship', 'fellowship', 'vocational_course', 'civic_volunteer', 'workshop') NOT NULL,
  organization VARCHAR(200) NOT NULL,
  eligibility_notes TEXT NOT NULL,
  description TEXT NOT NULL,
  application_deadline DATE NULL,
  official_link VARCHAR(500) NOT NULL,
  is_verified BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 11. Community Events (Section 5.F)
CREATE TABLE IF NOT EXISTS community_events (
  id INT AUTO_INCREMENT PRIMARY KEY,
  organizer_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  category ENUM('cleanliness_drive', 'tree_plantation', 'blood_donation_camp', 'awareness_workshop', 'recycling_meet') NOT NULL,
  description TEXT NOT NULL,
  venue VARCHAR(255) NOT NULL,
  area VARCHAR(150) NOT NULL,
  event_date DATETIME NOT NULL,
  max_participants INT DEFAULT 100,
  current_rsvps INT DEFAULT 0,
  is_approved BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (organizer_id) REFERENCES users(id) ON DELETE RESTRICT
) ENGINE=InnoDB;

-- 12. Content Flags & Moderation Queue (FR-13)
CREATE TABLE IF NOT EXISTS content_flags (
  id INT AUTO_INCREMENT PRIMARY KEY,
  reporter_id INT NOT NULL,
  target_type ENUM('complaint', 'help_request', 'listing', 'service', 'event') NOT NULL,
  target_id INT NOT NULL,
  reason ENUM('spam', 'inaccurate', 'abusive', 'harassment', 'duplicate', 'outdated') NOT NULL,
  details TEXT NULL,
  status ENUM('pending', 'reviewed', 'dismissed', 'action_taken') DEFAULT 'pending',
  moderator_notes TEXT NULL,
  resolved_by_id INT NULL,
  resolved_at DATETIME NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (reporter_id) REFERENCES users(id) ON DELETE RESTRICT,
  FOREIGN KEY (resolved_by_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- 13. System Notifications (FR-12)
CREATE TABLE IF NOT EXISTS notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  recipient_id INT NOT NULL,
  event_type VARCHAR(50) NOT NULL,
  title VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  target_link VARCHAR(255) NULL,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (recipient_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_notif_recipient (recipient_id, is_read)
) ENGINE=InnoDB;

-- Initial Seed Data
INSERT INTO complaint_categories (name, slug, description, department, sla_days, icon) VALUES
('Potholes & Road Damage', 'potholes', 'Cracks, deep potholes, sinkholes and damaged asphalt on public roads', 'Public Works Department', 4, 'alert-triangle'),
('Garbage & Waste Accumulation', 'garbage', 'Uncollected garbage heaps, overflowing bins, open dumping', 'Solid Waste Management', 2, 'trash-2'),
('Drainage & Sewage Overflow', 'drainage', 'Blocked storm drains, overflowing manholes, stagnant sewage', 'Sanitation & Drainage Board', 3, 'droplets'),
('Drinking Water Pipe Leakage', 'water_leakage', 'Main pipeline rupture, street tap leakage, low municipal pressure', 'Water Supply & Sewerage', 2, 'faucet'),
('Broken Streetlight & Dark Spots', 'streetlight', 'Fused bulbs, damaged poles, dark safety hazards', 'Electrical & Public Lighting', 3, 'lightbulb'),
('Public Facility & Park Damage', 'public_facility', 'Broken park benches, vandalized public toilets, damaged railings', 'Horticulture & Parks Dept', 7, 'building');
