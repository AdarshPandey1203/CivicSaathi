-- ============================================================================
-- CivicSaathi - Pune City Public Grievance Redressal and Management Portal
-- Relational Database Schema for MySQL 8.0 or above
-- Architecture: Three-Tier Web Architecture - Database Layer
-- Location: Pune City, Maharashtra, India
-- ============================================================================

CREATE DATABASE IF NOT EXISTS civicsaathi_pune_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE civicsaathi_pune_db;

-- ----------------------------------------------------------------------------
-- 1. Departments Table (Pune Municipal Corporation + State Authorities)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS departments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(50) NOT NULL UNIQUE,
  name VARCHAR(150) NOT NULL,
  authority VARCHAR(100) NOT NULL,  -- e.g. 'Pune Municipal Corporation', 'Pune Police', 'MSEDCL', etc.
  description TEXT,
  contact_email VARCHAR(255),
  contact_phone VARCHAR(50),
  sla_days INT NOT NULL DEFAULT 7,
  icon VARCHAR(50) DEFAULT 'building',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ----------------------------------------------------------------------------
-- 2. Complaint Categories Table
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS complaint_categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  department_id INT NOT NULL,
  name VARCHAR(150) NOT NULL,
  description TEXT,
  default_urgency ENUM('Low', 'Medium', 'High', 'Critical') DEFAULT 'Medium',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE CASCADE,
  INDEX idx_cat_dept (department_id)
) ENGINE=InnoDB;

-- ----------------------------------------------------------------------------
-- 3. Users Table (Citizens, Department Officers, Administrators)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('citizen', 'officer', 'admin') NOT NULL DEFAULT 'citizen',
  phone VARCHAR(25) NULL,
  ward_area VARCHAR(100) NULL,      -- e.g. 'Kothrud', 'Shivajinagar', 'Hadapsar'
  department_id INT NULL,           -- Applicable for role = 'officer'
  designation VARCHAR(100) NULL,    -- e.g. 'Junior Engineer', 'Ward Inspector'
  official_id VARCHAR(50) NULL,     -- Official Gov Employee ID
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL,
  INDEX idx_user_role (role),
  INDEX idx_user_email (email),
  INDEX idx_user_dept (department_id)
) ENGINE=InnoDB;

-- ----------------------------------------------------------------------------
-- 4. Complaints Table
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS complaints (
  id INT AUTO_INCREMENT PRIMARY KEY,
  reference_no VARCHAR(50) NOT NULL UNIQUE, -- e.g. 'CS-PUN-2026-1042'
  citizen_id INT NOT NULL,
  department_id INT NOT NULL,
  category_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  ward_area VARCHAR(100) NOT NULL,
  address_landmark TEXT NOT NULL,
  latitude DECIMAL(10, 7) NULL,
  longitude DECIMAL(10, 7) NULL,
  urgency ENUM('Low', 'Medium', 'High', 'Critical') NOT NULL DEFAULT 'Medium',
  photo_url VARCHAR(500) NULL,
  resolution_photo_url VARCHAR(500) NULL,
  status ENUM('Submitted', 'Under Review', 'In Progress', 'Resolved', 'Rejected') NOT NULL DEFAULT 'Submitted',
  assigned_officer_id INT NULL,
  officer_remarks TEXT NULL,
  rejection_reason TEXT NULL,
  resolved_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (citizen_id) REFERENCES users(id) ON DELETE RESTRICT,
  FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE RESTRICT,
  FOREIGN KEY (category_id) REFERENCES complaint_categories(id) ON DELETE RESTRICT,
  FOREIGN KEY (assigned_officer_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_comp_ref (reference_no),
  INDEX idx_comp_citizen (citizen_id),
  INDEX idx_comp_dept (department_id),
  INDEX idx_comp_status (status),
  INDEX idx_comp_ward (ward_area),
  INDEX idx_comp_created (created_at)
) ENGINE=InnoDB;

-- ----------------------------------------------------------------------------
-- 5. Complaint Timeline / Status Audit Trail
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS complaint_timeline (
  id INT AUTO_INCREMENT PRIMARY KEY,
  complaint_id INT NOT NULL,
  actor_id INT NOT NULL,
  actor_name VARCHAR(150) NOT NULL,
  actor_role VARCHAR(50) NOT NULL,
  status VARCHAR(50) NOT NULL,
  remarks TEXT NOT NULL,
  evidence_photo VARCHAR(500) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (complaint_id) REFERENCES complaints(id) ON DELETE CASCADE,
  FOREIGN KEY (actor_id) REFERENCES users(id) ON DELETE RESTRICT,
  INDEX idx_tl_complaint (complaint_id)
) ENGINE=InnoDB;

-- ----------------------------------------------------------------------------
-- 6. Administrative Activity Logs
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS admin_activity_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  admin_id INT NOT NULL,
  action_type VARCHAR(100) NOT NULL, -- e.g. 'REASSIGN_COMPLAINT', 'CREATE_OFFICER'
  details TEXT NOT NULL,
  ip_address VARCHAR(50) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE RESTRICT
) ENGINE=InnoDB;
