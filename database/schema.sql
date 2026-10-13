SET NAMES utf8mb4;

CREATE TABLE users (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(190) NOT NULL UNIQUE,
  phone VARCHAR(32) NULL,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('user','admin','moderator','finance') NOT NULL DEFAULT 'user',
  status ENUM('pending_verification','active','suspended','closed') NOT NULL DEFAULT 'pending_verification',
  email_verified_at DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX users_status_role(status, role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE email_verifications (
  user_id BIGINT UNSIGNED NOT NULL PRIMARY KEY,
  token_hash CHAR(64) NOT NULL,
  expires_at DATETIME NOT NULL,
  CONSTRAINT fk_verify_user FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE deals (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  public_id CHAR(26) NOT NULL UNIQUE,
  buyer_id BIGINT UNSIGNED NOT NULL,
  seller_email VARCHAR(190) NOT NULL,
  seller_id BIGINT UNSIGNED NULL,
  title VARCHAR(160) NOT NULL,
  terms TEXT NOT NULL,
  currency VARCHAR(4) NOT NULL DEFAULT 'KES',
  amount_minor BIGINT UNSIGNED NOT NULL,
  fee_minor BIGINT UNSIGNED NOT NULL DEFAULT 0,
  status ENUM('draft','awaiting_seller','awaiting_payment','funding','funded','in_progress','delivered','in_review','disputed','resolved','completed','cancelled','refunded') NOT NULL DEFAULT 'draft',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_deal_buyer FOREIGN KEY(buyer_id) REFERENCES users(id),
  CONSTRAINT fk_deal_seller FOREIGN KEY(seller_id) REFERENCES users(id),
  INDEX deals_buyer_status(buyer_id,status), INDEX deals_seller_status(seller_id,status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE deal_invites (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  deal_id BIGINT UNSIGNED NOT NULL,
  invited_email VARCHAR(190) NOT NULL,
  token_hash CHAR(64) NOT NULL UNIQUE,
  expires_at DATETIME NOT NULL,
  accepted_at DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_invite_deal FOREIGN KEY(deal_id) REFERENCES deals(id) ON DELETE CASCADE,
  INDEX invites_email(invited_email,expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE payment_intents (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  deal_id BIGINT UNSIGNED NOT NULL,
  provider ENUM('hashpay','mpesa','crypto') NOT NULL,
  provider_reference VARCHAR(190) NULL,
  provider_transaction_id VARCHAR(100) NULL,
  network ENUM('tron','bsc') NULL,
  checkout_url VARCHAR(500) NULL,
  expires_at DATETIME NULL,
  amount_minor BIGINT UNSIGNED NOT NULL,
  currency VARCHAR(4) NOT NULL,
  status ENUM('created','pending','confirmed','failed','refunded','exception') NOT NULL DEFAULT 'created',
  provider_payload JSON NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_payment_deal FOREIGN KEY(deal_id) REFERENCES deals(id),
  UNIQUE KEY payment_provider_ref(provider,provider_reference),
  UNIQUE KEY payment_provider_tx(provider,provider_transaction_id),
  INDEX payment_deal_status(deal_id,status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE safety_reports (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  reporter_id BIGINT UNSIGNED NULL,
  subject_identifier_hash CHAR(64) NULL,
  category VARCHAR(80) NOT NULL,
  details TEXT NOT NULL,
  evidence_path VARCHAR(255) NULL,
  status ENUM('new','reviewing','substantiated','unsubstantiated','appealed','closed') NOT NULL DEFAULT 'new',
  reviewer_id BIGINT UNSIGNED NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_reporter FOREIGN KEY(reporter_id) REFERENCES users(id) ON DELETE SET NULL,
  CONSTRAINT fk_report_reviewer FOREIGN KEY(reviewer_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX reports_status(status,created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE admin_audit_log (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  admin_id BIGINT UNSIGNED NOT NULL,
  action VARCHAR(80) NOT NULL,
  target_type VARCHAR(40) NOT NULL,
  target_id VARCHAR(80) NOT NULL,
  details JSON NULL,
  ip_hash CHAR(64) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_audit_admin FOREIGN KEY(admin_id) REFERENCES users(id),
  INDEX audit_target(target_type,target_id), INDEX audit_admin(admin_id,created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
