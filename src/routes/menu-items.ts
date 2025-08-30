import { Hono } from 'hono'
import type { Bindings, MenuItem, MealType, ApiResponse } from '../types'
import { generateId, isValidMealName, sortHebrewAlphabetically } from '../lib/utils'

export const menuItemsRoutes = new Hono<{ Bindings: Bindings }>()

// Get all menu items with optional filtering
menuItemsRoutes.get('/', async (c) => {
  try {
    // Check if database is available
    if (!c.env?.DB) {
      // Return empty data when DB is not available
      return c.json<ApiResponse<MenuItem[]>>({
        success: true,
        data: []
      })
    }

    const mealType = c.req.query('mealType') as MealType | undefined
    const search = c.req.query('search')
    const activeOnly = c.req.query('activeOnly') === 'true'

    let query = 'SELECT * FROM menu_items'
    const conditions: string[] = []
    const params: any[] = []

    if (activeOnly) {
      conditions.push('is_active = 1')
    }

    if (mealType) {
      conditions.push('meal_types LIKE ?')
      params.push(`%"${mealType}"%`)
    }

    if (search) {
      conditions.push('name LIKE ?')
      params.push(`%${search}%`)
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ')
    }

    query += ' ORDER BY name COLLATE NOCASE'

    const { results } = await c.env.DB.prepare(query).bind(...params).all()

    const menuItems: MenuItem[] = results.map((row: any) => ({
      id: row.id,
      name: row.name,
      mealTypes: JSON.parse(row.meal_types || '[]'),
      ingredients: JSON.parse(row.ingredients || '[]'),
      tags: JSON.parse(row.tags || '[]'),
      defaultServings: row.default_servings,
      isActive: Boolean(row.is_active),
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }))

    return c.json<ApiResponse<MenuItem[]>>({
      success: true,
      data: menuItems
    })
  } catch (error) {
    return c.json<ApiResponse<MenuItem[]>>({
      success: true,
      data: []
    })
  }
})

// Get single menu item
menuItemsRoutes.get('/:id', async (c) => {
  try {
    const id = c.req.param('id')
    const { results } = await c.env.DB.prepare(
      'SELECT * FROM menu_items WHERE id = ?'
    ).bind(id).all()

    if (results.length === 0) {
      return c.json<ApiResponse>({
        success: false,
        error: 'מנה לא נמצאה'
      }, 404)
    }

    const row = results[0] as any
    const menuItem: MenuItem = {
      id: row.id,
      name: row.name,
      mealTypes: JSON.parse(row.meal_types || '[]'),
      ingredients: JSON.parse(row.ingredients || '[]'),
      tags: JSON.parse(row.tags || '[]'),
      defaultServings: row.default_servings,
      isActive: Boolean(row.is_active),
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }

    return c.json<ApiResponse<MenuItem>>({
      success: true,
      data: menuItem
    })
  } catch (error) {
    return c.json<ApiResponse>({
      success: false,
      error: 'שגיאה בטעינת המנה'
    }, 500)
  }
})

// Create new menu item
menuItemsRoutes.post('/', async (c) => {
  try {
    const body = await c.req.json()
    const { name, mealTypes, ingredients, tags, defaultServings } = body

    // Validate required fields
    if (!name || !isValidMealName(name)) {
      return c.json<ApiResponse>({
        success: false,
        error: 'שם המנה חייב להיות בין 2-100 תווים'
      }, 400)
    }

    if (!mealTypes || !Array.isArray(mealTypes) || mealTypes.length === 0) {
      return c.json<ApiResponse>({
        success: false,
        error: 'חייב לציין לפחות סוג ארוחה אחד'
      }, 400)
    }

    const validMealTypes = ['breakfast', 'lunch', 'dinner']
    if (!mealTypes.every(type => validMealTypes.includes(type))) {
      return c.json<ApiResponse>({
        success: false,
        error: 'סוג ארוחה לא תקין'
      }, 400)
    }

    if (!ingredients || !Array.isArray(ingredients)) {
      return c.json<ApiResponse>({
        success: false,
        error: 'רשימת מרכיבים לא תקינה'
      }, 400)
    }

    // Check if menu item with same name already exists
    const { results: existing } = await c.env.DB.prepare(
      'SELECT id FROM menu_items WHERE name = ? AND is_active = 1'
    ).bind(name.trim()).all()

    if (existing.length > 0) {
      return c.json<ApiResponse>({
        success: false,
        error: 'מנה עם השם הזה כבר קיימת'
      }, 400)
    }

    const id = generateId()
    const now = new Date().toISOString()

    await c.env.DB.prepare(`
      INSERT INTO menu_items (
        id, name, meal_types, ingredients, tags, default_servings, 
        is_active, created_at, updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, 1, ?, ?)
    `).bind(
      id,
      name.trim(),
      JSON.stringify(mealTypes),
      JSON.stringify(ingredients),
      JSON.stringify(tags || []),
      defaultServings || 1,
      now,
      now
    ).run()

    const menuItem: MenuItem = {
      id,
      name: name.trim(),
      mealTypes,
      ingredients,
      tags: tags || [],
      defaultServings: defaultServings || 1,
      isActive: true,
      createdAt: now,
      updatedAt: now
    }

    return c.json<ApiResponse<MenuItem>>({
      success: true,
      data: menuItem,
      message: 'המנה נוספה בהצלחה'
    }, 201)
  } catch (error) {
    return c.json<ApiResponse>({
      success: false,
      error: 'שגיאה בהוספת המנה'
    }, 500)
  }
})

