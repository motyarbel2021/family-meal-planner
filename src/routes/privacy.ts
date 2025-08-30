import { Hono } from 'hono'
import type { Bindings, PrivacyConsent, ApiResponse } from '../types'

export const privacyRoutes = new Hono<{ Bindings: Bindings }>()

// Get current privacy consent status
privacyRoutes.get('/consent', async (c) => {
  try {
    const { results } = await c.env.DB.prepare(
      'SELECT * FROM privacy_consent WHERE id = "singleton"'
    ).all()

    let consent: PrivacyConsent

    if (results.length === 0) {
      // Initialize default consent record
      const now = new Date().toISOString()
      await c.env.DB.prepare(`
        INSERT INTO privacy_consent (id, has_consented, version, cloud_services_enabled, updated_at)
        VALUES ("singleton", 0, "1.0", 0, ?)
      `).bind(now).run()

      consent = {
        hasConsented: false,
        consentDate: '',
        version: '1.0',
        cloudServicesEnabled: false
      }
    } else {
      const row = results[0] as any
      consent = {
        hasConsented: Boolean(row.has_consented),
        consentDate: row.consent_date || '',
        version: row.version || '1.0',
        cloudServicesEnabled: Boolean(row.cloud_services_enabled)
      }
    }

    return c.json<ApiResponse<PrivacyConsent>>({
      success: true,
      data: consent
    })

  } catch (error) {
    return c.json<ApiResponse>({
      success: false,
      error: 'שגיאה בטעינת סטטוס הסכמת הפרטיות'
    }, 500)
  }
})

// Update privacy consent
privacyRoutes.post('/consent', async (c) => {
  try {
    const body = await c.req.json()
    const { hasConsented, cloudServicesEnabled, version } = body

    if (typeof hasConsented !== 'boolean') {
      return c.json<ApiResponse>({
        success: false,
        error: 'סטטוס הסכמה חייב להיות true או false'
      }, 400)
    }

    const now = new Date().toISOString()
    const consentDate = hasConsented ? now : ''

    await c.env.DB.prepare(`
      UPDATE privacy_consent 
      SET has_consented = ?, consent_date = ?, version = ?, 
          cloud_services_enabled = ?, updated_at = ?
      WHERE id = "singleton"
    `).bind(
      hasConsented ? 1 : 0,
      consentDate,
      version || '1.0',
      cloudServicesEnabled ? 1 : 0,
      now
    ).run()

    const consent: PrivacyConsent = {
      hasConsented,
      consentDate,
      version: version || '1.0',
      cloudServicesEnabled: cloudServicesEnabled || false
    }

    return c.json<ApiResponse<PrivacyConsent>>({
      success: true,
      data: consent,
      message: hasConsented ? 'ההסכמה נרשמה בהצלחה' : 'ההסכמה בוטלה'
    })

  } catch (error) {
    return c.json<ApiResponse>({
      success: false,
      error: 'שגיאה בעדכון הסכמת הפרטיות'
    }, 500)
  }
})

// Reset all application data (for privacy compliance)
privacyRoutes.post('/reset-all-data', async (c) => {
  try {
    const body = await c.req.json()
    const { confirmReset } = body

    if (!confirmReset) {
      return c.json<ApiResponse>({
        success: false,
        error: 'חייב לאשר את איפוס הנתונים'
      }, 400)
    }

    // Delete all user data tables (in order due to foreign keys)
    await c.env.DB.prepare('DELETE FROM day_plans').run()
    await c.env.DB.prepare('DELETE FROM week_plans').run()
    await c.env.DB.prepare('DELETE FROM week_presets').run()
    await c.env.DB.prepare('DELETE FROM children').run()
    await c.env.DB.prepare('DELETE FROM menu_items').run()
    await c.env.DB.prepare('DELETE FROM pantry_items').run()
    await c.env.DB.prepare('DELETE FROM chat_messages').run()
    
    // Reset privacy consent
    const now = new Date().toISOString()
    await c.env.DB.prepare(`
      UPDATE privacy_consent 
      SET has_consented = 0, consent_date = "", cloud_services_enabled = 0, updated_at = ?
      WHERE id = "singleton"
    `).bind(now).run()

    return c.json<ApiResponse>({
      success: true,
      message: 'כל הנתונים נמחקו בהצלחה'
    })

  } catch (error) {
    return c.json<ApiResponse>({
      success: false,
      error: 'שגיאה במחיקת הנתונים'
    }, 500)
  }
})

// Export user data (for privacy compliance)
privacyRoutes.get('/export-data', async (c) => {
  try {
    // Get all user data
    const [children, menuItems, weekPlans, dayPlans, pantryItems, chatMessages, privacyConsent] = await Promise.all([
      c.env.DB.prepare('SELECT * FROM children').all(),
      c.env.DB.prepare('SELECT * FROM menu_items').all(),
      c.env.DB.prepare('SELECT * FROM week_plans').all(),
      c.env.DB.prepare('SELECT * FROM day_plans').all(),
      c.env.DB.prepare('SELECT * FROM pantry_items').all(),
      c.env.DB.prepare('SELECT * FROM chat_messages').all(),
      c.env.DB.prepare('SELECT * FROM privacy_consent').all()
    ])

    const exportData = {
      exportDate: new Date().toISOString(),
      version: '1.0',
      data: {
        children: children.results,
        menuItems: menuItems.results,
        weekPlans: weekPlans.results,
        dayPlans: dayPlans.results,
        pantryItems: pantryItems.results,
        chatMessages: chatMessages.results,
        privacyConsent: privacyConsent.results
      },
      metadata: {
        totalRecords: children.results.length + menuItems.results.length + 
                    weekPlans.results.length + dayPlans.results.length + 
                    pantryItems.results.length + chatMessages.results.length,
        dataTypes: ['children', 'menuItems', 'weekPlans', 'dayPlans', 'pantryItems', 'chatMessages', 'privacyConsent']
      }
    }

    // Set appropriate headers for download
    c.header('Content-Type', 'application/json')
    c.header('Content-Disposition', `attachment; filename="meal-planner-data-${new Date().toISOString().split('T')[0]}.json"`)

    return c.json(exportData)

  } catch (error) {
    return c.json<ApiResponse>({
      success: false,
      error: 'שגיאה בייצוא הנתונים'
    }, 500)
  }
})

