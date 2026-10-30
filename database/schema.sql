CREATE DATABASE IF NOT EXISTS `broiler_farm` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `broiler_farm`;

DROP TABLE IF EXISTS `harvesting_records`;
DROP TABLE IF EXISTS `daily_logs`;
DROP TABLE IF EXISTS `inventory`;
DROP TABLE IF EXISTS `batches`;
DROP TABLE IF EXISTS `houses`;
DROP TABLE IF EXISTS `users`;

CREATE TABLE `users` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `username` VARCHAR(50) NOT NULL,
  `password_hash` VARCHAR(255) NOT NULL,
  `full_name` VARCHAR(120) NOT NULL,
  `role` ENUM('owner','vet','manager','worker') NOT NULL DEFAULT 'worker',
  `language` ENUM('th','my','en') NOT NULL DEFAULT 'th',
  `phone` VARCHAR(30) NULL,
  `email` VARCHAR(120) NULL,
  `status` ENUM('active','inactive','disabled') NOT NULL DEFAULT 'active',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_users_username` (`username`),
  KEY `idx_users_role` (`role`),
  KEY `idx_users_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='ข้อมูลผู้ใช้งานระบบและบทบาทตามหน้าที่';

CREATE TABLE `houses` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `house_name` VARCHAR(100) NOT NULL,
  `capacity` INT UNSIGNED NOT NULL,
  `status` ENUM('active','maintenance','empty') NOT NULL DEFAULT 'active',
  `location` VARCHAR(150) NULL,
  `description` TEXT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_houses_name` (`house_name`),
  KEY `idx_houses_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='ข้อมูลโรงเรือนเลี้ยงไก่ในฟาร์ม';

