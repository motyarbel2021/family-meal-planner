import { Hono } from 'hono'
import type { Bindings, ChatMessage, ChatBotResponse, ApiResponse } from '../types'
import { generateId } from '../lib/utils'

export const chatRoutes = new Hono<{ Bindings: Bindings }>()

// Process chat message (basic Hebrew NLP) - Updated endpoint for new UI
chatRoutes.post('/', async (c) => {
  try {
    const body = await c.req.json()
    const { message, context } = body

    if (!message || typeof message !== 'string' || message.trim() === '') {
      return c.json({
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
    `).bind(messageId, message.trim(), now).run()

    // Process the message with enhanced Hebrew NLP
    const response = await processHebrewMessageAdvanced(message.trim(), context, c.env.DB)

    // Save assistant response
    const responseId = generateId()
    await c.env.DB.prepare(`
      INSERT INTO chat_messages (id, content, role, timestamp, processed, actions_data)
      VALUES (?, ?, 'assistant', ?, 1, ?)
    `).bind(
      responseId, 
      response.response, 
      now, 
      JSON.stringify(response.suggestions || [])
    ).run()

    return c.json({
      success: true,
      response: response.response,
      suggestions: response.suggestions || []
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

// Enhanced Hebrew NLP processor with context awareness
async function processHebrewMessageAdvanced(content: string, context: any, db: D1Database): Promise<{ response: string, suggestions?: any[] }> {
  const lowerContent = content.toLowerCase()
  const { children = [], menuItems = [], hasWeekPlan = false } = context || {}
  
  // Greeting patterns
  if (lowerContent.match(/^(שלום|היי|הי|בוקר טוב|ערב טוב|טוב|אהלן)/)) {
    const greeting = getTimeBasedGreeting()
    return {
      response: `${greeting}! 😊 אני כאן לעזור לך עם תכנון הארוחות המשפחתיות. במה תרצה שאעזור לך היום?`,
      suggestions: [
        { title: '🍽️ הצע מנות לשבוע', action: 'suggest_meals' },
        { title: '👶 מנות מתאימות לילדים', action: 'kids_meals' },
        { title: '🛒 יצור רשימת קניות', action: 'grocery_list' }
      ]
    }
  }
  
  // Meal suggestion patterns
  if (lowerContent.match(/הצע|ממליץ|מנות|רעיונות|אפשרויות/)) {
    const mealSuggestions = await getSuggestedMeals(children, menuItems, db)
    return {
      response: `בהתבסס על המנות שלך, הנה כמה הצעות מעולות:

${mealSuggestions.map((meal, i) => `${i + 1}. **${meal.name}** (${meal.type})
   • מתאים ל-${meal.servings} סועדים
   • זמן הכנה: ${meal.prepTime || '30'} דקות`).join('\n\n')}

האם תרצה שאוסיף אחת מהמנות האלה לתפריט שלך?`,
      suggestions: mealSuggestions.slice(0, 3).map(meal => ({
        title: `הוסף ${meal.name}`,
        action: 'add_meal',
        data: meal
      }))
    }
  }

  // Kids-specific questions
  if (lowerContent.match(/ילדים|ילד|ילדה|קטנים/)) {
    const kidsAdvice = getKidsNutritionAdvice(children)
    return {
      response: kidsAdvice,
      suggestions: [
        { title: '🥞 מנות בוקר לילדים', action: 'kids_breakfast' },
        { title: '🍝 מנות צהריים פופולריות', action: 'kids_lunch' },
        { title: '🥗 איך להכניס ירקות', action: 'kids_vegetables' }
      ]
    }
  }

  // Healthy meal questions
  if (lowerContent.match(/בריא|דיאטה|קלוריות|תזונה|ירקות/)) {
    return {
      response: `מעולה שאתה מתעניין בתזונה בריאה! 🌱 הנה כמה עקרונות חשובים:

🥗 **הרכב המנה הבריאה:**
• 50% ירקות (טריים או מבושלים)
• 25% חלבון איכותי (דג, בשר רזה, קטניות)
• 25% פחמימות מורכבות (אורז מלא, קינואה)

🏃‍♀️ **עצות מעשיות:**
• השתמש בשמן זית במקום שמנים מעובדים
• הוסף צבעים שונים לצלחת
• שתה הרבה מים
• התחל בסלט לפני הארוחה

איזה היבט של תזונה בריאה מעניין אותך יותר?`,
      suggestions: [
        { title: '🐟 מנות חלבון בריאות', action: 'healthy_protein' },
        { title: '🥬 רעיונות לירקות', action: 'vegetable_ideas' },
        { title: '🍚 פחמימות מורכבות', action: 'complex_carbs' }
      ]
    }
  }

  // Quick meal requests
  if (lowerContent.match(/מהיר|זמן|עזוב|פשוט|קל/)) {
    return {
      response: `אני מבין שאתה מחפש משהו מהיר וקל! ⚡ הנה כמה רעיונות:

🍳 **15 דקות:**
• ביצים מקושקשות עם טוסט
• סלט טונה עם אבוקדו
• פסטה עם רוטב עגבניות מוכן

🥘 **30 דקות:**
• אורז מטוגן עם ירקות
• חזה עוף בתנור עם תפוחי אדמה
• קוסקוס עם ירקות ו חזה טורקיה

💡 **טיפ:** תכין מנות גדולות בסוף השבוע וחמם במשך השבוע!`,
      suggestions: [
        { title: '⚡ מנות 15 דקות', action: 'super_quick' },
        { title: '🥘 מנות 30 דקות', action: 'medium_quick' },
        { title: '📦 רעיונות לימי שבוע', action: 'weekday_meals' }
      ]
    }
  }

  // Grocery list patterns
  if (lowerContent.match(/רשימת|קניות|מצרכים|סופר/)) {
    if (hasWeekPlan) {
      return {
        response: `מצוין! אני רואה שיש לך תכנית שבועית מוכנה. 🛒

אני יכול ליצור עבורך רשימת קניות אוטומטית שתכלול את כל המרכיבים הדרושים לשבוע, כולל:
• צבירה חכמה של כמויות
• סידור לפי קטגוריות (ירקות, בשר, חלבי...)
• אפשרות לעריכה והתאמה אישית

האם תרצה שאפתח עבורך את מערכת רשימות הקניות?`,
        suggestions: [
          { title: '🛒 צור רשימת קניות', action: 'create_grocery_list' },
          { title: '📝 עצות לקניות חכמות', action: 'shopping_tips' }
        ]
      }
    } else {
      return {
        response: `כדי ליצור רשימת קניות מדויקת, אני צריך שתתכנן קודם את הארוחות לשבוע. 📅

זה יעזור לי:
• לחשב את הכמויות הנכונות
• למנוע בזבוז מזון
• לוודא שלא תשכח דברים חשובים

האם תרצה שאעזור לך לתכנן את השבוע?`,
        suggestions: [
          { title: '📅 תכנן שבוע חדש', action: 'plan_week' },
          { title: '🍽️ הוסף מנות תחילה', action: 'add_meals_first' }
        ]
      }
    }
  }

  // Adding meals patterns
  if (lowerContent.match(/הוסף|תוסיף|מנה חדשה|אני רוצה/)) {
    return {
      response: `נהדר! אני אשמח לעזור לך להוסיף מנה חדשה לתפריט! 🍽️

אתה יכול:
• לתת לי את שם המנה ואני אמלא את הפרטים
• לפתוח את מסך הוספת המנות למילוי מלא
• לבקש הצעות למנות חדשות

איך תעדיף להמשיך?`,
      suggestions: [
        { title: '➕ פתח מסך הוספת מנה', action: 'add_meal' },
        { title: '💡 הצע לי מנות חדשות', action: 'suggest_new_meals' },
        { title: '📖 רעיונות ממתכונים פופולריים', action: 'popular_recipes' }
      ]
    }
  }

  // Context-aware responses based on user data
  if (children.length === 0 && lowerContent.match(/משפחה|ילדים|בית/)) {
    return {
      response: `אני רואה שעדיין לא הוספת ילדים למערכת. 👨‍👩‍👧‍👦

זה יעזור לי לתת הצעות מותאמות יותר:
• המלצות על מנות שילדים אוהבים
• התאמת כמויות לפי גילאים
• רעיונות לארוחות בוקר אישיות

האם תרצה להוסיף את הילדים שלך למערכת?`,
      suggestions: [
        { title: '👶 הוסף ילד ראשון', action: 'add_child' },
        { title: '🍽️ המשך בלי ילדים', action: 'continue_no_kids' }
      ]
    }
  }

  // Try to extract meal name if it looks like adding a meal
  const mealNameMatch = content.match(/(?:מנה|ארוחה)\s+"([^"]+)"/i) ||
                       content.match(/(?:מנה|ארוחה)\s+(.+)/i)
  
  if (mealNameMatch) {
    const mealName = mealNameMatch[1].trim()
    if (mealName.length > 2) {
      return {
        response: `נהדר! אני רואה שאתה רוצה להוסיף את המנה "${mealName}". 

האם תרצה שאפתח עבורך את מסך הוספת המנות עם השם הזה מראש?`,
        suggestions: [{
          title: `הוסף מנה: ${mealName}`,
          action: 'add_meal',
          data: { name: mealName }
        }]
      }
    }
  }

  // Default response with contextual suggestions
  const suggestions = []
  
  if (children.length === 0) {
    suggestions.push({ title: '👶 הוסף ילד למשפחה', action: 'add_child' })
  }
  
  if (menuItems.length < 5) {
    suggestions.push({ title: '🍽️ הוסף מנות לתפריט', action: 'add_meal' })
  }
  
  if (!hasWeekPlan) {
    suggestions.push({ title: '📅 תכנן שבוע חדש', action: 'plan_week' })
  } else {
    suggestions.push({ title: '🛒 צור רשימת קניות', action: 'create_grocery_list' })
  }

  return {
    response: `אני לא בטוח שהבנתי בדיוק מה אתה מחפש 🤔

אתה יכול לשאול אותי על:
• הצעות מנות מתאימות לילדים
• רעיונות לארוחות מהירות ובריאות  
• עצות תזונה ותכנון שבועי
• יצירת רשימות קניות חכמות

או פשוט תגיד לי במילים שלך מה אתה רוצה לעשות!`,
    suggestions
  }
}

// Helper functions for enhanced NLP
function getTimeBasedGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'בוקר טוב'
  if (hour < 17) return 'צהריים טובים'
  if (hour < 21) return 'ערב טוב'
  return 'לילה טוב'
}

async function getSuggestedMeals(children: any[], existingMeals: any[], db: D1Database): Promise<any[]> {
  const suggestions = [
    {
      name: 'פסטה ברוטב עגבניות וגבינה',
      type: 'ארוחת צהריים',
      servings: Math.max(4, children.length + 2),
      prepTime: '25',
      kidsFriendly: true
    },
    {
      name: 'חזה עוף בתנור עם ירקות',
      type: 'ארוחת ערב',
      servings: Math.max(4, children.length + 2),
      prepTime: '40',
      healthy: true
    },
    {
      name: 'פנקייק במילוי בננה',
      type: 'ארוחת בוקר',
      servings: children.length || 2,
      prepTime: '20',
      kidsFriendly: true
    },
    {
      name: 'סלמון עם קינואה וירקות',
      type: 'ארוחת ערב',
      servings: Math.max(4, children.length + 2),
      prepTime: '35',
      healthy: true
    },
    {
      name: 'שקשוקה עם פיתה',
      type: 'ארוחת בוקר',
      servings: Math.max(4, children.length + 2),
      prepTime: '30',
      traditional: true
    }
  ]
  
  // Filter out meals that already exist
  const existingMealNames = existingMeals.map(m => m.name?.toLowerCase() || '')
  return suggestions.filter(meal => 
    !existingMealNames.some(existing => 
      existing.includes(meal.name.toLowerCase()) || 
      meal.name.toLowerCase().includes(existing)
    )
  ).slice(0, 4)
}

function getKidsNutritionAdvice(children: any[]): string {
  if (children.length === 0) {
    return `תזונת ילדים היא נושא חשוב מאוד! 👶

**עקרונות בסיסיים:**
• מגוון של צבעים בצלחת
• חלבון איכותי בכל ארוחה
• הגבלת חטיפים מתוקים
• שתייה של מים לאורך היום

**טיפים להכנת ילדים לאכול:**
• תנו דוגמה אישית
• הכינו ביחד
• התחילו עם כמויות קטנות
• שבחו כל ניסיון חדש`
  }
  
  return `עם ${children.length} ילדים בבית, כדאי להתמקד ב:

🍎 **מנות שילדים אוהבים:**
• פסטה עם רטבים שונים
• חזה עוף בציפוי קורנפלקס
• פיצה ביתית עם ירקות
• עוגיות שיבולת שועל

👨‍🍳 **בישוב משותף:**
• תנו לילדים לעזור בהכנה
• בחרו ירק חדש כל שבוע ביחד
• הכינו שמוטי פירות וירקות

💡 **טיפ חשוב:** אל תתייאשו אם ילד דוחה מזון חדש - לפעמים צריך 8-10 חשיפות עד שילד מקבל טעם חדש!`
}

// Basic Hebrew NLP processor (keep for compatibility)
async function processHebrewMessage(content: string, db: D1Database): Promise<ChatBotResponse> {
  return {
    message: "זה API ישן, אנא השתמש ב-API החדש",
    actions: []
  }
}