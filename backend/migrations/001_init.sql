CREATE DATABASE IF NOT EXISTS collab_docs CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE collab_docs;

CREATE TABLE IF NOT EXISTS users (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE,
  password_hash VARCHAR(255),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS documents (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(255) NOT NULL,
  content_text LONGTEXT,
  content_json JSON,
  content_html LONGTEXT,
  ydoc_state LONGBLOB,
  owner_id BIGINT NOT NULL,
  current_version INT DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (owner_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS document_collaborators (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  document_id BIGINT NOT NULL,
  user_id BIGINT NOT NULL,
  role ENUM('owner', 'editor', 'viewer') NOT NULL DEFAULT 'editor',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_document_user (document_id, user_id),
  FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS document_versions (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  document_id BIGINT NOT NULL,
  version_number INT NOT NULL,
  content_text LONGTEXT,
  content_json JSON,
  content_html LONGTEXT,
  ydoc_snapshot LONGBLOB,
  created_by BIGINT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS document_updates (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  document_id BIGINT NOT NULL,
  user_id BIGINT,
  update_data LONGBLOB NOT NULL,
  client_id VARCHAR(100),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

INSERT INTO users (id, name, email)
VALUES (1, 'Demo User', 'demo@example.com')
ON DUPLICATE KEY UPDATE name = VALUES(name);
