-- Run in phpMyAdmin (SQL tab) or: mysql -u root < scripts/mysql-local-xampp.sql
-- Matches backend/.env.example DB_DATABASE=koon_local

CREATE DATABASE IF NOT EXISTS `koon_local`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
