import { Hono } from 'hono'
import type { Bindings, GroceryItem, PantryItem, ApiResponse } from '../types'
import { 
  generateId, 
  normalizeUnit, 
  convertToBaseUnit, 
  convertFromBaseUnit, 
  categorizeGroceryItem,
  sortHebrewAlphabetically 
} from '../lib/utils'

export const groceryRoutes = new Hono<{ Bindings: Bindings }>()

// Generate grocery list for a week plan
groceryRoutes.post('/generate/:weekId', async (c) => {
  try {
    const weekId = c.req.param('weekId')
    
    // Get week plan data
    const { results: weekResults } = await c.env.DB.prepare(
      'SELECT * FROM week_plans WHERE week_id = ?'
    ).bind(weekId).all()

    if (weekResults.length === 0) {
      return c.json<ApiResponse>({
        success: false,
        error: 'תכנית שבועית לא נמצאה'
      }, 404)
    }

    // Get day plans for the week
    const { results: dayResults } = await c.env.DB.prepare(
      'SELECT * FROM day_plans WHERE week_id = ?'
    ).bind(weekId).all()

    // Get all active menu items
    const { results: menuResults } = await c.env.DB.prepare(
      'SELECT * FROM menu_items WHERE is_active = 1'
    ).all()

    const menuItemsMap = new Map()
    menuResults.forEach((item: any) => {
      menuItemsMap.set(item.id, {
        id: item.id,
        name: item.name,
        ingredients: JSON.parse(item.ingredients || '[]')
      })
    })

    // Collect all ingredients from the week plan
    const ingredientMap = new Map<string, { quantity: number; unit: string }>()

    for (const dayRow of dayResults) {
      const day = dayRow as any
      
      // Process breakfast meals (by child)
      const breakfastData = JSON.parse(day.breakfast_data || '{"byChild":{}}')
      for (const childId of Object.keys(breakfastData.byChild || {})) {
        const selections = breakfastData.byChild[childId] || []
        processMenuSelections(selections, menuItemsMap, ingredientMap)
      }

      // Process lunch meals
      const lunchData = JSON.parse(day.lunch_data || '[]')
      processMenuSelections(lunchData, menuItemsMap, ingredientMap)

      // Process dinner meals
      const dinnerData = JSON.parse(day.dinner_data || '[]')
      processMenuSelections(dinnerData, menuItemsMap, ingredientMap)
    }

    // Get pantry items to check what's already available
    const { results: pantryResults } = await c.env.DB.prepare(
      'SELECT * FROM pantry_items WHERE quantity > 0'
    ).all()

    const pantryMap = new Map<string, number>()
    pantryResults.forEach((item: any) => {
      const key = `${item.name}|${normalizeUnit(item.unit)}`
      pantryMap.set(key, item.quantity)
    })

    // Generate final grocery list
    const groceryItems: GroceryItem[] = []

    for (const [ingredientKey, totalQuantity] of ingredientMap.entries()) {
      const [name, unit] = ingredientKey.split('|')
      
      // Check if we have this item in pantry
      const pantryQuantity = pantryMap.get(ingredientKey) || 0
      const neededQuantity = Math.max(0, totalQuantity.quantity - pantryQuantity)
      
      if (neededQuantity > 0) {
        const finalQuantity = convertFromBaseUnit(neededQuantity, totalQuantity.unit)
        
        groceryItems.push({
          name,
          unit: finalQuantity.unit,
          quantity: Math.ceil(finalQuantity.quantity * 100) / 100, // Round up to 2 decimals
          category: categorizeGroceryItem(name),
          isInPantry: false
        })
      }
    }

    // Sort by category and then by Hebrew alphabetical order
    const sortedItems = groceryItems.sort((a, b) => {
      if (a.category !== b.category) {
        return a.category.localeCompare(b.category, 'he')
      }
      return a.name.localeCompare(b.name, 'he')
    })

    return c.json<ApiResponse<GroceryItem[]>>({
      success: true,
      data: sortedItems,
      message: 'רשימת המצרכים נוצרה בהצלחה'
    })

  } catch (error) {
    return c.json<ApiResponse>({
      success: false,
      error: 'שגיאה ביצירת רשימת המצרכים'
    }, 500)
  }
})

// Get all pantry items
groceryRoutes.get('/pantry', async (c) => {
  try {
    const { results } = await c.env.DB.prepare(
      'SELECT * FROM pantry_items ORDER BY name COLLATE NOCASE'
    ).all()

    const pantryItems: PantryItem[] = results.map((row: any) => ({
      name: row.name,
      unit: row.unit,
      quantity: row.quantity
    }))

    return c.json<ApiResponse<PantryItem[]>>({
      success: true,
      data: pantryItems
    })
  } catch (error) {
    return c.json<ApiResponse>({
      success: false,
      error: 'שגיאה בטעינת מלאי הבית'
    }, 500)
  }
})