CREATE TABLE `batches` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `house_id` BIGINT UNSIGNED NOT NULL,
  `batch_code` VARCHAR(50) NOT NULL,
  `breed` VARCHAR(80) NOT NULL,
  `chick_in_date` DATE NOT NULL,
  `initial_quantity` INT UNSIGNED NOT NULL,
  `current_quantity` INT UNSIGNED NOT NULL,
  `status` ENUM('planned','active','closed','cancelled') NOT NULL DEFAULT 'planned',
  `target_weight_kg` DECIMAL(8,2) NULL,
  `deleted_at` TIMESTAMP NULL DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_batches_code` (`batch_code`),
  KEY `idx_batches_house_id` (`house_id`),
  KEY `idx_batches_status` (`status`),
  KEY `idx_batches_chick_in_date` (`chick_in_date`),
  CONSTRAINT `fk_batches_house` FOREIGN KEY (`house_id`) REFERENCES `houses` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='ข้อมูลรอบการเลี้ยงไก่แต่ละโรงเรือน';

CREATE TABLE `daily_logs` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `batch_id` BIGINT UNSIGNED NOT NULL,
  `log_date` DATE NOT NULL,
  `recorded_by` BIGINT UNSIGNED NOT NULL,
  `mortality_count` INT UNSIGNED NOT NULL DEFAULT 0,
  `cull_count` INT UNSIGNED NOT NULL DEFAULT 0,
  `feed_bags` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `feed_kg` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `water_liters` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  `temperature_c` DECIMAL(5,2) NULL,
  `humidity_percent` DECIMAL(5,2) NULL,
  `photo_url` VARCHAR(255) NULL,
  `notes` TEXT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_daily_logs_batch_date` (`batch_id`, `log_date`),
  KEY `idx_daily_logs_batch_id` (`batch_id`),
  KEY `idx_daily_logs_log_date` (`log_date`),
  KEY `idx_daily_logs_recorded_by` (`recorded_by`),
  CONSTRAINT `fk_daily_logs_batch` FOREIGN KEY (`batch_id`) REFERENCES `batches` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_daily_logs_user` FOREIGN KEY (`recorded_by`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='บันทึกข้อมูลประจำวันจากหน้าโรงเรือน เช่น อาหาร น้ำ อุณหภูมิ และการตาย';

CREATE TABLE `inventory` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `item_code` VARCHAR(50) NOT NULL,
  `item_name` VARCHAR(150) NOT NULL,
  `category` ENUM('feed','medicine','vaccine','other') NOT NULL,
  `unit` VARCHAR(30) NOT NULL,
  `stock_quantity` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  `reorder_level` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  `supplier` VARCHAR(150) NULL,
  `purchase_date` DATE NULL,
  `expiry_date` DATE NULL,
  `status` ENUM('active','low_stock','expired','inactive') NOT NULL DEFAULT 'active',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_inventory_item_code` (`item_code`),
  KEY `idx_inventory_category` (`category`),
  KEY `idx_inventory_status` (`status`),
  KEY `idx_inventory_name` (`item_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='ข้อมูลสต็อกสินค้า เช่น อาหารไก่ ยา วัคซีน และวัสดุใช้งาน';

CREATE TABLE `harvesting_records` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `batch_id` BIGINT UNSIGNED NOT NULL,
  `harvest_date` DATE NOT NULL,
  `total_weight_kg` DECIMAL(10,2) NOT NULL,
  `bird_count` INT UNSIGNED NOT NULL,
  `empty_truck_weight_kg` DECIMAL(10,2) NOT NULL,
  `loss_percentage` DECIMAL(5,2) NOT NULL DEFAULT 0.00,
  `notes` TEXT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_harvest_batch_id` (`batch_id`),
  KEY `idx_harvest_date` (`harvest_date`),
  CONSTRAINT `fk_harvesting_batch` FOREIGN KEY (`batch_id`) REFERENCES `batches` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='บันทึกการจับไก่ส่งมอบ รายงานน้ำหนัก จำนวน และเปอร์เซ็นต์ไก่เสีย';

INSERT INTO `users` (`username`, `password_hash`, `full_name`, `role`, `language`) VALUES
  ('owner', '$2a$10$rs9rD4L7QGEyAgZWGgDSrub967MsgAb/SXyRTMDXxhscxds8EwRhS', 'Owner User', 'owner', 'th'),
  ('vet', '$2a$10$rs9rD4L7QGEyAgZWGgDSrub967MsgAb/SXyRTMDXxhscxds8EwRhS', 'Veterinarian', 'vet', 'en'),
  ('manager', '$2a$10$rs9rD4L7QGEyAgZWGgDSrub967MsgAb/SXyRTMDXxhscxds8EwRhS', 'Farm Manager', 'manager', 'th'),
  ('worker', '$2a$10$rs9rD4L7QGEyAgZWGgDSrub967MsgAb/SXyRTMDXxhscxds8EwRhS', 'Farm Worker', 'worker', 'my');

INSERT INTO `houses` (`house_name`, `capacity`, `status`, `location`) VALUES
  ('House A', 15000, 'active', 'North Zone'),
  ('House B', 12000, 'active', 'South Zone'),
  ('House C', 10000, 'maintenance', 'West Zone');

INSERT INTO `batches` (`house_id`, `batch_code`, `breed`, `chick_in_date`, `initial_quantity`, `current_quantity`, `status`, `target_weight_kg`) VALUES
  (1, 'BATCH-2025-001', 'Cobb 500', '2025-01-15', 12000, 11850, 'active', 2.60),
  (2, 'BATCH-2025-002', 'Ross 308', '2025-02-10', 10000, 9700, 'active', 2.50),
  (1, 'BATCH-2025-003', 'Cobb 500', '2025-03-01', 13000, 12850, 'planned', 2.70);

INSERT INTO `inventory` (`item_code`, `item_name`, `category`, `unit`, `stock_quantity`, `reorder_level`, `supplier`) VALUES
  ('FEED-001', 'Starter Feed 1', 'feed', 'bag', 250, 80, 'CP Feed'),
  ('FEED-002', 'Grower Feed 2', 'feed', 'bag', 180, 60, 'CP Feed'),
  ('MED-001', 'Vitamin C', 'medicine', 'bottle', 36, 10, 'Animal Health Co'),
  ('VAC-001', 'Newcastle Vaccine', 'vaccine', 'dose', 300, 50, 'Vet Supply');

INSERT INTO `daily_logs` (`batch_id`, `log_date`, `recorded_by`, `mortality_count`, `cull_count`, `feed_bags`, `feed_kg`, `water_liters`, `temperature_c`, `humidity_percent`, `notes`) VALUES
  (1, '2025-02-05', 4, 14, 2, 30.0, 1500.00, 1200.00, 31.50, 62.40, 'Feed consumption normal'),
  (1, '2025-02-06', 4, 18, 3, 32.0, 1600.00, 1260.00, 31.80, 63.20, 'Slightly warm in midday'),
  (2, '2025-02-15', 4, 20, 4, 25.0, 1250.00, 1140.00, 30.90, 61.10, 'Stable');
