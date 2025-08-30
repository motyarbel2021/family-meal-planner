-- Seed data for Meal Planning Application
-- נתוני דוגמה למערכת תכנון ארוחות

-- Sample children data
INSERT OR IGNORE INTO children (id, name, color, dietary_tags) VALUES 
  ('child-1', 'נועה', '#ff6b6b', '["צמחוני"]'),
  ('child-2', 'אריאל', '#4ecdc4', '[]'),
  ('child-3', 'מיכל', '#45b7d1', '["ללא גלוטן"]');

-- Sample menu items - ארוחות בוקר
INSERT OR IGNORE INTO menu_items (id, name, meal_types, ingredients, tags, default_servings) VALUES 
  ('breakfast-1', 'כריך חמאת בוטנים וריבה', '["breakfast"]', 
   '[{"id":"ing-1","name":"לחם","quantity":2,"unit":"פרוסות"}, {"id":"ing-2","name":"חמאת בוטנים","quantity":2,"unit":"כפות"}, {"id":"ing-3","name":"ריבה","quantity":1,"unit":"כפית"}]', 
   '["מהיר", "פופולרי"]', 1),
  
  ('breakfast-2', 'קורנפלקס עם חלב', '["breakfast"]',
   '[{"id":"ing-4","name":"קורנפלקס","quantity":1,"unit":"כוס"}, {"id":"ing-5","name":"חלב","quantity":200,"unit":"מיליליטר"}]',
   '["מהיר", "חלבי"]', 1),
   
  ('breakfast-3', 'ביצה רכה עם טוסט', '["breakfast"]',
   '[{"id":"ing-6","name":"ביצים","quantity":1,"unit":"יחידה"}, {"id":"ing-7","name":"לחם טוסט","quantity":2,"unit":"פרוסות"}, {"id":"ing-8","name":"חמאה","quantity":1,"unit":"כפית"}]',
   '["חלבון", "ביתי"]', 1),

  ('breakfast-4', 'יוגורט עם פירות וגרנולה', '["breakfast"]',
   '[{"id":"ing-9","name":"יוגורט טבעי","quantity":150,"unit":"גרם"}, {"id":"ing-10","name":"בננה","quantity":1,"unit":"יחידה"}, {"id":"ing-11","name":"גרנולה","quantity":2,"unit":"כפות"}]',
   '["בריא", "פירות"]', 1);

-- Sample menu items - ארוחות צהריים/ערב
INSERT OR IGNORE INTO menu_items (id, name, meal_types, ingredients, tags, default_servings) VALUES 
  ('lunch-1', 'פסטה ברוטב עגבניות', '["lunch", "dinner"]',
   '[{"id":"ing-12","name":"פסטה","quantity":500,"unit":"גרם"}, {"id":"ing-13","name":"רוטב עגבניות","quantity":1,"unit":"יחידה"}, {"id":"ing-14","name":"בצל","quantity":1,"unit":"יחידה"}, {"id":"ing-15","name":"שום","quantity":2,"unit":"שיניים"}]',
   '["צמחוני", "משפחתי", "פופולרי"]', 4),

  ('lunch-2', 'אורז עם ירקות וחזה עוף', '["lunch", "dinner"]',
   '[{"id":"ing-16","name":"אורז","quantity":2,"unit":"כוסות"}, {"id":"ing-17","name":"חזה עוף","quantity":600,"unit":"גרם"}, {"id":"ing-18","name":"גזר","quantity":2,"unit":"יחידות"}, {"id":"ing-19","name":"ברוקולי","quantity":300,"unit":"גרם"}]',
   '["חלבון", "ירקות", "מאוזן"]', 4),

  ('lunch-3', 'שקשוקה', '["lunch", "dinner"]',
   '[{"id":"ing-20","name":"ביצים","quantity":6,"unit":"יחידות"}, {"id":"ing-21","name":"עגבניות קופסה","quantity":1,"unit":"יחידה"}, {"id":"ing-22","name":"פלפל אדום","quantity":1,"unit":"יחידה"}, {"id":"ing-23","name":"בצל","quantity":1,"unit":"יחידה"}]',
   '["ביתי", "מהיר", "צמחוני"]', 4),

  ('dinner-1', 'דגים עם תפוחי אדמה', '["dinner"]',
   '[{"id":"ing-24","name":"פילה דג","quantity":600,"unit":"גרם"}, {"id":"ing-25","name":"תפוחי אדמה","quantity":800,"unit":"גרם"}, {"id":"ing-26","name":"לימון","quantity":1,"unit":"יחידה"}]',
   '["חלבון", "דג", "בריא"]', 4),

  ('dinner-2', 'מרק ירקות עם לחמניות', '["dinner"]',
   '[{"id":"ing-27","name":"ירקות מעורבים","quantity":500,"unit":"גרם"}, {"id":"ing-28","name":"מרק עוף","quantity":1,"unit":"ליטר"}, {"id":"ing-29","name":"לחמניות","quantity":4,"unit":"יחידות"}]',
   '["מחמם", "קל", "ירקות"]', 4);

-- Sample pantry items
INSERT OR IGNORE INTO pantry_items (id, name, unit, quantity) VALUES 
  ('pantry-1', 'אורז', 'קילוגרם', 2.5),
  ('pantry-2', 'פסטה', 'גרם', 800),
  ('pantry-3', 'חלב', 'ליטר', 1),
  ('pantry-4', 'ביצים', 'יחידות', 12),
  ('pantry-5', 'לחם', 'יחידה', 1),
  ('pantry-6', 'יוגורט', 'יחידות', 6);

-- Initialize privacy consent (not consented by default)
INSERT OR IGNORE INTO privacy_consent (id, has_consented, version) VALUES 
  ('singleton', 0, '1.0');

-- Sample week preset
INSERT OR IGNORE INTO week_presets (id, name, description, preset_data) VALUES 
  ('preset-1', 'שבוע לימודים רגיל', 'תפריט סטנדרטי לשבוע לימודים עם ארוחות בוקר מהירות וארוחות ערב משפחתיות',
   '{"children":[{"id":"child-1","name":"נועה","color":"#ff6b6b","dietaryTags":["צמחוני"]},{"id":"child-2","name":"אריאל","color":"#4ecdc4","dietaryTags":[]}],"days":[{"date":"2024-01-01","breakfast":{"byChild":{"child-1":[{"menuItemId":"breakfast-1","servings":1}],"child-2":[{"menuItemId":"breakfast-2","servings":1}]}},"lunch":[{"menuItemId":"lunch-1","servings":4}],"dinner":[{"menuItemId":"dinner-1","servings":4}]}]}');