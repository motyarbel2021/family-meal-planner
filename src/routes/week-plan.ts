import { Hono } from 'hono'
import type { Bindings, WeekPlan, DayPlan, ApiResponse } from '../types'
import { generateId, generateWeekId, getCurrentWeek, getWeekRange, parseDate } from '../lib/utils'

export const weekPlanRoutes = new Hono<{ Bindings: Bindings }>()

// Get current week plan
weekPlanRoutes.get('/current', async (c) => {
  try {
    // Check if database is available
    if (!c.env?.DB) {
      // Return empty week plan when DB is not available
      const currentWeek = getCurrentWeek()
      return c.json<ApiResponse<WeekPlan>>({
        success: true,
        data: {
          weekId: generateWeekId(currentWeek.startDate),
          startDate: currentWeek.startDate.toISOString().split('T')[0],
          endDate: currentWeek.endDate.toISOString().split('T')[0],
          days: []
        }
      })
    }

    const currentWeek = getCurrentWeek()
    const weekId = generateWeekId(currentWeek.startDate)
    
    return await getWeekPlanById(c, weekId, currentWeek)
  } catch (error) {
    // Return empty week plan instead of error
    const currentWeek = getCurrentWeek()
    return c.json<ApiResponse<WeekPlan>>({
      success: true,
      data: {
        weekId: generateWeekId(currentWeek.startDate),
        startDate: currentWeek.startDate.toISOString().split('T')[0],
        endDate: currentWeek.endDate.toISOString().split('T')[0],
        days: []
      }
    })
  }
})

// Get week plan by date
weekPlanRoutes.get('/by-date/:date', async (c) => {
  try {
    const dateStr = c.req.param('date')
    const date = parseDate(dateStr)
    const weekRange = getWeekRange(date)
    const weekId = generateWeekId(weekRange.startDate)
    
    return await getWeekPlanById(c, weekId, weekRange)
  } catch (error) {
    return c.json<ApiResponse>({
      success: false,
      error: 'שגיאה בטעינת התכנית השבועית'
    }, 500)
  }
})

// Get specific week plan
weekPlanRoutes.get('/:weekId', async (c) => {
  try {
    const weekId = c.req.param('weekId')
    
    return await getWeekPlanById(c, weekId)
  } catch (error) {
    return c.json<ApiResponse>({
      success: false,
      error: 'שגיאה בטעינת התכנית השבועית'
    }, 500)
  }
})