// Update menu item
menuItemsRoutes.put('/:id', async (c) => {
  try {
    const id = c.req.param('id')
    const body = await c.req.json()
    const { name, mealTypes, ingredients, tags, defaultServings, isActive } = body

    if (!name || !isValidMealName(name)) {
      return c.json<ApiResponse>({
        success: false,
        error: 'שם המנה חייב להיות בין 2-100 תווים'
      }, 400)
    }

    if (!mealTypes || !Array.isArray(mealTypes) || mealTypes.length === 0) {
      return c.json<ApiResponse>({
        success: false,
        error: 'חייב לציין לפחות סוג ארוחה אחד'
      }, 400)
    }

    // Check if another menu item with same name exists
    const { results: existing } = await c.env.DB.prepare(
      'SELECT id FROM menu_items WHERE name = ? AND id != ? AND is_active = 1'
    ).bind(name.trim(), id).all()

    if (existing.length > 0) {
      return c.json<ApiResponse>({
        success: false,
        error: 'מנה עם השם הזה כבר קיימת'
      }, 400)
    }

    const now = new Date().toISOString()

    const result = await c.env.DB.prepare(`
      UPDATE menu_items 
      SET name = ?, meal_types = ?, ingredients = ?, tags = ?, 
          default_servings = ?, is_active = ?, updated_at = ?
      WHERE id = ?
    `).bind(
      name.trim(),
      JSON.stringify(mealTypes),
      JSON.stringify(ingredients || []),
      JSON.stringify(tags || []),
      defaultServings || 1,
      isActive !== undefined ? (isActive ? 1 : 0) : 1,
      now,
      id
    ).run()

    if (result.changes === 0) {
      return c.json<ApiResponse>({
        success: false,
        error: 'מנה לא נמצאה'
      }, 404)
    }

    const menuItem: MenuItem = {
      id,
      name: name.trim(),
      mealTypes,
      ingredients: ingredients || [],
      tags: tags || [],
      defaultServings: defaultServings || 1,
      isActive: isActive !== undefined ? isActive : true,
      createdAt: '', // Will be filled from DB if needed
      updatedAt: now
    }

    return c.json<ApiResponse<MenuItem>>({
      success: true,
      data: menuItem,
      message: 'המנה עודכנה בהצלחה'
    })
  } catch (error) {
    return c.json<ApiResponse>({
      success: false,
      error: 'שגיאה בעדכון המנה'
    }, 500)
  }
})

// Archive/deactivate menu item (soft delete)
menuItemsRoutes.patch('/:id/archive', async (c) => {
  try {
    const id = c.req.param('id')
    const now = new Date().toISOString()

    const result = await c.env.DB.prepare(
      'UPDATE menu_items SET is_active = 0, updated_at = ? WHERE id = ?'
    ).bind(now, id).run()

    if (result.changes === 0) {
      return c.json<ApiResponse>({
        success: false,
        error: 'מנה לא נמצאה'
      }, 404)
    }

    return c.json<ApiResponse>({
      success: true,
      message: 'המנה הועברה לארכיון'
    })
  } catch (error) {
    return c.json<ApiResponse>({
      success: false,
      error: 'שגיאה בהעברת המנה לארכיון'
    }, 500)
  }
})

// Restore menu item from archive
menuItemsRoutes.patch('/:id/restore', async (c) => {
  try {
    const id = c.req.param('id')
    const now = new Date().toISOString()

    const result = await c.env.DB.prepare(
      'UPDATE menu_items SET is_active = 1, updated_at = ? WHERE id = ?'
    ).bind(now, id).run()

    if (result.changes === 0) {
      return c.json<ApiResponse>({
        success: false,
        error: 'מנה לא נמצאה'
      }, 404)
    }

    return c.json<ApiResponse>({
      success: true,
      message: 'המנה שוחזרה מהארכיון'
    })
  } catch (error) {
    return c.json<ApiResponse>({
      success: false,
      error: 'שגיאה בשחזור המנה מהארכיון'
    }, 500)
  }
})

// Delete menu item permanently (hard delete - use with caution)
menuItemsRoutes.delete('/:id', async (c) => {
  try {
    const id = c.req.param('id')
    
    const result = await c.env.DB.prepare(
      'DELETE FROM menu_items WHERE id = ?'
    ).bind(id).run()

    if (result.changes === 0) {
      return c.json<ApiResponse>({
        success: false,
        error: 'מנה לא נמצאה'
      }, 404)
    }

    return c.json<ApiResponse>({
      success: true,
      message: 'המנה נמחקה לצמיתות'
    })
  } catch (error) {
    return c.json<ApiResponse>({
      success: false,
      error: 'שגיאה במחיקת המנה'
    }, 500)
  }
})