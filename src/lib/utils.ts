// Utility functions for Meal Planning Application

// Generate unique IDs
export function generateId(): string {
  return crypto.randomUUID()
}

// Generate week ID based on start date
export function generateWeekId(startDate: string): string {
  return `week-${startDate}`
}

// Get Hebrew day name
export function getHebrewDayName(dayOfWeek: number): string {
  const days = ['רביעי', 'חמישי', 'שישי', 'שבת', 'ראשון', 'שני', 'שלישי']
  return days[dayOfWeek]
}

// Format date to YYYY-MM-DD
export function formatDate(date: Date): string {
  return date.toISOString().split('T')[0]
}

// Parse date from YYYY-MM-DD string
export function parseDate(dateStr: string): Date {
  return new Date(dateStr + 'T00:00:00')
}

// Get week range (Saturday to Friday by default)
export function getWeekRange(startDate: Date): { startDate: string; endDate: string; days: string[] } {
  const start = new Date(startDate)
  const days: string[] = []
  
  // Generate 7 days starting from the given start date
  for (let i = 0; i < 7; i++) {
    const day = new Date(start)
    day.setDate(start.getDate() + i)
    days.push(formatDate(day))
  }
  
  const endDate = new Date(start)
  endDate.setDate(start.getDate() + 6)
  
  return {
    startDate: formatDate(start),
    endDate: formatDate(endDate),
    days
  }
}

// Get current week (Saturday to Friday)
export function getCurrentWeek(): { startDate: string; endDate: string; days: string[] } {
  const now = new Date()
  const dayOfWeek = now.getDay() // 0 = Sunday, 6 = Saturday
  
  // Calculate days until Saturday (start of Hebrew week)
  let daysUntilSaturday = (6 - dayOfWeek) % 7
  if (daysUntilSaturday === 0 && dayOfWeek !== 6) {
    daysUntilSaturday = 6
  }
  
  const startDate = new Date(now)
  startDate.setDate(now.getDate() - (6 - daysUntilSaturday))
  
  return getWeekRange(startDate)
}

// Normalize unit names for ingredient consolidation
export function normalizeUnit(unit: string): string {
  const unitMap: { [key: string]: string } = {
    'גרם': 'גרם',
    'גר': 'גרם',
    'קילוגרם': 'קילוגרם',
    'קג': 'קילוגרם',
    'ק"ג': 'קילוגרם',
    'מיליליטר': 'מיליליטר',
    'מל': 'מיליליטר',
    'ליטר': 'ליטר',
    'ל': 'ליטר',
    'כוס': 'כוס',
    'כוסות': 'כוס',
    'כפות': 'כפות',
    'כפית': 'כפית',
    'כפיות': 'כפית',
    'יחידה': 'יחידה',
    'יח': 'יחידה',
    'יחידות': 'יחידה',
    'חבילה': 'חבילה',
    'חבילות': 'חבילה',
    'שקית': 'שקית',
    'שקיות': 'שקית',
    'פרוסה': 'פרוסה',
    'פרוסות': 'פרוסה'
  }
  
  return unitMap[unit] || unit
}

// Convert units to common base for consolidation
export function convertToBaseUnit(quantity: number, unit: string): { quantity: number; unit: string } {
  const normalized = normalizeUnit(unit)
  
  switch (normalized) {
    case 'קילוגרם':
      return { quantity: quantity * 1000, unit: 'גרם' }
    case 'ליטר':
      return { quantity: quantity * 1000, unit: 'מיליליטר' }
    default:
      return { quantity, unit: normalized }
  }
}

// Convert back from base unit to preferred display unit
export function convertFromBaseUnit(quantity: number, unit: string): { quantity: number; unit: string } {
  if (unit === 'גרם' && quantity >= 1000) {
    return { quantity: quantity / 1000, unit: 'קילוגרם' }
  }
  if (unit === 'מיליליטר' && quantity >= 1000) {
    return { quantity: quantity / 1000, unit: 'ליטר' }
  }
  return { quantity, unit }
}

// Categorize grocery items
export function categorizeGroceryItem(itemName: string): string {
  const name = itemName.toLowerCase()
  
  if (name.includes('עגבני') || name.includes('מלפפון') || name.includes('בצל') || name.includes('פלפל') || 
      name.includes('גזר') || name.includes('ברוקולי') || name.includes('בננה') || name.includes('תפוח') ||
      name.includes('ירקות') || name.includes('פירות')) {
    return 'ירקות ופירות'
  }
  
  if (name.includes('עוף') || name.includes('בשר') || name.includes('דג') || name.includes('פילה')) {
    return 'בשר ודגים'
  }
  
  if (name.includes('חלב') || name.includes('יוגורט') || name.includes('גבינה') || name.includes('ביצ')) {
    return 'חלב וביצים'
  }
  
  if (name.includes('לחם') || name.includes('לחמנ') || name.includes('טוסט') || name.includes('פיתה')) {
    return 'לחם ומאפים'
  }
  
  if (name.includes('אורז') || name.includes('פסטה') || name.includes('קטני') || name.includes('עדש') || 
      name.includes('חומוס') || name.includes('קמח')) {
    return 'יבשים וקטניות'
  }
  
  if (name.includes('רוטב') || name.includes('ריבה') || name.includes('שמן') || name.includes('חמאה') ||
      name.includes('תבלין') || name.includes('מלח') || name.includes('סוכר')) {
    return 'שמורים ומתובלים'
  }
  
  return 'אחר'
}

// Hebrew text search/comparison utilities
export function normalizeHebrewText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[״׳]/g, '') // Remove Hebrew punctuation
    .replace(/\s+/g, ' ') // Normalize spaces
    .trim()
}

// Check if text contains search term (Hebrew-aware)
export function hebrewIncludes(text: string, searchTerm: string): boolean {
  return normalizeHebrewText(text).includes(normalizeHebrewText(searchTerm))
}

// Sort Hebrew text alphabetically
export function sortHebrewAlphabetically<T>(items: T[], getTextFn: (item: T) => string): T[] {
  return items.sort((a, b) => {
    const textA = getTextFn(a)
    const textB = getTextFn(b)
    return textA.localeCompare(textB, 'he', { numeric: true, ignorePunctuation: true })
  })
}

// Validate Hebrew meal name
export function isValidMealName(name: string): boolean {
  if (!name || name.trim().length < 2) return false
  
  const trimmed = name.trim()
  // Allow Hebrew characters, Latin characters, numbers, spaces, and common punctuation
  const hebrewPattern = /^[\u0590-\u05FF\u0020-\u007E\s\-'"״׳]+$/
  
  return hebrewPattern.test(trimmed) && trimmed.length <= 100
}

// Generate color palette for children
export function generateChildColor(index: number): string {
  const colors = [
    '#ff6b6b', // Red
    '#4ecdc4', // Teal  
    '#45b7d1', // Blue
    '#f9ca24', // Yellow
    '#f0932b', // Orange
    '#eb4d4b', // Dark red
    '#6c5ce7', // Purple
    '#2d3436', // Dark gray
    '#00b894', // Green
    '#fdcb6e'  // Light orange
  ]
  
  return colors[index % colors.length]
}

// Format ingredient quantity for display
export function formatIngredientQuantity(quantity: number, unit: string): string {
  const formatted = quantity % 1 === 0 ? quantity.toString() : quantity.toFixed(1)
  return `${formatted} ${unit}`
}