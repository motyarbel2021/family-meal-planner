import { Hono } from 'hono';

type Bindings = {
  DB: D1Database;
}

const groceryListRoutes = new Hono<{ Bindings: Bindings }>();

// Ingredient categories mapping in Hebrew
const ingredientCategories = {
  // Proteins
  'בשר בקר': 'בשר ודגים',
  'בשר עוף': 'בשר ודגים', 
  'דג': 'בשר ודגים',
  'ביצים': 'בשר ודגים',
  'טונה': 'בשר ודגים',
  'סלמון': 'בשר ודגים',
  
  // Dairy
  'חלב': 'חלבי',
  'יוגורט': 'חלבי',
  'גבינה': 'חלבי',
  'חמאה': 'חלבי',
  'שמנת': 'חלבי',
  'קוטג\'': 'חלבי',
  
  // Grains and Bakery
  'לחם': 'דגנים ולחם',
  'פיתה': 'דגנים ולחם',
  'אורז': 'דגנים ולחם',
  'פסטה': 'דגנים ולחם',
  'קמח': 'דגנים ולחם',
  'שיבולת שועל': 'דגנים ולחם',
  
  // Vegetables
  'עגבנייה': 'ירקות',
  'מלפפון': 'ירקות',
  'בצל': 'ירקות',
  'שום': 'ירקות',
  'גזר': 'ירקות',
  'תפוח אדמה': 'ירקות',
  'תפוחי אדמה': 'ירקות',
  'חסה': 'ירקות',
  'פלפל': 'ירקות',
  'ברוקולי': 'ירקות',
  'כרוב': 'ירקות',
  
  // Fruits
  'תפוח': 'פירות',
  'בננה': 'פירות',
  'תפוז': 'פירות',
  'לימון': 'פירות',
  'אבוקדו': 'פירות',
  'ענבים': 'פירות',
  
  // Pantry items
  'שמן': 'מזווה',
  'שמן זית': 'מזווה',
  'מלח': 'מזווה',
  'פלפל שחור': 'מזווה',
  'סוכר': 'מזווה',
  'קטשופ': 'מזווה',
  'מיונז': 'מזווה',
  'חומץ': 'מזווה',
  'דבש': 'מזווה',
  'רוטב עגבניות': 'מזווה',
  'חמאת בוטנים': 'מזווה',
  'ריבה': 'מזווה',
  
  // Breakfast items
  'קורנפלקס': 'דגנים ולחם',
  'גרנולה': 'דגנים ולחם',
  
  // Meat and proteins (additional)
  'חזה עוף': 'בשר ודגים',
  'עגבניות קופסה': 'מזווה',
  
  // Frozen
  'ירקות קפואים': 'קפואים',
  'פירות קפואים': 'קפואים',
  
  // Drinks
  'מים': 'משקאות',
  'מיץ': 'משקאות',
  'קולה': 'משקאות',
  'בירה': 'משקאות',
  
  // Cleaning & Household
  'סבון כלים': 'ניקוי ובית',
  'נייר טואלט': 'ניקוי ובית',
  'חומר כביסה': 'ניקוי ובית'
};

// Unit normalization - convert everything to standard units
const unitConversions = {
  // Weight
  'גרם': { unit: 'גר', multiplier: 1 },
  'גר': { unit: 'גר', multiplier: 1 },
  'g': { unit: 'גר', multiplier: 1 },
  'קילוגרם': { unit: 'קג', multiplier: 1000 },
  'קג': { unit: 'קג', multiplier: 1000 },
  'kg': { unit: 'קג', multiplier: 1000 },
  
  // Volume
  'מיליליטר': { unit: 'מ״ל', multiplier: 1 },
  'מ״ל': { unit: 'מ״ל', multiplier: 1 },
  'ml': { unit: 'מ״ל', multiplier: 1 },
  'ליטר': { unit: 'ליטר', multiplier: 1000 },
  'l': { unit: 'ליטר', multiplier: 1000 },
  
  // Count
  'יחידה': { unit: 'יח\'', multiplier: 1 },
  'יח\'': { unit: 'יח\'', multiplier: 1 },
  'יחידות': { unit: 'יח\'', multiplier: 1 },
  'units': { unit: 'יח\'', multiplier: 1 },
  
  // Cooking measures
  'כף': { unit: 'כפות', multiplier: 1 },
  'כפות': { unit: 'כפות', multiplier: 1 },
  'כפית': { unit: 'כפיות', multiplier: 1 },
  'כפיות': { unit: 'כפיות', multiplier: 1 },
  'כוס': { unit: 'כוסות', multiplier: 1 },
  'כוסות': { unit: 'כוסות', multiplier: 1 }
};

function categorizeIngredient(ingredient: string): string {
  const lowerIngredient = ingredient.toLowerCase();
  
  // Check for exact matches first
  for (const [key, category] of Object.entries(ingredientCategories)) {
    if (lowerIngredient.includes(key.toLowerCase())) {
      return category;
    }
  }
  
  return 'כללי'; // Default category
}

function normalizeUnit(quantity: number, unit: string): { quantity: number, unit: string } {
  const lowerUnit = unit.toLowerCase().trim();
  const conversion = unitConversions[lowerUnit];
  
  if (!conversion) {
    return { quantity, unit }; // Return as-is if unknown unit
  }
  
  // Convert to base unit
  const baseQuantity = quantity * conversion.multiplier;
  
  // Convert to appropriate display unit
  if (conversion.unit === 'גר' && baseQuantity >= 1000) {
    return { quantity: baseQuantity / 1000, unit: 'קג' };
  }
  
  if (conversion.unit === 'מ״ל' && baseQuantity >= 1000) {
    return { quantity: baseQuantity / 1000, unit: 'ליטר' };
  }
  
  return { quantity: baseQuantity / conversion.multiplier, unit: conversion.unit };
}

