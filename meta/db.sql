CREATE TABLE IF NOT EXISTS protocol (
  id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
  protocol_name varchar(255) not NULL UNIQUE,
  creation_date DATETIME NOT NULL,
  protocol_string TEXT,
  comment TEXT,
  creator_id int NOT NULL,
  FOREIGN KEY (creator_id) REFERENCES user (id)
);

CREATE TABLE IF NOT EXISTS step (
  id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
  protocol_id int NOT NULL,
  sequence_order int NOT NULL,
  step_type varchar(255) CHECK(step_type in ('liquid_application', 'temperature_change','waiting')),
  FOREIGN KEY (protocol_id) REFERENCES protocol (id)
);

CREATE TABLE IF NOT EXISTS liquid_application (
  id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
  step_id int NOT NULL,
  liquid_id int NOT NULL,
  amount int NOT NULL,
  FOREIGN KEY (liquid_id) REFERENCES liquid (id),
  FOREIGN KEY (step_id) REFERENCES step (id)
);

CREATE TABLE IF NOT EXISTS waiting (
  id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
  waiting_time int NOT NULL,
  step_id int NOT NULL,
  FOREIGN KEY (step_id) REFERENCES step (id)
);

CREATE TABLE IF NOT EXISTS temperature_change (
  id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
  step_id int NOT NULL,
  target_temperature int NOT NULL,
  FOREIGN KEY (step_id) REFERENCES step (id)
);

CREATE TABLE IF NOT EXISTS user (
  id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
  name varchar(255) not NULL,
  surname varchar(255) not NULL,
  role varchar(255)
);

CREATE table IF NOT EXISTS user_setting (
  id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
  user_id int not NULL,
  setting varchar(255) not NULL,
  FOREIGN KEY (user_id) REFERENCES user (id)
);

CREATE TABLE IF NOT EXISTS protocol_deployment (
  id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
  protocol_id int NOT NULL,
  user_id INT NOT NULL,
  start_time datetime NOT NULL,
  end_time DATETIME,
  number_of_slots int NOT NULL,
  FOREIGN KEY (protocol_id) REFERENCES protocol (id),
  FOREIGN KEY (user_id) REFERENCES user (id)
);

CREATE TABLE IF NOT EXISTS executed_step (
  id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
  protocol_deployment_id int NOT NULL,
  step_id int NOT NULL,
  execution_datetime DATETIME NOT NULL,
  FOREIGN KEY (protocol_deployment_id) REFERENCES protocol_deployment (id),
  FOREIGN KEY (step_id) REFERENCES step (id)
);

CREATE TABLE IF NOT EXISTS liquid_type (
  id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
  type_name varchar(255) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS liquid (
  id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
  liquid_name VARCHAR(255) NOT NULL UNIQUE,
  liquid_type_id int NOT NULL,
  FOREIGN KEY (liquid_type_id) REFERENCES liquid_type (id)
);

CREATE TABLE IF NOT EXISTS deployment_error (
  id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
  error_id INT NOT NULL,
  deployment_id INT NOT NULL,
  FOREIGN KEY (error_id) REFERENCES error (id),
  FOREIGN KEY (deployment_id) REFERENCES protocol_deployment (id)
);

CREATE TABLE IF NOT EXISTS error (
  id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
  code INT NOT NULL,
  error_type VARCHAR(255) NOT NULL CHECK(error_type in ('hardware', 'software','pebkac')),
  error_message TEXT
);

CREATE TABLE IF NOT EXISTS deployment_liquid_configuration (
  id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
  protocol_deployment_id INT NOT NULL,
  liquid_slot_number INT NOT NULL,
  liquid_id INT NOT NULL,  
  liquid_amount INT NOT NULL,  
  FOREIGN KEY (protocol_deployment_id) REFERENCES protocol_deployment (id),
  FOREIGN KEY (liquid_id) REFERENCES liquid (id)
);


------ TEST DATA ------

INSERT INTO user (name, surname, role) VALUES ('John', 'Smith', 'Administrator')