// Get privacy policy content (static content)
privacyRoutes.get('/policy', async (c) => {
  const policyContent = {
    title: 'מדיניות פרטיות - מתכנן הארוחות המשפחתי',
    lastUpdated: '2024-01-01',
    version: '1.0',
    
    sections: {
      tldr: {
        title: 'TL;DR - תקציר מהיר',
        content: [
          '• אין חשבון, אין ענן - הכל נשמר במכשיר שלך בלבד',
          '• אנו שומרים רק מה שאתה מזין כדי לבנות תפריט ורשימת מצרכים', 
          '• אפשר למחוק הכל בכל רגע',
          '• אין איסוף מידע מזהה אישית מעבר למה שנחוץ לתפקוד',
          '• אין שיתוף עם צדדים שלישיים ללא הסכמתך המפורשת'
        ]
      },

      dataCollection: {
        title: 'מה אנחנו שומרים',
        content: [
          'שמות ילדים (לבחירתך) - רק לצורך ארוחות בוקר אישיות',
          'תפריטים שבועיים ומנות - לתכנון הארוחות',
          'רשימת מצרכים ומלאי ביתי - ליצירת רשימות קניות',
          'הודעות צ\'אט (אופציונלי) - לשיפור השירות',
          'העדפות והגדרות - לחוויית שימוש מותאמת',
          '',
          'אין איסוף: מיקום, פרטי תשלום, מספרי טלפון, כתובות דוא"ל או מידע מזהה אחר'
        ]
      },

      dataStorage: {
        title: 'איך הנתונים נשמרים',
        content: [
          'נתונים נשמרים מקומית במכשיר שלך (SQLite/Local Storage)',
          'אין גיבוי אוטומטי לענן או לשרתים חיצוניים',
          'אין סנכרון בין מכשירים (אלא אם תבחר לייצא ולייבא ידנית)',
          'הנתונים נשארים במכשיר גם כשאין חיבור לאינטרנט',
          'ייצוא נתונים אפשרי לקובץ JSON או PDF (לפי בחירתך)'
        ]
      },

      permissions: {
        title: 'הרשאות מכשיר',
        content: [
          'האפליקציה לא דורשת הרשאות מיוחדות',
          'גישה לקבצים - רק כאשר אתה בוחר לייצא או לייבא נתונים',
          'שיתוף - רק כאשר אתה לוחץ על כפתור שיתוף רשימת מצרכים',
          'אין גישה למצלמה, מיקום, אנשי קשר או הרשאות אחרות'
        ]
      },

      cloudServices: {
        title: 'שירותי ענן (אופציונלי בעתיד)',
        content: [
          'כברירת מחדל: כל העיבוד מקומי (Regex לצ\'אט)',
          'אם בעתיד יוצע חיבור לשירות AI חיצוני:',
          '  → יוצג הסבר ברור ו-Opt-in מפורש',
          '  → הודעות הצ\'אט יעברו אנונימיזציה/רידקציה',
          '  → אפשרות לכבות בכל עת',
          '  → בחירה בין עיבוד מקומי או ענני'
        ]
      },

      userRights: {
        title: 'הזכויות שלך',
        content: [
          'צפייה ועריכה: גישה מלאה לכל הנתונים שלך בכל עת',
          'מחיקה: כפתור "אפס את האפליקציה" עם אישור כפול',
          'ייצוא: הורד את כל הנתונים שלך בפורמט JSON',
          'שליטה מלאה: החלט מה לשמור ומה למחוק',
          'ביטול הסכמה: בטל שירותים ענניים בכל רגע'
        ]
      },

      dataRetention: {
        title: 'שמירת נתונים',
        content: [
          'הנתונים נשמרים עד שתבחר למחוק אותם',
          'אין מחיקה אוטומטית (הכל תחת השליטה שלך)',
          'בעת הסרת האפליקציה - כל הנתונים נמחקים אוטומטית',
          'אפשרות ליצור גיבויים ידניים (ייצוא לקובץ)'
        ]
      },

      childrenAndMinors: {
        title: 'ילדים ונוער',
        content: [
          'האפליקציה מיועדת להורה או אפוטרופוס',
          'שמות הילדים נשמרים רק לצורך תכנון ארוחות אישיות',
          'אין איסוף מידע ישיר מילדים',
          'הורים אחראים לנתונים הנוגעים לילדיהם'
        ]
      },

      contact: {
        title: 'יצירת קשר',
        content: [
          'לשאלות או בעיות: השתמש בטופס הפידבק באפליקציה',
          'מדיניות זו עשויה להתעדכן - תודיע על שינויים מהותיים',
          'גרסה נוכחית: 1.0',
          'תאריך עדכון אחרון: 01/01/2024'
        ]
      }
    }
  }

  return c.json<ApiResponse>({
    success: true,
    data: policyContent
  })
})