// Update pantry item
groceryRoutes.put('/pantry/:name', async (c) => {
  try {
    const name = decodeURIComponent(c.req.param('name'))
    const body = await c.req.json()
    const { unit, quantity } = body

    if (!unit || typeof quantity !== 'number' || quantity < 0) {
      return c.json<ApiResponse>({
        success: false,
        error: 'יחידה וכמות חייבים להיות תקינים'
      }, 400)
    }

    const now = new Date().toISOString()

    // Check if pantry item exists
    const { results: existing } = await c.env.DB.prepare(
      'SELECT id FROM pantry_items WHERE name = ?'
    ).bind(name).all()

    if (existing.length === 0) {
      // Create new pantry item
      const id = generateId()
      await c.env.DB.prepare(`
        INSERT INTO pantry_items (id, name, unit, quantity, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?)
      `).bind(id, name, unit, quantity, now, now).run()
    } else {
      // Update existing pantry item
      await c.env.DB.prepare(`
        UPDATE pantry_items 
        SET unit = ?, quantity = ?, updated_at = ?
        WHERE name = ?
      `).bind(unit, quantity, now, name).run()
    }

    const pantryItem: PantryItem = {
      name,
      unit,
      quantity
    }

    return c.json<ApiResponse<PantryItem>>({
      success: true,
      data: pantryItem,
      message: 'פריט המלאי עודכן בהצלחה'
    })

  } catch (error) {
    return c.json<ApiResponse>({
      success: false,
      error: 'שגיאה בעדכון פריט המלאי'
    }, 500)
  }
})

// Delete pantry item
groceryRoutes.delete('/pantry/:name', async (c) => {
  try {
    const name = decodeURIComponent(c.req.param('name'))
    
    const result = await c.env.DB.prepare(
      'DELETE FROM pantry_items WHERE name = ?'
    ).bind(name).run()

    if (result.changes === 0) {
      return c.json<ApiResponse>({
        success: false,
        error: 'פריט לא נמצא במלאי'
      }, 404)
    }

    return c.json<ApiResponse>({
      success: true,
      message: 'הפריט הוסר מהמלאי'
    })

  } catch (error) {
    return c.json<ApiResponse>({
      success: false,
      error: 'שגיאה בהסרת הפריט מהמלאי'
    }, 500)
  }
})

// Batch update pantry items (after shopping)
groceryRoutes.post('/pantry/batch-update', async (c) => {
  try {
    const body = await c.req.json()
    const { items } = body

    if (!items || !Array.isArray(items)) {
      return c.json<ApiResponse>({
        success: false,
        error: 'רשימת פריטים לא תקינה'
      }, 400)
    }

    const now = new Date().toISOString()

    for (const item of items) {
      const { name, unit, quantity } = item

      if (!name || !unit || typeof quantity !== 'number') {
        continue // Skip invalid items
      }

      // Check if pantry item exists
      const { results: existing } = await c.env.DB.prepare(
        'SELECT id FROM pantry_items WHERE name = ?'
      ).bind(name).all()

      if (existing.length === 0) {
        // Create new pantry item
        const id = generateId()
        await c.env.DB.prepare(`
          INSERT INTO pantry_items (id, name, unit, quantity, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?)
        `).bind(id, name, unit, quantity, now, now).run()
      } else {
        // Add to existing quantity
        await c.env.DB.prepare(`
          UPDATE pantry_items 
          SET quantity = quantity + ?, updated_at = ?
          WHERE name = ?
        `).bind(quantity, now, name).run()
      }
    }

    return c.json<ApiResponse>({
      success: true,
      message: 'המלאי עודכן בהצלחה'
    })

  } catch (error) {
    return c.json<ApiResponse>({
      success: false,
      error: 'שגיאה בעדכון המלאי'
    }, 500)
  }
})

// Helper function to process menu selections and add ingredients
function processMenuSelections(
  selections: any[], 
  menuItemsMap: Map<string, any>, 
  ingredientMap: Map<string, { quantity: number; unit: string }>
) {
  for (const selection of selections) {
    const menuItem = menuItemsMap.get(selection.menuItemId)
    if (!menuItem) continue

    const servings = selection.servings || 1
    
    for (const ingredient of menuItem.ingredients) {
      const baseUnit = convertToBaseUnit(ingredient.quantity * servings, ingredient.unit)
      const key = `${ingredient.name}|${baseUnit.unit}`
      
      if (ingredientMap.has(key)) {
        const existing = ingredientMap.get(key)!
        ingredientMap.set(key, {
          quantity: existing.quantity + baseUnit.quantity,
          unit: baseUnit.unit
        })
      } else {
        ingredientMap.set(key, baseUnit)
      }
    }
  }
}