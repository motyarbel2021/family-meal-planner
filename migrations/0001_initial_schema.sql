-- Initial schema for Meal Planning Application
-- מבנה בסיס נתונים למערכת תכנון ארוחות משפחתי

-- Children table - טבלת ילדים
CREATE TABLE IF NOT EXISTS children (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#007bff',
  dietary_tags TEXT DEFAULT '[]', -- JSON array of dietary restrictions
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Menu items table - טבלת מנות
CREATE TABLE IF NOT EXISTS menu_items (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  meal_types TEXT NOT NULL DEFAULT '[]', -- JSON array: ["breakfast", "lunch", "dinner"]
  ingredients TEXT NOT NULL DEFAULT '[]', -- JSON array of ingredients
  tags TEXT DEFAULT '[]', -- JSON array of tags
  default_servings INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Week plans table - טבלת תכניות שבועיות
CREATE TABLE IF NOT EXISTS week_plans (
  week_id TEXT PRIMARY KEY,
  children_data TEXT DEFAULT '[]', -- JSON array of children for this week
  start_date TEXT NOT NULL, -- YYYY-MM-DD format
  end_date TEXT NOT NULL, -- YYYY-MM-DD format
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Day plans table - טבלת תכניות יומיות
CREATE TABLE IF NOT EXISTS day_plans (
  id TEXT PRIMARY KEY,
  week_id TEXT NOT NULL,
  date TEXT NOT NULL, -- YYYY-MM-DD format
  breakfast_data TEXT DEFAULT '{}', -- JSON: {byChild: {childId: [selections]}}
  lunch_data TEXT DEFAULT '[]', -- JSON array of MenuItemSelection
  dinner_data TEXT DEFAULT '[]', -- JSON array of MenuItemSelection  
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (week_id) REFERENCES week_plans(week_id) ON DELETE CASCADE
);

-- Week presets table - טבלת תבניות שבועיות
CREATE TABLE IF NOT EXISTS week_presets (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  preset_data TEXT NOT NULL, -- JSON of complete week plan
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Pantry items table - טבלת פריטי מלאי ביתי
CREATE TABLE IF NOT EXISTS pantry_items (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  unit TEXT NOT NULL,
  quantity REAL DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Privacy consent table - טבלת הסכמות פרטיות
CREATE TABLE IF NOT EXISTS privacy_consent (
  id TEXT PRIMARY KEY DEFAULT 'singleton',
  has_consented BOOLEAN DEFAULT 0,
  consent_date DATETIME,
  version TEXT DEFAULT '1.0',
  cloud_services_enabled BOOLEAN DEFAULT 0,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Chat messages table - טבלת הודעות צ'אט (אופציונלי למעקב)
CREATE TABLE IF NOT EXISTS chat_messages (
  id TEXT PRIMARY KEY,
  content TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  processed BOOLEAN DEFAULT 0,
  actions_data TEXT DEFAULT '[]' -- JSON array of actions taken
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_menu_items_active ON menu_items(is_active);
CREATE INDEX IF NOT EXISTS idx_menu_items_name ON menu_items(name);
CREATE INDEX IF NOT EXISTS idx_day_plans_week_id ON day_plans(week_id);
CREATE INDEX IF NOT EXISTS idx_day_plans_date ON day_plans(date);
CREATE INDEX IF NOT EXISTS idx_week_plans_dates ON week_plans(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_children_name ON children(name);
CREATE INDEX IF NOT EXISTS idx_pantry_items_name ON pantry_items(name);

-- Triggers for updated_at timestamps
CREATE TRIGGER IF NOT EXISTS update_children_timestamp 
  AFTER UPDATE ON children
  BEGIN
    UPDATE children SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
  END;

CREATE TRIGGER IF NOT EXISTS update_menu_items_timestamp 
  AFTER UPDATE ON menu_items
  BEGIN
    UPDATE menu_items SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
  END;

CREATE TRIGGER IF NOT EXISTS update_week_plans_timestamp 
  AFTER UPDATE ON week_plans
  BEGIN
    UPDATE week_plans SET updated_at = CURRENT_TIMESTAMP WHERE week_id = NEW.week_id;
  END;

CREATE TRIGGER IF NOT EXISTS update_day_plans_timestamp 
  AFTER UPDATE ON day_plans
  BEGIN
    UPDATE day_plans SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
  END;

CREATE TRIGGER IF NOT EXISTS update_pantry_items_timestamp 
  AFTER UPDATE ON pantry_items
  BEGIN
    UPDATE pantry_items SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
  END;

CREATE TRIGGER IF NOT EXISTS update_privacy_consent_timestamp 
  AFTER UPDATE ON privacy_consent
  BEGIN
    UPDATE privacy_consent SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
  END;