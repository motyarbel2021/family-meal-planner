import { Hono } from 'hono'
import type { Bindings, ChatMessage, ChatBotResponse, ApiResponse } from '../types'
import { generateId } from '../lib/utils'

export const chatRoutes = new Hono<{ Bindings: Bindings }>()

// Process chat message (basic Hebrew NLP)
chatRoutes.post('/message', async (c) => {
  try {
    const body = await c.req.json()
    const { content } = body

    if (!content || typeof content !== 'string' || content.trim() === '') {
      return c.json<ApiResponse>({
        success: false,
        error: 'תוכן ההודעה לא יכול להיות ריק'
      }, 400)
    }

    const messageId = generateId()
    const now = new Date().toISOString()

    // Save user message
    await c.env.DB.prepare(`
      INSERT INTO chat_messages (id, content, role, timestamp, processed)
      VALUES (?, ?, 'user', ?, 0)
    `).bind(messageId, content.trim(), now).run()

    // Process the message with basic Hebrew NLP
    const response = await processHebrewMessage(content.trim(), c.env.DB)

    // Save assistant response
    const responseId = generateId()
    await c.env.DB.prepare(`
      INSERT INTO chat_messages (id, content, role, timestamp, processed, actions_data)
      VALUES (?, ?, 'assistant', ?, 1, ?)
    `).bind(
      responseId, 
      response.message, 
      now, 
      JSON.stringify(response.actions || [])
    ).run()

    return c.json<ApiResponse<ChatBotResponse>>({
      success: true,
      data: response
    })

  } catch (error) {
    return c.json<ApiResponse>({
      success: false,
      error: 'שגיאה בעיבוד ההודעה'
    }, 500)
  }
})

// Get chat history
chatRoutes.get('/history', async (c) => {
  try {
    const limit = parseInt(c.req.query('limit') || '50')
    const offset = parseInt(c.req.query('offset') || '0')

    const { results } = await c.env.DB.prepare(`
      SELECT * FROM chat_messages 
      ORDER BY timestamp DESC 
      LIMIT ? OFFSET ?
    `).bind(limit, offset).all()

    const messages: ChatMessage[] = results.map((row: any) => ({
      id: row.id,
      content: row.content,
      role: row.role,
      timestamp: row.timestamp,
      processed: Boolean(row.processed)
    }))

    return c.json<ApiResponse<ChatMessage[]>>({
      success: true,
      data: messages.reverse() // Show oldest first for chat display
    })

  } catch (error) {
    return c.json<ApiResponse>({
      success: false,
      error: 'שגיאה בטעינת היסטוריית הצ\'אט'
    }, 500)
  }
})

// Clear chat history
chatRoutes.delete('/history', async (c) => {
  try {
    await c.env.DB.prepare('DELETE FROM chat_messages').run()

    return c.json<ApiResponse>({
      success: true,
      message: 'היסטוריית הצ\'אט נמחקה'
    })

  } catch (error) {
    return c.json<ApiResponse>({
      success: false,
      error: 'שגיאה במחיקת היסטוריית הצ\'אט'
    }, 500)
  }
})

// Basic Hebrew NLP processor
async function processHebrewMessage(content: string, db: D1Database): Promise<ChatBotResponse> {
  const lowerContent = content.toLowerCase()
  
  // Common Hebrew patterns for meal planning
  const patterns = [
    {
      patterns: ['הוסף מנה', 'תוסיף מנה', 'מנה חדשה', 'רוצה להוסיף'],
      response: 'אני יכול לעזור לך להוסיף מנה חדשה! באיזה סוג ארוחה מדובר (בוקר/צהריים/ערב) ומה שם המנה?',
      action: 'add_meal_prompt'
    },
    {
      patterns: ['ארוחת בוקר', 'בוקר', 'ארוחה בבוקר'],
      response: 'מצוין! איך תרצה לקרוא לארוחת הבוקר החדשה?',
      action: 'breakfast_meal_prompt'
    },
    {
      patterns: ['ארוחת צהריים', 'צהריים', 'ארוחה בצהריים'],
      response: 'נהדר! איך תרצה לקרוא לארוחת הצהריים החדשה?',
      action: 'lunch_meal_prompt'
    },
    {
      patterns: ['ארוחת ערב', 'ערב', 'ארוחה בערב', 'דינר'],
      response: 'מעולה! איך תרצה לקרוא לארוחת הערב החדשה?',
      action: 'dinner_meal_prompt'
    },
    {
      patterns: ['רשימת מצרכים', 'מצרכים', 'קניות', 'רשימה לקניות'],
      response: 'כדי ליצור רשימת מצרכים, אני צריך שתבחר תכנית שבועית קודם. האם יש לך תכנית מוכנה?',
      action: 'grocery_list_prompt'
    },
    {
      patterns: ['ילד חדש', 'הוסף ילד', 'תוסיף ילד', 'ילדה חדשה'],
      response: 'כמובן! איך קוראים לילד/ילדה החדש/ה? ואיזה צבע תרצה לבחור?',
      action: 'add_child_prompt'
    },
    {
      patterns: ['עזרה', 'איך', 'מה אני יכול', 'מה אפשר לעשות'],
      response: `אני יכול לעזור לך עם:
      
🍽️ הוספת מנות חדשות לתפריט
👶 הוספת ילדים למשפחה
📅 תכנון ארוחות שבועיות
🛒 יצירת רשימות מצרכים
📝 ניהול מלאי הבית

פשוט תגיד לי מה תרצה לעשות!`,
      action: 'help'
    }
  ]

  // Check for patterns
  for (const patternGroup of patterns) {
    for (const pattern of patternGroup.patterns) {
      if (lowerContent.includes(pattern)) {
        return {
          message: patternGroup.response,
          actions: [{ type: 'add_meal', data: { action: patternGroup.action } }]
        }
      }
    }
  }

  // Try to extract meal name if it looks like adding a meal
  const mealNameMatch = content.match(/(?:מנה|ארוחה)\s+"([^"]+)"/i) ||
                       content.match(/(?:מנה|ארוחה)\s+(.+)/i)
  
  if (mealNameMatch) {
    const mealName = mealNameMatch[1].trim()
    if (mealName.length > 2) {
      return {
        message: `נהדר! אני רואה שאתה רוצה להוסיף את המנה "${mealName}". איזה מרכיבים יש במנה הזו?`,
        actions: [{
          type: 'add_meal',
          data: {
            name: mealName,
            step: 'ingredients'
          }
        }]
      }
    }
  }

  // Try to extract child name
  const childNameMatch = content.match(/(?:ילד|ילדה|בן|בת)\s+"([^"]+)"/i) ||
                        content.match(/(?:ילד|ילדה|בן|בת)\s+(.+)/i)
  
  if (childNameMatch) {
    const childName = childNameMatch[1].trim()
    if (childName.length > 1) {
      return {
        message: `מעולה! אני אוסיף את ${childName} לרשימת הילדים. איזה צבע תרצה לבחור?`,
        actions: [{
          type: 'add_child',
          data: {
            name: childName,
            step: 'color'
          }
        }]
      }
    }
  }

  // Default response with suggestions
  return {
    message: `אני לא בטוח שהבנתי. אתה יכול לנסות להגיד:

• "הוסף מנה" - כדי להוסיף מנה חדשה
• "ילד חדש" - כדי להוסיף ילד למשפחה  
• "רשימת מצרכים" - כדי ליצור רשימת קניות
• "עזרה" - לרשימה מלאה של פעולות

או פשוט תכתוב מה אתה רוצה לעשות במילים שלך!`,
    actions: []
  }
}