// Create new week plan
weekPlanRoutes.post('/', async (c) => {
  try {
    const body = await c.req.json()
    const { weekStartDate, children, days } = body

    if (!weekStartDate) {
      return c.json<ApiResponse>({
        success: false,
        error: 'תאריך התחלת השבוע חסר'
      }, 400)
    }

    if (!children || !Array.isArray(children)) {
      return c.json<ApiResponse>({
        success: false,
        error: 'רשימת ילדים לא תקינה'
      }, 400)
    }

    if (!days || !Array.isArray(days)) {
      return c.json<ApiResponse>({
        success: false,
        error: 'רשימת ימים לא תקינה'
      }, 400)
    }

    // Generate week ID from start date
    const weekId = generateWeekId(weekStartDate)
    const now = new Date().toISOString()

    try {
      // Check if week plan already exists
      const { results: existingWeek } = await c.env.DB.prepare(
        'SELECT week_id FROM week_plans WHERE week_id = ?'
      ).bind(weekId).all()

      if (existingWeek.length > 0) {
        return c.json<ApiResponse>({
          success: false,
          error: 'תכנון שבוע כבר קיים לתאריך זה'
        }, 409)
      }

      // Calculate week end date
      const weekRange = getWeekRange(new Date(weekStartDate))

      // Insert week plan
      await c.env.DB.prepare(`
        INSERT INTO week_plans (week_id, children_data, start_date, end_date, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?)
      `).bind(
        weekId,
        JSON.stringify(children),
        weekRange.startDate,
        weekRange.endDate,
        now,
        now
      ).run()

      // Insert day plans
      for (const day of days) {
        await c.env.DB.prepare(`
          INSERT INTO day_plans (
            id, week_id, date, breakfast_data, lunch_data, dinner_data, 
            created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
          generateId(),
          weekId,
          day.date,
          JSON.stringify(day.breakfast || {}),
          JSON.stringify(day.lunch || []),
          JSON.stringify(day.dinner || []),
          now,
          now
        ).run()
      }

      // Return the created week plan
      return await getWeekPlanById(c, weekId, weekRange)

    } catch (dbError) {
      console.error('Database error:', dbError)
      return c.json<ApiResponse>({
        success: false,
        error: 'שגיאה בשמירת התכנית השבועית'
      }, 500)
    }

  } catch (error) {
    console.error('Week plan creation error:', error)
    return c.json<ApiResponse>({
      success: false,
      error: 'שגיאה ביצירת התכנית השבועית'
    }, 500)
  }
})

// Create or update week plan
weekPlanRoutes.put('/:weekId', async (c) => {
  try {
    const weekId = c.req.param('weekId')
    const body = await c.req.json()
    const { children, days, startDate, endDate } = body

    if (!children || !Array.isArray(children)) {
      return c.json<ApiResponse>({
        success: false,
        error: 'רשימת ילדים לא תקינה'
      }, 400)
    }

    if (!days || !Array.isArray(days)) {
      return c.json<ApiResponse>({
        success: false,
        error: 'רשימת ימים לא תקינה'  
      }, 400)
    }

    const now = new Date().toISOString()

    // Start transaction-like operation
    try {
      // Check if week plan exists
      const { results: existingWeek } = await c.env.DB.prepare(
        'SELECT week_id FROM week_plans WHERE week_id = ?'
      ).bind(weekId).all()

      if (existingWeek.length === 0) {
        // Create new week plan
        await c.env.DB.prepare(`
          INSERT INTO week_plans (week_id, children_data, start_date, end_date, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?)
        `).bind(
          weekId,
          JSON.stringify(children),
          startDate,
          endDate,
          now,
          now
        ).run()
      } else {
        // Update existing week plan
        await c.env.DB.prepare(`
          UPDATE week_plans 
          SET children_data = ?, start_date = ?, end_date = ?, updated_at = ?
          WHERE week_id = ?
        `).bind(
          JSON.stringify(children),
          startDate,
          endDate,
          now,
          weekId
        ).run()
      }

      // Delete existing day plans for this week
      await c.env.DB.prepare(
        'DELETE FROM day_plans WHERE week_id = ?'
      ).bind(weekId).run()

      // Insert new day plans
      for (const day of days) {
        const dayId = generateId()
        await c.env.DB.prepare(`
          INSERT INTO day_plans (
            id, week_id, date, breakfast_data, lunch_data, dinner_data, 
            created_at, updated_at
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `).bind(
          dayId,
          weekId,
          day.date,
          JSON.stringify(day.breakfast || { byChild: {} }),
          JSON.stringify(day.lunch || []),
          JSON.stringify(day.dinner || []),
          now,
          now
        ).run()
      }

      const weekPlan: WeekPlan = {
        weekId,
        children,
        days,
        createdAt: now,
        updatedAt: now
      }

      return c.json<ApiResponse<WeekPlan>>({
        success: true,
        data: weekPlan,
        message: 'התכנית השבועית נשמרה בהצלחה'
      })

    } catch (dbError) {
      return c.json<ApiResponse>({
        success: false,
        error: 'שגיאה בשמירת התכנית השבועית'
      }, 500)
    }

  } catch (error) {
    return c.json<ApiResponse>({
      success: false,
      error: 'שגיאה בעדכון התכנית השבועית'
    }, 500)
  }
})

// Update single day plan
weekPlanRoutes.put('/:weekId/day/:date', async (c) => {
  try {
    const weekId = c.req.param('weekId')
    const date = c.req.param('date')
    const body = await c.req.json()
    const { breakfast, lunch, dinner } = body

    const now = new Date().toISOString()

    // Check if day plan exists
    const { results: existingDay } = await c.env.DB.prepare(
      'SELECT id FROM day_plans WHERE week_id = ? AND date = ?'
    ).bind(weekId, date).all()

    if (existingDay.length === 0) {
      // Create new day plan
      const dayId = generateId()
      await c.env.DB.prepare(`
        INSERT INTO day_plans (
          id, week_id, date, breakfast_data, lunch_data, dinner_data,
          created_at, updated_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        dayId,
        weekId,
        date,
        JSON.stringify(breakfast || { byChild: {} }),
        JSON.stringify(lunch || []),
        JSON.stringify(dinner || []),
        now,
        now
      ).run()
    } else {
      // Update existing day plan
      await c.env.DB.prepare(`
        UPDATE day_plans 
        SET breakfast_data = ?, lunch_data = ?, dinner_data = ?, updated_at = ?
        WHERE week_id = ? AND date = ?
      `).bind(
        JSON.stringify(breakfast || { byChild: {} }),
        JSON.stringify(lunch || []),
        JSON.stringify(dinner || []),
        now,
        weekId,
        date
      ).run()
    }

    const dayPlan: DayPlan = {
      date,
      breakfast: breakfast || { byChild: {} },
      lunch: lunch || [],
      dinner: dinner || []
    }

    return c.json<ApiResponse<DayPlan>>({
      success: true,
      data: dayPlan,
      message: 'התכנית היומית עודכנה בהצלחה'
    })

  } catch (error) {
    return c.json<ApiResponse>({
      success: false,
      error: 'שגיאה בעדכון התכנית היומית'
    }, 500)
  }
})

// Delete week plan
weekPlanRoutes.delete('/:weekId', async (c) => {
  try {
    const weekId = c.req.param('weekId')

    // Delete day plans first (due to foreign key constraint)
    await c.env.DB.prepare(
      'DELETE FROM day_plans WHERE week_id = ?'
    ).bind(weekId).run()

    // Delete week plan
    const result = await c.env.DB.prepare(
      'DELETE FROM week_plans WHERE week_id = ?'
    ).bind(weekId).run()

    if (result.changes === 0) {
      return c.json<ApiResponse>({
        success: false,
        error: 'תכנית שבועית לא נמצאה'
      }, 404)
    }

    return c.json<ApiResponse>({
      success: true,
      message: 'התכנית השבועית נמחקה בהצלחה'
    })

  } catch (error) {
    return c.json<ApiResponse>({
      success: false,
      error: 'שגיאה במחיקת התכנית השבועית'
    }, 500)
  }
})

// Get all week plans (for history)
weekPlanRoutes.get('/', async (c) => {
  try {
    const limit = parseInt(c.req.query('limit') || '10')
    const offset = parseInt(c.req.query('offset') || '0')

    const { results } = await c.env.DB.prepare(`
      SELECT week_id, start_date, end_date, created_at, updated_at
      FROM week_plans 
      ORDER BY start_date DESC 
      LIMIT ? OFFSET ?
    `).bind(limit, offset).all()

    const weekPlans = results.map((row: any) => ({
      weekId: row.week_id,
      startDate: row.start_date,
      endDate: row.end_date,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }))

    return c.json<ApiResponse>({
      success: true,
      data: weekPlans
    })

  } catch (error) {
    return c.json<ApiResponse>({
      success: false,
      error: 'שגיאה בטעינת רשימת התכניות השבועיות'
    }, 500)
  }
})

// Helper function to get week plan by ID
async function getWeekPlanById(c: any, weekId: string, weekRange?: any): Promise<Response> {
  try {
    // Check if database is available
    if (!c.env?.DB) {
      // Return empty week plan when DB is not available
      const range = weekRange || getCurrentWeek()
      const emptyWeekPlan: WeekPlan = {
        weekId,
        children: [],
        days: range.days.map((date: string) => ({
          date,
          breakfast: { byChild: {} },
          lunch: [],
          dinner: []
        })),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      
      return c.json<ApiResponse<WeekPlan>>({
        success: true,
        data: emptyWeekPlan
      })
    }

    // Get week plan
    const { results: weekResults } = await c.env.DB.prepare(
      'SELECT * FROM week_plans WHERE week_id = ?'
    ).bind(weekId).all()

    let weekPlan: WeekPlan

    if (weekResults.length === 0) {
      // Create empty week plan if doesn't exist
      const range = weekRange || getCurrentWeek()
      weekPlan = {
        weekId,
        children: [],
        days: range.days.map((date: string) => ({
          date,
          breakfast: { byChild: {} },
          lunch: [],
          dinner: []
        })),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    } else {
      const weekRow = weekResults[0] as any

      // Get day plans
      const { results: dayResults } = await c.env.DB.prepare(
        'SELECT * FROM day_plans WHERE week_id = ? ORDER BY date'
      ).bind(weekId).all()

      const days: DayPlan[] = dayResults.map((row: any) => ({
        date: row.date,
        breakfast: JSON.parse(row.breakfast_data || '{"byChild":{}}'),
        lunch: JSON.parse(row.lunch_data || '[]'),
        dinner: JSON.parse(row.dinner_data || '[]')
      }))

      weekPlan = {
        weekId: weekRow.week_id,
        children: JSON.parse(weekRow.children_data || '[]'),
        days,
        createdAt: weekRow.created_at,
        updatedAt: weekRow.updated_at
      }
    }

    return c.json<ApiResponse<WeekPlan>>({
      success: true,
      data: weekPlan
    })

  } catch (error) {
    throw error
  }
}