function aggregateIngredients(ingredients: Array<{ ingredient: string, quantity: number, unit: string }>): Array<{ ingredient: string, quantity: number, unit: string, category: string }> {
  const aggregated = new Map();
  
  for (const item of ingredients) {
    const key = item.ingredient.toLowerCase().trim();
    const normalized = normalizeUnit(item.quantity, item.unit);
    const category = categorizeIngredient(item.ingredient);
    
    if (aggregated.has(key)) {
      const existing = aggregated.get(key);
      // Only aggregate if same unit
      if (existing.unit === normalized.unit) {
        existing.quantity += normalized.quantity;
      } else {
        // Different units, create separate entry
        const uniqueKey = `${key}_${normalized.unit}`;
        aggregated.set(uniqueKey, {
          ingredient: item.ingredient,
          quantity: normalized.quantity,
          unit: normalized.unit,
          category
        });
      }
    } else {
      aggregated.set(key, {
        ingredient: item.ingredient,
        quantity: normalized.quantity,
        unit: normalized.unit,
        category
      });
    }
  }
  
  return Array.from(aggregated.values());
}

// Generate grocery list from week plan
groceryListRoutes.post('/:weekId', async (c) => {
  try {
    const weekId = c.req.param('weekId');
    
    // Get week plan
    const weekPlan = await c.env.DB.prepare(`
      SELECT * FROM week_plans WHERE week_id = ?
    `).bind(weekId).first();
    
    if (!weekPlan) {
      return c.json({ error: 'Week plan not found' }, 404);
    }
    
    // Get day plans for this week
    const { results: dayPlans } = await c.env.DB.prepare(`
      SELECT * FROM day_plans WHERE week_id = ? ORDER BY date
    `).bind(weekId).all();
    
    const allIngredients: Array<{ ingredient: string, quantity: number, unit: string }> = [];
    
    // Extract ingredients from all meals in the week plan
    for (const dayPlan of dayPlans) {
      const mealIds: string[] = [];
      
      // Collect all meal IDs from breakfast data (per child)
      const breakfastData = JSON.parse(dayPlan.breakfast_data || '{}');
      for (const childBreakfast of Object.values(breakfastData)) {
        if (Array.isArray(childBreakfast)) {
          for (const meal of childBreakfast) {
            if (meal && (meal as any).id) {
              mealIds.push((meal as any).id);
            }
          }
        }
      }
      
      // Collect meal IDs from lunch data
      const lunchData = JSON.parse(dayPlan.lunch_data || '[]');
      for (const meal of lunchData) {
        if (meal && meal.id) {
          mealIds.push(meal.id);
        }
      }
      
      // Collect meal IDs from dinner data
      const dinnerData = JSON.parse(dayPlan.dinner_data || '[]');
      for (const meal of dinnerData) {
        if (meal && meal.id) {
          mealIds.push(meal.id);
        }
      }
      
      // Fetch ingredients for all meals from menu_items table
      for (const mealId of mealIds) {
        const menuItem = await c.env.DB.prepare(`
          SELECT ingredients FROM menu_items WHERE id = ?
        `).bind(mealId).first();
        
        if (menuItem && menuItem.ingredients) {
          const ingredients = JSON.parse(menuItem.ingredients as string);
          // Convert ingredient format to match expected format
          for (const ing of ingredients) {
            allIngredients.push({
              ingredient: ing.name || ing.ingredient,
              quantity: parseFloat(ing.quantity) || 1,
              unit: ing.unit || 'יח\''
            });
          }
        }
      }
    }
    
    // Aggregate and normalize ingredients
    const aggregatedIngredients = aggregateIngredients(allIngredients);
    
    // Sort by category and then by name
    aggregatedIngredients.sort((a, b) => {
      if (a.category !== b.category) {
        return a.category.localeCompare(b.category, 'he');
      }
      return a.ingredient.localeCompare(b.ingredient, 'he');
    });
    
    const groceryList = {
      weekId,
      weekRange: `${weekPlan.start_date} - ${weekPlan.end_date}`,
      generatedAt: new Date().toISOString(),
      ingredients: aggregatedIngredients.map(item => ({
        ...item,
        purchased: false
      })),
      totalItems: aggregatedIngredients.length
    };
    
    return c.json(groceryList);
    
  } catch (error) {
    console.error('Error generating grocery list:', error);
    return c.json({ error: 'Failed to generate grocery list' }, 500);
  }
});

// Get saved grocery lists
groceryListRoutes.get('/', async (c) => {
  try {
    // For now, return empty array as we're not persisting grocery lists
    // In the future, you could save grocery lists to database
    return c.json([]);
  } catch (error) {
    console.error('Error fetching grocery lists:', error);
    return c.json({ error: 'Failed to fetch grocery lists' }, 500);
  }
});

// Update grocery list (mark items as purchased, edit quantities, etc.)
groceryListRoutes.put('/:weekId', async (c) => {
  try {
    const weekId = c.req.param('weekId');
    const updatedList = await c.req.json();
    
    // Here you could save the updated grocery list to database
    // For now, just return success
    
    return c.json({ 
      success: true, 
      message: 'Grocery list updated successfully',
      weekId,
      updatedAt: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error updating grocery list:', error);
    return c.json({ error: 'Failed to update grocery list' }, 500);
  }
});

export default groceryListRoutes;