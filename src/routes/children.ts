import { Hono } from 'hono'
import type { Bindings, Child, ApiResponse } from '../types'
import { generateId } from '../lib/utils'

export const childrenRoutes = new Hono<{ Bindings: Bindings }>()

// Get all children
childrenRoutes.get('/', async (c) => {
  try {
    // Check if database is available
    if (!c.env?.DB) {
      // Return empty data when DB is not available
      return c.json<ApiResponse<Child[]>>({
        success: true,
        data: []
      })
    }

    const { results } = await c.env.DB.prepare(
      'SELECT * FROM children ORDER BY name COLLATE NOCASE'
    ).all()

    const children: Child[] = results.map((row: any) => ({
      id: row.id,
      name: row.name,
      color: row.color,
      dietaryTags: JSON.parse(row.dietary_tags || '[]'),
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }))

    return c.json<ApiResponse<Child[]>>({
      success: true,
      data: children
    })
  } catch (error) {
    // Return empty data instead of error
    return c.json<ApiResponse<Child[]>>({
      success: true,
      data: []
    })
  }
})

// Get single child
childrenRoutes.get('/:id', async (c) => {
  try {
    const id = c.req.param('id')
    const { results } = await c.env.DB.prepare(
      'SELECT * FROM children WHERE id = ?'
    ).bind(id).all()

    if (results.length === 0) {
      return c.json<ApiResponse>({
        success: false,
        error: 'ילד לא נמצא'
      }, 404)
    }

    const row = results[0] as any
    const child: Child = {
      id: row.id,
      name: row.name,
      color: row.color,
      dietaryTags: JSON.parse(row.dietary_tags || '[]'),
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }

    return c.json<ApiResponse<Child>>({
      success: true,
      data: child
    })
  } catch (error) {
    return c.json<ApiResponse>({
      success: false,
      error: 'שגיאה בטעינת פרטי הילד'
    }, 500)
  }
})

// Create new child
childrenRoutes.post('/', async (c) => {
  try {
    const body = await c.req.json()
    const { name, color, dietaryTags } = body

    if (!name || typeof name !== 'string' || name.trim() === '') {
      return c.json<ApiResponse>({
        success: false,
        error: 'שם הילד הוא שדה חובה'
      }, 400)
    }

    const id = generateId()
    const now = new Date().toISOString()
    const childColor = color || '#007bff'
    const tags = JSON.stringify(dietaryTags || [])

    await c.env.DB.prepare(`
      INSERT INTO children (id, name, color, dietary_tags, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `).bind(id, name.trim(), childColor, tags, now, now).run()

    const child: Child = {
      id,
      name: name.trim(),
      color: childColor,
      dietaryTags: dietaryTags || [],
      createdAt: now,
      updatedAt: now
    }

    return c.json<ApiResponse<Child>>({
      success: true,
      data: child,
      message: 'הילד נוסף בהצלחה'
    }, 201)
  } catch (error) {
    return c.json<ApiResponse>({
      success: false,
      error: 'שגיאה בהוספת הילד'
    }, 500)
  }
})

// Update child
childrenRoutes.put('/:id', async (c) => {
  try {
    const id = c.req.param('id')
    const body = await c.req.json()
    const { name, color, dietaryTags } = body

    if (!name || typeof name !== 'string' || name.trim() === '') {
      return c.json<ApiResponse>({
        success: false,
        error: 'שם הילד הוא שדה חובה'
      }, 400)
    }

    const tags = JSON.stringify(dietaryTags || [])
    const now = new Date().toISOString()

    const result = await c.env.DB.prepare(`
      UPDATE children 
      SET name = ?, color = ?, dietary_tags = ?, updated_at = ?
      WHERE id = ?
    `).bind(name.trim(), color || '#007bff', tags, now, id).run()

    if (result.changes === 0) {
      return c.json<ApiResponse>({
        success: false,
        error: 'ילד לא נמצא'
      }, 404)
    }

    const child: Child = {
      id,
      name: name.trim(),
      color: color || '#007bff',
      dietaryTags: dietaryTags || [],
      createdAt: '', // Will be filled from DB if needed
      updatedAt: now
    }

    return c.json<ApiResponse<Child>>({
      success: true,
      data: child,
      message: 'פרטי הילד עודכנו בהצלחה'
    })
  } catch (error) {
    return c.json<ApiResponse>({
      success: false,
      error: 'שגיאה בעדכון פרטי הילד'
    }, 500)
  }
})

// Delete child
childrenRoutes.delete('/:id', async (c) => {
  try {
    const id = c.req.param('id')
    
    const result = await c.env.DB.prepare(
      'DELETE FROM children WHERE id = ?'
    ).bind(id).run()

    if (result.changes === 0) {
      return c.json<ApiResponse>({
        success: false,
        error: 'ילד לא נמצא'
      }, 404)
    }

    return c.json<ApiResponse>({
      success: true,
      message: 'הילד נמחק בהצלחה'
    })
  } catch (error) {
    return c.json<ApiResponse>({
      success: false,
      error: 'שגיאה במחיקת הילד'
    }, 500)
  }
})